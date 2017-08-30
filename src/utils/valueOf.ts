import reduceTypeInstanceDescriptors from './reduceTypeInstanceDescriptors';
import isPrimitive from './isPrimitive';

export default function valueOf(value: any): any {
  if (value === null) {
    return value;
  }
  let { constructor } = value;

  if (value && value.valueOf && value.valueOf.call) {
    return value.valueOf();
  } else {
    return reduceTypeInstanceDescriptors(
      constructor,
      (accumulator, descriptor, name) => {
        if (isPrimitive(descriptor.value)) {
          return {
            ...accumulator,
            [name]: value[name],
          };
        } else {
          return {
            ...accumulator,
            [name]: valueOf(value[name]),
          };
        }
      },
      {}
    );
  }
}
