import { CypherNode, Identifier } from "./cypher";
import { EntityProp, EntityRef, GraphDef, Property, PropertyType, Reference, RefKey, WithMultiplicity } from "./define";
import { SameKeys } from "./util";

export type Selection<G extends GraphDef, L extends keyof G, Q extends SelectionDef<Q, G, L>> = {
  graphDefinition: G;
  label: L;
  definition: Q;
  cypher: (n: Identifier) => CypherNode;
  example: () => SelectionResultNode<G, L, null, Q>;
};

type NestedSelectionDef<Q, G extends GraphDef, R extends Reference> = SelectionDef<Q, G, R["label"]>;

export type SelectionDef<Q, G extends GraphDef, L extends keyof G> = G[L]["type"] extends "node"
  ? SameKeys<
      Q,
      {
        [K in keyof G[L]["members"] as RefKey<G[L]["members"], K>]?: G[L]["members"][K] extends Reference
          ? K extends keyof Q
            ? NestedSelectionDef<Q[K], G, G[L]["members"][K]>
            : never
          : never;
      }
    >
  : never;

type SelectionResultKeys<G extends GraphDef, L extends keyof G, T extends keyof G | null, Q> =
  | "id"
  | (EntityRef<G[L]["members"]> & keyof Q)
  | EntityProp<G[L]["members"]>
  | (T extends keyof G ? keyof G[T]["members"] : T extends string ? "relationshipId" : never);

type SelectionResultNode<G extends GraphDef, L extends keyof G, T extends keyof G | null, Q> = {
  [K in SelectionResultKeys<G, L, T, Q>]: K extends keyof G[L]["members"]
    ? G[L]["members"][K] extends Property
      ? PropertyType<G[L]["members"][K]>
      : G[L]["members"][K] extends Reference
      ? K extends keyof Q
        ? WithMultiplicity<
            G[L]["members"][K]["multiplicity"],
            SelectionResultNode<G, G[L]["members"][K]["label"], G[L]["members"][K]["relationshipType"], Q[K]>
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
