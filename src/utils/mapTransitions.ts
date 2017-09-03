import { Packet } from '_debugger';
import { reduceObject } from 'ioo';
import isNumeric from './isNumeric';
import { IAction, ITypeTree, IPath } from '../Interfaces';
import defineComputedProperty from './defineComputedProperty';

export default function mapTransitions(
  tree: ITypeTree,
  path: IPath,
  callback: (transition: IAction, path: IPath) => any
): any {
  if (tree.isComposed && tree.isList) {
    return new Proxy([], {
      get(target, property: string) {
        // console.log('getting transition', {
        //   property,
        //   path,
        //   tree,
        //   transition: tree.transitions[property],
        // });
        if (tree.transitions[property]) {
          return callback(tree.transitions[property], path);
        } else if (isNumeric(property)) {
          let [of] = tree.of;
          return mapTransitions(of, [...tree.path, parseInt(property)], callback);
        } else {
          return target[property];
        }
      },
    });
  }

  if (tree.isComposed) {
    let composed = reduceObject(tree.properties, (accumulator, node: ITypeTree, propName: string) =>
      defineComputedProperty(
        accumulator,
        propName,
        () => {
          return mapTransitions(node, [...path, propName], callback);
        },
        { enumerable: true }
      )
    );

    return reduceObject(
      tree.transitions,
      (accumulator, transition, propName: string) => {
        return defineComputedProperty(accumulator, propName, () => callback(transition, path), {
          enumerable: true,
        });
      },
      composed
    );
  }

  return reduceObject(tree.transitions, (accumulator, transition, propName: string) => {
    return defineComputedProperty(accumulator, propName, () => callback(transition, path), {
      enumerable: true,
    });
  });
}
