const { keys } = Object;

export default function isPrimitive(Type) {
  return keys(new Type()).length === 0;
}
