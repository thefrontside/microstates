# ts-library-starter
[![NPM version](https://img.shields.io/npm/v/ts-library-starter.svg)](https://www.npmjs.com/package/ts-library-starter)
[![Build Status](https://travis-ci.org/DxCx/ts-library-starter.svg?branch=master)](https://travis-ci.org/DxCx/ts-library-starter)
[![Coverage Status](https://coveralls.io/repos/github/DxCx/ts-library-starter/badge.svg?branch=master)](https://coveralls.io/github/DxCx/ts-library-starter?branch=master)
[![Standard Version](https://img.shields.io/badge/release-standard%20version-brightgreen.svg)](https://github.com/conventional-changelog/standard-version)

Example git project that is used for typescript libraries as a starter pack

What does it include:
----
    1. exported class as example for an npm moudle
    2. packaging for npm modules (webpack + tslint + awesome-typescript-loader + dts-bundle)
    3. testings for npm modules (jest)
    4. code coverage (jest) when running tests
    5. Typescript => ES6 => ES5 (babel)
    6. Two versions embed in the package, one for node, one for browser (browserify)

Notes
----
Please note that you will need to rename the library name in some files:

    1. webpack.config.js (bundle_opts)
    2. package.json (ofcourse ;))
Also don't forget to reset package version ;)

Useful commands:
----
    npm run prebuild       - install NPM dependancies
    npm run build          - build the library files
    npm run test           - run the tests
    npm run test:watch     - run the tests (watch-mode)
    npm run coverage       - run the tests with coverage
    npm run coverage:watch - run the tests with coverage (watch-mode)
    npm run pack           - build the library, make sure the tests passes, and then pack the library (creates .tgz)
    npm run release        - prepare package for next release

Files explained:
----
    1. src - directory is used for typescript code that is part of the project
        1a. src/Example.ts - Just an example exported library, used to should import in tests.
        1b. src/Example.spec.ts - tests for the example class
        1c. src/index.ts        - index, which functionality is exported from the library
        1d. src/main.ts         - just wrapper for index
    3. package.json                 - file is used to describe the library
    4. tsconfig.json                - configuration file for the library compilation
    6. tslint.json                  - configuration file for the linter (both test and library)
    8. webpack.config.js            - configuration file of the compilation automation process for the library

Output files explained:
----
    1. node_modules                       - directory npm creates with all the dependencies of the module (result of npm install)
    2. dist                               - directory contains the compiled library (javascript + typings)
    3. <module_name>-<module_version>.tgz - final tgz file for publish. (result of npm run pack)
    4. coverage                           - code coverage report output made by istanbul
