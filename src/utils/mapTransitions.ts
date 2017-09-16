import { reduceObject } from 'ioo';
import isNumeric from './isNumeric';
import { ITransition, ITypeTree, IPath } from '../Interfaces';
import defineComputedProperty from './defineComputedProperty';
import * as lensPath from 'ramda/src/lensPath';

export default function mapTransitions(
  tree: ITypeTree,
  path: IPath,
  onTransition: (transition: any, ...args: any[]) => any
): any {
  if (tree.isComposed && tree.isList) {
    return new Proxy([], {
      get(target, property: string) {
        if (tree.transitions[property]) {
          return function composedListTransition(...args: any[]) {
            return onTransition(tree.transitions[property](lensPath(path)), ...args);
          };
        } else if (isNumeric(property)) {
          let [of] = tree.of;
          return mapTransitions(of, [...tree.path, parseInt(property)], onTransition);
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
          return mapTransitions(node, [...path, propName], onTransition);
        },
        { enumerable: true }
      )
    );

    return reduceObject(
      tree.transitions,
      (accumulator, transition, propName: string) => {
        return defineComputedProperty(
          accumulator,
          propName,
          () =>
            function composedStateTransition(...args: any[]) {
              return onTransition(transition(lensPath(path)), ...args);
            },
          {
            enumerable: true,
          }
        );
      },
      composed
    );
  }

  return reduceObject(tree.transitions, (accumulator, transition, propName: string) => {
    return defineComputedProperty(
      accumulator,
      propName,
      () =>
        function primiviteValueTransition(...args: any[]) {
          return onTransition(transition(lensPath(path)), ...args);
        },
      {
        enumerable: true,
      }
    );
  });
}
