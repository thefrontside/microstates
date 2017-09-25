import { reduceObject } from 'ioo';
import * as lensPath from 'ramda/src/lensPath';

import { IPath, ITransitionMap, ITypeTree } from '../Interfaces';
import defineComputedProperty from './define-computed-property';
import Tree from './tree';

export default class Transitions {
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
