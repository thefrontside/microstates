import { reduceObject } from 'ioo';
import * as lensPath from 'ramda/src/lensPath';

import { ITransitionMap } from '../../dist/Interfaces';
import { IPath, ITypeTree } from '../Interfaces';
import defineComputedProperty from './defineComputedProperty';
import Tree from './tree';

export default class Transitions {
  static map(fn: (transition: () => any, path: IPath) => any, tree: Tree): ITransitionMap {
    return Tree.map(function transitionsMap(node: ITypeTree, path: IPath) {
      return reduceObject(
        node.transitions,
        (accumulator, transition, name: string) => {
          return defineComputedProperty(
            accumulator,
            name,
            function computeTransition() {
              return fn(transition(lensPath(path)), path);
            },
            { enumerable: true }
          );
        },
        new Transitions()
      );
    }, tree);
  }
}
