import { IPath, ISchema, IState, ITransition, ITransitions, ITypeTree } from '../Interfaces';
import TypeTree from './TypeTree';
import mapState from './mapState';
import getValue from './getValueFactory';
import mapTransitions from './mapTransitions';
import onTransition from './onTransitionFactory';

export default class ObservableMicrostate {
  public transitions: ITransitions;
  private tree: ITypeTree;
  private state: IState;
  private initial: any;
  private observer: { next?: (state) => void };

  constructor(Type: ISchema, initial: any = undefined) {
    this.tree = new TypeTree(Type);
    this.state = mapState(this.tree, [], getValue(initial));
    this.transitions = mapTransitions(this.tree, [], onTransition(this.onTransition));
  }

  private onTransition = compute => {
    if (this.observer) {
      this.state = mapState(this.tree, [], getValue(compute(this.state)));
      this.observer.next(this.state);
    }
  };

  public subscribe(observer) {
    this.observer = observer;
    observer.next(this.state);
    return this;
  }

  public unsubscribe() {
    this.observer = null;
    return this;
  }
}
