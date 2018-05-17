const rollup = require("rollup");
const config = require("../rollup.config");
const PrettyError = require('pretty-error');
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('rollup');

module.exports = function() {
  console.log("\n"); // eslint-disable-line
  // create a bundle
  return rollup
    .rollup(config)
    .then(bundle => {
      let built = config.output.map(options => bundle.write(options));
      return Promise.all(built);
    })
    .catch(e => console.log(pe.render(e))); // eslint-disable-line
};
