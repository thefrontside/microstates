import { IPath, ISchema, IState, ITransition, ITransitions, ITypeTree } from '../Interfaces';
import TypeTree from './TypeTree';
import stateFor from './stateFor';
import transitionsFor from './transitionsFor';

export default class ObservableMicrostate {
  public transitions: ITransitions;
  private tree: ITypeTree;
  private state: IState;
  private initial: any;
  private observer: { next?: (state: any) => void };

  constructor(Type: ISchema, initial: any = undefined) {
    this.tree = new TypeTree(Type);
    this.state = stateFor(this.tree, initial);
    let observable = this;
    this.transitions = transitionsFor(
      this.tree,
      function onTransition(transition: (state: any, ...args: any[]) => any, ...args: any[]) {
        if (this.observer) {
          this.state = stateFor(this.tree, transition(this.state, ...args));
          this.observer.next(this.state);
        }
      }.bind(this)
    );
  }

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
