import { Date, DateTime, Duration, LocalDateTime, LocalTime } from "neo4j-driver";
import { z } from "zod";
import { NodeDef, Property, PropKey } from "./definition";

export type Condition<N extends NodeDef> = {
  [K in keyof N["members"] as PropKey<N["members"], K>]?: N["members"][K] extends Property
    ? PropCondition<z.infer<N["members"][K]["zodType"]>>
    : never;
} & { $id?: number | number[] };

type PropCondition<T> = { "="?: T } & (T extends string | null ? StringCondition : {}) &
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

export const condition = (node: NodeDef, root: Condition<NodeDef>) => {};
