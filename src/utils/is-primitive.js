const { keys } = Object;

export default function isPrimitive(type) {
  return keys(new type()).length === 0;
}
