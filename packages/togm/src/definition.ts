/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { z, ZodType } from "zod";
import { selection, Selection, SelectionDef } from "./selection";
import { CreateNode, CreateRelationship, UpdateNode, UpdateRelationship } from "./update";
import { capitalize, DeepStrict, Flatten1, Flatten2, getKeys, PascalizeKeys } from "./util";

export type Id = { id?: number } | number;

export type Graph<G extends GraphDef = GraphDef> = {
  definition: G;
  select: {
    [L in keyof G as LabelKey<G, L>]: <Q extends SelectionDef<G, L>>(
      def: Q & DeepStrict<SelectionDef<G, L>, Q>
    ) => Selection<G, L, Q>;
  };
  create: {
    [L in keyof G as LabelKey<G, L>]: (
      props: PropRecord<G[L]["members"]>,
      opts?: { additionalLabels: GraphLabel<G>[] }
    ) => CreateNode;
  } & {
    [T in keyof G as TypeKey<G, T>]: (
      start: Id,
      end: Id,
      props: PropRecord<G[T]["members"]>
    ) => CreateRelationship;
  };
  update: {
    [L in keyof G as LabelKey<G, L>]: (
      id: Id,
      props: Partial<PropRecord<G[L]["members"]>>
    ) => UpdateNode;
  } & {
    [T in keyof G as TypeKey<G, T>]: (
      id: Id,
      props: Partial<PropRecord<G[T]["members"]>>
    ) => UpdateRelationship;
  };
};

export type GraphDef = {
  [K: string]: NodeDef | RelDef;
};

export type NodeDef = {
  type: "node";
  members: NodeMembers;
};

export type RelDef = {
  type: "relationship";
  members: RelMembers;
};

type NodeMembers = {
  [K: string]: Property | Reference;
};

type RelMembers = {
  [K: string]: Property;
};

export type EntityMembers = NodeMembers | RelMembers;

export type LabelKey<G extends GraphDef, L extends keyof G> = G[L]["type"] extends "node"
  ? L
  : never;

export type TypeKey<G extends GraphDef, T extends keyof G> = G[T]["type"] extends "relationship"
  ? T
  : never;

export type GraphLabel<G extends GraphDef> = keyof {
  [K in keyof G as LabelKey<G, K>]: 0;
};

export type GraphType<G extends GraphDef> = keyof {
  [K in keyof G as TypeKey<G, K>]: 0;
};

export type MemberProps<M extends NodeMembers | RelMembers> = {
  [K in keyof M as M[K]["type"] extends "property" ? K : never]: M[K];
};

export type NodeRefs<M extends NodeMembers> = {
  [K in keyof M as M[K]["type"] extends "reference" ? K : never]: M[K];
};

export const propTypes = {
  string: z.string(),
  number: z.number(),
  boolean: z.boolean(),
  duration: z.custom<Duration<number>>((v: any) => isDuration(v)),
  localTime: z.custom<LocalTime<number>>((v: any) => isLocalTime(v)),
  date: z.custom<Date<number>>((v: any) => isDate(v)),
  localDateTime: z.custom<LocalDateTime<number>>((v: any) => isLocalDateTime(v)),
  dateTime: z.custom<DateTime<number>>((v: any) => isDateTime(v)),
  point: z.custom<Point<number>>((v: any) => isPoint(v)),
};

const propTypeCoercions: { [K in keyof typeof propTypes]: (type: ZodType) => ZodType } = {
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
};

export const coercedTypes = Object.fromEntries(
  Object.entries(propTypes).map(([k, t]) => [k, (propTypeCoercions as any)[k](t)])
) as { [K in keyof typeof propTypes]: ZodType };

const propCardinalities = {
  array: true,
  "": false,
} as const;

const propNullabilities = {
  OrNull: true,
  "": false,
} as const;

export type Property<T = any, A extends boolean = boolean, N extends boolean = boolean> = {
  type: "property";
  propertyType: keyof typeof propTypes;
  nullable: N;
  array: A;
  zodType: ZodType<PropTypeStep2<PropTypeStep1<T, A>, N>>;
};

type PropTypeStep1<T, A extends boolean> = A extends true ? T[] : T;
type PropTypeStep2<T, N extends boolean> = N extends true ? null | T : T;

export const multiplicities = {
  one: "single",
  many: "many",
  opt: "optional",
} as const;

export const directions = {
  out: "outgoing",
  in: "incoming",
  undirected: "undirected",
} as const;

type Direction = typeof directions[keyof typeof directions];
type Multiplicity = typeof multiplicities[keyof typeof multiplicities];

export type WithMultiplicity<M extends Multiplicity, T> = M extends "single"
  ? T
  : M extends "many"
  ? T[]
  : M extends "optional"
  ? T | null
  : never;

export type Reference = {
  type: "reference";
  relationshipType: string;
  label: string;
  direction: Direction;
  multiplicity: Multiplicity;
};

type PropertyFactories = {
  [P in keyof typeof propTypes]: {
    [C in keyof typeof propCardinalities]: {
      [N in keyof typeof propNullabilities]: <T extends z.infer<typeof propTypes[P]>>(
        type?: ZodType<T>
      ) => Property<
        unknown extends T ? z.infer<typeof propTypes[P]> : T,
        typeof propCardinalities[C],
        typeof propNullabilities[N]
      >;
    };
  };
};

type ReferenceFactories = {
  [M in keyof typeof multiplicities]: {
    [D in keyof typeof directions]: <T extends string, L extends string>(
      relationshipType: T,
      label: L
    ) => {
      type: "reference";
      relationshipType: T;
      label: L;
      multiplicity: typeof multiplicities[M];
      direction: typeof directions[D];
    };
  };
};

type PropRecord<M extends NodeMembers | RelMembers> = {
  [P in keyof MemberProps<M>]: M[P] extends Property ? z.infer<M[P]["zodType"]> : never;
};

export const applyMultiplicity = (type: ZodType, multiplicity: Multiplicity): ZodType => {
  if (multiplicity === "many") {
    return type.array();
  }
  if (multiplicity === "optional") {
    return type.nullable();
  }
  return type;
};

export const defineNode = <M extends NodeMembers>(members: M): { type: "node"; members: M } => {
  return { type: "node", members };
};

export const defineRelationship = <M extends RelMembers>(
  members: M
): { type: "relationship"; members: M } => {
  return { type: "relationship", members };
};

export const propertyFactories = (): PascalizeKeys<Flatten2<PropertyFactories>> => {
  const result = {} as any;
  for (const p of getKeys(propTypes)) {
    for (const c of getKeys(propCardinalities)) {
      for (const n of getKeys(propNullabilities)) {
        result[`${p}${capitalize(c)}${capitalize(n)}`] = (type?: ZodType) => {
          const array = propCardinalities[c];
          const nullable = propNullabilities[n];
          let zodType = propTypeCoercions[p](type ?? propTypes[p]);
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

export const referenceFactories = (): PascalizeKeys<Flatten1<ReferenceFactories>> => {
  const result = {} as any;
  for (const m of getKeys(multiplicities)) {
    for (const d of getKeys(directions)) {
      result[`${m}${capitalize(d)}`] = (relType: string, label: string) => ({
        type: "reference",
        relationshipType: relType,
        label: label,
        multiplicity: multiplicities[m],
        direction: directions[d],
      });
    }
  }
  return result;
};

export const defineGraph = <G extends GraphDef>(def: G): Graph<G> => {
  const result: Graph<G> = {
    definition: def,
    create: {} as Graph<G>["create"],
    update: {} as Graph<G>["update"],
    select: {} as Graph<G>["select"],
  };
  for (const k in def) {
    const e = def[k];
    const zodType = propsZodType(e.members);
    if (e.type === "node") {
      (result.create as any)[k] = (
        props: any,
        opts?: { additionalLabels?: string[] }
      ): CreateNode => {
        const labels = new Set<string>(opts?.additionalLabels ?? []);
        labels.add(k);
        return {
          type: "createNode",
          labels: [...labels],
          properties: zodType.parse(props),
        };
      };
      (result.update as any)[k] = (id: Id, props: any): UpdateNode => {
        return {
          type: "updateNode",
          node: id,
          properties: zodType.partial().parse(props),
        };
      };
      (result.select as any)[k] = (selDef: any) => selection(selDef, result, k);
    }
    if (e.type === "relationship") {
      (result.create as any)[k] = (start: Id, end: Id, props: any): CreateRelationship => {
        return {
          type: "createRelationship",
          relationshipType: k,
          start: start,
          end: end,
          properties: zodType.parse(props),
        };
      };
      (result.update as any)[k] = (id: Id, props: any): UpdateRelationship => {
        return {
          type: "updateRelationship",
          relationship: id,
          properties: zodType.partial().parse(props),
        };
      };
    }
  }
  return result;
};

const propsZodType = (members: NodeMembers | RelMembers) => {
  const fields: { [key: string]: ZodType } = {};
  for (const k in members) {
    const m = members[k];
    if (m.type === "property") {
      fields[k] = m.zodType;
    }
  }
  return z.object(fields);
};
