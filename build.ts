import { readFileSync } from 'node:fs';

import { htmlPlugin } from '@craftamap/esbuild-plugin-html';
import { build, BuildOptions } from 'esbuild';
import clean from 'esbuild-plugin-clean';
import copy from 'esbuild-plugin-copy';
import { start } from 'live-server';
import yargs from 'yargs';

const SRC_DIR = 'src';
const OUT_DIR = 'dist';

const ASSETS_DIR = 'assets';
const ENTRY_FILE = `${SRC_DIR}/index.tsx`;

const { watch } = yargs(process.argv.slice(2))
	.options({
		watch: { type: 'boolean', default: false },
	})
	.parseSync();

console.debug('ESBUILD CONFIG:', {
	watch,
});

const options: BuildOptions = {
	logLevel: 'debug',
	watch,
	entryPoints: [ENTRY_FILE],
	entryNames: '[name]-[hash]',
	outdir: `${OUT_DIR}`,
	metafile: true,
	incremental: true,
	bundle: true,
	minify: true,
	sourcemap: true,
	define: Object.fromEntries(
		Object.keys(process.env).map((key) => [
			`process.env.${key}`,
			JSON.stringify(process.env[key]),
		]),
	),
	plugins: [
		clean({
			patterns: [`./${OUT_DIR}/*`],
		}),
		copy({
			assets: [
				{ from: `${SRC_DIR}/${ASSETS_DIR}/*`, to: ASSETS_DIR },
				{ from: `${SRC_DIR}/favicon.ico`, to: './' },
			],
		}),
		htmlPlugin({
			files: [
				{
					entryPoints: [ENTRY_FILE],
					filename: 'index.html',
					htmlTemplate: readFileSync(
						`${SRC_DIR}/index.html`,
						'utf-8',
					),
				},
			],
		}),
	],
};

build(options)
	.then(() => {
		if (watch) {
			start({
				root: OUT_DIR,
				open: false,
			});
		} else {
			process.exit(0);
		}
	})
	.catch(() => process.exit(1));
