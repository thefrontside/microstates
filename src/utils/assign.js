import { MicroState } from '../'

export default function(target, ...sources) {
  return sources.reduce(function(target, source) {
    Object.keys(source).forEach(function(property) {
      
      // let targetValue = target[property];
      // if (isMicrostate(targetValue)) {
        
      // }
      target[property] = source[property];


    });
    return target;
  }, target);
}

function isMicrostate(value) {
  return value instanceof MicroState;
}