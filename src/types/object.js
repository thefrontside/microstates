import { parameterized } from './parameters0';
import Any from './any';

class ObjectType {
  initialize(value = {}) {
    return value;
  }
  assign(props = {}) {
    return Object.assign({}, this.state, props);
  }
}

export default parameterized(ObjectType, {T: Any});
