import { parameterized, any } from '../type-parameters';

class ObjectType {
  constructor(value = {}) {
    return new Object(value);
  }
  assign(props) {
    return Object.assign({}, this.state, props);
  }
}

// export default ObjectType;
export default parameterized(ObjectType, {T: any});
