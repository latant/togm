/* eslint-disable @typescript-eslint/ban-types */
import { z, ZodObject } from "zod";
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
import { NodeDefinition, Properties } from "./definition";
import {
  coercedPropertyZodTypes,
  Property,
  PropertyType,
  propertyZodTypes,
  TSProperty,
} from "./property";
import { MatchProvider } from "./read";

type All<T> = T & { $any?: Any<T>; $not?: All<T> };

const zAll = <T extends z.SomeZodObject>(type: T): z.ZodType<All<z.infer<T>>> =>
  z.lazy(() => type.merge(z.object({ $any: zAny(type).optional(), $not: zAll(type).optional() })));

type Any<T> = T & { $all?: All<T>; $not?: All<T> };

const zAny = <T extends z.SomeZodObject>(type: T): z.ZodType<Any<z.infer<T>>> =>
  type.merge(z.object({ $all: zAll(type).optional(), $not: zAll(type).optional() }));

export type NodeCondition<P extends Properties = Properties> = All<SimpleNodeCondition<P>>;

export const zNodeCondition = <P extends Properties>(props: P) =>
  zAll(zSimpleNodeCondition(props) as z.SomeZodObject);

export type ReferenceCondition<
  N extends Properties = Properties,
  R extends Properties = Properties
> = All<SimpleReferenceCondition<N & Omit<R, keyof N>>>;

export const zReferenceCondition = <N extends Properties, R extends Properties>(
  nodeProps: N,
  relProps: R
) => zAll(zSimpleReferenceCondition({ ...nodeProps, ...relProps }) as z.SomeZodObject);

type SimpleNodeCondition<P extends Properties = Properties> = {
  [K in keyof P]?: PropertyCondition<P[K]>;
} & { $id?: number | number[] };

const zSimpleNodeCondition = <P extends Properties>(props: P) => {
  const fields = {} as { [key: string]: z.ZodType };
  for (const k in props) {
    fields[k] = zPropertyCondition(props[k]);
  }
  fields.$id = z.number().or(z.number().array());
  return z.object(fields).strict().partial() as z.ZodType<SimpleNodeCondition<P>>;
};

type SimpleReferenceCondition<P extends Properties> = {
  [K in keyof P]?: PropertyCondition<P[K]>;
} & { $id?: number | number[]; $rid?: number | number[] };

export const zSimpleReferenceCondition = <P extends Properties>(props: P) => {
  const fields = {} as { [key: string]: z.ZodType };
  for (const k in props) {
    fields[k] = zPropertyCondition(props[k]);
  }
  fields.$id = z.number().or(z.number().array());
  fields.$rid = z.number().or(z.number().array());
  return z.object(fields).strict().partial() as z.ZodType<SimpleReferenceCondition<P>>;
};

type PropertyCondition<P extends Property> = All<SimplePropertyCondition<P>>;

const zPropertyCondition = <P extends Property>(property: P) =>
  zAll(zSimplePropertyCondition(property) as z.SomeZodObject) as z.ZodType<PropertyCondition<P>>;

type SimplePropertyCondition<P extends Property> = Partial<
  (P["nullable"] extends true ? { null: boolean } : {}) &
    (P["array"] extends true
      ? { contains: TSProperty[P["propertyType"]] }
      : z.infer<PropertyConditionType<P["propertyType"]>>)
>;

const zSimplePropertyCondition = <P extends Property>(property: P) =>
  z
    .object(property.nullable ? { null: z.boolean() } : {})
    .merge(
      property.array
        ? z.object({ contains: propertyZodTypes[property.propertyType] })
        : propertyConditionTypes[property.propertyType]
    )
    .strict()
    .partial() as unknown as z.ZodType<SimplePropertyCondition<P>>;

const zStringCondition = z.object({
  "=": z.string(),
  contains: z.string(),
  startsWith: z.string(),
  endsWith: z.string(),
});

const zNumericCondition = <T extends PropertyType>(type: T) => {
  const t = coercedPropertyZodTypes[type];
  return z.object({ "=": t, "<": t, ">": t, "<=": t, ">=": t });
};

type PropertyConditionType<P extends PropertyType> = typeof propertyConditionTypes[P];

export const propertyConditionTypes = {
  string: zStringCondition,
  number: zNumericCondition("number"),
  boolean: z.object({ "=": z.boolean() }),
  duration: zNumericCondition("duration"),
  localTime: zNumericCondition("localTime"),
  date: zNumericCondition("date"),
  localDateTime: zNumericCondition("localDateTime"),
  dateTime: zNumericCondition("dateTime"),
  point: z.object({}),
};

type Op = "any" | "all";

export const nodeMatchProvider = (
  label: string,
  node: NodeDefinition,
  cond: unknown
): MatchProvider => {
  return {
    cypher(n) {
      const condCypher = conditionCypher("all", cond, {
        properties: node.properties,
        variable: n,
      });
      return [MATCH, "(", n, ":", identifier(label), ")", condCypher && [WHERE, condCypher]];
    },
  };
};

export type Entity = {
  properties: Properties;
  variable: Identifier;
};

const condEmitters: {
  [key: string]: (value: any, node: Entity, relationship?: Entity) => CypherNode;
} = {
  $all: (v, n, r) => conditionCypher("all", v, n, r),
  $any: (v, n, r) => conditionCypher("any", v, n, r),
  $not: (v, n, r) => ["(", NOT, conditionCypher("all", v, n, r), ")"],
  $id: (v, n, r) => [
    "(id(",
    n.variable,
    ")",
    typeof v === "number" ? " = " : IN,
    parameter(undefined, v),
    ")",
  ],
  $rid: (v, n, r) => [
    "(id(",
    r!.variable,
    ")",
    typeof v === "number" ? " = " : IN,
    parameter(undefined, v),
    ")",
  ],
};

export const conditionCypher = (
  op: Op,
  condition: any,
  node: Entity,
  relationship?: Entity
): CypherNode => {
  const result: CypherNode[] = [];
  for (const k in condition) {
    const emitter = condEmitters[k];
    if (emitter) {
      result.push(emitter(condition[k], node, relationship));
    } else {
      const entity = !relationship ? node : node.properties[k] ? node : relationship;
      result.push(
        propConditionCypher("all", k, entity.properties[k], condition[k], entity.variable)
      );
    }
  }
  return joinOp(op, result);
};

const propCondEmitters: {
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
    result.push(propCondEmitters[k](propertyName, property, entity, condition[k]));
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
