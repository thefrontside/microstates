import { type } from 'funcadelic';

export const Collapse = type(class Collapse {
  collapse(holder) {
    return this(holder).collapse(holder);
  }
});

export const { collapse } = Collapse.prototype;