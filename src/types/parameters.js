import { map } from 'funcadelic';
import { parameterized as parameterized0, params as params0 } from './parameters0';
import { toType } from '../types';

export function parameterized(Constructor, ...rest) {
  let Type = toType(Constructor, ...rest);
  return parameterized0(Type, ...map(item => typeof item === 'function' ? toType(item) : map(toType, item), rest));
}

export function params(Constructor) {
  return params0(toType(Constructor));
}