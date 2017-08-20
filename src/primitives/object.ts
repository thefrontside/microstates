export default class MicrostateObject extends Object {
  static assign = (current: {}, props: {}) => ({
    ...current,
    ...props,
  });
}
