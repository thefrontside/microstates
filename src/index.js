import './typeclasses';

import { Microstate } from './tree';

export default Microstate;
export const { create, from, use, map } = Microstate;
export { reveal } from './utils/secret';
export { default as types } from './types';
export { default as query } from './query';

export { default as Tree } from './tree';
export { parameterized } from './types/parameters.js';
