export default function CachedProperty(key, reify) {
  let enumerable = true;
  let configurable = true;
  return {
    enumerable,
    configurable,
    get() {
      let value = reify(this);
      Object.defineProperty(this, key, { enumerable, value });
      return value;
    }
  };
}
