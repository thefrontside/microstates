import { parameterized, any } from './parameters0';

class ObjectType {
  constructor(value = {}) {
    return new Object(value);
  }
  assign(props) {
    return Object.assign({}, this.state, props);
  }
}

export default parameterized(ObjectType, {T: any});
