import { Date, DateTime, Duration, LocalDateTime, LocalTime, Point } from "neo4j-driver";
import { Identifier, TextNode } from "./cypher";
import { Id, CreateNode, UpdateNode, CreateRelationship, UpdateRelationship } from "./transaction";
import { capitalize, Flatten1, Flatten2, PascalizeKeys, SameKeys } from "./util";

export type Graph<G extends GraphDef = GraphDef> = {
  definition: G;
  query: {
    [L in keyof G as LabelKey<G, L>]: <Q extends QueryDef<Q, G, L>>(def: Q) => Query<G, L, Q>;
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

type Query<G extends GraphDef, L extends keyof G, Q extends QueryDef<Q, G, L>> = {
  graphDefinition: G;
  label: L;
  definition: Q;
  apply: (n: Identifier) => TextNode;
  example: () => QueryResultNode<G, L, null, Q>;
};

type GraphDef = {
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

type LabelKey<G extends GraphDef, L extends keyof G> = G[L]["type"] extends "node" ? L : never;
type TypeKey<G extends GraphDef, T extends keyof G> = G[T]["type"] extends "relationship" ? T : never;
type PropKey<M extends NodeMembers | RelMembers, K extends keyof M> = M[K]["type"] extends "property" ? K : never;
type RefKey<M extends NodeMembers | RelMembers, K extends keyof M> = M[K]["type"] extends "reference" ? K : never;
type GraphLabel<G extends GraphDef> = keyof { [K in keyof G as LabelKey<G, K>]: 0 };
type GraphType<G extends GraphDef> = keyof { [K in keyof G as TypeKey<G, K>]: 0 };
type EntityProp<M extends NodeMembers | RelMembers> = keyof { [K in keyof M as PropKey<M, K>]: 0 };
type EntityRef<M extends NodeMembers | RelMembers> = keyof { [K in keyof M as RefKey<M, K>]: 0 };

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

type Property = {
  type: "property";
  propertyType: keyof typeof propTypeDefaults;
  nullable: boolean;
  array: boolean;
  defaultValue: any;
};

type PropTypeStep1<T, A extends boolean> = A extends true ? T[] : T;
type PropTypeStep2<T, N extends boolean> = N extends true ? null | T : T;
type PropertyType<P extends Property> = PropTypeStep2<PropTypeStep1<P["defaultValue"], P["array"]>, P["nullable"]>;

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

type WithMultiplicity<M extends Multiplicity, T> = M extends "single"
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

type NestedQueryDef<Q, G extends GraphDef, R extends Reference> = QueryDef<Q, G, R["label"]>;

type QueryDef<Q, G extends GraphDef, L extends keyof G> = G[L]["type"] extends "node"
  ? SameKeys<
      Q,
      {
        [K in keyof G[L]["members"] as RefKey<G[L]["members"], K>]?: G[L]["members"][K] extends Reference
          ? K extends keyof Q
            ? NestedQueryDef<Q[K], G, G[L]["members"][K]>
            : never
          : never;
      }
    >
  : never;

type QueryResultKeys<G extends GraphDef, L extends keyof G, T extends keyof G | null, Q> =
  | "id"
  | (EntityRef<G[L]["members"]> & keyof Q)
  | EntityProp<G[L]["members"]>
  | (T extends keyof G ? keyof G[T]["members"] : T extends string ? "relationshipId" : never);

type QueryResultNode<G extends GraphDef, L extends keyof G, T extends keyof G | null, Q> = {
  [K in QueryResultKeys<G, L, T, Q>]: K extends keyof G[L]["members"]
    ? G[L]["members"][K] extends Property
      ? PropertyType<G[L]["members"][K]>
      : G[L]["members"][K] extends Reference
      ? K extends keyof Q
        ? WithMultiplicity<
            G[L]["members"][K]["multiplicity"],
            QueryResultNode<G, G[L]["members"][K]["label"], G[L]["members"][K]["relationshipType"], Q[K]>
          >
        : never
      : never
    : T extends keyof G
    ? K extends keyof G[T]["members"]
      ? G[T]["members"][K] extends Property
        ? PropertyType<G[T]["members"][K]>
        : never
      : never
    : K extends "relationshipId"
    ? number
    : K extends "id"
    ? number
    : never;
};

type PropRecord<M extends NodeMembers | RelMembers> = {
  [P in keyof M as PropKey<M, P>]: M[P] extends Property ? PropertyType<M[P]> : never;
};

function node<M extends NodeMembers>(members: M): { type: "node"; members: M } {
  return { type: "node", members };
}

function relationship<M extends RelMembers>(members: M): { type: "relationship"; members: M } {
  return { type: "relationship", members };
}

function propertyFactories(): PascalizeKeys<Flatten2<PropertyFactories>> {
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

function referenceFactories(): PascalizeKeys<Flatten1<ReferenceFactories>> {
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

function graph<G extends GraphDef>(def: G): Graph<G> {
  return {} as any;
}

export default {
  graph,
  node,
  relationship,
  ...propertyFactories(),
  ...referenceFactories(),
};
