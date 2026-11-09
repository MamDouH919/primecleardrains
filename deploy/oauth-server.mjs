// سيرفر صغير لتسجيل الدخول بـ GitHub في لوحة Decap CMS (بدون أي dependencies).
// شغّله على الـ VPS: node deploy/oauth-server.mjs
// المتغيرات المطلوبة: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, PORT (اختياري، الافتراضي 3055)
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';

const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, PORT = 3055 } = process.env;
if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
	console.error('GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are required');
	process.exit(1);
}

const renderResult = (status, content) => `<!doctype html><html><body><script>
(function () {
	function receiveMessage(e) {
		window.opener.postMessage(
			'authorization:github:${status}:' + ${JSON.stringify(JSON.stringify(content))},
			e.origin
		);
		window.removeEventListener('message', receiveMessage, false);
	}
	window.addEventListener('message', receiveMessage, false);
	window.opener.postMessage('authorizing:github', '*');
})();
</script></body></html>`;

createServer(async (req, res) => {
	const url = new URL(req.url, `https://${req.headers.host}`);

	if (url.pathname === '/auth') {
		const state = randomBytes(16).toString('hex');
		const authorize = new URL('https://github.com/login/oauth/authorize');
		authorize.searchParams.set('client_id', GITHUB_CLIENT_ID);
		authorize.searchParams.set('scope', url.searchParams.get('scope') || 'repo');
		authorize.searchParams.set('state', state);
		res.writeHead(302, {
			Location: authorize.toString(),
			'Set-Cookie': `decap_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
		});
		return res.end();
	}

	if (url.pathname === '/callback') {
		const cookieState = /decap_oauth_state=([a-f0-9]+)/.exec(req.headers.cookie || '')?.[1];
		res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
		if (!cookieState || cookieState !== url.searchParams.get('state')) {
			return res.end(renderResult('error', { message: 'Invalid state' }));
		}
		try {
			const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
				method: 'POST',
				headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
				body: JSON.stringify({
					client_id: GITHUB_CLIENT_ID,
					client_secret: GITHUB_CLIENT_SECRET,
					code: url.searchParams.get('code'),
				}),
			});
			const data = await tokenRes.json();
			if (!data.access_token) throw new Error(data.error_description || 'No access token');
			return res.end(renderResult('success', { token: data.access_token, provider: 'github' }));
		} catch (err) {
			return res.end(renderResult('error', { message: err.message }));
		}
	}

	res.writeHead(404).end('Not found');
}).listen(PORT, '127.0.0.1', () => console.log(`Decap OAuth server on 127.0.0.1:${PORT}`));
