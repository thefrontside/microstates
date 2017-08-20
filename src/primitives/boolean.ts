export default class MicrostateBoolean extends Boolean {
  static toggle = (current: boolean) => !current;
}
