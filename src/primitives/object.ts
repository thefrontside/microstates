export default class MicrostateObject extends Object {
  static initialize = (current: {}, newState: any) => newState || {};

  static assign = (current: {}, props: {}) => ({
    ...current,
    ...props,
  });
}
