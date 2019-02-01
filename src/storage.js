import { over, view, set, Path } from './lens';

export default class Storage {
  constructor(value, observe = x => x) {
    this.value = value;
    this.observe = observe;
  }

  get() {
    return this.value;
  }

  set(value) {
    if (value !== this.value) {
      this.value = value;
      this.observe();
    }
    return this;
  }

  getPath(path) {
    return view(Path(path), this.value);
  }

  setPath(path, value) {
    return this.set(set(Path(path), value, this.value));
  }

  overPath(path, fn) {
    return this.set(over(Path(path), fn, this.value));
  }
}
