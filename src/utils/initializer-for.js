import getReducerType from './get-reducer-type';

export default function initializerFor(Type) {
  let initialize = getReducerType(Type).prototype.initialize;
  if (initialize) {
    return initialize;
  } else {
    return attrs => new Type(attrs);
  }
}
