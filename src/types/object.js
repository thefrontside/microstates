import { map, filter, flatMap, foldl } from 'funcadelic';
import { parameterized, params } from './parameters0';
import Any from './any';
import Tree from '../tree';

class ObjectType {
  initialize(value = {}) {
    return value;
  }

  assign(props = {}) {
    return transform((children, T) => {
      return foldl((children, key) => {
        children[key] = Tree.from(props[key], T);
        return children;
      }, Object.assign({}, children), Object.keys(props));
    }, this);
  }

  put(key, value) {
    return transform((children, T) => {
      if (children[key] && children[key].value === value) {
        return children
      } else  {
        return Object.assign({}, children, {
          [key]: Tree.from(value, T)
        })
      }
    }, this);
  }

  delete(propertyName) {
    return transform((children) => {
      if (propertyName in children) {
        return filter(({ key }) => key !== propertyName, children);
      } else {
        return children;
      }
    }, this);
  }
}

function transform(fn, microstate) {
  return map(tree => flatMap(current => {
    if (current.is(tree)) {
      return current.assign({
        meta: {
          children() {
            let { T } = params(current.Type);
            return fn(current.children, T);
          }
        }
      });
    } else {
      return current;
    }
  }, tree), microstate);
}

export default parameterized(ObjectType, {T: Any});
