[![Build Status](https://travis-ci.org/cowboyd/microstates.js.svg?branch=master)](https://travis-ci.org/cowboyd/microstates.js)
[![Coverage Status](https://coveralls.io/repos/github/cowboyd/microstates.js/badge.svg?branch=master)](https://coveralls.io/github/cowboyd/microstates.js?branch=master)

# Microstates

Microstates are a _typed_, _composable_ and _immutable_ state container.

Let's get some terminology out of the way so we're on the same page for the rest of the README.

* _Typed_ means that microstates know about the kind of data it contains and transitions that can be
  performed on that data.
* _Composable_ means that simple types can be grouped to describe complex data structures.
  Microstates knows how to transition complex data structures in an immutable way.
* _Immutable_ means that state in the microstate can not be modified. To change the state, you must
  invoke a transition.
* _Transition_ is an operation that receive state and return new state.

To add microstates to your node project,

```bash
npm install --save microstates

# yarn add microstates
```

`microstates` module exports a microstate constructor as `default` and built in types: `Number`,
`String`, `Boolean`, `Object` and `Array`.

_Note_: We recommend `import * as MS from 'microstates'` syntax, to hide built-in types behind a
namespace. Otherwise they'll overwrite built in JavaScript classes in the module.

Let's see some code,

```js
import microstate, * as MS from 'microstates';

microstate(MS.Number, 42).increment().state;
//=> 43

class MyCounter {
  count = MS.Number;
}

// creating microstate from composed states
microstate(MyCounter).state;
// => { count: 0 }

microstate(MyCounter).count.increment().state;
// => { count: 1 }

class MyModal {
  isOpen = MS.Boolean;
  title = MS.String;
}

// you can restore a microstate from previous value
microstate(MyModal, { isOpen: true, title: 'Hello World' }).state;
// => { isOpen: true, title: 'Hello World' }

microstate(MyModal, { isOpen: true, title: 'Hello World' }).isOpen.toggle().state;
// => { isOpen: false, title: 'Hello World' }

// lets composed multiple state together
class MyState {
  modal = MyModal;
  counter = MyCounter;
}

microstate(MyState).state;
// => {
//  modal: { isOpen: false, title: '' },
//  counter: { count: 0 }
// }

microstate(MyState)
  .counter.increment()
  .modal.title.set('Hello World')
  .modal.isOpen.set(true).state;
// => {
//  modal: { isOpen: true, title: 'Hello World' },
//  counter: { count: 1 }
// }
```

# microstate constructor

Microstate constructor creates a microstate. It accepts two arguments: `Type` class that describes
the structure of your state and `value` that is the initial state.

```js
import microstate, * as MS from 'microstates';

// initial value is undefined so state will be default value of String which is an empty string
microstate(MS.String).state;
// => ''

// initial value is 'hello world' so state will be hello world.
microstate(MS.String, 'hello world').state;
// => ''
```

The object returned from the constructor has all of the transitions for the structure.

```js
import microstate, * as MS from 'microstates';

let ms = microstate(MS.Object);

console.log(ms);
//  {
//    assign: Function
//    set: Function
//  }

ms.assign({ hello: 'world', hi: 'there' }).state;
// => { hello: 'world', hi: 'there' }
```

# Built-in types

Microstates package provides base building blocks for your state. `Number`, `String`, `Boolean`,
`Object` and `Array` come with predefined transitions.

## `Boolean`

`Boolean` type presents a `true` or `false` value. `Boolean` has `toggle` and `set` transitions.

### set(value: any) => microstate

Return a new microstate with boolean value replaced. Value will be coerced with
`Boolean(value).valueOf()`.

```js
import microstate, * as MS from 'microstates';

microstate(MS.Boolean).set(true).state;
// => true
```

### toggle() => microstate

Return a new microstate with state of boolean value switched to opposite.

```js
import microstate, * as MS from 'microstates';

microstate(MS.Boolean).state;
// => false

microstate(MS.Boolean).toggle().state;
// => true;

microstate(MS.Boolean, true).toggle().state;
// => false;
```

## `Number`

`Number` type represents any numeric value. `Number` has [`sum`](), [`subtract`](), [`increment`](),
[`decrement`]() and [`set`]() transitions.

### set(value: any) => microstate

Replace current state with value. The value will be coerced same as `Number(value).valueOf()`.

```js
import microstate, * as MS from 'microstates';

microstate(MS.Number).set(10).state;
// => 10
```

### sum(number: Number [, number: Number]) => microstate

Return a microstate with result of adding passed in values to current state.

```js
import microstate, * as MS from 'microstates';

microstate(MS.Number).sum(5, 10).state;
// => 15
```

### subtract(number: Number, [, number: Number]) => microstate

Return a microstate with result of subtraction of passed in values from current state.

```js
import microstate, * as MS from 'microstates';

microstate(MS.Number, 42).subtract(2, 10).state;
// => 30
```

### increment(step: Number = 1) => microstate

Return a microstate with state increased by step value of current state (defaults to 1).

```js
import microstate, * as MS from 'microstates';

microstate(MS.Number).increment().state;
// => 1

microstate(MS.Number).increment(5).state;
// => 5

microstate(MS.Number)
  .increment(5)
  .increment().state;
// => 6
```

### decrement(step: Number = 1) => microstate

Return a microstate with state decreased by step value of current state (defaults to 1).

```js
import microstate, * as MS from 'microstates';

microstate(MS.Number).decrement().state;
// => -1

microstate(MS.Number).decrement(5).state;
// => -5

microstate(MS.Number)
  .decrement(5)
  .decrement().state;
// => -6
```

## String

`String` represents string values. `String` has `concat` and `set` transitions. You can vote for
additional transitions to be included in #27.

### set(value: any) => microstate

Replace the state with value and return a new microsate with new state. Value will be coerced using
`String(value).valueOf()`.

```js
import microstate, * as MS from 'microstates';

microstate(MS.String).set('hello world').state;
// => 'hello world'
```

### concat(str: String [, str1: String]) => microstate

Combine current state with passed in string and return a new microstate with new state.

```js
import microstate, * as MS from 'microstates';

microstate(MS.String, 'hello ').concat('world').state;
// => 'hello world'
```

## Array

Represents an indexed collection of items.

### set(value: any) => microstate

Replace state with value and return a new microstate with new state. Value will be coerced with
`Array(value).valueOf()`

```js
import microstate, * as MS from 'microstates';

microstate(MS.Array).set('hello world');
// ['hello world']
```

### push(value: any [, value1: any]) => microstate

Push value to the end of the array and return a new microstate with state as new array.

```js
import microstate, * as MS from 'microstates';

microstate(MS.Array).push(10, 15, 25).state;
// => [ 10, 15, 25 ]

microstate(MS.Array, ['a', 'b'])
  .push('c')
  .push('d').state;
// => [ 'a', 'b', 'c', 'd' ]
```

### filter(fn: value => boolean) => microstate

Apply filter fn to every element in the array and return a new microstate with result as state.

```js
import microstate, * as MS from 'microstates';

microstate(MS.Array, [10.123, 1, 42, 0.01]).filter(value => Number.isNumber(value)).state;
// => [ 1, 42 ];
```

### map(fn: (value, index) => any) => microstate

Map every item in array and return a new microstate with new array as state.

```js
microstate(MS.Array, ['a', 'b', 'c']).map(v => v.toUpperCase()).state;
// => ['A', 'B', 'C']
```

### replace(item: any, replacement; any) => microstate

Replace first occurance of `item` in array with `replacement` using exact(`===`) comparison.

```js
microstate(MS.Array, ['a', 'b', 'c']).replace('b', 'B').state;
// => [ 'a', 'B', 'c' ]
```

## Object

Represents a collection of values keyed by string. Object types have `assign` and `set` transitions.

```js
import microstate, * as MS from 'microstates';

microstate(MS.Object).state;
// => {}
```

### set(value: any) => microstate

Replace state with value and return a new microstate with new state. The value will be coerced to
object with `Object(value).valueOf()`.

```js
import microstate, * as MS from 'microstates';

microstate(MS.Object).set({ hello: 'world' }).state;
// => { hello: 'world' }
```

### assign(object: Object) => microstate

Create a new object and copy values from existing state and passed in object. Return a new
microstate with new state.

```js
import microstate, * as MS from 'microstates';

microstate(MS.Object, { color: 'red' }).assign({ make: 'Honda' }).state;
// => { color: 'red', make: 'Honda' }
```
