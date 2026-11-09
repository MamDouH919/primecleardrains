import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) =>
	new Response(
		`User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${new URL('sitemap-index.xml', site).href}
Sitemap: ${new URL('sitemap-images.xml', site).href}
`,
		{ headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
	);
