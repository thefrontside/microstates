export default function validate(Type, name) {
  if (!(typeof Type === "function" || Array.isArray(Type))) {
    throw new Error(
      `${name}() expects first argument to be a class, instead received ${typeof Type}`
    );
  }
}
