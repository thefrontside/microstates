import { filter, foldl, append } from 'funcadelic';
import getOwnPropertyDescriptors from 'object.getownpropertydescriptors';

export default function valueOf(o) {
  if (typeof o === 'object' && !Array.isArray(o)) {
    return foldl(
      (acc, { value: decorator, key }) => {
        if (decorator.hasOwnProperty('value')) {
          return append(acc, {
            [key]: valueOf(decorator.value),
          });
        } else {
          return acc;
        }
      },
      {},
      getOwnPropertyDescriptors(o)
    );
  } else {
    return o;
  }
}
