import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json'));

const plugins = [
  typescript({
    tsconfig: './tsconfig.prod.json',
  }),
  json(),
  commonjs(),
  resolve({
    extensions: ['.ts', '.js'],
  }),
];

export default {
  input: './src/extension.ts',
  output: { format: 'cjs', file: pkg.main },
  plugins,
};
