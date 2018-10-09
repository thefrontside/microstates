export function query(iterable) {
  return new Query(iterable);
}

export function map(iterable, fn) {
  return query(iterable).map(fn);
}

export function filter(iterable, fn) {
  return query(iterable).filter(fn);
}

export function reduce(iterable, fn, initial) {
  return query(iterable).reduce(fn, initial);
}

class Query {
  constructor(iterable) {
    if (typeof iterable[Symbol.iterator] === 'function') {
      this.generator = () => iterable[Symbol.iterator]();
    } else if (typeof iterable === 'function') {
      this.generator = iterable;
    } else {
      throw new Error('Query must be constructed with a generator function or iterable. Received `${iterable}`')
    }
  }

  get length() {
    return reduce(this, sum => sum + 1, 0);
  }

  map(fn) {
    return query(() => {
      let source = this.generator();
      return {
        next() {
          let next = source.next();
          return {
            get done() { return next.done; },
            get value() { return fn(next.value); }
          }
        }
      }
    })
  }

  filter(fn) {
    return query(() => {
      let source = this.generator();
      return {
        next() {
          let result;
          function find() {
            if (result != null) {
              return result;
            } else {
              for (result = source.next(); !result.done && !fn(result.value); result = source.next()) {}
              return result;
            }
          }
          return {
            get done() { return find().done; },
            get value() { return find().value; }
          }
        }
      }
    })
  }

  reduce(fn, initial) {
    let iterator = this.generator();
    let result = initial;
    for (let next = iterator.next(); !next.done; next = iterator.next()) {
      result = fn(result, next.value);
    }
    return result;
  }

  [Symbol.iterator]() {
    return this.generator();
  }
}
