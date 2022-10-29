import { Date, DateTime, Duration, LocalDateTime, LocalTime, Point } from "neo4j-driver";
import { z, ZodType } from "zod";
import { Selection, SelectionDef } from "./selection";
import { CreateNode, CreateRelationship, UpdateNode, UpdateRelationship } from "./update";
import { capitalize, Flatten1, Flatten2, PascalizeKeys } from "./util";

export type Id = { id?: number } | number;

export type Graph<G extends GraphDef = GraphDef> = {
  definition: G;
  select: {
    [L in keyof G as LabelKey<G, L>]: <Q extends SelectionDef<Q, G, L>>(def: Q) => Selection<G, L, Q>;
  };
  create: {
    [L in keyof G as LabelKey<G, L>]: (
      props: PropRecord<G[L]["members"]>,
      opts?: { additionalLabels: GraphLabel<G>[] }
    ) => CreateNode;
  } & {
    [T in keyof G as TypeKey<G, T>]: (start: Id, end: Id, props: PropRecord<G[T]["members"]>) => CreateRelationship;
  };
  update: {
    [L in keyof G as LabelKey<G, L>]: (id: number, props: Partial<PropRecord<G[L]["members"]>>) => UpdateNode;
  } & {
    [T in keyof G as TypeKey<G, T>]: (id: number, props: Partial<PropRecord<G[T]["members"]>>) => UpdateRelationship;
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

export type LabelKey<G extends GraphDef, L extends keyof G> = G[L]["type"] extends "node" ? L : never;
export type TypeKey<G extends GraphDef, T extends keyof G> = G[T]["type"] extends "relationship" ? T : never;
export type PropKey<M extends NodeMembers | RelMembers, K extends keyof M> = M[K]["type"] extends "property"
  ? K
  : never;
export type RefKey<M extends NodeMembers | RelMembers, K extends keyof M> = M[K]["type"] extends "reference"
  ? K
  : never;
export type GraphLabel<G extends GraphDef> = keyof { [K in keyof G as LabelKey<G, K>]: 0 };
export type GraphType<G extends GraphDef> = keyof { [K in keyof G as TypeKey<G, K>]: 0 };
export type EntityProp<M extends NodeMembers | RelMembers> = keyof { [K in keyof M as PropKey<M, K>]: 0 };
export type EntityRef<M extends NodeMembers | RelMembers> = keyof { [K in keyof M as RefKey<M, K>]: 0 };

const propTypes = {
  string: z.string(),
  number: z.number(),
  boolean: z.boolean(),
  duration: z.custom<Duration<number>>((v) => v instanceof Duration),
  localTime: z.custom<LocalTime<number>>((v) => v instanceof LocalTime),
  date: z.custom<Date<number>>((v) => v instanceof Date),
  localDateTime: z.custom<LocalDateTime<number>>((v) => v instanceof LocalDateTime),
  dateTime: z.custom<DateTime<number>>((v) => v instanceof DateTime),
  point: z.custom<Point<number>>((v) => v instanceof Point),
};

const propCardinalities = {
  array: true as true,
  "": false as false,
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

const multiplicities = {
  one: "single",
  many: "many",
  opt: "optional",
} as const;

const directions = {
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
  [P in keyof M as PropKey<M, P>]: M[P] extends Property ? z.infer<M[P]["zodType"]> : never;
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

export function defineNode<M extends NodeMembers>(members: M): { type: "node"; members: M } {
  return { type: "node", members };
}

export function defineRelationship<M extends RelMembers>(members: M): { type: "relationship"; members: M } {
  return { type: "relationship", members };
}

export function propertyFactories(): PascalizeKeys<Flatten2<PropertyFactories>> {
  const result = {} as any;
  for (const p in propTypes) {
    for (const c in propCardinalities) {
      for (const n in propNullabilities) {
        result[`${p}${capitalize(c)}${capitalize(n)}`] = (type?: ZodType) => {
          const array = propCardinalities[c];
          const nullable = propNullabilities[n];
          let zodType: ZodType = type ?? propTypes[p];
          if (array) zodType = zodType.array();
          if (nullable) zodType = zodType.nullable();
          return { type: "property", propertyType: p, array, nullable, zodType };
        };
      }
    }
  }
  return result;
}

export function referenceFactories(): PascalizeKeys<Flatten1<ReferenceFactories>> {
  const result = {} as any;
  for (const m in multiplicities) {
    for (const d in directions) {
      result[`${m}${capitalize(d)}`] = (relType: string, label: string) => ({
        type: "reference",
        relationshipType: relType,
        label: label,
        multiplicity: m,
        direction: d,
      });
    }
  }
  return result;
}

export function defineGraph<G extends GraphDef>(def: G): Graph<G> {
  return {} as any;
}
