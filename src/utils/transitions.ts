import { reduceObject } from 'ioo';
import * as lensPath from 'ramda/src/lensPath';

import { IPath, ITransitionMap, ITypeTree } from '../Interfaces';
import defineComputedProperty from './define-computed-property';
import Tree from './tree';

export default class Transitions {
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
  static map(fn: (transition: () => any, path: IPath) => any, tree: Tree): ITransitionMap {
    return Tree.map(function transitionsMap(node: ITypeTree, path: IPath) {
      return reduceObject(
        node.transitions,
        (accumulator, transition, name: string) =>
          defineComputedProperty(
            accumulator,
            name,
            function computeTransition() {
              return fn(transition(lensPath(path)), path);
            },
            { enumerable: true }
          ),
        new Transitions()
      );
    }, tree);
  }
}
