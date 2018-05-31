[![Build Status](https://travis-ci.org/microstates/microstates.js.svg?branch=master)](https://travis-ci.org/microstates/microstates.js)
[![Coverage Status](https://coveralls.io/repos/github/microstates/microstates.js/badge.svg?branch=master)](https://coveralls.io/github/microstates/microstates.js?branch=master)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Gitter](https://badges.gitter.im/microstates/microstates.js.svg)](https://gitter.im/microstates/microstates.js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

# Microstates

Composable State Primitives with GraphQL inspired API     

Microstates is a pure JavaScript model authoring system designed to ease state management in component based applications.

By combining lazy execution, algebraic data types and structural sharing, we created
a tool that provides a tiny API to describe complex data structures and provide a
mechanism to change the value in immutable way.

## Why Microstates?

With microstates added to your project, you get: 

- 🍣 Atomic composable type system
- 🍱 Effortless composition of types
- 💎 Pure immutable state transitions without reducers
- 🔭 Optional integration with Observables
- 🎯 Transpilation free type system
- ⚛ Use in Node.js and web applications
- 🦋 Easiest way to express state machines

But, most imporantly, Microstates makes working with **state fun**. 

## 🤗 Having fun with state 

When was the last time you had fun working with state in JavaScript applications? For many, the answer is probably never because state management in JavaScript
is an endless game of choosing from compromises. You can choose to go fully immutable and end up writing endless reducers. You can go mutable and everything magically becomes an observable. Or you can `setState` and loose the benefit of serialization and time travel debugging. 

Unlike the view layer, where most frameworks agree on some variation of React components, state management is alloot less certain. It's less certain because
none of the available tools strike the balance that React components introduced
to the view layer. 

React components have a tiny API, they are functional, simple and extremely reusable. The tiny API gives you high productivity for little necessary knowledge. 
Functional components are predictable and easy to reason about. They are conceptually simple, but simplicity hides architecture that makes them performant. Their simplicity, predictability and isolation makes them composable and reusable.

These factors combined is what makes React style components easy to work with
and ultimately fun to write. Tiny API abstracting sophisticated architecture that delivers performance and is equaly useful on small and big projects is the outcome that we set out to achieve for state management with Microstates. 

## Tiny API

Microstates is architected to allow developers to declaratively describe their state and allow Microstates to figure out how to immutably transition that state. We provide you with transitions based on your declared types and custom transitions that you can optionally write. 



## FAQ

### What if I can't use class syntax?

Classes are functions in JavaScript, so you should be able to use a function to do most of the same
things as you would with classes.

```js
class Person {
  name = String;
  age = Number;
}
```

☝️ is equivalent to 👇

```js
function Person() {
  this.name = String;
  this.age = Number;
}
```

### What if I can't use Class Properties?

Babel compiles Class Properties into class constructors. If you can't use Class Properties, then you
can try the following.

```js
class Person {
  constructor() {
    this.name = String;
    this.age = Number;
  }
}

class Employee extends Person {
  constructor() {
    super();
    this.boss = Person;
  }
}
```

## Run Tests

```shell
$ npm install
$ npm test
```
