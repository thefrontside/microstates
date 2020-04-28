const pkg = require("./package.json");
const babel = require("rollup-plugin-babel");
const filesize = require("rollup-plugin-filesize");
const resolve = require("rollup-plugin-node-resolve");
const commonjs = require('rollup-plugin-commonjs');
const replace = require('rollup-plugin-replace');

const external = [
  "funcadelic",
  "symbol-observable"
];

const babelPlugin = babel({
  babelrc: false,
  comments: false,
  plugins: ["@babel/plugin-proposal-class-properties"],
  presets: [
    [
      "@babel/preset-env",
      {
        modules: false
      }
    ]
  ]
});

const fileSize = filesize();

module.exports = [
  {
    input: "index.js",
    output: {
      name: 'Microstates',
      file: pkg.unpkg,
      format: "umd"
    },
    plugins: [
      replace({
        "process.env.NODE_ENV": JSON.stringify('production')
      }),
      resolve({
        module: false,
        main: true
      }),
      babel({
        babelrc: false,
        comments: false,
        plugins: ["@babel/plugin-proposal-class-properties"],
        presets: [
          [
            "@babel/preset-env",
            {
              targets: {
                chrome: "58",
              },
              modules: false
            }
          ]
        ]
      }),
      commonjs(),
      fileSize
    ]
  },
  {
    input: "index.js",
    external,
    output: {
      file: pkg.main,
      format: "cjs",
      sourcemap: true
    },
    plugins: [
      resolve(),
      babel({
        babelrc: false,
        comments: false,
        plugins: ["@babel/plugin-proposal-class-properties"],
        presets: [
          [
            "@babel/preset-env",
            {
              targets: {
                node: "6"
              },
              modules: false
            }
          ]
        ]
      }),
      fileSize
    ]
  },
  {
    input: "index.js",
    external,
    output: { file: pkg.module, format: "es", sourcemap: true },
    plugins: [
      resolve(),
      babelPlugin,
      fileSize
    ]
  }
];
