/* eslint-disable @typescript-eslint/ban-types */
import { z } from "zod";
import {
  AND,
  CONTAINS,
  CypherNode,
  cypherParameter,
  ENDS,
  identifier,
  Identifier,
  IN,
  IS,
  NOT,
  NULL,
  OR,
  STARTS,
  WITH,
} from "./cypher";
import { Properties } from "./definition";
import {
  coercedPropertyZodTypes,
  Property,
  PropertyType,
  propertyZodTypes,
  TSProperty,
} from "./property";
import { IntersectVals } from "./util";

export type QueryParameter = z.infer<typeof zQueryParameter>;
const zQueryParameter = z.object({
  type: z.literal("queryParameter"),
  name: z.string(),
});

const isQueryParameter = (value: any): value is QueryParameter => value.type === "queryParameter";

export const queryParameter = <P extends string>(name: P) =>
  ({ type: "queryParameter", name } satisfies QueryParameter);

type PropertyValueParameters<T, V> = V extends QueryParameter ? { [K in V["name"]]: T } : {};

type PropertyConditionParameters<T, C> = IntersectVals<{
  [K in keyof C]: K extends RecursiveKey
    ? PropertyConditionParameters<T, C[K]>
    : PropertyValueParameters<T, C[K]>;
}>;

export type ReferenceConditionParameters<
  N extends Properties,
  R extends Properties,
  C
> = ConditionParameters<N & Omit<R, keyof N>, C>;

export type ConditionParameters<P extends Properties, C> = IntersectVals<{
  [K in keyof C]: K extends RecursiveKey
    ? ConditionParameters<P, C[K]>
    : K extends keyof P
    ? PropertyConditionParameters<z.infer<P[K]["zodType"]>, C[K]>
    : never;
}>;

type RecursiveKey = "$all" | "$any" | "$not";

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
} & { $id?: number | number[] | QueryParameter };

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
} & { $id?: number | number[] | QueryParameter; $rid?: number | number[] | QueryParameter };

export const zSimpleReferenceCondition = <P extends Properties>(props: P) => {
  const fields = {} as { [key: string]: z.ZodType };
  for (const k in props) {
    fields[k] = zPropertyCondition(props[k]);
  }
  fields.$id = z.number().or(z.number().array()).or(zQueryParameter);
  fields.$rid = z.number().or(z.number().array()).or(zQueryParameter);
  return z.object(fields).strict().partial() as z.ZodType<SimpleReferenceCondition<P>>;
};

type PropertyCondition<P extends Property> = All<SimplePropertyCondition<P>>;

const zPropertyCondition = <P extends Property>(property: P) =>
  zAll(zSimplePropertyCondition(property) as z.SomeZodObject) as z.ZodType<PropertyCondition<P>>;

type SimplePropertyCondition<P extends Property> = Partial<
  (P["nullable"] extends true ? { null: boolean } : {}) &
    (P["array"] extends true
      ? { contains: TSProperty[P["propertyType"]] | QueryParameter }
      : SpecificPropertyCondition<P["propertyType"]>)
>;

const zSimplePropertyCondition = <P extends Property>(property: P) =>
  z
    .object(property.nullable ? { null: z.boolean() } : {})
    .merge(
      property.array
        ? z.object({ contains: propertyZodTypes[property.propertyType].or(zQueryParameter) })
        : zSpecificPropertyCondition(property.propertyType)
    )
    .strict()
    .partial() as unknown as z.ZodType<SimplePropertyCondition<P>>;

type SpecificPropertyCondition<P extends PropertyType> = {
  [K in typeof propertyConditionKeys[P][number]]: TSProperty[P] | QueryParameter;
};

const zSpecificPropertyCondition = (propertyType: PropertyType) => {
  const t = coercedPropertyZodTypes[propertyType].or(zQueryParameter);
  return z.object(Object.fromEntries(propertyConditionKeys[propertyType].map((k) => [k, t])));
};

export const propertyConditionKeys = {
  string: ["=", "contains", "startsWith", "endsWith"],
  number: ["=", "<", ">", "<=", ">="],
  boolean: ["="],
  duration: ["=", "<", ">", "<=", ">="],
  localTime: ["=", "<", ">", "<=", ">="],
  date: ["=", "<", ">", "<=", ">="],
  localDateTime: ["=", "<", ">", "<=", ">="],
  dateTime: ["=", "<", ">", "<=", ">="],
  point: [],
} as const satisfies Readonly<{ [K in PropertyType]: readonly string[] }>;

type PropertyConditionKey =
  | RecursiveKey
  | "null"
  | typeof propertyConditionKeys[PropertyType][number];

type ConditionKey = RecursiveKey | "$id" | "$rid";

type Op = "any" | "all";

type Entity = {
  properties: Properties;
  variable: Identifier;
};

const condEmitters: {
  [K in ConditionKey]: (value: any, node: Entity, relationship?: Entity) => CypherNode;
} = {
  $all(v, n, r) {
    return conditionCypher("all", v, n, r);
  },
  $any(v, n, r) {
    return conditionCypher("any", v, n, r);
  },
  $not(v, n, r) {
    return ["(", NOT, conditionCypher("all", v, n, r), ")"];
  },
  $id(v, n, r) {
    return ["(id(", n.variable, ")", typeof v === "number" ? " = " : IN, emitParameter(v), ")"];
  },
  $rid(v, n, r) {
    return ["(id(", r!.variable, ")", typeof v === "number" ? " = " : IN, emitParameter(v), ")"];
  },
};

export const conditionCypher = (
  op: Op,
  condition: any,
  node: Entity,
  relationship?: Entity
): CypherNode => {
  const result: CypherNode[] = [];
  for (const k in condition) {
    const emitter = condEmitters[k as ConditionKey];
    if (emitter) {
      result.push(emitter(condition[k], node, relationship));
    } else {
      const entity = !relationship ? node : node.properties[k] ? node : relationship;
      result.push(
        propConditionCypher("all", k, entity.properties[k], condition[k], entity.variable)
      );
    }
  }
  return joinOpCypher(op, result);
};

const emitParameter = (value: any): CypherNode => {
  return isQueryParameter(value)
    ? [identifier("p"), ".", identifier(value.name)]
    : cypherParameter(undefined, value);
};

const propCondEmitters: {
  [K in PropertyConditionKey]: (
    propertyName: string,
    property: Property,
    entity: Identifier,
    value: any
  ) => CypherNode;
} = {
  $all(n, p, e, v) {
    return propConditionCypher("all", n, p, v, e);
  },
  $any(n, p, e, v) {
    return propConditionCypher("any", n, p, v, e);
  },
  $not(n, p, e, v) {
    return ["(", NOT, propConditionCypher("all", n, p, v, e), ")"];
  },
  "="(n, p, e, v) {
    return [e, ".", identifier(n), "=", emitParameter(v)];
  },
  "<"(n, p, e, v) {
    return [e, ".", identifier(n), "<", emitParameter(v)];
  },
  ">"(n, p, e, v) {
    return [e, ".", identifier(n), ">", emitParameter(v)];
  },
  "<="(n, p, e, v) {
    return [e, ".", identifier(n), "<=", emitParameter(v)];
  },
  ">="(n, p, e, v) {
    return [e, ".", identifier(n), ">=", emitParameter(v)];
  },
  contains(n, p, e, v) {
    return p.array
      ? [emitParameter(v), IN, e, ".", identifier(n)]
      : [e, ".", identifier(n), CONTAINS, emitParameter(v)];
  },
  startsWith(n, p, e, v) {
    return [e, ".", identifier(n), STARTS, WITH, emitParameter(v)];
  },
  endsWith(n, p, e, v) {
    return [e, ".", identifier(n), ENDS, WITH, emitParameter(v)];
  },
  null(n, p, e, v) {
    return [e, ".", identifier(n), v ? [IS, NULL] : [IS, NOT, NULL]];
  },
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
    result.push(
      propCondEmitters[k as PropertyConditionKey](propertyName, property, entity, condition[k])
    );
  }
  return joinOpCypher(op, result);
};

const joinOpCypher = (op: Op, cyps: CypherNode[]): CypherNode => {
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

export type ParameterEntry = { name: string; type: z.ZodType };

const nodeCondParamCollectors: {
  [K in ConditionKey]: (value: any, properties: Properties) => ParameterEntry[];
} = {
  $all(v, p) {
    return conditionParameters(v, p);
  },
  $any(v, p) {
    return conditionParameters(v, p);
  },
  $not(v, p) {
    return conditionParameters(v, p);
  },
  $id(v, p) {
    return valueParameters(v, z.number().or(z.number().array()));
  },
  $rid(v, p) {
    return valueParameters(v, z.number().or(z.number().array()));
  },
};

export const conditionParameters = (condition: any, properties: Properties): ParameterEntry[] => {
  const entries: ParameterEntry[] = [];
  for (const k in condition) {
    const collector = nodeCondParamCollectors[k as ConditionKey];
    if (collector) {
      entries.push(...collector(condition[k], properties));
    } else {
      entries.push(...propertyConditionParameters(condition[k], properties[k]));
    }
  }
  return entries;
};

const propCondParamCollectors: {
  [K in PropertyConditionKey]: (value: any, property: Property) => ParameterEntry[];
} = {
  $all(v, p) {
    return propertyConditionParameters(v, p);
  },
  $any(v, p) {
    return propertyConditionParameters(v, p);
  },
  $not(v, p) {
    return propertyConditionParameters(v, p);
  },
  "="(v, p) {
    return valueParameters(v, propertyZodTypes[p.propertyType]);
  },
  "<"(v, p) {
    return valueParameters(v, propertyZodTypes[p.propertyType]);
  },
  ">"(v, p) {
    return valueParameters(v, propertyZodTypes[p.propertyType]);
  },
  "<="(v, p) {
    return valueParameters(v, propertyZodTypes[p.propertyType]);
  },
  ">="(v, p) {
    return valueParameters(v, propertyZodTypes[p.propertyType]);
  },
  contains(v, p) {
    return valueParameters(v, propertyZodTypes[p.propertyType]);
  },
  startsWith(v, p) {
    return valueParameters(v, propertyZodTypes[p.propertyType]);
  },
  endsWith(v, p) {
    return valueParameters(v, propertyZodTypes[p.propertyType]);
  },
  null(v, p) {
    return valueParameters(v, propertyZodTypes[p.propertyType]);
  },
};

const propertyConditionParameters = (condition: any, property: Property): ParameterEntry[] => {
  const entries: ParameterEntry[] = [];
  for (const k in condition) {
    entries.push(...propCondParamCollectors[k as PropertyConditionKey](condition[k], property));
  }
  return entries;
};

const valueParameters = (value: any, type: z.ZodType): ParameterEntry[] => {
  return isQueryParameter(value) ? [{ name: value.name, type }] : [];
};
