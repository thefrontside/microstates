export default class MicrostateObject {
  initialize() {
    return {};
  }

  assign(current: {}, props: {}) {
    return {
      ...current,
      ...props,
    };
  }
}
