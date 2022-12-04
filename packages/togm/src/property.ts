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
import { capitalize, Flatten2, getKeys, PascalizeKeys, ZodType } from "./util";

export type PropertyType = z.infer<typeof PropertyType>;
export const PropertyType = z.enum([
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

export type PropertyCardinality = z.infer<typeof PropertyCardinality>;
export const PropertyCardinality = z.enum(["array", ""]);

type PropTypeStep1<T, A extends boolean> = A extends true ? T[] : T;
type PropTypeStep2<T, N extends boolean> = N extends true ? null | T : T;
export type Property<T = any, A extends boolean = boolean, N extends boolean = boolean> = {
  type: "property";
  propertyType: PropertyType;
  nullable: N;
  array: A;
  zodType: z.ZodType<PropTypeStep2<PropTypeStep1<T, A>, N>>;
};
export const Property: z.ZodType<Property> = z.object({
  type: z.literal("property"),
  propertyType: PropertyType,
  nullable: z.boolean(),
  array: z.boolean(),
  zodType: ZodType,
});

export const propertyZodTypes = {
  string: z.string(),
  number: z.number(),
  boolean: z.boolean(),
  duration: z.custom<Duration<number>>((v: any) => isDuration(v)),
  localTime: z.custom<LocalTime<number>>((v: any) => isLocalTime(v)),
  date: z.custom<Date<number>>((v: any) => isDate(v)),
  localDateTime: z.custom<LocalDateTime<number>>((v: any) => isLocalDateTime(v)),
  dateTime: z.custom<DateTime<number>>((v: any) => isDateTime(v)),
  point: z.custom<Point<number>>((v: any) => isPoint(v)),
} satisfies { [K in PropertyType]: z.ZodType };

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
) as { [K in PropertyType]: z.ZodType };

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
        unknown extends T ? z.infer<typeof propertyZodTypes[P]> : T,
        typeof propCardinalities[C],
        typeof propNullabilities[N]
      >;
    };
  };
};

export const propertyFactories = (): PascalizeKeys<Flatten2<PropertyFactories>> => {
  const result = {} as any;
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
  return result;
};

export type PropRecord<MP extends { [key: string]: Property }> = {
  [P in keyof MP]: MP[P] extends Property ? z.infer<MP[P]["zodType"]> : never;
};
