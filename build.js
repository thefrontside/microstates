const rollup = require("rollup");
const config = require("./rollup.config");

module.exports = function() {
  console.log("\n");
  // create a bundle
  return rollup.rollup(config)
    .then(bundle => {
      let built = config.output.map(options => bundle.write(options));
      return Promise.all(built);
    })
    .then(() => console.log() )
};
