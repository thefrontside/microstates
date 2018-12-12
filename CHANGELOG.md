# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.12.3] - 2018-12-12

### Fixed

- Gather all transitions from the prototype chain https://github.com/microstates/microstates.js/pull/290

## [0.12.2] - 2018-11-26

### Fixed

- Ensure Identity maps non-enumerable properties https://github.com/microstates/microstates.js/pull/284

## [0.12.1] - 2018-11-18

### Added

- ArrayType#remove transition https://github.com/microstates/microstates.js/pull/275
- ObjectType#Symbol.iterator to allow iterating objects in queries https://github.com/microstates/microstates.js/pull/276

### Changed

- No special case for the `set` transition https://github.com/microstates/microstates.js/pull/279

## [0.12.0] - 2018-10-31

### Fixed

- Store should allow destructuring microstates https://github.com/microstates/microstates.js/pull/263

### Added

- Added ObjectType#map and #ObjectType#filter transitions https://github.com/microstates/microstates.js/pull/225
- Added ArrayType#sort transition https://github.com/microstates/microstates.js/pull/245
- Added ArrayType#slice transition https://github.com/microstates/microstates.js/pull/249

### Changed

- ArrayType#map is now stable. array.map(x => x) is no-op https://github.com/microstates/microstates.js/pull/239
- ArrayType#filter is now stable. array.filter(x => true) is no-op https://github.com/microstates/microstates.js/pull/241
- Identity/Store no longer calls observer on creation (behaviour of Observer.from remains unchanged) https://github.com/microstates/microstates.js/pull/255 


## [0.11.0] - 2018-10-11

### Added
- New benchmarks based on TodoMVC, runnable via `yarn bench`
- Introduced the "femtostates" architecture. See below for breaking
  changes. See also
  https://github.com/microstates/microstates.js/pull/227
- The opaque type `Any` is now exported from the main microstates
  module. This is the type of `create(null)`
- The `Primitive` type which aliases a types `valueOf()` to the
  `.state` property is now exported frmo the main microstates module.
- The builtin types that correspond to JavaScript builtins are now, `ArrayType`,
  `ObjectType`, `BooleanType`, `StringType`, and `NumberType`.

### Changed
- `.state` property is no longer on every microstate, only on
  primitive types like `Number`, `String`, `Boolean`, and `Any`. In
  order to get at the JavaScript value enclosed by a microstate, use
  the `valueOf()` method exported by the main package.
- All microstate properties are _completely_ lazily evaluated.
- Array microstates cannot be accessed by index, but must use the
  iterable interface.
- Type-shifting has been restricted to the `initialize` method.


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
