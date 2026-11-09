import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import { type CollectionEntry, getCollection } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

/** المشاريع المميزة الأول، وبعدين الأحدث. */
export async function getProjects(): Promise<Project[]> {
	return (await getCollection('projects')).sort(
		(a, b) =>
			Number(b.data.featured) - Number(a.data.featured) || b.data.date.valueOf() - a.data.date.valueOf(),
	);
}

export const projectUrl = (project: Project) => `/projects/${project.id}/`;

/** كل صور المشروع بالترتيب: الغلاف، قبل/بعد، وبعدين المعرض. */
export function projectImages(project: Project): { image: ImageMetadata; alt: string }[] {
	const { cover, coverAlt, before, after, photos, title } = project.data;
	const all = [
		{ image: cover, alt: coverAlt },
		// صورة واحدة بس (قبل أو بعد) = صورة مجمّعة فيها الاتنين
		...(before ? [{ image: before, alt: `${title} — ${after ? 'قبل' : 'قبل وبعد'}` }] : []),
		...(after ? [{ image: after, alt: `${title} — ${before ? 'بعد' : 'قبل وبعد'}` }] : []),
		...photos,
	];
	// نفس الصورة مرتين (مثلاً الغلاف هو صورة "بعد") تتحسب مرة واحدة
	return all.filter((item, i) => all.findIndex((x) => x.image.src === item.image.src) === i);
}

/**
 * نسخة كبيرة ثابتة من الصورة (1600px). دي اللي بتتفتح في الـ lightbox
 * وبتتبعت لجوجل في الـ Schema والـ image sitemap.
 */
export async function fullImage(image: ImageMetadata) {
	const img = await getImage({ src: image, width: Math.min(1600, image.width), format: 'webp', quality: 82 });
	return { src: img.src, width: img.attributes.width as number, height: img.attributes.height as number };
}
