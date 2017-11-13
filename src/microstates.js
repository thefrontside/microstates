import { map } from 'funcadelic';
import Tree from './utils/tree';
import States from './utils/states';
import Transitions from './utils/transitions';
import validate from './utils/validate';

const { assign } = Object;

export default function Microstates(Type) {
  let tree = Tree.from(Type);

  return function Microstate(value) {
    let states = States(tree, value).collapsed;
    let transitions = Transitions(tree, states, value);

    return assign(
      {
        Type,
        states,
        transitions: transitions.collapsed,

        valueOf() {
          return value;
        },
      },
      map(transitions => map(t => (...args) => Microstate(t(...args)), transitions), transitions)
        .collapsed
    );
  };
}
