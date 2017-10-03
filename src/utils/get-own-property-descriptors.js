export default function getOwnPropertyDescriptors(o) {
  return Object.getOwnPropertyNames(o).reduce((accumulator, propName) => {
    return Object.assign({}, accumulator, {
      [propName]: Object.getOwnPropertyDescriptor(o, propName),
    });
  }, {});
}
