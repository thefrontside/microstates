import { IPath, ITypeTree } from '../Interfaces';
import Tree from './tree';

export default class State {
  static map(fn: (value: any, path: IPath) => any, tree: Tree) {
    return Tree.map(function mapState(node: ITypeTree, path: IPath) {
      return fn(node.transitions.initialize(), path);
    }, tree);
  }
}
