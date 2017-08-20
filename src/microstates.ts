import wrapProps from './utils/wrapProps';
import * as string from './primitives/string';
import * as number from './primitives/number';
import * as boolean from './primitives/boolean';
import * as object from './primitives/object';
import * as array from './primitives/array';
import mapStaticProps from './utils/mapStaticProps';
import traverseState from './utils/traverseState';

export default function microstates(Class, initial = {}) {
  if (typeof Class !== 'function') {
    throw new Error(
      `microstates() expects first argument to be a class, instead received ${typeof Class}`
    );
  }

  let state = traverseState(Class, [], initial);

  let actions = mapStaticProps(Class, (descriptor, name) => {
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
    }
  });

  return {
    state,
    actions,
  };
}
