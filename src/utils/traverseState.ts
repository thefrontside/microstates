// import { ITypeTree, IStateObject, IPath } from '../Interfaces';
// import { curry } from 'ramda';
// import mapForState from './mapForState';

// /**
//  * traverseState returns value for given tree at
//  */
// export default curry(function traverseState(
//   tree: ITypeTree,
//   path: IPath,
//   state: IStateObject
// ): IStateObject {
//   return mapForState(tree, (node, path: IPath) => {
//     if (node.isPrimitive) {
//       return node.transitions.initialize(null, get(path, state));
//     }

//     if (node.isList && node.isParameterized) {

//     }

//     return traverseState(node, [...path, propName], state);
//   });
// });

// if (isPrimitive(type) || Array.isArray(type)) {
//   return matchStateType(type, path, state);
// } else {
//   let composed = reduceTypeToCachedTree(
//     type,
//     (descriptor, name) => {
//       let { value: type } = descriptor;
//       return matchStateType(type, [...path, name], state);
//     },
//     { enumerable: true }
//   );
//   return defineValueOf(composed, path, state);
// }
