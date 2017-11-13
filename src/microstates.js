import { map } from 'funcadelic';
import Tree from './utils/tree';
import States from './utils/states';
import Transitions from './utils/transitions';
import validate from './utils/validate';

export default function Microstates(Type) {
  let tree = Tree.from(Type);

  return function Microstate(value) {
    let states = States(tree, value).collapsed;
    let transitions = Transitions(tree, states, value);

    return {
      Type,
      states,
      transitions: transitions.collapsed,

      valueOf() {
        return value;
      },

      ...map(transitions => map(t => (...args) => Microstate(t(...args)), transitions), transitions)
        .collapsed,
    };
  };
}
