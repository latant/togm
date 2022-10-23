import { Date, DateTime, Duration, LocalDateTime, LocalTime } from "neo4j-driver";
import { z } from "zod";
import { NodeDef, Property, PropKey } from "./define";

type Condition<D extends NodeDef> = {
  [K in keyof D["members"] as PropKey<D["members"], K>]: D["members"][K] extends Property
    ? PropCondiiton<z.infer<D["members"][K]["zodType"]>>
    : never;
} & {
  $id?: number;
  $ids?: number[];
};

type PropCondiiton<T> = { "="?: T } & (T extends string | null ? StringCondition : {}) &
  (T extends NumericType | null ? NumericCondition<T> : {});

type NumericType = number | Duration | LocalTime | Date | LocalDateTime | DateTime;

type StringCondition = {
  contains?: string;
  startsWith?: string;
  endsWith?: string;
};

type NumericCondition<T> = {
  "<"?: NonNullable<T>;
  ">"?: NonNullable<T>;
  "<="?: NonNullable<T>;
  ">="?: NonNullable<T>;
};
