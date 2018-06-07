const babel = require("rollup-plugin-babel");
const filesize = require("rollup-plugin-filesize");
const resolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");
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

module.exports = [
  {
		input: 'src/nodules.js',
		output: {
			name: 'microstates',
			file: pkg.browser,
      format: 'umd',
      sourcemap: true
		},
		plugins: [
      babelPlugin,
      resolve(),
      commonjs(), 
      filesize({
        render(opt, size, gzip, bundle) {
          return `Built: ${bundle.file} ( size: ${size}, gzip: ${gzip})`;
        }
      })
		]
	},
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
      babelPlugin,
      filesize({
        render(opt, size, gzip, bundle) {
          return `Built: ${bundle.file} ( size: ${size}, gzip: ${gzip})`;
        }
      })
    ]
  }
];
