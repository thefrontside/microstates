export default {
  sum: (current: number, ...args: Array<number>) =>
    args.reduce((accumulator, value) => accumulator + value, current),

  subtract: (current: number, ...args: Array<number>) =>
    args.reduce((accumulator, value) => accumulator - value, current),

  increment: (current: number, step = 1) => current + step,

  decrement: (current: number, step = 1) => current - step,
};
