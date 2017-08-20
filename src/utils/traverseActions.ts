import mapStaticProps from './mapStaticProps';
import wrapProps from './wrapProps';
import * as string from '../primitives/string';
import * as number from '../primitives/number';
import * as boolean from '../primitives/boolean';
import * as object from '../primitives/object';
import * as array from '../primitives/array';

export default function traverseActions(Class, path, initial) {
  return mapStaticProps(Class, (descriptor, name) => {
    let descendant = [...path, name];
    switch (descriptor.value) {
      case String:
        return wrapProps(
          string,
          (action, name) => {
            return () => {
              /* TODO: invoke state transition */
            };
          },
          { enumerable: true }
        );
      case Number:
        return wrapProps(
          number,
          (action, name) => {
            return () => {
              /* TODO: invoke state transition */
            };
          },
          { enumerable: true }
        );
      case Boolean:
        return wrapProps(
          boolean,
          (action, name) => {
            return () => {
              /* TODO: invoke state transition */
            };
          },
          { enumerable: true }
        );
      case Object:
        return wrapProps(
          object,
          (action, name) => {
            return () => {
              /* TODO: invoke state transition */
            };
          },
          { enumerable: true }
        );
      case Array:
        return wrapProps(
          array,
          (action, name) => {
            return () => {
              /* TODO: invoke state transition */
            };
          },
          { enumerable: true }
        );
      default:
        return traverseActions(descriptor.value, descendant, initial);
    }
  });
}
