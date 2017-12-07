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
// initial value is undefined so state will be default value of String which is an empty string
microstate(MS.String).state;
// => ''

// initial value is 'hello world' so state will be hello world.
microstate(MS.String, 'hello world').state;
// => 'hello world'
```

The object returned from the constructor has all of the transitions for the structure.

```js
let ms = microstate(MS.Object);

console.log(ms);
//  {
//    assign: Function
//    set: Function
//  }

ms.assign({ hello: 'world', hi: 'there' }).state;
// => { hello: 'world', hi: 'there' }
```

# Composition

Microstates are designed to be composable. You can define custom microstate types and nested them
necessary. Microstates will take care of ensuring that all transitioning composed microstates is
done immutably.

Defining custom types is done using ES2016 classes syntax. In JavaScript classes are functions. So
any function can work as a type, but we recommend using class syntax.

```js
class Counter {
  count = MS.Number;
}

microstate(Counter);
// => {
//      merge: Function
//      set: Function
//      count: {
//        increment: Function
//        decrement: Function
//        sum: Function
//        subtract: Function
//      }
//    }

microstate(Counter).state;
// => { count: 0 }
```

We use Class Properties syntax to define composition of microstates. If you're using Babel, you need
[Class Properties transform](https://babeljs.io/docs/plugins/transform-class-properties/) for Class
Properties to work.

```js
class Person {
  name = MS.String;
  age = MS.Number;
}

microstate(Person);
// => {
//      name: { concat: Function, set: Function },
//      age: { increment: Function, decrement: Function, sum: Function, subtract: Function }
//    }

// state objects maintain their type's class
microstate(Person).state instanceof Person;
// => true

microstate(Person).state;
// => { name: '', age: 0 }
```

You can restore a composed microstate by providing initial value that matches the structure of the
microstate.

```js
microstate(Person, { name: 'Taras', age: 99 }).state;
// => { name: 'Taras', age: 99 }
```

You can compose custom types into other custom types.

```js
class Address {
  street = MS.String;
  number = MS.Number;
  city = MS.String;
}

class Person {
  name = MS.String;
  age = MS.Number;
  address = Address;
}

microstate(Person, { name: 'Taras', address: { city: 'Toronto' } }).state;
// => {
//      name: 'Taras',
//      age: 0,
//      address: {
//        street: '',
//        number: 0,
//        city: 'Toronto'
//      }
//    }
```

You can access transitions of composed states by using object property notation. Every time that you
call a transition, you receive a new microstate and you start from the root of the original type.

```js
microstate(Person)
  .age.increment()
  .address.city.set('San Francisco')
  .address.street.set('Market St').state;
// => {
//      name: 'Taras',
//      age: 1,
//      address: {
//        street: 'Market St',
//        number: 0,
//        city: 'San Francisco'
//      }
//    }
```

The objects can be of any complexity and can even support recursion.

```js
class Person {
  name = MS.String;
  father = Person;
}

microsate(Person, { name: 'Stewie' })
  .father.name.set('Peter')
  .father.father.name.set('Mr Griffin')
  .father.father.father.name.set('Mr Giffin Senior').state;
// => { name: 'Stewie',
//      father: {
//        name: 'Peter',
//        father: {
//          name: 'Mr Griffin,
//          father: {
//            name: 'Mr Griffin Senior'
//          }
//        }
//      }
//    }
```

We currently do not support composition inside of arrays but we're looking into supporting it in the
future.

Composed states have two default transitions `set` and `merge`.

`set` will replace the state of current microstate.

```js
microstate(Person).father.father.set({ name: 'Peter' }).state;
// => { name: '', father: { name: 'Peter' }}
```

`merge` will recursively merge the object into current state.

```js
microstate(Person, { name: 'Peter' }).merge({ name: 'Taras', father: { name: 'Serge' } }).state;
// { name: 'Taras', father: { name: 'Serge' }}
```

# Static values

You can define static values on custom types. Static values are added to state but do not get
transitions.

```js
class Ajax {
  content = null;
  isLoaded = false;
}

microstate(Ajax).state.content;
// => null;

microstate(Ajax).content;
// undefined

microstate(Ajax).state.isLoaded;
// => false

microstate(Ajax).isLoaded.set(false);
// Error: calling set of undefined
```

# Computed Properties

Composed states can have computed properties. Computed Properties make it possible define properties
that derive their values from the state. Use getter syntax to define computed properties on composed
states.

```js
class Measure {
  length = MS.Number;
  get inInches() {
    return `${this.height / 2.54} inches`;
  }
}

microstate(Measure, { length: 170 }).state.inInches;
// => '66.9291 inches'

microstate(Measure, { length: 170 }).height.set(160).state.inInches;
// => '62.9921 inches'
```

# Custom Transitions

You can define custom transitions on custom types. Inside of custom transitions, you have access to
current state and ability to transition local state using `this()` function. You probably never seen
`this()` before. Think about it as a function that returns a microstate for the current node. It is
actually a microstate constructor that is bound to custom transitions.

```js
class Person {
  home: MS.String;
  location: MS.String;
  goHome(current) {
    if (current.home !== current.location) {
      return this().location.set(current.home);
    } else {
      return current;
    }
  }
}

microstate(Person, { home: 'Toronto', location: 'San Francisco' }).goHome().state;
// => { home: 'Toronto', location: 'Toronto' }
```

# Batch Transitions

Custom transitions can be used to perform multiple transformations in sequence. This is useful when
you have a deeply nested microstate and you're applying several transformations to one branch of the
microstate. All of the operations we'll execute before the transformation is complete.

```js
class MyModal {
  isOpen = MS.Boolean;
  title = MS.String;
  content = MS.String;

  show(current, title, content) {
    return this()
      .isOpen.set(true),
      .title.set(title)
      .content.set(content)
  }
}

class MyComponent {
  modal = MyModal;
  counter = MS.Number
}

microstate(MyComponent).modal.show('Hello World', 'Rise and shine!').state;
// => { modal: { isOpen: true, title: 'Hello World', content: 'Rise and shine!' }, counter: 0 }
```

# Changing structure

Microstates can change their own structure using custom transitions. This is useful when you're
modeling state machines or want to be able to change the shape of the state after a transition. To
change the structure of a microstate you replace it with new microstate in a custom transition.

```js
class Session {
  content = null;
}

class AuthenticatedSession extends Session {
  isAuthenticated = true;
  content = MS.Object;

  logout() {
    return this(AnonymousSession);
  }
}

class AnonymousSession extends Session {
  isAuthenticated = false;
  authenticate(current, user) {
    return this(AuthenticatedSession, { content: user });
  }
}

class MyApp {
  session = AnonymousSession;
}

microstate(MyApp).state;
// => { session: { content: null, isAuthenticated: false }}

microstate(MyApp).authenticate({ name: 'Taras' }).state;
// => { session: { content: { name: 'Taras' }, isAuthenticated: true }};
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
microstate(MS.Boolean).set(true).state;
// => true
```

### toggle() => microstate

Return a new microstate with state of boolean value switched to opposite.

```js
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
microstate(MS.Number).set(10).state;
// => 10
```

### sum(number: Number [, number: Number]) => microstate

Return a microstate with result of adding passed in values to current state.

```js
microstate(MS.Number).sum(5, 10).state;
// => 15
```

### subtract(number: Number, [, number: Number]) => microstate

Return a microstate with result of subtraction of passed in values from current state.

```js
microstate(MS.Number, 42).subtract(2, 10).state;
// => 30
```

### increment(step: Number = 1) => microstate

Return a microstate with state increased by step value of current state (defaults to 1).

```js
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
microstate(MS.String).set('hello world').state;
// => 'hello world'
```

### concat(str: String [, str1: String]) => microstate

Combine current state with passed in string and return a new microstate with new state.

```js
microstate(MS.String, 'hello ').concat('world').state;
// => 'hello world'
```

## Array

Represents an indexed collection of items.

### set(value: any) => microstate

Replace state with value and return a new microstate with new state. Value will be coerced with
`Array(value).valueOf()`

```js
microstate(MS.Array).set('hello world');
// ['hello world']
```

### push(value: any [, value1: any]) => microstate

Push value to the end of the array and return a new microstate with state as new array.

```js
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
microstate(MS.Object).state;
// => {}
```

### set(value: any) => microstate

Replace state with value and return a new microstate with new state. The value will be coerced to
object with `Object(value).valueOf()`.

```js
microstate(MS.Object).set({ hello: 'world' }).state;
// => { hello: 'world' }
```

### assign(object: Object) => microstate

Create a new object and copy values from existing state and passed in object. Return a new
microstate with new state.

```js
microstate(MS.Object, { color: 'red' }).assign({ make: 'Honda' }).state;
// => { color: 'red', make: 'Honda' }
```

# FAQ

## What if I can't use class syntax?

Classes are functions in JavaScript, so you should be able to use a function to do most of the same
things as you would with classes.

```js
class Person {
  name = MS.String;
  age = MS.Number;
}
```

^^ is equivalent to

```js
function Person() {
  this.name = MS.String;
  this.age = MS.Number;
}
```

## What if I can't use Class Properties?

Babel compiles Class Properties into class constructors. If you can't use Class Properties, then you
can try the following.

```js
class Person {
  constructor() {
    this.name = MS.String;
    this.age = MS.Number;
  }
}

class Employee extends Person {
  constructor() {
    super();
    this.boss = Person;
  }
}
```
