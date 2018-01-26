import { reduce } from 'funcadelic';
import $ from './chain';
import isPrimitive from './is-primitive';
import gettersFor from './getters-for';
import constantsFor from './constants-for';
import getOwnPropertyDescriptors from 'object.getownpropertydescriptors';

export default function initialize(Type, value) {
  let instance = new Type(value).valueOf();
  if (isPrimitive(Type)) {
    return instance;
  } else {
    return reduce(Object, [instance, propertiesOf(value || {})]);
  }
}

function propertiesOf(value) {
  return $(getOwnPropertyDescriptors(value))
    .map(desc => desc.value)
    .valueOf();
}
