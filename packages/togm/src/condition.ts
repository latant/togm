/* eslint-disable @typescript-eslint/ban-types */
import { Date, DateTime, Duration, LocalDateTime, LocalTime } from "neo4j-driver";
import { z } from "zod";
import {
  AND,
  CONTAINS,
  CypherNode,
  ENDS,
  identifier,
  Identifier,
  IN,
  IS,
  MATCH,
  NOT,
  NULL,
  OR,
  parameter,
  STARTS,
  WHERE,
  WITH,
} from "./cypher";
import { EntityDefinition, NodeDefinition, Properties } from "./definition";
import { Property } from "./property";
import { MatchProvider } from "./read";
import { error } from "./util";

export type NodeCondition<N extends Properties> = All<NodeConditionImpl<N>>;

export type ReferenceCondition<N extends Properties, R extends Properties> = All<
  ReferenceConditionImpl<R & Omit<N, keyof R>>
>;

type NodeConditionImpl<P extends Properties = Properties> = {
  [K in keyof P]?: P[K] extends Property ? PropCondition<z.infer<P[K]["zodType"]>> : never;
} & { $id?: number | number[] };

type ReferenceConditionImpl<P extends Properties> = {
  [K in keyof P]?: P[K] extends Property ? PropCondition<z.infer<P[K]["zodType"]>> : never;
} & { $id?: number | number[]; $rid?: number | number[] };

type PropCondition<T> = All<PropConditionImpl<T>>;

type PropConditionImpl<T = any> = { "="?: NonNullable<T> } & (T extends string | null
  ? StringCondition
  : {}) &
  (T extends NumericType | null ? NumericCondition<T> : {}) &
  (null extends T ? { null?: boolean } : {}) &
  (T extends (infer E)[] | null ? { contains: E } : {});

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

type All<T> = T & { $any?: Any<T>; $not?: All<T> };
type Any<T> = T & { $all?: All<T>; $not?: All<T> };
type Op = "any" | "all";

export const nodeMatchProvider = (
  label: string,
  node: NodeDefinition,
  cond: NodeConditionImpl
): MatchProvider => {
  return {
    cypher(n) {
      const condCyp = entityConditionCypher("all", cond, {
        kind: label,
        definition: node,
        variable: n,
      });
      return [MATCH, "(", n, ":", identifier(label), ")", condCyp && [WHERE, condCyp]];
    },
  };
};

export type Entity = {
  kind: string;
  definition: EntityDefinition;
  variable: Identifier;
};

const entityConditionEmitters: {
  [key: string]: (value: any, node: Entity, relationship?: Entity) => CypherNode;
} = {
  $all: (v, n, r) => entityConditionCypher("all", v, n, r),
  $any: (v, n, r) => entityConditionCypher("any", v, n, r),
  $not: (v, n, r) => ["(", NOT, entityConditionCypher("all", v, n, r), ")"],
  $id: (v, n, r) => [
    "(id(",
    n.variable,
    ")",
    typeof v === "number" ? " = " : IN,
    parameter(undefined, v),
    ")",
  ],
  $rid: (v, n, r) =>
    r
      ? ["(id(", r.variable, ")", typeof v === "number" ? " = " : IN, parameter(undefined, v), ")"]
      : error("$rid condition is only available in reference conditions"),
};

export const entityConditionCypher = (
  op: Op,
  condition: any,
  node: Entity,
  relationship?: Entity
): CypherNode => {
  const result: CypherNode[] = [];
  for (const k in condition) {
    const emitter = entityConditionEmitters[k];
    if (!emitter) {
      const entity = node.definition.properties[k]
        ? node
        : relationship?.definition?.properties?.[k]
        ? relationship
        : undefined;
      if (entity) {
        const property = entity.definition.properties[k];
        result.push(propConditionCypher("all", k, property, condition[k], entity.variable));
      } else {
        error(`Property not found in ${[node, relationship].filter((e) => e).join(" or ")}: ${k}`);
      }
    } else {
      result.push(emitter(condition[k], node, relationship));
    }
  }
  return joinOp(op, result);
};

const propConditionEmitters: {
  [key: string]: (
    propertyName: string,
    property: Property,
    entity: Identifier,
    value: any
  ) => CypherNode;
} = {
  $all: (n, p, e, v) => propConditionCypher("all", n, p, v, e),
  $any: (n, p, e, v) => propConditionCypher("any", n, p, v, e),
  $not: (n, p, e, v) => ["(", NOT, propConditionCypher("all", n, p, v, e), ")"],
  "=": (n, p, e, v) => [e, ".", identifier(n), "=", parameter(undefined, v)],
  "<": (n, p, e, v) => [e, ".", identifier(n), "<", parameter(undefined, v)],
  ">": (n, p, e, v) => [e, ".", identifier(n), ">", parameter(undefined, v)],
  "<=": (n, p, e, v) => [e, ".", identifier(n), "<=", parameter(undefined, v)],
  ">=": (n, p, e, v) => [e, ".", identifier(n), ">=", parameter(undefined, v)],
  contains: (n, p, e, v) =>
    p.array
      ? [parameter(undefined, v), IN, e, ".", identifier(n)]
      : [e, ".", identifier(n), CONTAINS, parameter(undefined, v)],
  startsWith: (n, p, e, v) => [e, ".", identifier(n), STARTS, WITH, parameter(undefined, v)],
  ensWith: (n, p, e, v) => [e, ".", identifier(n), ENDS, WITH, parameter(undefined, v)],
  null: (n, p, e, v) => [e, ".", identifier(n), v ? [IS, NULL] : [IS, NOT, NULL]],
};

const propConditionCypher = (
  op: Op,
  propertyName: string,
  property: Property,
  condition: any,
  entity: Identifier
): CypherNode => {
  const result: CypherNode[] = [];
  for (const k in condition) {
    const emitter = propConditionEmitters[k] ?? error(`Unknow property condition key: ${k}`);
    result.push(emitter(propertyName, property, entity, condition[k]));
  }
  return joinOp(op, result);
};

const joinOp = (op: Op, cyps: CypherNode[]): CypherNode => {
  const conds = cyps.filter((e) => e);
  if (conds.length === 0) {
    return undefined;
  }
  const result: CypherNode[] = [];
  result.push("(");
  result.push(conds[0]);
  const cypherOp = op === "all" ? AND : OR;
  for (let i = 1; i < conds.length; i++) {
    result.push(cypherOp);
    result.push(conds[i]);
  }
  result.push(")");
  return result;
};
