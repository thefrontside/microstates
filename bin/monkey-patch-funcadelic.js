const json = require('jsonfile');

const funcadelicPackageFilename = 'node_modules/funcadelic/package.json';

let pkg = json.readFileSync(funcadelicPackageFilename);
json.writeFileSync(`${funcadelicPackageFilename}.original`, pkg, { spaces: 2 });
pkg.main = pkg.module;
json.writeFileSync(funcadelicPackageFilename, pkg, {spaces: 2});
