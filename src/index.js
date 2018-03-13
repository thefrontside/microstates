import './typeclasses';
import Microstate from './microstate';

export default Microstate;
export const { create, from } = Microstate;

export { default as Microstate } from './microstate';
export { default as Tree } from './utils/tree';
export { default as analyze } from './structure';
export { parameterized } from './types/parameters.js';
