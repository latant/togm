/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
// FLATTEN

import { z } from "zod";

type IsFunction<T, R, Fallback = T> = T extends (...args: any[]) => any ? R : Fallback;

// Returns R if T is an object, otherwise returns Fallback
type IsObject<T, R, Fallback = T> = IsFunction<T, Fallback, T extends object ? R : Fallback>;

// "a.b.c" => "b.c"
type Tail<S> = S extends `${string}.${infer T}` ? Tail<T> : S;

// typeof Object.values(T)
type Val<T> = T[keyof T];

// {a: {b: 1, c: 2}} => {"a.b": {b: 1, c: 2}, "a.c": {b: 1, c: 2}}
type FlattenStepOne<T> = {
  [K in keyof T as K extends string
    ? IsObject<T[K], `${K}.${keyof T[K] & string}`, K>
    : K]: IsObject<T[K], { [key in keyof T[K]]: T[K][key] }>;
};

// {"a.b": {b: 1, c: 2}, "a.c": {b: 1, c: 2}} => {"a.b": 1, "a.c": 2}
type FlattenStepTwo<T> = {
  [a in keyof T]: IsObject<
    T[a],
    Val<{ [M in keyof T[a] as M extends Tail<a> ? M : never]: T[a][M] }>
  >;
};

// {a: {b: 1, c: {d: 1}}} => {"a.b": 1, "a.c": {d: 1}}
type FlattenOneLevel<T> = FlattenStepTwo<FlattenStepOne<T>>;

// {a: {b: 1, c: {d: 1}}} => {"a.b": 1, "a.b.c.d": 1}
// type Flatten<T> = T extends FlattenOneLevel<T> ? T : Flatten<FlattenOneLevel<T>>;

export type Flatten1<T> = FlattenOneLevel<T>;
export type Flatten2<T> = FlattenOneLevel<Flatten1<T>>;

// STRINGS

type Pascalize<S> = S extends `${infer A}.${infer B}`
  ? `${Pascalize<A>}${Capitalize<Pascalize<B>>}`
  : S;

export type PascalizeKeys<T> = {
  [K in keyof T as Pascalize<K>]: T[K];
};

export const capitalize = <S extends string>(str: S) => {
  return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<S>;
};

// REST

type Impossible<K extends keyof any> = {
  [P in K]: never;
};

export type Strict<T, U> = U & Impossible<Exclude<keyof U, keyof T>>;

export type DeepStrict<T, U> = Strict<T, U> & {
  // [K in keyof T & keyof U]: [NonNullable<T[K]>, U[K]]
  [K in keyof T & keyof U as K]: object extends U[K] ? DeepStrict<NonNullable<T[K]>, U[K]> : U[K];
};

// type A = { b?: B; c: C };
// type B = { a?: A; c?: B };
// type C = { a?: A; b?: B };
// const f = <T extends A>(t: T & DeepStrict<A, T>) => t;
// f({ b: {}, c: { a: { c: {} }, foo: "bar" }, foo: "bar" });
// f({ c: {} });

// type X = IntersectStep1<{a: {b: 1, c: 2}}> // {"a.b": {b: 1, c: 2}, "a.c": {b: 1, c: 2}}
type IntersectStep1<T> = {
  [K in keyof T as `${K & string}.${keyof T[K] & string}`]: T[K];
};

// type X = IntersectStep2<{ "a.b": { b: 1; c: 2 } }>; // "a.c": {b: 1, c: 2}} => {"a.b": 1, "a.c": 2}
type IntersectStep2<T> = {
  [K in keyof T as Tail<K>]: Val<{
    [L in keyof T[K] as L extends Tail<K> ? L : never]: T[K][L];
  }>;
};

// type Y = IntersectVals<{ a: { a: string; b: string }; b: { a: number; c: number } }>;
export type IntersectVals<T> = IntersectStep2<IntersectStep1<T>>;

export type PickValuesExtend<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K] extends V ? T[K] : never;
};

export const zZodType = z.custom<z.ZodType>((arg) => (arg as any)?._def);
export const zZodObject = z.custom<z.ZodObject<any>>((arg) => (arg as any)?.partial);

export const error = (msg: string): never => {
  throw new Error(msg);
};

export const getKeys = <T extends Record<string, any>>(obj: T) => Object.keys(obj) as (keyof T)[];

export const getValues = <T extends Record<string, any>>(obj: T) =>
  Object.values(obj) as T[keyof T][];
