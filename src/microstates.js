import { map } from 'funcadelic';
import Tree from './utils/tree';
import States from './utils/states';
import Transitions from './utils/transitions';
import validate from './utils/validate';

const { assign } = Object;

export default function Microstates(Type) {
  return function Microstate(value, tree = Tree.from(Type)) {
    if (!(tree instanceof Tree)) {
      tree = Tree.from(tree);
    }

    let states = States(tree, value).collapsed;
    let transitions = Transitions(tree, states, value);

    return assign(
      {
        Type,
        states,
        transitions: transitions.collapsed,

        value,

        valueOf() {
          return value;
        },

        isMicrostate: true,
      },
      map(transitions => map(t => (...args) => Microstate(t(...args)), transitions), transitions)
        .collapsed
    );
  };
}
