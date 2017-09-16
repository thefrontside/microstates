import { ITypeTree, IState } from '../Interfaces';
import * as view from 'ramda/src/view';
import * as __ from 'ramda/src/__';
import mapState from './mapState';

export default function stateFor(tree: ITypeTree, value: any): IState {
  return mapState(tree, [], view(__, value));
}
