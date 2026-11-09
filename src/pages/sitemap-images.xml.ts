import type { APIRoute } from 'astro';
import { fullImage, getProjects, projectImages, projectUrl } from '../lib/projects';

// Image sitemap لجوجل: كل صفحة مشروع ومعاها روابط كل صورها بالحجم الكبير
// https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps
const escape = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async ({ site }) => {
	const projects = await getProjects();
	const urls = await Promise.all(
		projects.map(async (project) => {
			const images = await Promise.all(
				projectImages(project).map(async ({ image }) => {
					const { src } = await fullImage(image);
					return `<image:image><image:loc>${escape(new URL(src, site).href)}</image:loc></image:image>`;
				}),
			);
			const loc = escape(new URL(projectUrl(project), site).href);
			const lastmod = project.data.date.toISOString().slice(0, 10);
			return `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod>${images.join('')}</url>`;
		}),
	);

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>`;

	return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
