import { reduceObject } from 'ioo';
import { IPath, IState, ITransition, ITypeTree, CurriedGetValue } from '../Interfaces';
import defineComputedProperty from './defineComputedProperty';

export default function mapState(tree: ITypeTree, path: IPath, getValue: CurriedGetValue): IState {
  let { initialize } = tree.transitions;

  if (tree.isComposed && tree.isList) {
    let value = getValue(path) || initialize();
    return new Proxy(value, {
      get(target, property: string) {
        if (property === 'length') {
          return value.length;
        } else if (property === 'valueOf') {
          return () => getValue(path);
        } else if (value.hasOwnProperty(property)) {
          let [of] = tree.of;
          return mapState(of, [...tree.path, parseInt(property)], getValue);
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
          () => mapState(node, [...path, propName], getValue),
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
        return getValue(path);
      },
    });
  }

  return getValue(path) || initialize();
}
