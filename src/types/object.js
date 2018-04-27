import { parameterized } from './parameters0';
import Any from './any';

class ObjectType {
  constructor(value = {}) {
    return new Object(value);
  }
  assign(props) {
    return this.set(Object.assign({}, this.state, props));
  }
}

export default parameterized(ObjectType, {T: Any});
