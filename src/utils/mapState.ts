import { reduceObject } from 'ioo';
import { IPath, IState, ITransition, ITypeTree } from '../Interfaces';
import defineComputedProperty from './defineComputedProperty';

export default function mapState(
  tree: ITypeTree,
  path: IPath,
  callback: (initialize: ITransition, path: IPath) => any
): IState {
  if (tree.isComposed && tree.isList) {
    let value = callback(tree.transitions.initialize, path);
    return new Proxy(value, {
      get(target, property: string) {
        if (property === 'length') {
          return callback((current, newState) => newState || 0, [...path, 'length']);
        } else if (property === 'valueOf') {
          return () => callback(null, path);
        } else if (value.hasOwnProperty(property)) {
          let [of] = tree.of;
          return mapState(of, [...tree.path, parseInt(property)], callback);
        } else {
          return target[property];
        }
      },
    });
  }
  if (tree.isComposed && !tree.isList) {
    let composed = reduceObject(
      tree.properties,
      (accumulator, node: ITypeTree, propName: string) =>
        defineComputedProperty(
          accumulator,
          propName,
          () => mapState(node, [...path, propName], callback),
          {
            enumerable: true,
          }
        ),
      tree.transitions.initialize(null)
    );

    return Object.defineProperty(composed, 'valueOf', {
      enumerable: false,
      configurable: false,
      writable: false,
      value() {
        return callback(null, path);
      },
    });
  }

  return callback(tree.transitions.initialize, path);
}
