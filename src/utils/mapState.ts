import { reduceObject } from 'ioo';
import { IAction, IPath, ITypeTree } from '../Interfaces';
import defineComputedProperty from './defineComputedProperty';

export default function mapState(
  tree: ITypeTree,
  path: IPath,
  callback: (transition: IAction, path: IPath) => any
): any {
  if (tree.isComposed && tree.isList) {
    let value = callback(tree.transitions.initialize, path);
    // console.log('getting from array', {
    //   callback,
    //   value,
    //   path,
    //   nodePath: tree.path,
    // });
    return new Proxy(value, {
      get(target, property: string) {
        if (property === 'length') {
          return target.length;
        } else if (property === 'valueOf') {
          return () => value;
        } else if (value.hasOwnProperty(property)) {
          let [of] = tree.of;
          // console.log('array at', [...tree.path, parseInt(property)]);
          return mapState(of, [...tree.path, parseInt(property)], callback);
        } else {
          return value[property];
        }
      },
    });
  }
  if (tree.isComposed && !tree.isList) {
    // console.log('composing state with', tree);
    return reduceObject(
      tree.properties,
      (accumulator, node: ITypeTree, propName: string) =>
        defineComputedProperty(
          accumulator,
          propName,
          () => mapState(node, [...path, ...tree.path, propName], callback),
          {
            enumerable: true,
          }
        ),
      tree.transitions.initialize(null)
    );
  }

  return callback(tree.transitions.initialize, path);
}
