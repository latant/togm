import { Date, DateTime, Duration, LocalDateTime, LocalTime } from "neo4j-driver";
import { z } from "zod";
import { AND, CypherNode, identifier, Identifier, IN, MATCH, OR, parameter, WHERE } from "./cypher";
import { NodeDef, Property, PropKey } from "./definition";
import { MatchProvider } from "./read";

export type Condition<N extends NodeDef> = All<ConditionImpl<N>>;

type ConditionImpl<N extends NodeDef = NodeDef> = {
  [K in keyof N["members"] as PropKey<N["members"], K>]?: N["members"][K] extends Property
    ? PropCondition<z.infer<N["members"][K]["zodType"]>>
    : never;
} & { $id?: number | number[] };

type PropCondition<T> = All<PropConditionImpl<T>>;

type PropConditionImpl<T = any> = { "="?: T } & (T extends string | null ? StringCondition : {}) &
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

type All<T> = T & { $any?: Any<T> };
type Any<T> = T & { $all?: All<T> };
type Op = "any" | "all";

export const nodeMatchProvider = (lbl: string, node: NodeDef, cond: ConditionImpl): MatchProvider => {
  return {
    cypher(n) {
      const condCyp = nodeConditionCypher(node, cond, n, "all");
      return [MATCH, "(", n, ":", identifier(lbl), ")", condCyp && [WHERE, condCyp]];
    },
  };
};

const nodeConditionCypher = (node: NodeDef, cond: ConditionImpl, n: Identifier, op: Op): CypherNode => {
  const result: CypherNode[] = [];
  for (const k in cond) {
    const p = node.members[k];
    if (p?.type === "property") {
      result.push(propConditionCypher(k, cond[k], n, "all"));
    } else if (k === "$id") {
      result.push(["(id(", n, ")", typeof cond[k] === "number" ? " = " : IN, parameter(undefined, cond[k]), ")"]);
    } else if (k === "$any") {
      result.push(nodeConditionCypher(node, cond[k], n, "any"));
    } else if (k === "$all") {
      result.push(nodeConditionCypher(node, cond[k], n, "all"));
    }
  }
  return joinOp(op, result);
};

const propConditionCypher = (prop: string, cond: PropConditionImpl, n: Identifier, op: Op): CypherNode => {
  const result: CypherNode[] = [];
  for (const k in cond) {
    if (k === "$any") {
      result.push(propConditionCypher(prop, cond[k], n, "any"));
    } else if (k === "$all") {
      result.push(propConditionCypher(prop, cond[k], n, "all"));
    } else {
      result.push([n, ".", identifier(prop), ` ${k} `, parameter(undefined, cond[k])]);
    }
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
