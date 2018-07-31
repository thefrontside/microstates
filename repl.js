let babel = require('@babel/core');
let repl = require('repl')

require('./tests/setup');

// this code lifted from the @babel/node package
// https://github.com/babel/babel/blob/master/packages/babel-node/src/_babel-node.js#L104-L117
const _eval = function(code, filename) {
  code = code.trim();
  if (!code) return undefined;

  code = babel.transform(code, {
    filename: filename,
  }).code;

  return vm.runInThisContext(code, {
    filename: filename,
  });
};


// This code lifted from the @babel/node package
// https://github.com/babel/babel/blob/master/packages/babel-node/src/_babel-node.js#L206-L221
function replEval(code, context, filename, callback) {
  let err;
  let result;

  try {
    if (code[0] === "(" && code[code.length - 1] === ")") {
      code = code.slice(1, -1); // remove "(" and ")"
    }

    result = _eval(code, filename);
  } catch (e) {
    err = e;
  }

  callback(err, result);
}

// put all of the microstate functions into the global scope
Object.assign(global, require('./index'))

//start the repl using the @babel/node
repl.start({
  eval: replEval,
  useGlobal: true,
});
