export default function overload(Type, property, value) {
  return class extends Type {
    [property] = value;
  };
}
