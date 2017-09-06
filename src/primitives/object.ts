export default class MicrostateObject extends Object {
  static initialize = () => ({});

  static assign = (current: {}, props: {}) => ({
    ...current,
    ...props,
  });
}
