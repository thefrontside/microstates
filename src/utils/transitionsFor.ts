import { ITypeTree } from '../Interfaces';
import mapTransitions from './mapTransitions';

export default function transitionsFor(
  tree: ITypeTree,
  onTransition: (transition: any, ...args: any[]) => any
) {
  return mapTransitions(tree, [], onTransition);
}
