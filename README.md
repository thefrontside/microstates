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

## Features

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

When was the last time you had fun working with state in JavaScript applications? For many, the answer is probably never because state management in JavaScript is an endless game of choosing from compromises. You can choose to go fully immutable and end up writing endless reducers. You can go mutable and everything magically becomes an observable. Or you can `setState` and loose the benefit of serialization and time travel debugging. 

Unlike the view layer, where most frameworks agree on some variation of React components, state management is alloot less certain. It's less certain because none of the available tools strike the balance that React components introduced to the view layer. 

React components have a tiny API, they are functional, simple and extremely reusable. The tiny API gives you high productivity for little necessary knowledge. Functional components are predictable and easy to reason about. They are conceptually simple, but simplicity hides architecture that makes them performant. Their simplicity, predictability and isolation makes them composable and reusable.

These factors combined is what makes React style components easy to work with and ultimately fun to write. Tiny API abstracting sophisticated architecture that delivers performance and is equaly useful on small and big projects is the outcome that we set out to achieve for state management with Microstates. 

It's not easy to find the right balance between simplicity and power, but considering the importance of state management in web applications, we believe it's a worthy challenge.

## What is a Microstate?

A Microstate is an JavaScript object that is created from a Microstate type. Microstate types are similar to JavaScript classes except instances created from Microstate types are immutable, which means that they can not be modified after they were created. To modify an immutable object, you must create a copy of the original object with the change that you wish to make.

Let's consider the implication of this for a minute. JavaScript objects are mutable. If you create an instance of a JavaScript class, the created objects are mutable. 

**🤔 How does an immutable class instances work?**

This is the not the question that we set out to answer when we started working on Microstates in 2016, but it's one of the question that we believe Microstates is answering.

The challenge with answering this question is that it uproots a lot of what we know about working with JavaScript classes. Let's consider some of these and see where it takes us.

### Instance Methods

Instance methods are functions that can modify properties of the object. For example, `setFirstName` might modify the `firstName` on an instance of `Person`.

```js
// typical JavaScript class (not Microstate)
class Person {
  constructor({ firstName, lastName }) {
    this.firstName = firstName;
    this.lastName = lastName;
  }

  setFirstName(firstName) {
    this.firstName = firstName;
  }
}

let homer = new Person({ firstName: 'Homer', lastName: 'Simpson' });

homer.setFirstName('Homer J');
```

But what if the instance is immutable, `setFirstName` must return a new instance of `Person` class without modifying the original object. This raises another question, how do you create a copy of an instance of a class? I won't answer this question here, but I'll just say that Microstates does it.

Let's see what this would look like with a Microstate.

```js
// this is a Microstate type
class Person {
  firstName = String;
  lastName = String;

  setFirstName(firstName) {
    return this.firstName.set(firstName);
  }
}

import { create } from 'microstates';

let homer = create(Person, { firstName: 'Homer', lastName: 'Simpson' });

// original homer is unmodified
let homerJ = homer.setFirstName('Homer J');
```

Unlike a regular JavaScript class methods which imperatively mutate objects they have access to, Microstates types declaratively describe what should be different in the copy that's returned from the method.

### Getters

Getters on JavaScript objects are evaluated everytime that a getter is read. This can very wasteful when properties of an object haven't changed. Frameworks like Ember and Vue have *computed properties* which memoize computations and automatically recompute when a property changes. 

Tracking property changes is not possible in pure JavaScript, as a result there is no safe way to cache getters on JavaScript objects. This limitation of getters can lead to very suble performance problems when used in frameworks like React that use shallow equality to determine if components need to rerender.

Consider the following example,

```js
// regular JavaScript class
class Shop {
  constructor({ products, filter }) {
    this.products = products;
    this.filter = filter;
  }

  get filtered() {
    return this.products.filter(product => product.category === this.filter);
  }
}

let filter = 'clothing';
let products = [ 
  { name: 'Pants', category: 'clothing' },
  { name: 'Shirt', category: 'clothing' },
  { name: 'Watch', category: 'accessory' }
]

let shop = new Shop({ products, filter });

shop.filtered === shop.filtered
//> false
```

If you passed `shop.filtered` to a React component, this React component would re-render every time that the parent component's render function is called even though neither `products` nor `filter` is changed.

This is a very different story in Microstates because Microstate instances are 
immutable. There is no need for property tracking, since properties can not change. It's safe to automatically cache getters because for any state they can only ever have one result. 

Here is how this example would look in Microstates,

```js
// Microstate type 
// (these annotations are for the readers, they don't do anything special)
class Shop {
  products = [Product]
  filter = String

  get filtered() {
    return this.products.filter(product => product.category === this.filter);
  }
}

class Product {
  name = String;
  category = String;
}

let filter = 'clothing';
let products = [ 
  { name: 'Pants', category: 'clothing' },
  { name: 'Shirt', category: 'clothing' },
  { name: 'Watch', category: 'accessory' }
]

import { create } from 'microstates';

let shop = create(Shop, { products, filter });

shop.state.filtered === shop.state.filtered
//> true
```

Cached getters in Microstates make cached computed properties available in all frameworks, not just Vue and Ember. For those familiar with Reselect, cached getters can replace Reselect for most applications.

### Serialization & Deserialization

Serialization is the process of converting class instances into plain JavaScript objects (aka POJOs) that can be saved as JSON. Deserialization is the opposite process of converting the JSON to JavaScript class instances. 

**How can you serialize a JavaScript class instances?**

In JavaScript, all objects have a `valueOf` method. [According to MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/valueOf), *the valueOf() method returns the primitive value of the specified object*. In theory, we should be able to take the primitive value of a class, serialize it to JSON, then restore with `JSON.parse`. 

We can't expect to get same objects, but we should at least get instances of classes so we use methods and getters on these objects.

Let's see what that actually does. You can play with this example in [▶ RunKit](https://runkit.com/taras/valueof-javascript-class).

```js
// regular JavaScript class
class Shop {
  constructor({ products, filter }) {
    this.products = products.map(product => new Product(product));
    this.filter = filter;
  }

  get filtered() {
    return this.products.filter(product => product.category === this.filter);
  }
}

class Product {
    constructor({ name, category }) {
        this.name = name;
        this.category = category;
    }
}

let filter = 'clothing';
let products = [ 
  { name: 'Pants', category: 'clothing' },
  { name: 'Shirt', category: 'clothing' },
  { name: 'Watch', category: 'accessory' }
]

let shop = new Shop({ products, filter });

let restored = JSON.parse(JSON.stringify(shop.valueOf()));

restored instanceof Shop
//> false
```

`shop.valueOf()` doesn't give you a primitive value, because `valueOf` class instance returns the shop object. It doesn't return a primivite value of the object, it returns the same object. `JSON.parse/JSON.stringify` are not enough because these functions don't know how to convert your POJOs into instances. If you look closely, you'll see that actually deserialization is done manually in the constructor. This gets very complicated with complex data structures and inpractical when you have complex relationships between data.

We need an easier way to serialize and deserialize complex data structures. Microstates can do this for you because Microstates are designed to be serializable. Let's see what that would look like. You can run this example in [▶ RunKit](https://runkit.com/taras/serializing-deserializing-a-microstate)

```js
class Shop {
  products = [Product]
  filter = String

  get filtered() {
      return this.products.filter(product => product.category === this.filter);
  }
}

class Product {
  name = String;
  category = String;
}

let filter = 'clothing';
let products = [ 
  { name: 'Pants', category: 'clothing' },
  { name: 'Shirt', category: 'clothing' },
  { name: 'Watch', category: 'accessory' }
]

import { create } from 'microstates';

let shop = create(Shop, { products, filter });

shop.valueOf();
// give you the value that can be used to restore the state
```

Microstates actually does deserialization by default. When you create a Microstate object, you provide the `create` function with the type and a POJO that represents the value. Microstates internally will create all of the instances using the type as a blueprint for the final state. 

As discussed earlier, Microstates methods return copies that are derived from original microstate. These copies will have a new value. This allows to serialize/deserialize a type to any derived state. 

For those familiar with tools like ReactDevTools and time travel debugging, Microstates makes it possible to use these kinds of tools on individual Microstate level. Microstates can work like tiny Redux stores where you don't have to write reducers while still get the benefits of time travel debugging.

In summary, Microstates are immutable JavaScript objects that are serializable, allow you to cache getters and provide a mechanism to declaratively derive next state using class like instance methods. They look like regular JavaScript classes but they hold conventions and performance improvements for state composed of many smaller states.

## Why Microstates?

Out tools effect how we solve problems and collaborate. Two tools can serve the same purpose but foster a completely different kind of ecosystem. Take jQuery plugins and React components as an example. Both of these tools provided a way to add custom behaviour to a DOM element but they fostered very different communities. 

In React world today, we see many special purpose components that are easy to combine to create sophisticated user experiences. These components tends to have few options but provide just the right API for you to build what you need. 

jQuery plugins on the other hand offer endsless list of options that are difficult get just right. In jQuery ecosystem, libraries tended to be monolithic because plugins from different libraries often did not work well together. 

As a result, in React ecosystem we see components like [react-virtualized](https://github.com/bvaughn/react-virtualized) and [react-dnd](https://github.com/react-dnd/react-dnd) that are made by experienced React developers. These components save companies and developers millions of dollars in wasted development by eliminating the need for everyone to re-invent these components to build their user experiences.  

The ability to leverage the experience of other developers that they made available as packages elevates our entire ecosystem. We call this *standing on the shoulders of giants*. Our goal is to bring this level of collaboration to state management. 

### What would an ecosystem of shared state primitives give us?

### Shared Solutions

Imagine never having to write another normalized data store again because someone made a normalized data store Microstate that you can compose into your app's Microstate. 

In the future(not currently implemented), you will be able to write a normalized data store like this,

```js
import Normalized from 'future-normalized-microstate';

class MyApp {
  store = Normalized.of(Product, User, Category)
}
```

The knowledge about building normalized data stores is available in libraries like [Ember Data](https://github.com/emberjs/data), [Orbit.js](https://github.com/orbitjs/orbit), [Apollo](https://www.apollographql.com) and [urql](https://github.com/FormidableLabs/urql), yet many companies end up rolling their own because these tools are coupled to other stacks.

As time and resource permit, we hope to create a solution that will be flexible enough for use in most applications. If you're interested in helping us with this, please reach out. 

### Added Flexibility

Imagine if your favourite Calendar component came with a Microstate that allowed you to customized the logic of the calendar without touching the rendered output. It might looks something like this,

```js
import Calendar from 'awesome-calendar';

class MyCalendar extends Calendar.Model {
  // make days as events
  days = Day.of([Event])

  // component renders days from this property
  get visibleDays() {
    return this.days.filter(day => day.status !== 'finished');
  }
}

<Calendar.Component model={MyCalendar}/>
```

At these point, these are psycode, but Microstates was architectured to allow these kinds of solutions to be created.  

### Framework Agnostic Solutions

Competition moves our industry forward but concensus builds ecosystems. 

Unfortunately, when it comes to the M(odel) of the MVC pattern, we are seeing neither compentition nor concesus. Every framework has it's own model layer that is not compatible with another. This makes it difficult to create trully portable solutions that can be used on all frameworks. 

It creates lockin that is detremental to businesses that use these frameworks and developers who are forced to make career altering decisions before they fully understand their choices. 

We don't expect everyone to agree that Microstates is the right solution, but we would like to start the conversation about what a shared primitive for state management in JavaScript might look like. Microstates is our proposed solution.

In many ways, Microstates is a beginning. We hope you'll join us for the ride and help us create a future where building stateful applications in JavaScript is much easier than it is today.

## M in MVC

If you're a web developer and using a framework, you might be wondering how Microstates will work within your framework. For now, I will say that we'll have an integration for each framework, but it's important that we're on the same page about the role of Microstates within your application. Once we have that, you'll see more ways to use Microstates than I can cover in this README.

Regardless of the kind of application you're building, your application is made of code that roughly represents data, converts user input into data and presents data to the user. This traditionally has been described as MVC pattern where M, model, is data that is persisted or accumulated through user actions or input. V, view, is how that data is presented to the user, often we describe with components and C, controller, which represents the constraints that exist on the user's actions.

Talking about MVC is a little passe in some communities and understandbly so because traditional MVC did not bring a lot of comfort to early adopters in web frameworks. Of the early adopters, only a few MVCish frameworks are left, but regardless of the popularity of the term, the architectural pattern is still a big part of our applications.

What we're seeing now is the discovery of what MVC looks like in modern web applications. One thing that most of us can agree on is that our views are now called components. Over the last 5 years, we saw a lot of competition in the view layer to make the most performant and ergonomic view building developer experience. 

## Functional Models

The view boom was in big part ignited by the introduction of React. With React, came the introduction and mass adoption of functional programming ideas in the JavaScript ecosystem. Functional programming brought a lot of simplicity to the view layer. It is conceptually simple - a component is a function that takes props and returns DOM. This simplicity helped developers learn React and has been adopted to a varied degree by most frameworks. The API that each frameworks exposes to their view is somewhat different but the general idea is the same.

Microstates brings the same kind of simplicity to the model layer. A Microstate is a functional model in a way that a component is a functional view. Component takes params and returns DOM, a Microstate takes value and returns state. DOM is a tree of element instances, state is a tree of model instances. A component is an abstraction that we use to manipulate the DOM tree. A microstate is an abstraction that we use to manipulate the state tree. 

When you want to change what the user sees, you could imperatively manipulate the DOM elements with jQuery, but React taught us to change DOM declaratively by changing the data that the DOM reflects. In the same way, when you want to change the state, you must change the value and allow the state to be reflected. 

A DOM tree is created by passing data to a root component. A state tree is created from a root type and value. By default, Microstates expects structure of the data to match the structure of the value. 

For example,

```js
class Person {
  firstName = String;
  lastName = String;
}
```

Matches `{ firstName: 'Homer', lastName: 'Simpson' }` and Microstates will take properties from the value to populate a state tree that it creates for the type.

```js
import { create } from 'microstates';

let person = create(Person, { firstName: 'Homer', lastName: 'Simpson' });

person.state.firstName
//> Homer

person.state.lastName
// => Simpson
```

If your value does not match the structure or you need to process the value, then you can specify an `initialize` transition that will return a different state tree from the value. For example, if your data passes lower case properties, you could do something like this,

```js
import { create } from 'microsates'

class Person {
  initialize(props = {}) {
    let values = {}
    if (props.firstname) {
      values.firstName = props.firstname;
    }
    if (props.lastname) {
      value.lastName = props.lastname;
    }
    return create(Person, values);
  }
}
```

The return value from the `initialize` transition, as with all transitions, is a Microstate. Those familiar with functional programming might recorganize this as a flatMap operation. It is not required for you to understand Monads to use Microstates transitions, but if you're interested in learning about the primitives of functional programming, you may checkout [funcadelic.js](https://github.com/cowboyd/funcadelic.js) which Microstates uses under the hood. 

Conceptually, a Microstate is similar to a single DOM element, except DOM elements are mutable and microstates are immutable. If you wanted to create a DIV element and set it's content, you can set `textContent` property on the DOM node. Like this

![Creating a DOM element](README/create-dom-element-fast.gif)

Similar pattern will not work with a Microstate because it's immutable. You must call a method that will return another Microstate. This new Microstate will have a new value and a new state tree that's derived from the Microstate's type and the new value. 

The ability to express a state as type and value allows us to give each state an identity. In other words, by having a type and value represent a single state, we are able to distinguish one state from another.

## Reactivity with Microstates

The ability to give state identity, predictably store and restore the state from identity and quickly compare the identity of the state to another state is the fundamental building build block of reactive programming with Microstates. 

A Microstate represents a single state, to make a react programming engine you need a way to store an identity and change the identity over time. The simpliest way to do this is to store a reference to the microstate. 

For example,

```js
import { create } = 'microstates';

class Person {
  firstName = String;
  lastName = String;

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}

class Car {
  licensePlate = String;
  color = String;
  make = String;
  year = Number;
  owner = Person;
  status = String;

  get info() {
    let info `${this.status} ${this.color}  ${this.year} ${this.make}`;
    if (this.owner) {
      return `${info} owned by ${this.owner.fullName}`; 
    }
    return this.owner;
  }

  sell({ licensePlate, owner }) {
    return this
      .status.set('sold')
      .licensePlate.set(licensePlate)
      .owner.set(owner);
  }
}

let car = create(Car, { make: 'Honda', color: 'red', year: 2018 });
```

The *car* variable references the microstate object which contains `Car` type with value `{ make: 'Honda', color: 'red', year: 2018 }`. The type also describes the operations that can be performed on this type. 

To create a tiny reactive engine, we need to 
1. render the state that's referenced by the car variable, 
2. create an action which is a function that will perform the transition, 
3. bind the action to some event emitter,
4. replace the car variable with a reference to the new microstate,
5. re-render to display the latest state

```js
let car = create(Car, { make: 'Honda', color: 'red', year: 2018 });

const render = () => console.log(car.state.info)

// 1. render state referenced by car variable 
render();

// 2. create a function that will perform the transition, 
const sellCarTo = ({ firstName, lastName, licensePlate }) => {
  // 4. replace the car variable with a reference to the new microstate,
  car = car.sell({ firstName, lastName, licensePlate });
  // 5. re-render to display the latest state
  render();
}

// 3. bind the action to some event emitter,
setInterval(() => {
  sellCarTo({ firstName: 'Homer', lastName: 'Simpson', licensePlate: 'DONUTS' });
}, 1000);
```

A variation of this pattern is the foundation of every reactive engine, including React, Vue, Ember & Angular. This pattern is so significant that we added a special way to integrate this pattern into Microstates via middleware.

## Middleware

Middleware makes it possible to modify what is called before a transition is performed and what is returned by a transition. You can use it to change the outcome of a transition or emit a side effect. 

Installation of a middleware is done in an immutable fashion as with all other operations in Microstates. To install a middleware, you must map a microstate to create a new microstate that uses the given middleware. 

Let's create logging middleware that will log every transition.

```js
import { create, map } from 'microstates';

class Person {
  firstName = String;
  lastName = String;
}

let homer = create(Person, { firstName: 'Homer', lastName: 'Simpson' });

function loggingMiddleware(next) {
  return (microstate, transition, args) => {
    console.log(`before ${transition.name} value is`, microstate.valueOf());
    let result = next(microstate, transition, args);
    console.log(`after ${transition.name} value is`, result.valueOf());
    return result;
  }
}

let homerWithMiddleware = map(tree => tree.use(loggingMiddleware), homer);
```

The middleware will be invoked on any transition that you call on this Microstate. The middleware will be carried over on every consequent transition as it is now part of the Microstate. We use this mechanism to create Observable Microstates.

## Observable Microstates

Microstates provides an easy way to convert a microstate which represents a single value into a Observable stream of values. This is done by passing a microstate to `Observable.from` function. This function will return a Observable object with a subscribe method. You can subscribe to the stream by passing an observer to the subscribe function. Once you subscribe, 
you will syncronously receive a microstate with middleware installed that will cause the result of transitions to be pushed through the stream.

You should be able to use to any implementation of Observables that supports `Observer.from` using [symbol-observable](https://github.com/benlesh/symbol-observable). We'll use `RxJS` for our example.

```js
import { from } from 'rxjs';
import { create } from 'microstates';

let homer = create(Person, { firstName: 'Homer', lastName: 'Simpson' });

let observable = from(homer);

let last;
let subscription = observable.subscribe(next => {
  // capture the next microstate coming through the stream
  last = next;
})

last.firstName.set('Homer J');

last.valueOf();
//> { firstName: 'Homer J', lastName: 'Simpson' }
```

This mechanism provides is the starting point for integration between Observables ecosystem and Microstates. 

## `microstates` package

The `microstates` package provides the `Microstate` class and functions that operate on microstate objects.

You can import microstates library using,

```bash
npm install microstates

or 

yarn add microstates
```

Then import the libraries using,

```js
import Microstate, { create, from, map } from 'microstates';
```

### create(Type, value): Microstate

`create` function is conceptually similar to `Object.create`. It creates a microstate object from type class and a value. This function is lazy, so it should be safe in most high performant operations even with complex and deeply nested data structures.

```js
import { create } from 'microstates';

create(Number, 42);
//> Microstate
```

### from(any): Microstate

`from` allows to convert any POJO(plain JavaScript object) into a Microstate. Once you created a microstate, you can perform operations on all properties of the value.

```js
import { from } from 'microstates';

from('hello world')
//Microstate<String> 

from(42).increment()
//> Microstate<Number>

from(true).toggle()
//> Microstate<Boolean>

from([1, 2, 3])
//> Microstate<Array<Number>>

from({ hello: 'world' })
//> Microstate<Object>

```

`from` is lazy, so you can put in any deeply nested pojo and microstates will allow you to transition it. The cost of building the objects inside of microstates is paid whenever you reach for a microstate inside. For example, `let o = from({ a: { b: c: 42 }})` doesn't do anything until you start to read the properties with dot notiation like `o.a.b.c`.

```js
from({ a: { b: c: 42 }}).a.b.c.increment().valueOf();
// { a: { b: { c: 43 }}}

from({ hello: [ 'world' ]}).hello[0].concat('!!!').valueOf();
// { hello: [ 'world!!!' ]}
```

### map(fn: tree => tree, microstate: Microstate): Microstate

`map` function is used to perform operations on the that is used to build the microstate. It expects a function and a microstate and returns a microstate. This function accepts a mapping function which will receive the microstate's tree. The mapping function is expected to return a tree. The tree that is returned from the mapping will be used to generate the microstate that's returned by the map operation.

This is most frequently used go derive a microstate with middleware installed. 

```js
import { map, from } from 'microstates';

let number = from(42);

function loggingMiddleware(next) {
  return (microstate, transition, args) => {
    console.log(`before ${transition.name} value is`, microstate.valueOf());
    let result = next(microstate, transition, args);
    console.log(`after ${transition.name} value is`, result.valueOf());
    return result;
  }
}

let loggedNumber = map(tree => tree.use(loggingMiddleware), number);

loggedNumber.increment();
// before increment value is 42
// after increment value is 43
```

### Microstates class

Microstates class is only really useful for checking if something is an instance of a Microstate. You should not use `new Microstate()`. It's used internally to create new microstates but for most cases `create` function should be used.

## Type Composition DSL

Type Composition DSL (domain specific langulage) is used to describe the shape of data and operations that you can perform on that data. 

Microstates uses pure JavaScript for its DSL with the exception of [Class Properties (aka Class Fields)](https://github.com/tc39/proposal-class-fields) which are a Stage 3 proposal. `create-react-app` includes class properties transpiler. You can use [@babel/plugin-proposal-class-properties](https://github.com/babel/babel/tree/master/packages/babel-plugin-proposal-class-properties) or checkout *what if I can't use class syntax?* section of the FAQ.

The primary purpose of the DSL is to give developers a way to declaratively describe their data and how that data can change. Microstates uses a run time type system to understand your data. It has 6 built in types: `Boolean`, `Number`, `String`, `Object` and `Array`, two parameterized types `[Type]` and `{Type}` and `class` types. You already saw some of these types in action earlier in the README.

Microstates uses this type information to extract 3 pieces of information from your types.

1. Type Hiearchy
2. Transitions
3. State

### Type Hierarchy

When you define a `class` type, you're telling Microstates what the hiearchy should be. The hierarchy is used to provide access to compose microstates via dot notation. 

For example from this type,

```js
class Person {        
  name = String;      
  age = Number;       
}
```

We get the following microstate,

```txt
                     + Microstate<String>
                    /
                   /name
                  /
Microstate<Person>
                  \
                   \age
                    \
                     + Microstate<Number>
```

Each microstate has on it transitions for that type and in that particular location in the microstate. You can use object notation to access composed microstate. 

```js
let person = create(Person, { name: 'Homer', age: 39 });

person.name
//> Microstate<String>

person.age
//> Microstate<Number>
```

The same hiearchy is used when reading values.

```js
let person = create(Person, { name: 'Homer', age: 39 });
    // |                        ^              ^
    // name------value----------+              |
    // age-------value-------------------------+
```

This is the foundation of composition of Microstates. This pattern allows you to compose these types as necesarry to accurately reflect your data. 

For example, we can create a group of people,

```js
class Group {
  members = [Person]
}
```

```txt
Microstate<Group>--+
                   |                           + Microstate<String>
                   |                          /
                   |                         /name
                   |                        /
                   +- 0 - Microstate<Person>
                   |                        \
                   |                         \age
                   |                          \
                   |                           + Microstate<Number>
                   |
                   |                           + Microstate<String>
                   |                          /
                   |                         /name
                   |                        /
                   +- 1 - Microstate<Person>
                                            \
                                             \age
                                              \
                                               + Microstate<Number>
```

`[Person]` means that `members` property is an array of `People` instances. These kinds of types are called parameterized arrays. The number of items in that array depends on it's value. Any object in that array will be created as a `Person`. 

To access objects in parameterized arrays, you can use the array notation.

```js
let group = create(Group, { members: [ { name: 'Homer', age: 39 }, { name: 'Bart', age: 10 } ] });

group.members[0].state                 
                //> Person                  |              |          |              |
                // name------value----------+              |          |              |
                // age-------value-------------------------+          |              |
                                                          //          |              |
group.members[1].state                                    //          |              |
                //> Person                                            |              |
                // name------value------------------------------------+              |
                // age-------value---------------------------------------------------+
```

This hierarchy is used to determine how the value should be changed. When you call a transition on one of the composed types, the value is modified in the same place.

```js
let group2 = group.members[0].age.increment();
```

The value of the new object will be changed.

```diff
{ 
  members: [ 
-   { name: 'Homer', age: 39 }, 
+   { name: 'Homer', age: 40 }, 
    { name: 'Bart', age: 10 } ] 
  ]
}
```


## FAQ

### What if I can't use class syntax?

Classes are functions in JavaScript, so you should be able to use a function to do most of the same things as you would with classes.

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
