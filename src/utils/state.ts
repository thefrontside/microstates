import * as lensPath from 'ramda/src/lensPath';
import * as view from 'ramda/src/view';

import { IPath, ITypeTree } from '../Interfaces';
import Tree from './tree';

export default class State {
  static from(tree: Tree, value?: any) {
    return State.map(view => view(value), tree);
  }

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
