// Build plugins
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';

import pkg from "./package.json";

const production = !process.env.ROLLUP_WATCH;

const banner = `
/**
 * Copyright (C) ${new Date().getFullYear()} by Videsk - All Rights Reserved
 * @name ${pkg.name}
 * @author Videsk
 * @license ${pkg.license}
 * Written by ${pkg.author}
 *
 * ${pkg.description}
 *
*/`;

function addToBuild(options) {
    return production && options;
}

export default {
    input: 'src/index.js',
    output: [
        addToBuild({
            file: pkg.main,
            format: 'cjs',
            sourcemap: !production,
            banner,
        }),
        addToBuild({
            file: pkg.module,
            format: 'es',
            sourcemap: !production,
            banner,
        }),
    ],
    plugins: [
        json(),
        commonjs(),
        production && terser(),
    ],
    external: ['mongoose'],
    watch: { clearScreen: false }
}
