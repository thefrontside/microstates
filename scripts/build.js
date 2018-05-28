const rollup = require("rollup");
const config = require("../rollup.config");
const PrettyError = require("pretty-error");
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage("rollup");

module.exports = function() {
  console.log("\n"); // eslint-disable-line
  // create a bundle
  return Promise.all(
    config.map(config =>
      rollup.rollup(config).then(bundle => bundle.write(config.output))
    )
  ).catch(e => console.log(pe.render(e))); // eslint-disable-line
};
