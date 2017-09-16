import { IPath, ISchema, IState, ITransition, ITransitions, ITypeTree } from '../Interfaces';
import TypeTree from './TypeTree';
import mapState from './mapState';
import mapTransitions from './mapTransitions';
import onTransition from './onTransitionFactory';
import * as view from 'ramda/src/view';
import * as __ from 'ramda/src/__';
import stateFor from './stateFor';

export default class ObservableMicrostate {
  public transitions: ITransitions;
  private tree: ITypeTree;
  private state: IState;
  private initial: any;
  private observer: { next?: (state: any) => void };

  constructor(Type: ISchema, initial: any = undefined) {
    this.tree = new TypeTree(Type);
    this.state = stateFor(this.tree, initial);
    this.transitions = mapTransitions(this.tree, [], onTransition(this.onTransition));
  }

  private onTransition = (compute: (state: any) => any) => {
    if (this.observer) {
      this.state = stateFor(this.tree, compute(this.state));
      this.observer.next(this.state);
    }
  };

  public subscribe(observer: any) {
    this.observer = observer;
    observer.next(this.state);
    return this;
  }

  public unsubscribe() {
    this.observer = null;
    return this;
  }
}
