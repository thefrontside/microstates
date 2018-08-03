import { Assemble } from './assemble';
import parameterized from './parameterized';

import { Any, ObjectType, ArrayType, BooleanType, NumberType, StringType } from './types';

class DSL {
  constructor(rules = []) {
    this.rules = rules;
  }

  expand(value) {
    for (let rule of this.rules) {
      let result = rule.call(this, value);
      if (result && typeof result.Type === 'function') {
        return result;
      } else {
        continue;
      }
    }
    return { Type: Any, value };
  }

  use(rule) {
    return new DSL(this.rules.concat(rule));
  }
}

export default new DSL()
  .use(function matchBuiltins(value) {
    switch(value) {
    case Object:
      return { Type: ObjectType, value: {} };
    case Array:
      return { Type: ArrayType, value: [] };
    case Boolean:
      return { Type: BooleanType, value: false };
    case Number:
      return { Type: NumberType, value: 0 };
    }
    // TIL switch doesn't work on String ¯\_(ツ)_/¯
    if (value === String) {
      return { Type: StringType, value: '' };
    }

  })
  .use(function matchArrays(value) {
    if (Array.isArray(value) && value.length < 2) {
      let [ T ] = value;
      if (T != null) {
        let { Type } = this.expand(T);
      }
      let Type = T != null ? ArrayType.of(this.expand(T).Type) : ArrayType;
      return { Type, value: [] };
    }
  })
  .use(function matchObjects(value) {
    if (value != null && typeof value === 'object' && Object.keys(value).length < 2) {
      let [ key ] = Object.keys(value);
      if (key == null) {
        return { Type: ObjectType, value: {} };
      } else {
        let { Type: childType, value: childValue } = this.expand(value[key]);
        if (childType.isConstant) {
          return undefined;
        } else {
          return {Type: ObjectType.of(childType), value: {} };
        }
      }
    }
  })
  .use(function matchCustomTypes(value) {
    if (typeof value === 'function') {
      return { Type: value, value: undefined };
    }
  })
  .use(function matchConstants(value) {
    return { Type: Constant.of(value), value };
  })

const Constant = parameterized(value => class Constant {
  static isConstant = true;
  static initialize() {
    Assemble.instance(this, {
      assemble(Type, instance) {
        instance.state = value;
        return instance;
      }
    })
  }
})
