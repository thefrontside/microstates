import { view } from '../lens';
import { valueOf } from '../meta';

export default class Primitive {
  get state() {
    return valueOf(this);
  }
};
