// @ts-nocheck

import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/kuromoji.ts",
  output: {
    file: "dist/kuromoji.js",
    format: "cjs",
  },
  plugins: [commonjs(), typescript(), nodeResolve()],
};
