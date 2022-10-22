// FLATTEN

type IsFunction<T, R, Fallback = T> = T extends (...args: any[]) => any ? R : Fallback;

// Returns R if T is an object, otherwise returns Fallback
type IsObject<T, R, Fallback = T> = IsFunction<T, Fallback, T extends object ? R : Fallback>;

// "a.b.c" => "b.c"
type Tail<S> = S extends `${string}.${infer T}` ? Tail<T> : S;

// typeof Object.values(T)
type Value<T> = T[keyof T];

// {a: {b: 1, c: 2}} => {"a.b": {b: 1, c: 2}, "a.c": {b: 1, c: 2}}
type FlattenStepOne<T> = {
  [K in keyof T as K extends string ? IsObject<T[K], `${K}.${keyof T[K] & string}`, K> : K]: IsObject<
    T[K],
    { [key in keyof T[K]]: T[K][key] }
  >;
};

// {"a.b": {b: 1, c: 2}, "a.c": {b: 1, c: 2}} => {"a.b": {b: 1}, "a.c": {c: 2}}
type FlattenStepTwo<T> = {
  [a in keyof T]: IsObject<T[a], Value<{ [M in keyof T[a] as M extends Tail<a> ? M : never]: T[a][M] }>>;
};

// {a: {b: 1, c: {d: 1}}} => {"a.b": 1, "a.c": {d: 1}}
type FlattenOneLevel<T> = FlattenStepTwo<FlattenStepOne<T>>;

// {a: {b: 1, c: {d: 1}}} => {"a.b": 1, "a.b.c.d": 1}
type Flatten<T> = T extends FlattenOneLevel<T> ? T : Flatten<FlattenOneLevel<T>>;

export type Flatten1<T> = FlattenOneLevel<T>;
export type Flatten2<T> = FlattenOneLevel<Flatten1<T>>;

// SPREAD

type OptionalPropertyNames<T> = {
  [K in keyof T]-?: {} extends { [P in K]: T[K] } ? K : never;
}[keyof T];

type SpreadProperties<L, R, K extends keyof L & keyof R> = {
  [P in K]: L[P] | Exclude<R[P], undefined>;
};

type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;

type SpreadTwo<L, R> = Id<
  Pick<L, Exclude<keyof L, keyof R>> &
    Pick<R, Exclude<keyof R, OptionalPropertyNames<R>>> &
    Pick<R, Exclude<OptionalPropertyNames<R>, keyof L>> &
    SpreadProperties<L, R, OptionalPropertyNames<R> & keyof L>
>;

export type Spread<A extends readonly [...any]> = A extends [infer L, ...infer R] ? SpreadTwo<L, Spread<R>> : unknown;

// STRINGS

type Pascalize<S> = S extends `${infer A}.${infer B}` ? `${Pascalize<A>}${Capitalize<Pascalize<B>>}` : S;

export type PascalizeKeys<T> = {
  [K in keyof T as Pascalize<K>]: T[K];
};

export function capitalize(str: any) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// REST

export type SameKeys<A, B> = {
  [K in keyof A]: K extends keyof B ? B[K] : never;
} & B;

export const error = (msg: string): never => {
  throw new Error(msg);
};
