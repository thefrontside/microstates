/*global require, __dirname */

// This file cannot be written with ECMAScript 2015 because it has to load
// the Babel require hook to enable ECMAScript 2015 features!
require("babel/register")({
  optional: "runtime"
});

// The tests, however, can and should be written with ECMAScript 2015.
require("require-all")({
  dirname: __dirname,
  filter: /.+-test.js/
});
