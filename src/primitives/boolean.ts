export default class MicrostateBoolean extends Boolean {
  static initialize = () => false;

  static toggle = (current: boolean) => !current;
}
