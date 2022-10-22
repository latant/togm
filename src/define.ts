import { Date, DateTime, Duration, LocalDateTime, LocalTime, Point } from "neo4j-driver";
import { Selection, SelectionDef } from "./select";
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

const propTypeDefaults = {
  string: "" as string,
  number: 0 as number,
  boolean: true as boolean,
  duration: new Duration<number>(0, 0, 0, 0),
  localTime: new LocalTime<number>(0, 0, 0, 0),
  date: new Date<number>(0, 0, 0),
  localDateTime: new LocalDateTime<number>(0, 0, 0, 0, 0, 0, 0),
  dateTime: new DateTime<number>(0, 0, 0, 0, 0, 0, 0, 0, "UTC"),
  point: new Point<number>(0, 0, 0, 0),
};

const propCardinalities = {
  array: true as true,
  "": false as false,
} as const;

const propNullabilities = {
  OrNull: true,
  "": false,
} as const;

export type Property = {
  type: "property";
  propertyType: keyof typeof propTypeDefaults;
  nullable: boolean;
  array: boolean;
  defaultValue: any;
};

type PropTypeStep1<T, A extends boolean> = A extends true ? T[] : T;
type PropTypeStep2<T, N extends boolean> = N extends true ? null | T : T;
export type PropertyType<P extends Property> = PropTypeStep2<
  PropTypeStep1<P["defaultValue"], P["array"]>,
  P["nullable"]
>;

const multipilicities = {
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
type Multiplicity = typeof multipilicities[keyof typeof multipilicities];

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
  [P in keyof typeof propTypeDefaults]: {
    [C in keyof typeof propCardinalities]: {
      [N in keyof typeof propNullabilities]: <D extends typeof propTypeDefaults[P]>() => {
        type: "property";
        propertyType: P;
        array: typeof propCardinalities[C];
        nullable: typeof propNullabilities[N];
        defaultValue: unknown extends D ? typeof propTypeDefaults[P] : D;
      };
    };
  };
};

type ReferenceFactories = {
  [M in keyof typeof multipilicities]: {
    [D in keyof typeof directions]: <T extends string, L extends string>(
      relationshipType: T,
      label: L
    ) => {
      type: "reference";
      relationshipType: T;
      label: L;
      multiplicity: typeof multipilicities[M];
      direction: typeof directions[D];
    };
  };
};

type PropRecord<M extends NodeMembers | RelMembers> = {
  [P in keyof M as PropKey<M, P>]: M[P] extends Property ? PropertyType<M[P]> : never;
};

export function node<M extends NodeMembers>(members: M): { type: "node"; members: M } {
  return { type: "node", members };
}

export function relationship<M extends RelMembers>(members: M): { type: "relationship"; members: M } {
  return { type: "relationship", members };
}

export function propertyFactories(): PascalizeKeys<Flatten2<PropertyFactories>> {
  const result = {} as any;
  for (const p in propTypeDefaults) {
    for (const c in propCardinalities) {
      for (const n in propNullabilities) {
        result[`${p}${capitalize(c)}${capitalize(n)}`] = () => ({
          type: "property",
          propertyType: p,
          array: propCardinalities[c],
          nullable: propNullabilities[n],
          defaultValue: propTypeDefaults[p],
        });
      }
    }
  }
  return result;
}

export function referenceFactories(): PascalizeKeys<Flatten1<ReferenceFactories>> {
  const result = {} as any;
  for (const m in multipilicities) {
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

export function graph<G extends GraphDef>(def: G): Graph<G> {
  return {} as any;
}
