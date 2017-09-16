import { reduceObject } from 'ioo';
import { IPath, IState, ITransition, ITypeTree, CurriedGetValue } from '../Interfaces';
import defineComputedProperty from './defineComputedProperty';
import * as lensPath from 'ramda/src/lensPath';

export default function mapState(tree: ITypeTree, path: IPath, $view: (lens: any) => any): IState {
  let { initialize } = tree.transitions;

  if (tree.isComposed && tree.isList) {
    let value = $view(lensPath(path)) || initialize();
    return new Proxy(value, {
      get(target, property: string) {
        if (property === 'length') {
          return value.length;
        } else if (property === 'valueOf') {
          return () => $view(lensPath(path));
        } else if (value.hasOwnProperty(property)) {
          let [of] = tree.of;
          return mapState(of, [...tree.path, parseInt(property)], $view);
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
          () => mapState(node, [...path, propName], $view),
          {
            enumerable: true,
          }
        ),
      initialize()
    );

    return Object.defineProperty(composed, 'valueOf', {
      enumerable: false,
      configurable: false,
      writable: false,
      value() {
        return $view(lensPath(path));
      },
    });
  }

  return $view(lensPath(path)) || initialize();
}
