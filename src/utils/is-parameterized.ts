import { ISchema } from '../Interfaces';

export default function isParameterized(Type: ISchema): boolean {
  return Array.isArray(Type) && Type.length > 0;
}
