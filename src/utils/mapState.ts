import { reduceObject } from 'ioo';
import { ITransition, IPath, ITypeTree } from '../Interfaces';
import defineComputedProperty from './defineComputedProperty';

export default function mapState(
  tree: ITypeTree,
  path: IPath,
  callback: (initialize: ITransition, path: IPath) => any
): any {
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
          // console.log('getting array item at', [...tree.path, parseInt(property)]);
          return mapState(of, [...tree.path, parseInt(property)], callback);
        } else {
          return target[property];
        }
      },
    });
  }
  if (tree.isComposed && !tree.isList) {
    // console.log('composing state with', tree, path);
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

  // console.log('getting from tree', path, tree);

  return callback(tree.transitions.initialize, path);
}
