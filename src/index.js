import './typeclasses';
import Microstate from './microstate';

export default Microstate;
export const create = Microstate.create;

export { default as Tree } from './utils/tree';
export { default as analyze } from './structure';
