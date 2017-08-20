export default class MicrostateNumber extends Number {
  static sum = (current: number, ...args: Array<number>) =>
    args.reduce((accumulator, value) => accumulator + value, current);

  static subtract = (current: number, ...args: Array<number>) =>
    args.reduce((accumulator, value) => accumulator - value, current);

  static increment = (current: number, step = 1) => current + step;

  static decrement = (current: number, step = 1) => current - step;
}
