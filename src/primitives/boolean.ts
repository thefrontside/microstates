export default class MicrostateBoolean extends Boolean {
  static initialize = (current: {}, newState: any) => newState || false;

  static toggle = (current: boolean) => !current;
}
