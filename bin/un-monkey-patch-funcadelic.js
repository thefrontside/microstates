const json = require('jsonfile');

const funcadelicPackageFilename = 'node_modules/funcadelic/package.json';
const originalFuncadelicPackageFilename = 'node_modules/funcadelic/package.json.original';

let pkg = json.readFileSync(originalFuncadelicPackageFilename);
json.writeFileSync(funcadelicPackageFilename, pkg, {spaces: 2});
