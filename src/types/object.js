import { filter, foldl } from 'funcadelic';
import transform from '../transform';
import Tree from '../tree';
import Any from './any';
import { parameterized } from './parameters0';

const { assign, keys } = Object;

class ObjectType {
  initialize(value = {}) {
    return value;
  }

  assign(props = {}) {
    return transform((children, T) => {
      return foldl((children, key) => {
        children[key] = Tree.from(props[key], T).graft([key]);
        return children;
      }, assign({}, children), keys(props));
    }, this);
  }

  put(key, value) {
    return transform((children, T) => {
      if (children[key] && children[key].value === value) {
        return children
      } else  {
        return assign({}, children, {
          [key]: Tree.from(value, T).graft([key])
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

export default parameterized(ObjectType, {T: Any});
