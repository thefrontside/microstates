import { append } from 'funcadelic';

import getType from './get-type';

export default function initializerFor(Type) {
  let initialize = getType(Type).prototype.initialize;
  if (initialize) {
    return initialize;
  } else {
    return (attrs = {}) => append({}, attrs);
  }
}
