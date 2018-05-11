// Pull from preact-shallow-compare
// https://github.com/tkh44/preact-shallow-compare/blob/master/src/index.js
export default function shallowDiffers (a, b) {
  for (let i in a) if (!(i in b)) return true
  for (let i in b) if (a[i] !== b[i]) return true
  return false
}