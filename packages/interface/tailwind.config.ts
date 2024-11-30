import type { Config } from 'tailwindcss';
import formsPlugin from '@tailwindcss/forms';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {},
	},

	plugins: [formsPlugin()],
} satisfies Config;
