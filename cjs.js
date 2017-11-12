// https://github.com/standard-things/esm#getting-started
require = require('@std/esm')(module, { esm: 'js' });
module.exports = require('./src/index.js');
