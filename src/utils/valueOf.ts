import isPrimitive from './isPrimitive';

export default function valueOf(value: any) {
  if (value === null) {
    return value;
  }
  let { constructor } = value;
  if (isPrimitive(constructor)) {
    return constructor.prototype.valueOf(value);
  } else {
  }
}
