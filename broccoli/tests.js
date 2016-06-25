var funnel = require('broccoli-funnel');
var es6 = require('broccoli-babel-transpiler');
var concat = require('broccoli-concat');
var merge = require('broccoli-merge-trees');
var amdLoader = require('broccoli-amd-loader');

var path = require('path');


function emberCLITestLoaderTree() {
  var testLoaderPath = path.join(path.dirname(
    require.resolve('broccoli-test-builder')
  ), 'ext');
  return funnel(testLoaderPath, {
    include: [ 'test-loader.js' ],
    destDir: '/tests/test-loader/'
  });
}

function mochaShimTree() {
    function compileES6(tree) {
      return new es6(tree, {
        loose: true,
        moduleIds: true,
        modules: 'amdStrict'
      });
    }

    var emberMochaLib = path.join(__dirname, 'shims');
    
    var mochaChai = funnel(emberMochaLib, {
      include: ['chai.js', 'mocha.js'],
      destDir: '/'
    });

    return concat(compileES6(mochaChai), {
      inputFiles: ['**.js'],
      outputFile: '/mocha-chai.amd.js'
    });
}

function buildTestTree(options) {
  if (!options) { options = {}; }

  var libDirName = options.libDirName || 'lib';

  var testJSTree = funnel('./tests', {
    include: ['**/*.js'],
    destDir: '/tests'
  });

  nodeTestTree = es6(testJSTree, {
    moduleIds: true,
    modules: 'commonStrict',
    // Transforms /index.js files to use their containing directory name
    getModuleId: function (name) {
      return name.replace(/\/index$/, '');
    }
  });

  testJSTree = es6(testJSTree, {
    moduleIds: true,
    modules: 'amdStrict'
  });

  testJSTree = merge([
    mochaShimTree(), 
    testJSTree
  ]);

  testJSTree = concat(testJSTree, {
    inputFiles: ['**/*.js'],
    outputFile: '/tests/built-amd-tests.js'
  });

  var testIndex = funnel('./tests', {
    include: ['index.html'],
    destDir: '/tests'
  });

  var testTree = merge([
    nodeTestTree,
    testIndex,
    testJSTree,
    emberCLITestLoaderTree()
  ]);
  testTree = amdLoader(testTree, {
    destDir: '/tests/loader.js'
  });

  return testTree;
}

module.exports = {
  build: buildTestTree
};