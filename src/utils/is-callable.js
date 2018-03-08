export default function isCallable(fn) {
  return fn && fn.call;
}