import { type } from 'funcadelic';

export const TypeDelegate = type(class TypeDelegate {
  typeDelegateFor(Constructor) {
    if (Constructor.prototype[TypeDelegate.symbol]) {
      return this(Constructor.prototype).typeDelegateFor(Constructor);
    } else {
      return Constructor;
    }
  }
})

export const { typeDelegateFor } = TypeDelegate.prototype;
