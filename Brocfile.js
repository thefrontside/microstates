/* jshint node:true */

var broccoli = require('broccoli');
var Watcher = require('broccoli-sane-watcher');
var builder = require('broccoli-multi-builder');
var mergeTrees = require('broccoli-merge-trees');

var tests = require('./broccoli/tests');
var jquery = require('./broccoli/jquery');
var mocha = require('./broccoli/mocha');
var chai = require('./broccoli/chai');

var injectLiveReload = require('broccoli-inject-livereload');
var LiveReload = require('tiny-lr');
var replace = require('broccoli-string-replace');

var packageName = require('./package.json').name;

var buildOptions = {
  libDirName: 'src',
  packageName: packageName
};

var testTree = tests.build({libDirName: 'src'});
testTree = jquery.build(testTree, '/tests/jquery');
testTree = mocha.build(testTree, '/tests/mocha');
testTree = chai.build(testTree, '/tests/chai');

var testBuilder = new broccoli.Builder(testTree);
var lrServer = new LiveReload.Server();
lrServer.listen();
var watcher = new Watcher(testBuilder);

watcher.on('change', function() {
  try {
    lrServer.changed({
      body: {
        files: ['/']
      }
    });
  } catch(e) {
    console.log('error notifying live-reload of change: ',e);
  }
});

function replaceVersion(tree) {
  var version = require('./package.json').version;
  return replace(tree, {
    files: ['**/*.js'],
    pattern: {
      match: /##VERSION##/g,
      replacement: version
    }
  });
}

module.exports = mergeTrees([
  replaceVersion(builder.build('amd', buildOptions)),
  replaceVersion(builder.build('global', buildOptions)),
  replaceVersion(builder.build('commonjs', buildOptions)),
  injectLiveReload(testTree)
]);