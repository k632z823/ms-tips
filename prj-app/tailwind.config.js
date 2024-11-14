/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		fontFamily: {
			inter: ["Inter", "sans-serif"],
		},
		fontWeight: {
			thin: '100',
			extralight: '200',
			light: '300',
			normal: '400',
			medium: '500',
			semibold: '600',
			bold: '700',
			extrabold: '800',
			black: '900',
		},
		colors: {
			'white': '#FFFFFF',
			'black': '#000000',
			'menu-gray': '#070707',
			'border-gray': '#181818',
			'content-gray': '#606060',
			'table-header-gray': '#A3A3A3',
			'dialog-bg-gray': '#050505',
			'mini-gray': '#404040',
			'icon-gray': '#505050',
			'input-gray': '#0A0A0A',
			'select-red': '#140000',
			'border-red': '#450A0A',
			'red': '#B91C1C',
			'green': '#22C55E',
		},
		extend: {
		},
	},
	plugins: [],
};
