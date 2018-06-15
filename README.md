[![Build Status](https://travis-ci.org/microstates/microstates.js.svg?branch=master)](https://travis-ci.org/microstates/microstates.js)
[![Coverage Status](https://coveralls.io/repos/github/microstates/microstates.js/badge.svg?branch=master)](https://coveralls.io/github/microstates/microstates.js?branch=master)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Gitter](https://badges.gitter.im/microstates/microstates.js.svg)](https://gitter.im/microstates/microstates.js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

# Microstates

Composable State Primitives with a GraphQL inspired API.

Microstates is a functional runtime type system designed to ease state management in component based applications. It allows to declaratively compose application state from atomic state machines.

By combining lazy execution, algebraic data types and structural sharing, we created
a tool that provides a tiny API to describe complex data structures and provide a mechanism to change the value in an immutable way.

## Features

With microstates added to your project, you get:

* 🍇 Composable type system
* 🍱 Reusable state atoms
* 💎 Pure immutable state transitions without writing reducers
* ⚡️ Lazy and synchronous out of the box
* 🦋 Mosy elegant way to express state machines
* 🎯 Transpilation free type system
* 🔭 Optional integration with Observables
* ⚛ Use in Node.js and browser

But, most imporantly, Microstates makes working with state fun.

**When was the last time you had fun working with state?**

For many, the answer is probably never, because state management in JavaScript is an endless game of compromises. You can choose to go fully immutable and write endless reducers. You can go mutable and everything becomes an observable. Or you can `setState` and loose the benefit of serialization and time travel debugging.

Unlike the view layer, where most frameworks agree on some variation of React components, state management is a lot less certain. It's less certain because none of the available tools strike the balance that React components introduced to the view layer.

React components have a tiny API, they are functional, simple and extremely reusable. The tiny API gives you high productivity for little necessary knowledge. Functional components are predictable and easy to reason about. They are conceptually simple, but simplicity hides architecture that makes them performant. Their simplicity, predictability and isolation makes them composable and reusable.

These factors combined is what makes React style components easy to work with and ultimately fun to write. Tiny API abstracting sophisticated architecture that delivers performance and is equaly useful on small and big projects is the outcome that we set out to achieve for state management with Microstates.

It's not easy to find the right balance between simplicity and power, but considering the importance of state management in web applications, we believe it's a worthy challenge.

## Why Microstates?

Out tools effect how we solve problems and collaborate. 

Two tools can serve the same purpose but foster a completely different kind of ecosystem. Take jQuery plugins and React components as an example. Both of these tools provided a way to add custom behaviour to a DOM element but they fostered very different communities.

In React world today, we see many special purpose components that are easy to combine to create sophisticated user experiences. These components tend to have few options but provide just the right API for you to build what you need.

jQuery plugins on the other hand offer endsless list of options that are difficult get just right. In jQuery ecosystem, libraries tended to be monolithic because plugins from different libraries often did not work well together.

As a result, in React ecosystem we see components like [react-virtualized](https://github.com/bvaughn/react-virtualized) and [react-dnd](https://github.com/react-dnd/react-dnd) that are made by experienced React developers. These components save companies and developers millions of dollars in wasted development by eliminating the need for everyone to re-invent these components to build their user experiences.

The ability to leverage the experience of other developers that they made available as packages elevates our entire ecosystem. We call this _standing on the shoulders of giants_. Our goal is to bring this level of collaboration to state management.

### M in MVC

If you're a web developer and using a framework, you might be wondering how Microstates will work within your framework. For now, I will say that we'll have an integration for each framework, but it's important that we're on the same page about the role of Microstates within your application. Once we have that, you'll see more ways to use Microstates than I can cover in this README.

Regardless of the kind of application you're building, your application is made of code that roughly represents data, converts user input into data and presents data to the user. This traditionally has been described as MVC pattern where M, model, is data that is persisted or accumulated through user actions or input. V, view, is how that data is presented to the user, often we describe with components and C, controller, which represents the constraints that exist on the user's actions.

Talking about MVC is a little passe in some communities and understandbly so because traditional MVC did not bring a lot of comfort to early adopters in web frameworks. Of the early adopters, only a few MVCish frameworks are left, but regardless of the popularity of the term, the architectural pattern is still a big part of our applications.

What we're seeing now is the discovery of what MVC looks like in modern web applications. One thing that most of us can agree on is that our views are now called components. Over the last 5 years, we saw a lot of competition in the view layer to make the most performant and ergonomic view building developer experience.

### Functional Models

The view boom was in big part ignited by the introduction of React. With React, came the introduction and mass adoption of functional programming ideas in the JavaScript ecosystem. Functional programming brought a lot of simplicity to the view layer. It is conceptually simple - a component is a function that takes props and returns DOM. This simplicity helped developers learn React and has been adopted to a varied degree by most frameworks. The API that each frameworks exposes to their view is somewhat different but the general idea is the same.

Microstates brings the same kind of simplicity to the model layer. A Microstate is a functional model in a way that a component is a functional view. Component takes params and returns DOM, a Microstate takes value and returns state. DOM is a tree of element instances, state is a tree of model instances. A component is an abstraction that we use to manipulate the DOM tree. A microstate is an abstraction that we use to manipulate the state tree.

When you want to change what the user sees, you could imperatively manipulate the DOM elements with jQuery, but React taught us to change DOM declaratively by changing the data that the DOM reflects. In the same way, when you want to change the state, you must change the value and allow the state to be reflected.

A DOM tree is created by passing data to a root component. A state tree is created from a root type and value. 

## What is a Microstate?

A microstate is a JavaScript object that is created from a Microstate type and pojo value. The shape and methods of the microstate are determined by the type and value it contains. A type describes the structure and transitions that can be performed on the microstate. Using type and value, Microstates derives a single immutable state tree.

## Types

Microstates comes with 5 primitive types: `Boolean`, `Number`, `String`, `Object` and `Array`. In addition to primivite types, Microstates allows you to declare two parameterized types `[Type]`, `{Type}` and `class` types

### Type Composition

Microstates types are composable, which mean that you can combine types to create other types. Types that compose other types are called `class` types. They look similar to regular JavaScript classes but they must confirm to certain conventions that allow them to be composable.

### Defining class types

To define a class type with Microstates, you define a regular JavaScript class and use class properties(aka class fields) to describe where composed microstates will be. 

Let say we wanted to create a microstate type that represents a person. The person type will have a name that is a string and age that is just a number. 

You would declare a Microstate type in the following way,

```js
class Person {
  name = String;
  age = Number;
}
```

Once you have a type, you can use that type to create as many people as your application requires,

```js
import { create } from "microstates";

let person = create(Person, { name: "Homer", age: 39 });
```

Every microstate created with `Person` type will have the following shape,

```txt
+----------------------+
|                      |       +--------------------+
|  Microstate<Person>  +-name--+                    +-concat()->
|                      |       | Microstate<String> +-set()->
|                      |       |                    +-state: 'Homer'
|                      |       +--------------------+
|                      |
|                      |       +--------------------+
|                      +-age---+                    +-increment()->
|                      |       | Microstate<Number> +-decrement()->
|                      |       |                    +-set()->
|                      |       |                    +-state: 39
|                      |       +--------------------+
|                      |
|                      +-set()->
|                      +-state: Person { name: 'Homer', age: 39 }
+----------------------+
```

### Composing class types

`class` types can compose other `class` types. This makes it possible to build complex data structures that accurately describe your domain. Since Microstates are atomic and all transitions return microstates, Microstates can automatically handle transitions regardless of how your `class` types are composed.

Let's define another type that composes the person type.

```js
class Car {
  designer = Person;
  name = String;
}

let theHomerCar = create(Car, {
  designer: { name: "Homer", age: 39 },
  name: "The Homer"
});
```

`theHomerCar` object will have the following shape,

```txt
+-------------------+           +----------------------+
|                   |           |                      |       +--------------------+
|  Microstate<Car>  |           |  Microstate<Person>  +-name--+                    +-concat()->
|                   |           |                      |       | Microstate<String> +-set()->
|                   +-designer--+                      |       |                    +-state: 'Homer'
|                   |           |                      |       +--------------------+
|                   |           |                      |
|                   |           |                      |       +--------------------+
|                   |           |                      +-age---+                    +-increment()->
|                   |           |                      |       | Microstate<Number> +-decrement()->
|                   |           |                      |       |                    +-set()->
|                   |           |                      |       |                    +-state: 39
|                   |           |                      |       +--------------------+
|                   |           |                      |
|                   |           |                      +-set()->
|                   |           |                      +-state: Person<{ name: 'Homer', age: 39 }>
|                   |           +----------------------+
|                   |
|                   |           +--------------------+
|                   +-name------+                    +-concat()->
|                   |           | Microstate<String> +-set()->
|                   |           |                    +-state: 'The Homer'
|                   |           +--------------------+
|                   |
|                   +-set()->
|                   +-state: Car<{ designer: Person<{ name: 'Homer', age: 39 }> }, name: 'The Homer' }>
+-------------------+
```

The property names are important when defining `class` types because they are used to reference composed microstates. You can use the object dot notation to access a composed microstate. Using the same example from

```js
theHomerCar.designer.state;
//> Person<{ name: 'Homer', age: 39 }>

theHomerCar.designer.age.state;
//> 39

theHomerCar.name.state;
//> The Homer
```

### Parameterized Types

Quiet often it is helpful to describe your data as a collection of types. A blog might have an array of posts. To do this, you can use the parameterized array notation, `[Post]`. This signals to microstates that the microstate represents the state of an array collection of `Post` type.

```js
class Blog {
  posts = [Post];
}

class Post {
  id = Number;
  title = String;
}

let blog = create(Blog, {
  posts: [
    { id: 1, title: "Hello World" },
    { id: 2, title: "Most fascinating blog in the world" }
  ]
});

blog.posts[0].state;
//> Post<{ id: 1, title: 'Hello World' }>

blog.posts[1].state;
//> Post<{ id: 2, title: 'Most fascinating blog in the world' }>
```

When you're working with parameterized types, the shape of the microstate is determined by the value. In this case, `posts` is created with two items which will create a microstate with two items. Each item will be a microstate of type `Post`. If you push another item the `posts` microstate, it'll be treated as a `Post`.

```js
let blog2 = blog.posts.push({ id: 3, title: "It is only getter better" });

blog2.posts[2].state;
//> Post<{ id: 3, title: 'It is only getter better' }>
```

You can also create a parameterized object with `{Post}`. The difference is that the collection is treated as an object. This can be helpful when create normalized data stores.

```js
class Blog {
  posts = { Post };
}

class Post {
  id = Number;
  title = String;
}

let blog = create(Blog, {
  posts: {
    "1": { id: "1", title: "Hello World" },
    "2": { id: 2, title: "Most fascinating blog in the world" }
  }
});

blog.posts["0"].state;
//> Post<{ id: 1, title: 'Hello World' }>

blog.posts["1"].state;
//> Post<{ id: 2, title: 'Most fascinating blog in the world' }>
```

Parameterized objects have `Object` type transitions which allow you to use `assign` and `put`.

```js
let blog2 = blog.posts.put("3", { id: 3, title: "It is only getter better" });

blog2.posts["3"].state;
//> Post<{ id: 3, title: 'It is only getter better' }>
```

## State

State is an object graph that is lazily constructred from Microstate's type and value. It mirrors the structure of the Microstate type that was used to create it.  

### Building state

State is built from the root of the microstate down one child at a time as your application reaches for that state. The constuction of the state is done lazily which allows recursive data structures. `class` types are instantiated from their JavaScript classes.

Let's consider a faily deep data structure,

```js
class App {
  shop = Shop
}

class Shop {
  products = [Product]
}

class Product {
  title = String;
}
```

If we were to create this type, we'd get the following,

```js
import { create } from 'microstates';

let app = create(App, { 
  shop: { 
    products: [
      { id: 1, title: 'Sponge' }
    ] 
  } 
});

app.state instanceof App //> true
app.state.shop instanceof Shop //> true
app.state.shop.products instanceof Array //> true
app.state.shop.products[0] instanceof Product //> true
app.state.shop.products[0].title === 'Sponge' // true
app.state.shop.products[0].id === 1 //> true
```

What I tried to show here is that the object that's created from state property is the same structure as the microstate itself. According to the structure, each instance is populated by it's corresponding value from the value object. 

### All getters are cached

A microstate is a pure function of type and value, which means that for any type and value you can only ever have one state. We can rely on this to cache all of the computations that are derived this state. 

Let's say you have some state were you need to perform a heavy computation,

```js
class Table {
  rows = [Row]

  get sortedRows() {
    return this.rows.sort((a, b) => b.order - a.order));
  }
}

class Row {
  order = Number;
}

import { create } from 'microstates';

let table = create(Table, {
  rows: [
    { order: 10 }, { order: 4 }, { order: 2 }
  ]
});

table.state.sortedRows === table.state.sortedRows
```

When you read this getter, it'll be evaluated and result will be cached. All future reads will return the same value. 

*Note*: It's ok if you've never done this before with regular JavaScript classes. JavaScript classes that were not instantiated with Microstates are mutable and do not cache their getters. A similar example without Microstates would cause the sort function to invoked on each read. 

### Reuse of immutable state instances

When you create a deeply composed microstate, your state has the shape of a nesting doll. Each higher level contains all of it's children states. In this scenario, it's critical the parents reference the same state objects as the children. 

In our shop example, the state generated on app object should be the same state that's generated on product object. Let's look at the example again,

```js
import { create } from 'microstates';

class App {
  shop = Shop
}

class Shop {
  products = [Product]
}

class Product {
  title = String;
}

let app = create(App, { 
  shop: { 
    products: [
      { id: 1, title: 'Sponge' }
    ] 
  } 
});

app.state.shop.products[0] === app.shop.products[0].state
//    ^    state object on app, should be same as    ^ 
```

The state is generated from another microstate, but it's the same state as on the children. This ensures we maintain `===` (exact equality) down the state tree. 


## Transitions

Transitions are declarative operations that you can perform on a microstate to derive another state. All transitions return another microstate.

The simplest example of this is `toggle` transition on the `Boolean` type. The `toggle` transition takes no arguments and creates a new microstate with the state that is opposite of the current state. The `Boolean` type can be described with the following state chart.

![Boolean Statechart](README/boolean-statechart.png)

Here is what this looks like with Microstates.

```js
import { create } from "microstates";

let bool = create(Boolean, false);

bool.state;
//> false

let b2 = bool.toggle();

b2.state;
//> true
```

An important quality of the transitions in Microstates is that they always return a microstate. This is true inside of transition functions and outside where the transition is invoked. Microstates use this convention to allow composition to crazy complexity.

Let's compose a Boolean into another class type and see what happens.

```js
class App {
  name = String;
  notification = Modal;
}

class Modal {
  text = String;
  isOpen = Boolean;
}

let app = create(App, {
  name: "Welcome to your app",
  notification: {
    text: "Hello there",
    isOpen: false
  }
});

let opened = app.notification.isOpen.toggle();
//> Microstate<App>

opened.valueOf();
//> {
// name: 'Welcome to your app',
// notification: {
//   text: 'Hello there',
//   isOpen: true
// }}
```

In the above example, I invoked the boolean transition on `app.notification.isOpen` but we still got a new App microstate. The value was changed immutably without modifying the original object and the transition returned App microstate.

### Primitive type transitions

The primitive types have predefined transitions,

* `Boolean`
  * `toggle(): microstate` - return a microstate with opposite boolean value
* `String`
  * `concat(str: String): microstate` - return a microstate with `str` added to the end of the current value
* `Number`
  * `increment(step = 1: Number): microstate` - return a microstate with number decreased by `step`, default is 1.
  * `decrement(step = 1: Number): microstate` - return a microstate with number decreased by `step`, default is 1.
* `Object`
  * `assign(object): microstate` - return a microstate after merging object into current object.
  * `put(key: String, value: Any): microstate` - return a microstate after adding value at given key.
  * `delete(key: String): microstate` - return a microstate after removing property at given key.
* `Array`
  * `map(fn: (microstate) => microstate): microstate` - return a microstate with mapping function applied to each element in the array. For each element, the mapping function will receive the microstate for that element. Any transitions performed in the mapping function will be included in the final result.
  * `push(value: any): microstate` - return a microstate with value added to the end of the array.
  * `pop(): microstate` - return a microstate with last element removed from the array.
  * `shift(): microstate` - return a microstate with element removed from the array.
  * `unshift(value: any): microstate` - return a microstate with value added to the beginning of the array.
  * `filter(fn: state => boolean): microstate` - return a microstate with filtered array. The predicate function will receive state of each element in the array. If you return a falsy value from the predicate, the item will be excluded from the returned microstate.
  * `clear(): microstate` - return a microstate with an empty array.

Many transitions on primitive type are similar to methods on original classes. The biggest difference is that transitions return microstates.

### class type transitions

You can define transitions for class types. Inside of a transition, you can invoke transitions on other microstates that are composed onto this microstate. You can use the fact that composed microstates always return root microstates to chain transitions. 

```js
import { create } from "microstates";

class Person {
  name = String;
  age = Number;

  changeName(name) {
    return this.name.set(name);
  }
}

let homer = create(Person, { name: 'Homer', age: 39 });

let lisa = homer.changeName('Lisa');
```

### chaining transitions

The result of the last operation in the chain will be merged into the microstate. 

```js
class Session {
  token = String;
}

class Authentication {
  session = Session;
  isAuthenticated = Boolean;

  authenticate(token) {
    return this
      .session.token.set(token)
      .isAuthenticated.set(true);
  }
}

class App {
  authentication = Authentication
}

let app = create(App, { authentication: {} });

let authenticated = app.authentication.authenticate('SECRET');

authenticated.valueOf();
//> { authentication: { session: { token: 'SECRET' }, isAuthenticated: true } }
```

### `initialize` transition

Initialize transition converts value into a microstate when a microstate is being created with the `create` function. The initialize transition is invoked for every microstate that declares one. They are called from top to bottom, meaning that a parent microstate is initalized before the children. This is imporant because the parent microstate can change what children are created.

You can use this mechanism to change the value that is used to initialize children microstates.

For example,

```js
class Person {
  firstName = String;
  lastName = String;

  initialize({ firstname, lastname } = {}) {
    let initialized = this;

    if (firstname) {
      initialized = initialized.firstName.set(firstname);
    }

    if (lastname) {
      initialized = initialized.lastName.set(lastname);
    }

    return initialized;
  }
}
```

### `set` transition

`set` transition is the only transition that is available on all types. It can be used to replace the value of the current microstate with another value.

```js
import { create } from 'microstates'

let number = create(Number, 42).set(43);

number.valueOf()
//> 43
```

You can also use `set` transition to replace the current microstate with another microstate. This is especially useful when building state machines because it allows you to change the type of the current microstate. By changing the type, you're also changing available transitions and how the state is calculated. 

```js
import { types } from 'microstates';

class Vehicle {
  weight = Number;
  towing = Vehicle;

  get isTowing {
    return !!this.towing;
  }

  get towCapacity() {
    throw new Error('not implemented');
  }

  tow() {
    throw new Erorr('not implemented');
  }
}

class Car extends Vehicle {}

class Truck extends Vehicle {
  towCapacity = Number;

  tow(vehicle) {
    if (vehicle.weight.state < this.towCapacity.state) {
      return this.vehicle.set(vehicle);
    } else {
      throw new Error(`Unable to tow ${vehicle.weight.state} because it exceeds tow capacity of ${this.towCapacity.state}`);
    }
  }
}

class Friend {
  vehicle = Vehicle;
}

let prius = create(Car, { weight: 3000 });

let mustang = create(Car, { weight: 3500, towCapacity: 1000 });
let f150 = create(Truck, { weight: 5000, towCapacity: 13000 });

let rob = create(Friend).vehicle.set(mustant);
let charles = create(Friend).vehicle.set(f150);

rob.vehicle.tow(prius);
//> Error: not implemented

let result = charles.vehicle.tow(prius)

result.vehicle.state.isTowing
//> true
```

Those familiar with functional programming might recognize this as a flatMap operation. It is not required for you to understand Monads to use Microstates transitions. If you're interested in learning about the primitives of functional programming, you may checkout [funcadelic.js](https://github.com/cowboyd/funcadelic.js). Microstates uses Funcadelic under the hood. 

### Scope rules

For Microstates to be composable, they must work the same as a root microstate or composed into another microstate. For this reason, microstate transitions only have access to their own transitions and the transitions of the microstate that are composed into them. They do not have access to their context. This is similar to how components work. The parent component can render a child component and pass data to them. The child components does not have direct access to the parent component.

## `microstates` npm package

The `microstates` package provides the `Microstate` class and functions that operate on microstate objects.

You can import microstates library using,

```bash
npm install microstates

# or

yarn add microstates
```

Then import the libraries using,

```js
import Microstate, { create, from, map } from "microstates";
```

### create(Type, value): Microstate

`create` function is conceptually similar to `Object.create`. It creates a microstate object from type class and a value. This function is lazy, so it should be safe in most high performant operations even with complex and deeply nested data structures.

```js
import { create } from "microstates";

create(Number, 42);
//> Microstate
```

### from(any): Microstate

`from` allows to convert any POJO(plain JavaScript object) into a Microstate. Once you created a microstate, you can perform operations on all properties of the value.

```js
import { from } from "microstates";

from("hello world");
//Microstate<String>

from(42).increment();
//> Microstate<Number>

from(true).toggle();
//> Microstate<Boolean>

from([1, 2, 3]);
//> Microstate<Array<Number>>

from({ hello: "world" });
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
import { map, from } from "microstates";

let number = from(42);

function loggingMiddleware(next) {
  return (microstate, transition, args) => {
    console.log(`before ${transition.name} value is`, microstate.valueOf());
    let result = next(microstate, transition, args);
    console.log(`after ${transition.name} value is`, result.valueOf());
    return result;
  };
}

let loggedNumber = map(tree => tree.use(loggingMiddleware), number);

loggedNumber.increment();
// before increment value is 42
// after increment value is 43
```

## Middleware

Middleware makes it possible to modify what is called before a transition is performed and what is returned by a transition. You can use it to change the outcome of a transition or emit a side effect.

Installation of a middleware is done in an immutable fashion as with all other operations in Microstates. To install a middleware, you must map a microstate to create a new microstate that uses the given middleware.

Let's create logging middleware that will log every transition.

```js
import { create, map } from "microstates";

class Person {
  firstName = String;
  lastName = String;
}

let homer = create(Person, { firstName: "Homer", lastName: "Simpson" });

function loggingMiddleware(next) {
  return (microstate, transition, args) => {
    console.log(`before ${transition.name} value is`, microstate.valueOf());
    let result = next(microstate, transition, args);
    console.log(`after ${transition.name} value is`, result.valueOf());
    return result;
  };
}

let homerWithMiddleware = map(tree => tree.use(loggingMiddleware), homer);
```

The middleware will be invoked on any transition that you call on this Microstate. The middleware will be carried over on every consequent transition as it is now part of the Microstate. We use this mechanism to create Observable Microstates.

## Observable Microstates

Microstates provides an easy way to convert a microstate which represents a single value into a Observable stream of values. This is done by passing a microstate to `Observable.from` function. This function will return a Observable object with a subscribe method. You can subscribe to the stream by passing an observer to the subscribe function. Once you subscribe,
you will syncronously receive a microstate with middleware installed that will cause the result of transitions to be pushed through the stream.

You should be able to use to any implementation of Observables that supports `Observer.from` using [symbol-observable](https://github.com/benlesh/symbol-observable). We'll use `RxJS` for our example.

```js
import { from } from "rxjs";
import { create } from "microstates";

let homer = create(Person, { firstName: "Homer", lastName: "Simpson" });

let observable = from(homer);

let last;
let subscription = observable.subscribe(next => {
  // capture the next microstate coming through the stream
  last = next;
});

last.firstName.set("Homer J");

last.valueOf();
//> { firstName: 'Homer J', lastName: 'Simpson' }
```

This mechanism provides is the starting point for integration between Observables ecosystem and Microstates.


# Th Vision of Microstates

What would an ecosystem of shared state primitives give us?

## Shared Solutions

Imagine never having to write another normalized data store again because someone made a normalized data store Microstate that you can compose into your app's Microstate.

In the future(not currently implemented), you will be able to write a normalized data store like this,

```js
import Normalized from "future-normalized-microstate";

class MyApp {
  store = Normalized.of(Product, User, Category);
}
```

The knowledge about building normalized data stores is available in libraries like [Ember Data](https://github.com/emberjs/data), [Orbit.js](https://github.com/orbitjs/orbit), [Apollo](https://www.apollographql.com) and [urql](https://github.com/FormidableLabs/urql), yet many companies end up rolling their own because these tools are coupled to other stacks.

As time and resource permit, we hope to create a solution that will be flexible enough for use in most applications. If you're interested in helping us with this, please reach out.

## Added Flexibility

Imagine if your favourite Calendar component came with a Microstate that allowed you to customized the logic of the calendar without touching the rendered output. It might looks something like this,

```js
import Calendar from "awesome-calendar";

class MyCalendar extends Calendar.Model {
  // make days as events
  days = Day.of([Event]);

  // component renders days from this property
  get visibleDays() {
    return this.days.filter(day => day.status !== "finished");
  }
}

<Calendar.Component model={MyCalendar} />;
```

At these point, these are pseudo, but Microstates was architectured to allow these kinds of solutions to be created.

## Framework Agnostic Solutions

Competition moves our industry forward but concensus builds ecosystems.

Unfortunately, when it comes to the M(odel) of the MVC pattern, we are seeing neither competition nor concesus. Every framework has it's own model layer that is not compatible with another. This makes it difficult to create trully portable solutions that can be used on all frameworks.

It creates lockin that is detremental to businesses that use these frameworks and developers who are forced to make career altering decisions before they fully understand their choices.

We don't expect everyone to agree that Microstates is the right solution, but we would like to start the conversation about what a shared primitive for state management in JavaScript might look like. Microstates is our proposed solution.

In many ways, Microstates is a beginning. We hope you'll join us for the ride and help us create a future where building stateful applications in JavaScript is much easier than it is today.

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
