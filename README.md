## Picostates

An exploration of how far we can lean on raw optics (lenses, et al..)
to implement most of microstates.

In order to remove free variables from the equation and get at the
core of the issue, picostates has been stripped down to the bare metal.

Picostates does not:

- provide any builtin types..
- have any DSL or other syntactic sugar. All classes are expressed as
  the output of whatever DSL we might want to layer on top.
- Explicitly maintain a tree representing the object graph.

Instead, it is an experiment to cut at the meat of the problems and
see if there is a simpler way to

- [x] immutable state transitions from any node
- [x] stable `state` property
- [x] Lazy evaluation of the consequence of transitions
- [x] Array and Object types that allow for generic types (parameterized types)
- [ ] "middleware" or some way for enclosing states to intercept and alter the meaning of transitions that occur within them.
- [ ] "queries" or the ability to collect states contained within the current state

## Tree

Whereas Microstates explicitly maintains a tree, and derives the `state`
and "transitions" object as metadata off of that tree, Picostates inverts this
approach, instead storing metadata at each object in the graph, and
then providing a "virtual tree" by allowing you to map over the
metadata of each node in the tree. The difference is that the actual
tree that is used by applcation code is the source of truth. This is
only possible through the power of our own lens library.

## Heavy duty lenses

Picostate lenses are more powerful by default than Ramda lenses. This
is because they can preserve type information on `set`. Technically
this could be done with Ramda lenses, but would require
re-implementing `lensProp` and `lensPath`.

Now, if we have picostate

```
A
 b: B
 c: C
```

We can set the 'c' property to a new `C`, and the resulting object
will still be an A.

### How it works

Every picostate object in the graph has an instance of `Meta` which
contains the lens for that object in the graph as well as the context
(or root node). The lens is a special lens that keeps both the
picostate and it's `state` property in sync with the next layer of
context.
A transition is nothing more than a lens set on the
root context of the new value. Since every transition has to eventually go through `set`, the
set logic just looks up the lens and does a set on the global context,
and then remaps the global context.

### Stability via the lens mechanism.

Another exciting development is that we can now use our own lenses to
keep both the microstate graph _and_ the state graph in sync, every
time, guaranteed. That's because updating the microstate, also updates
the state. In other words, state is stable for free.
