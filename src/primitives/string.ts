export function concat(current, ...args) {
  return String.apply(current, args);
}
