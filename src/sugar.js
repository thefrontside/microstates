export class Sugar {
  constructor() {
    this.typeMap = new Map();

  }

  mapType(Type, Delegate) {
    return this.typeMap.set(Type, Delegate)
  }

  typeFor(Type) {
    if (this.typeMap.has(Type)) {
      return this.typeMap.get(Type);
    } else {
      return Type;
    }
  }
}

export default new Sugar();
