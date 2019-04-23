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

export function find(iterable, fn){
  return query(iterable).find(fn);
}

class Query {
  constructor(iterable) {
    if (typeof iterable[Symbol.iterator] === 'function') {
      this.generator = () => iterable[Symbol.iterator]();
    } else if (typeof iterable === 'function') {
      this.generator = iterable;
    } else {
      throw new Error('Query must be constructed with a generator function or iterable. Received `${iterable}`');
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
          };
        }
      };
    });
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
              // eslint-disable-next-line no-empty
              for (result = source.next(); !result.done && !fn(result.value); result = source.next()) {}
              return result;
            }
          }
          return {
            get done() { return find().done; },
            get value() { return find().value; }
          };
        }
      };
    });
  }

  reduce(fn, initial) {
    let result = initial;
    for (let item of this) {
      result = fn(result, item)
    }
    return result;
  }

  find(fn) {
    for (let item of this){
      if (fn(item)){
        return item;
      }
    }
  }

  [Symbol.iterator]() {
    return this.generator();
  }
}
