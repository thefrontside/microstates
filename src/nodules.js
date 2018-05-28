import './typeclasses';

import { Microstate } from './tree';
export { Microstate };

export const create = Microstate.create;
export const map = Microstate.map;

export { reveal } from './utils/secret';

export { default as types } from './types';
export { default as Tree } from './tree';
export { parameterized } from './types/parameters.js';
