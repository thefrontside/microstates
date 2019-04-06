declare module "microstates" {
  interface Base {}

  interface Constructor<T> {
    new (...args: any[]): T;
  }

  export const Any: Constructor<Any>
  export interface Any {
    set(value: any): Any
    state: any
  }

  export const BooleanType: Constructor<BooleanType>;
  export interface BooleanType {
    set(value: boolean): BooleanType
    toggle(): BooleanType
    state: boolean
  }

  export const StringType: Constructor<StringType>;
  export interface StringType {
    concat(str: string): StringType
    set(value: string): StringType
    state: string
  }

  export const ObjectType: ObjectTypeConstructor & Constructor<ObjectType<Any>>;
  interface ObjectType<T> extends Iterable<Entry<T>> {
    entries: { [key: string]: T };
    put(key: string, value: any): any;
    delete(key: string): any;
  }
  interface ObjectTypeConstructor {
    of<T>(constructor: Constructor<T>): Constructor<ObjectType<T>>;
  }

  export interface Entry<T> {
    key: string;
    value: T;
  }

  export function create<T>(Type: Constructor<T>, value?: any): T & Any

  export function Store<T>(microstate: T, next: (state: T) => any): T & Any

  export function valueOf(target: any): any

  interface Query<T> extends Iterable<T> {
    map<U>(fn: (t: T) => U) : Query<U>;
    filter(predicate: (item: T) => boolean) : Query<T>;
    reduce<R>(fn: (reduction: R, item: T) => R, initial: R ) : R
  }

  export function query<T>(source: Iterable<T>): Query<T>;

  export function map<A,B>(source: Iterable<A>, fn: (a: A) => B) : Query<B>;

  export function filter<A>(source: Iterable<A>, fn: (a: A) => boolean) : Query<A>;

  export function reduce<A, B>(source: Iterable<A>, fn: (reduction: B, item: A) => B, initial: B) : B;
}