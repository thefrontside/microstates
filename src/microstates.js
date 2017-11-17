import { map, append } from 'funcadelic';

import Microstate from './utils/microstate';

export default function Microstates(Type, value) {
  let microstate = new Microstate(Type, value);
  let properties = append(
    {
      microstate,
      get states() {
        return microstate.states.collapsed;
      },
    },
    microstate.transitions.collapsed
  );
  return append(microstate, properties);
}
