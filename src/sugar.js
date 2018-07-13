export class Sugar {
  constructor() {
    this.desugarType = (Type) => {
      if (typeof Type !== `function`) {
        throw new Error(`${Type} is not a valid constructor`);
      } else {
        return Type;
      }
    }
    this.desugar = (value) => {
      if (value != null && value.constructor.isPicostateType) {
        return value;
      } else {
        throw new Error(`${value} cannot be desugared into a Picostate`);
      }
    }
  }

  mapType(Type, Delegate) {
    return this.extendTypes(Constructor => Constructor === Type ? Delegate : Constructor);
  }

  extendTypes(transform) {
    let next = this.desugarType;
    this.desugarType = Type => next(transform(Type));
  }

  extend(transform) {
    let next = this.desugar;
    this.desugar = value => next(transform(value));
  }
}

export default new Sugar();
