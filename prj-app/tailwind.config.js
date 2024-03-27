/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		fontFamily: {
			inter: ["Inter", "sans-serif"],
		},
		colors: {
			'white': '#FFFFFF',
			'black': '#000000',
			'menu-gray': '#070707',
			'border-gray': '#151515',
			'content-gray': '#606060',
			'input-gray': '#0A0A0A',
		},
		extend: {
		},
	},
	plugins: [],
};
