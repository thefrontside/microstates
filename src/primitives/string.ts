export default {
  concat: (current: string, ...args: Array<string>) => String.apply(current, args),
};
