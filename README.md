[![Build Status](https://travis-ci.org/cowboyd/microstates.js.svg?branch=master)](https://travis-ci.org/cowboyd/microstates.js) [![Coverage Status](https://coveralls.io/repos/github/cowboyd/microstates.js/badge.svg?branch=master)](https://coveralls.io/github/cowboyd/microstates.js?branch=master)

# Microstates

Immutable. Composable. Lovable.

## Introduction

Microstates are a composable immutable data structure that knows how to transition its own state. Microstates are created from a Type which
describes microstate's structure. A type can be `Number`, `String`, `Boolean`, `Object`, `Array` or a custom class. A microstate generates a states tree and a transitions tree for given structure.

The states tree provides a convinient way to access values of a microstate. States tree is created from initial value which can be `undefined`. 

For example, 

```js
import Microstates from 'microstates';

let { states } = Microstates.from(Number);

console.log(states); // => 0
```

`states` is 0 because initial value is not specified and `Number` type has default value of `0`.

You can change the initial value by passing 2nd argument to `Microstates.from` function.

```js
let { states } = Microstates.from(Number, 42);

console.log(states); // => 42
```

The transitions tree provides transitions that can performed on your microstate. Transitions are inferred from type.

For example,

```js
let { transitions } = Microstates.from(Number, 42);

console.log(transitions.increment()); // => 43
```

Microstates are immutable, which means that transitions create new values and do not modify original values.

```js
let { states, transitions } = Microstates.from(Number, 42);

console.log(states); // => 42
console.log(transitions.increment()); // => 43
console.log(states); // => 42
```

## Types

Microstates library comes with five native types: [`Number`](src/types/array.js), [`String`](src/types/string.js), [`Boolean`](src/types/boolean.js), [`Array`](src/types/array.js) and [`Object`](src/types/object.js). We call these types native because they represent values that are native to JavaScript language. 

All native types have default values. Default values are used when an initial value is not specified.

```js
console.log(Microstates.from(Number).states); // => 0
console.log(Microstates.from(String).states); // => ''
console.log(Microstates.from(Boolean).states); // => false
console.log(Microstates.from(Array).states); // => []
console.log(Microstates.from(Object).states); // => {}
```

Native types have transitions that are appropriate for the type. 

For example, `Number` type has `increment`, `decrement`, `sum` and `subtract`.

```js
let { transitions } = Microstates.from(Number, 42);

console.log(transitions.increment()); // => 43
console.log(transitions.decrement()); // =>  41
console.log(transitions.sum(5)); // => 47
console.log(transitions.subtract(2)); // => 40  
```

`String` has `concat`. 

```js
let { transitions } = Microstates.from(String, 'hello world');

console.log(transitions.concat('!')); // => hello world!
```

`Boolean` has `toggle`.

```js
let { transitions } = Microstates.from(Boolean, true);

console.log(transitions.toggle()); // => false
```

`Array` has `push`.

```js
let { transitions } = Microstates.from(Array, [ 'cat', 'dog', 'horse' ]);

console.log(transitions.push('bird')); // => [ 'cat', 'dog', 'horse', 'bird' ]
```

`Object` has `assign`.

```js
let { transitions } = Microstates.from(Object, { firstName: 'Peter' });

console.log(transitions.assign({ lastName: 'Griffin' } )); // => { firstName: 'Peter', lastName: 'Griffin' }
```

All types have a transition called `set`. `set` can be used to replace the value. 

### Composition

Native types are basic building blocks of Microstates. You can compose these values into more complex data structures. To group related values together, you can define a type using ES6 `class` syntax.

```js
class Person {
  name = String;
  age = Number;
  isFunny = Boolean;
  likes = Array;
  nsaMetadata = Object;
}
```

*Note*: this syntax relies on Class properites which are currently at [State 3 of TC39](https://github.com/tc39/proposal-class-fields#field-declarations). This syntax is available with [Babel Class Properties Transform](https://babeljs.io/docs/plugins/transform-class-properties).

You can create microstates from this type.

```js
let { states } = Microstates.from(Person);

console.log(states); // => { name: '', age: 0, isFunny: false, likes: [], nsaMetadata: {} }
```

You can prepopulate the microstates with values by providing initial data.

```js
let { states, transitions } = Microstates.from(Person, { 
  name: 'Peter Griffin',
  age: 64,
  isFunny: true,
  likes: ['beer'],
  nsaMetadata: {
    iraqiLobster: true
  }
});

console.log(states); 
// => { 
// name: 'Peter Griffin',
//  age: 64,
//  isFunny: true,
//  likes: ['beer'],
//  nsaMetadata: {
//    iraqiLobster: true
//  }
// }
```

The transitions tree is generated for composed states. You can invoke transitions that are nested on corresponding properties.

```js
console.log(transitions.likes.push(`Surfin' Bird`)); 
// => { 
//  name: 'Peter Griffin',
//  age: 65,
//  isFunny: true,
//  likes: ['beer', 'Surfin\' Bird'],
//  nsaMetadata: {
//    iraqiLobster: true
//  }
// }
```

Composed transitions will return a new value that represents transitioned state. The returned object will be a new object with new value.
Microstates are designed to perfectly for tools like Redux that expect new state to be returned from a reducer. 

Composed states can contain other composed states and computed properties. 

```js
class Session {
  token = String;
}

class Authentication {
  session = Session;
  get isAuthenticated() {
    return this.session.token.length > 0;
  }
}

class State {
  authentication = Session;
}

let { states, transitions } = Microstates.from(State, { 
  authentication: {
    session: {
      token: 'SECRET'
    }
  }
});

console.log(states.authentication.isAuthenticated); // true
```

Invoking a transition on a composed state will immutably transition the state.

```js
console.log(transitions.authentication.session.token.set(null)); // => 
// {
//   authentication: {
//     session: {
//       token: ''
//     }
//   }
// }
```