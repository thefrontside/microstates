# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.10.1] - 2018-08-12

### Fixed
- Make sure dist is included in the package. https://github.com/microstates/microstates.js/pull/206

## [0.10.0] - 2018-08-08

### Added
- Implement Array.pop() transition https://github.com/microstates/microstates.js/pull/197

### Changed
- Make transitions functions stable per location. https://github.com/microstates/microstates.js/pull/200

## [0.9.6] - 2018-08-04
### Added
- Implicitly bind methods for microstates inside a store.
  https://github.com/microstates/microstates.js/pull/193
- Allow consumers to use the Identity / Store API directly.
  https://github.com/microstates/microstates.js/pull/194
  
### Changed
- Make redundant transitions fully idemptotent for Identities. 
  https://github.com/microstates/microstates.js/pull/191

## [0.9.5] - 2018-08-03
### Changed
- [BUGFIX] - this resolves completely the issues of syntatic sugar
  non-determinism without the need for any workarounds
  https://github.com/microstates/microstates.js/pull/189

## [0.9.4] - 2018-08-02
### Changed
- [BUGFIX] - syntactic sugar has problems and our testcases were not
  catching them. Include a partial
  workaround. https://github.com/microstates/microstates.js/pull/187

## [0.9.3] - 2018-08-01
### Added
- REPL for experimenting with, and demoing microstates.

### Changed
- [BUGFIX] fix problem where nested microstates being set to the same
  value were breaking https://github.com/microstates/microstates.js/pull/183
- Many, many fixes to the README.

## [0.9.2] - 2018-07-31
### Added
- Export filter & reduce query functions and remove sum from Reducible https://github.com/microstates/microstates.js/pull/169
- Added map query to Reducible and export it https://github.com/microstates/microstates.js/pull/172

## [0.9.1] - 2018-07-28
### Changed
- Migrate to the picostates architecture. This introduces many, many
  breaking changes. See
  https://github.com/microstates/microstates.js/pull/158 for details.

## [0.8.1] - 2018-06-20
### Changed
- Bump to funcadelic 0.5.1 #139

## [0.8.0] - 2018-06-29
### Added
- [ENHANCEMENT] Allow putting and assigning microstates to objects #119
- [ENHANCEMENT] Added formatting to microstate types #133
- [ENHANCEMENT] Add ability to include microstates in from #115
- [ENCHANCEMENT] Transitions are now auto bound #142

### Changed
- [BREAKING] Removed automatic caching of getters and memoize getters dependency #139
- [BREAKING] exposed use for middleware and map for array mapping #138
- [BREAKING] Fix transitions of parameterized arrays #127
- [BREAKING] Drop UMD build and fix cjs/es builds #141
- [CHORE] Upgraded to funcadelic 0.5.0 #128
- [CHORE] Added failing test for observable from arraylike #131
- [CHORE] Removed momoize-getters dependency from package.json #140
