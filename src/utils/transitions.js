import { foldl, Functor, map } from 'funcadelic';
import lensPath from 'ramda/src/lensPath';

import defineComputedProperty from './define-computed-property';

const { keys } = Object;

export default class Transitions {
  static from(tree) {
    return map(function transitionsMap(node, path) {
      return foldl(
        (accumulator, { key: name, value: transition }) =>
          defineComputedProperty(
            accumulator,
            name,
            function computeTransition() {
              let t = transition(lensPath(path));
              // TODO(taras): store path on transition metadata (which doesn't exist yet)
              t.node = node;
              return t;
            },
            { enumerable: true }
          ),
        new Transitions(),
        node.transitions
      );
    }, tree);
  }
}

Functor.instance(Transitions, {
  /**
   * Transitions map lazily applies a callback to transition in transition tree.
   *
   * Let's consider an example,
   *
   * class Todo {
   *  title = String;
   *  isCompleted = Boolean;
   * }
   *
   * let callback = (transition, path) => (...args) => transition(value, ...args), tree);
   *                 ^ transition          ^ transition args      ^ to transition
   *
   * let transitions = Transitions.map(callback, Tree.from(Todo));
   *
   * At this point, the callback is not called yet. It'll be called when you access a transition.
   *
   * transitions.title.set // will cause callback to be invoked
   *
   * // (transition, path) => (...args) => transition(value, ...args)
   *    |---invoked---------| |---returned--------------------------|
   *
   * The returned part is the actual "reducer". When this reducer is called, it'll receive a
   * function that expects to recieve state and args from the reducer. The return value is new state.
   *
   * @param fn (transition: () => any, path: IPath) => any
   * @param tree Tree
   */
  map(fn, transitions) {
    return keys(transitions).reduce(
      (accumulator, name) => {
        let value = transitions[name];
        if (value instanceof Transitions) {
          return defineComputedProperty(
            accumulator,
            name,
            function computeMappedNode() {
              return map(fn, value);
            },
            { enumerable: true }
          );
        } else {
          return defineComputedProperty(
            accumulator,
            name,
            function computeTransition() {
              return fn(value, value.node.path);
            },
            { enumerable: true }
          );
        }
      },
      new Transitions(),
      transitions
    );
  },
});
