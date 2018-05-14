const babel = require("rollup-plugin-babel");
const filesize = require("rollup-plugin-filesize");
const pkg = require("./package.json");

const { keys } = Object;

const globals = {
  funcadelic: "funcadelic",
  "ramda/src/over": "R.over",
  "ramda/src/lens": "R.lens",
  "ramda/src/view": "R.view",
  "ramda/src/set": "R.set",
  "ramda/src/lensPath": "R.lensPath",
  "symbol-observable": "SymbolObservable",
  "get-prototype-descriptors": "getPrototypeDescriptors",
  "memoize-getters": "memoizeGetters"
};

module.exports = {
  input: "src/index.js",
  external: keys(globals),
  output: [
    {
      file: pkg.browser,
      format: "umd",
      name: "Microstates",
      globals,
      exports: "named",
      sourcemap: true
    },
    { file: pkg.module, format: "es", sourcemap: true }
  ],
  plugins: [
    babel({
      babelrc: false,
      comments: false,
      plugins: [
        "@babel/plugin-proposal-class-properties"
      ],
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
};
