import './typeclasses';

import { Microstate } from './tree';
export { Microstate };

export const create = Microstate.create;
export const map = Microstate.map;
export const use = Microstate.use;
export const from = Microstate.from;

export { reveal } from './utils/secret';
export { default as query } from './query';

export { default as types } from './types';
export { default as Tree } from './tree';
export { parameterized } from './types/parameters.js';