import { terser } from "rollup-plugin-terser";
import nodeResolve from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import commonjs from "rollup-plugin-commonjs";
import prettier from "rollup-plugin-prettier";
import filesize from "rollup-plugin-filesize";
import replace from "rollup-plugin-replace";
import deepmerge from "deepmerge";
import pkg from "./package.json";

const typescriptPlugin = () =>
  typescript({
    tsconfigOverride: {
      compilerOptions: {
        target: "es5",
        module: "es2015"
      },
      include: ["src"]
    },
    include: ["src/**/*.js", "src/**/*.ts"],
    exclude: ["src/**/*.d.ts"]
  });

const prettierPlugin = () => prettier({ parser: "babylon" });

const terserPlugin = () =>
  terser({
    mangle: {
      toplevel: true,
      properties: {
        regex: /^_[^_].*/
      }
    }
  });

const es6 = {
  input: "src/index.js",
  external: ["react", "hoist-non-react-statics", "reflect-metadata", "tslib"],
  output: {
    file: pkg.module,
    format: "es",
    sourcemap: true
  }
};

const cjs = {
  input: "src/index.js",
  external: ["react", "hoist-non-react-statics", "reflect-metadata", "tslib"],
  output: {
    file: pkg.main,
    format: "cjs",
    sourcemap: true
  }
};

const umd = {
  input: "src/index.js",
  external: ["react"],
  output: {
    file: pkg.main.replace(".js", ".umd.js"),
    format: "umd",
    name: "ReactIoC",
    globals: {
      react: "React"
    },
    sourcemap: true
  }
};

export default [
  deepmerge(es6, {
    plugins: [
      typescriptPlugin(),
      replace({ __DEV__: `(process.env.NODE_ENV !== "production")` }),
      prettierPlugin()
    ]
  }),
  deepmerge(cjs, {
    plugins: [
      typescriptPlugin(),
      replace({ __DEV__: `(process.env.NODE_ENV !== "production")` }),
      prettierPlugin()
    ]
  }),
  deepmerge(umd, {
    plugins: [
      nodeResolve(),
      typescriptPlugin(),
      replace({ __DEV__: true }),
      commonjs()
    ]
  }),
  deepmerge(es6, {
    output: {
      file: es6.output.file.replace(".js", ".min.js")
    },
    plugins: [
      typescriptPlugin(),
      replace({ __DEV__: false }),
      terserPlugin(),
      filesize()
    ]
  }),
  deepmerge(cjs, {
    output: {
      file: cjs.output.file.replace(".js", ".min.js")
    },
    plugins: [
      typescriptPlugin(),
      replace({ __DEV__: false }),
      terserPlugin(),
      filesize()
    ]
  }),
  deepmerge(umd, {
    output: {
      file: umd.output.file.replace(".js", ".min.js")
    },
    plugins: [
      nodeResolve(),
      typescriptPlugin(),
      replace({ __DEV__: false }),
      commonjs(),
      terserPlugin(),
      filesize()
    ]
  })
];
