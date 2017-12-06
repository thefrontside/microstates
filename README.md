[![Build Status](https://travis-ci.org/cowboyd/microstates.js.svg?branch=master)](https://travis-ci.org/cowboyd/microstates.js) [![Coverage Status](https://coveralls.io/repos/github/cowboyd/microstates.js/badge.svg?branch=master)](https://coveralls.io/github/cowboyd/microstates.js?branch=master)

# Microstates

Immutable. Composable. Lovable.

## Getting started

Microstates exposes one function that's used to create state and actions objects. These objects store state and allow the developer to trigger transitions of these microstates. Microstates classes takes an ES6 class as the first parameter. Microstates will use this class to build state and actions for your application.

```js
import microstates from 'microstates';

class State {
  counter = Number;
}

let { state, actions } = microstates(State);
```

## Development

``` shell
$ npm install
$ npm test
```