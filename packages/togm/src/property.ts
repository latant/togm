import {
  Date,
  DateTime,
  Duration,
  isDate,
  isDateTime,
  isDuration,
  isInt,
  isLocalDateTime,
  isLocalTime,
  isPoint,
  LocalDateTime,
  LocalTime,
  Point,
} from "neo4j-driver";
import { z } from "zod";
import { capitalize, Flatten2, getKeys, PascalizeKeys, zZodType } from "./util";

export type PropertyType = z.infer<typeof zPropertyType>;
export const zPropertyType = z.enum([
  "string",
  "number",
  "boolean",
  "duration",
  "localTime",
  "date",
  "localDateTime",
  "dateTime",
  "point",
]);

export type PropertyCardinality = z.infer<typeof zPropertyCardinality>;
export const zPropertyCardinality = z.enum(["array", ""]);

type PropTypeStep1<T, A extends boolean> = A extends true ? T[] : T;
type PropTypeStep2<T, N extends boolean> = N extends true ? null | T : T;
export type Property<
  P extends PropertyType = PropertyType,
  N extends boolean = boolean,
  A extends boolean = boolean,
  T = any
> = {
  type: "property";
  propertyType: P;
  nullable: N;
  array: A;
  zodType: z.ZodType<PropTypeStep2<PropTypeStep1<T, A>, N>>;
};
export const zProperty: z.ZodType<Property> = z.object({
  type: z.literal("property"),
  propertyType: zPropertyType,
  nullable: z.boolean(),
  array: z.boolean(),
  zodType: zZodType,
});

export type TSProperty = {
  string: string;
  number: number;
  boolean: boolean;
  duration: Duration<number>;
  localTime: LocalTime<number>;
  date: Date<number>;
  localDateTime: LocalDateTime<number>;
  dateTime: DateTime<number>;
  point: Point<number>;
};

export const propertyZodTypes: { [K in PropertyType]: z.ZodType<TSProperty[K]> } = {
  string: z.string(),
  number: z.number(),
  boolean: z.boolean(),
  duration: z.custom((v: any) => isDuration(v)),
  localTime: z.custom((v: any) => isLocalTime(v)),
  date: z.custom((v: any) => isDate(v)),
  localDateTime: z.custom((v: any) => isLocalDateTime(v)),
  dateTime: z.custom((v: any) => isDateTime(v)),
  point: z.custom((v: any) => isPoint(v)),
};

export const propertyTypeCoercions = {
  string: (t) => t,
  number: (t) => {
    return z.preprocess((x) => {
      if (typeof x === "bigint") {
        return Number(x);
      }
      if (isInt(x)) {
        return x.toNumber();
      }
      return x;
    }, t);
  },
  boolean: (t) => t,
  duration: (t) => t,
  localTime: (t) => t,
  date: (t) => t,
  localDateTime: (t) => t,
  dateTime: (t) => t,
  point: (t) => t,
} satisfies { [K in PropertyType]: (type: z.ZodType) => z.ZodType };

export const coercedPropertyZodTypes = Object.fromEntries(
  Object.entries(propertyZodTypes).map(([k, t]) => [k, (propertyTypeCoercions as any)[k](t)])
) as { [K in PropertyType]: z.ZodType<TSProperty[K]> };

const propCardinalities = {
  array: true,
  "": false,
} as const;

const propNullabilities = {
  OrNull: true,
  "": false,
} as const;

export type PropertyFactories = {
  [P in PropertyType]: {
    [C in keyof typeof propCardinalities]: {
      [N in keyof typeof propNullabilities]: <T extends z.infer<typeof propertyZodTypes[P]>>(
        type?: z.ZodType<T>
      ) => Property<
        P,
        typeof propNullabilities[N],
        typeof propCardinalities[C],
        unknown extends T ? z.infer<typeof propertyZodTypes[P]> : T
      >;
    };
  };
};

export const propertyFactories = () => {
  const result = {} as { [key: string]: (type: z.ZodType) => Property };
  for (const p of getKeys(propertyZodTypes)) {
    for (const c of getKeys(propCardinalities)) {
      for (const n of getKeys(propNullabilities)) {
        result[`${p}${capitalize(c)}${capitalize(n)}`] = (type?: z.ZodType) => {
          const array = propCardinalities[c];
          const nullable = propNullabilities[n];
          let zodType = propertyTypeCoercions[p](type ?? propertyZodTypes[p]);
          if (array) zodType = zodType.array();
          if (nullable) zodType = zodType.nullable();
          return {
            type: "property",
            propertyType: p,
            array,
            nullable,
            zodType,
          };
        };
      }
    }
  }
  return result as PascalizeKeys<Flatten2<PropertyFactories>>;
};

export type PropRecord<MP extends { [key: string]: Property }> = {
  [P in keyof MP]: MP[P] extends Property ? z.infer<MP[P]["zodType"]> : never;
};
