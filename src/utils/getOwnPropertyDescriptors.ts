import { IDescriptor } from '../Interfaces';
export default function getOwnPropertyDescriptors(o: { [x: string]: IDescriptor }) {
  return Object.getOwnPropertyNames(o).reduce((accumulator, propName) => {
    return {
      ...accumulator,
      [propName]: Object.getOwnPropertyDescriptor(o, propName),
    };
  }, {});
}
