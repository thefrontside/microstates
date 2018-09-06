import { Reducible, reduce } from './query';

export function addArrayMethods(proto) {
  const methods = ["push", "pop", "shift", "unshift", "filter", "map", "clear"]
  Object.assign(proto, methods.reduce((acc, m) => ({
    ...acc,
    [m]: function(...args) {
      return this.__list__ && this.__list__[m](...args)
    }
  }), {}))
}

export function setupArrayWrapper(proto, Type) {
  addArrayMethods(proto)

  Object.assign(proto, {
    initialize: function(state) {
      if (!state) {
        return this
      }
      if (state.push) {
        return this.__list__.set(state)
      }
      return this
    },
  })

  for(let i=0;i<1000;i++) {
    Object.defineProperty(proto, i, {
      get: function() {
        return this.__list__[i]
      }
    })
  }

  Reducible.instance(Type, {
    reduce(array, fn, initial) {
      return reduce(array.__list__, fn, initial)
    }
  });
}

export default function(proto, Type) {
  if (Type.isArray) setupArrayWrapper(proto, Type)
}
