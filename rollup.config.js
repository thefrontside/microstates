import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'umd',
    name: 'Microstates'
  },
  plugins: [
    babel({
      babelrc: false,
      comments: false,
      plugins: ["@babel/plugin-proposal-class-properties"],
      presets: [
        ['@babel/preset-env', {
          modules: false
        }]
      ]
    })
  ]
};
