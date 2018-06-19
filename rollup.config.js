const babel = require("rollup-plugin-babel");
const filesize = require("rollup-plugin-filesize");
const pkg = require("./package.json");
const resolve = require("rollup-plugin-node-resolve");
const replace = require("rollup-plugin-replace");

const ramda = [
  "ramda/es/lensPath",
  "ramda/es/over",
  "ramda/es/set",
  "ramda/es/view"
]

const external = [
  "funcadelic",
  "symbol-observable",
  "get-prototype-descriptors",
  "invariant"
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

const fileSize = filesize({
  render(opt, size, gzip, bundle) {
    return `Built: ${bundle.file} ( size: ${size}, gzip: ${gzip})`;
  }
});

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
      replace({
        "import lensPath from 'ramda/es/lensPath'": "const {lensPath} from 'ramda/src/lensPath'",
        "import lset from 'ramda/es/set'": "const {set: lset} from 'ramda/src/set'",
        "import view from 'ramda/es/view'": "const {view} from 'ramda/src/view'",
        "import over from 'ramda/es/over'": "const {over} from 'ramda/src/over'"
      }),
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
    input: "src/index.js",
    external: [...external, ...ramda],
    output: { file: pkg.module, format: "es", sourcemap: true },
    plugins: [
      resolve(),
      babelPlugin,
      fileSize
    ]
  }
];
