var path = require('path');

require("require-all")({
  dirname: path.join(__dirname, 'unit'),
  filter: /.+-test.js/
});