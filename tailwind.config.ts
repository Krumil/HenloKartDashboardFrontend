import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}"
	],
	theme: {
		extend: {
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))"
			},
			colors: {
				custom: {
					"50": "#eff0fe",
					"100": "#e0e0fc",
					"200": "#c1c2f9",
					"300": "#a1a3f7",
					"400": "#8285f4",
					"500": "#6366f1",
					"600": "#4f52c1",
					"700": "#3b3d91",
					"800": "#282960",
					"900": "#141430"
				}
			}
		}
	},
	plugins: []
};
export default config;
