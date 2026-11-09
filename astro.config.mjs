// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://primecleardrains.novaslash.com',
	integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/admin') })],
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'IBM Plex Sans Arabic',
			cssVariable: '--font-plex-arabic',
			weights: [400, 600],
			styles: ['normal'],
			subsets: ['arabic', 'latin'],
			fallbacks: ['sans-serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'Alexandria',
			cssVariable: '--font-alexandria',
			weights: [500, 600, 700, 800],
			styles: ['normal'],
			subsets: ['arabic', 'latin'],
			fallbacks: ['sans-serif'],
		},
	],
});
