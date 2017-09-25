import * as lensPath from 'ramda/src/lensPath';
import * as view from 'ramda/src/view';

import { IPath, ITypeTree } from '../Interfaces';
import Tree from './tree';

export default class State {
  /**
   * Default implementation of State tree for given Type Tree and value.
   * Return value is a lazy state tree with every node as instance of Type
   * and leaf as lazy value.
   * 
   * @param tree Type Tree
   * @param value any value
   */
  static from(tree: Tree, value?: any) {
    return State.map(view => view(value), tree);
  }

  /**
   * State.map apply a callback to every value of a state tree. It accepts,
   * a callback and a tree to map. The callback is invoked lazily when value
   * is read. The callback will receive a view function as first argument.
   * 
   * The view function has curries lensPath(path). Invoking the view with value,
   * will return the focused value. 
   * 
   * @param fn (view: (state: any) => any, path: [string | int]) => any
   * @param tree Tree
   */
  static map(fn: (view: (state: any) => any, path: IPath) => any, tree: Tree) {
    return Tree.map(function stateMap(node: ITypeTree, path: IPath) {
      if (node.isPrimitive) {
        return fn(view(lensPath(path)), path) || node.transitions.initialize();
      } else {
        return node.transitions.initialize();
      }
    }, tree);
  }
}
