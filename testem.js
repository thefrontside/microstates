module.exports = {
  "framework": "mocha+chai",
  "test_page": "dist/tests/index.html",
  "src_files": [
    "dist/tests/built-amd-tests.js"
  ],
  "launchers": {
    "Mocha": {
      "command": "NODE_PATH=dist/commonjs ./node_modules/.bin/mocha dist/tests/index.js  -R tap",
      "protocol": "tap"
    }
  },
  "launch_in_ci": [
    //"PhantomJS",
    //"Chrome",
    "Mocha"
  ],
  "launch_in_dev": [
    //"PhantomJS",
    "Chrome",
    "Mocha"
  ]
};