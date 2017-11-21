import { append } from 'funcadelic';
import getOwnPropertyDescriptors from 'object.getownpropertydescriptors';

const { keys } = Object;

export default function descriptorsFor(obj) {
  let descriptors = getOwnPropertyDescriptors(obj);
  return keys(descriptors).reduce((acc, name) => {
    return [...acc, append({ name }, descriptors[name])];
  }, []);
}
