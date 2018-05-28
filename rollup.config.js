const babel = require("rollup-plugin-babel");
const filesize = require("rollup-plugin-filesize");
const pkg = require("./package.json");

const external = [
  "funcadelic",
  "symbol-observable",
  "get-prototype-descriptors",
  "memoize-getters",
  "ramda/src/lensPath",
  "ramda/src/set",
  "ramda/src/lens",
  "ramda/src/over",
  "ramda/src/view"
];

module.exports = [
  {
    input: "src/nodules.js",
    external,
    output: {
      file: pkg.main,
      format: "cjs",
      sourcemap: true
    },
    plugins: [
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
      filesize({
        render(opt, size, gzip, bundle) {
          return `Built: ${bundle.file} ( size: ${size}, gzip: ${gzip})`;
        }
      })
    ]
  },
  {
    input: "src/index.js",
    external,
    output: { file: pkg.module, format: "es", sourcemap: true },
    plugins: [
      babel({
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
      }),
      filesize({
        render(opt, size, gzip, bundle) {
          return `Built: ${bundle.file} ( size: ${size}, gzip: ${gzip})`;
        }
      })
    ]
  }
];
