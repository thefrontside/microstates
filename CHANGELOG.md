# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- REPL for experimenting with, and demoing microstates.

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
