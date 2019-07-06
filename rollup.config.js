import resolve from 'rollup-plugin-node-resolve';
import buble from 'rollup-plugin-buble';
import pkg from './package.json';

export default [
	{
		input: 'src/main.js',
		output: {
			name: 'MdHub',
			file: pkg.browser,
			format: 'umd'
		},
		plugins: [
			resolve(),
			buble({
				exclude: ['node_modules/**']
			})
		]
	},
	{
		input: 'src/main.js',
		output: [
			{ file: pkg.module, format: 'es' }
		],
		plugins: [
			buble({
				exclude: ['node_modules/**']
			})
		]
	}
];
