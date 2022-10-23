import { CypherNode, identifier, Identifier, MapEntry } from "./cypher";
import {
  EntityProp,
  EntityRef,
  Graph,
  GraphDef,
  NodeDef,
  Property,
  Reference,
  RefKey,
  RelDef,
  WithMultiplicity,
  applyMultiplicity,
} from "./define";
import { NodeExpressionProvider } from "./read";
import { error, SameKeys } from "./util";
import { z, ZodType } from "zod";

export type Selection<G extends GraphDef, L extends keyof G, Q extends SelectionDef<Q, G, L>> = {
  graphDefinition: G;
  label: L;
  definition: Q;
} & NodeExpressionProvider<ZodType<SelectionResultNode<G, L, null, Q>>>;

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
  | "$id"
  | (EntityRef<G[L]["members"]> & keyof Q)
  | EntityProp<G[L]["members"]>
  | (T extends keyof G ? keyof G[T]["members"] : T extends string ? "$rid" : never);

type SelectionResultNode<G extends GraphDef, L extends keyof G, T extends keyof G | null, Q> = {
  [K in SelectionResultKeys<G, L, T, Q>]: K extends keyof G[L]["members"]
    ? G[L]["members"][K] extends Property
      ? z.infer<G[L]["members"][K]["zodType"]>
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
        ? z.infer<G[T]["members"][K]["zodType"]>
        : never
      : never
    : K extends "$rid"
    ? number
    : K extends "$id"
    ? number
    : never;
};

type SelectionNode = { [key: string]: SelectionNode };

type EntityVar = {
  kind: string;
  var: Identifier;
};

const requireEntity = (graph: Graph, kind: string): NodeDef | RelDef => {
  return graph.definition[kind] ?? error(`Entity not found: ${kind}`);
};

const requireNode = (graph: Graph, label: string) => {
  const entity = requireEntity(graph, label);
  if (entity.type !== "node") error(`Entity not a node: ${label}`);
  return entity as NodeDef;
};

const requireRelationship = (graph: Graph, type: string) => {
  const entity = requireEntity(graph, type);
  if (entity.type !== "relationship") error(`Entity not a relationship: ${type}`);
  return entity as RelDef;
};

const requireRef = (lbl: string, def: NodeDef, k: string) => {
  const member = def[k] ?? error(`Node member not found: ${lbl}.${k}`);
  if (member.type !== "reference") error(`Member not reference: ${lbl}.${k}`);
  return member as Reference;
};

// refs > ids > nodeProps > relProps
export const selectionType = (
  query: SelectionNode,
  graph: Graph,
  label: string,
  relationshipType?: string
): ZodType => {
  const nodeDef = requireNode(graph, label);
  const relDef = relationshipType && requireRelationship(graph, relationshipType);
  const fields: { [key: string]: ZodType } = {};
  if (relDef) {
    for (const k in relDef.members) {
      fields[k] = relDef.members[k].zodType;
    }
  }
  for (const k in nodeDef.members) {
    const member = nodeDef.members[k];
    if (member.type === "property") {
      fields[k] = member.zodType;
    }
  }
  fields["$id"] = z.number();
  if (relDef) fields["$rid"] = z.number();
  for (const k in query) {
    const ref = requireRef(label, nodeDef, k);
    const nestedType = selectionType(query[k], graph, ref.label, ref.relationshipType);
    fields[k] = applyMultiplicity(nestedType, ref.multiplicity);
  }
  return z.strictObject(fields).partial();
};

export const selectionCypher = (query: SelectionNode, graph: Graph, node: EntityVar, rel?: EntityVar): CypherNode => {
  const nodeDef = graph.definition[node.kind] as NodeDef;
  const relDef = rel && (graph.definition[rel.kind] as RelDef);
  const entries: { [key: string]: MapEntry } = {};
  if (relDef) {
    for (const k in relDef.members) {
      entries[k] = [identifier(k), [rel.var, ".", identifier(k)]];
    }
  }
  for (const k in nodeDef.members) {
    const member = nodeDef.members[k];
    if (member.type === "property") {
      entries[k] = [identifier(k), [node.var, ".", identifier(k)]];
    }
  }
  entries["$id"] = [identifier("$id"), ["id(", node.var, ")"]];
  if (rel) entries["$rid"] = [identifier("$rid"), ["id(", rel.var, ")"]];
  for (const k in query) {
    const ref = nodeDef[k] as Reference;
    const targetNode = identifier();
    const targetRel = identifier();
    entries[k] = [
      identifier(k),
      [
        "[",
        ["(", node.var, ")"],
        ref.direction === "incoming" && "<",
        ["-[:", targetRel, "]-"],
        ref.direction === "outgoing" && ">",
        ["(", targetNode, ":", ref.label, ")"],
        "|",
        selectionCypher(
          query[k],
          graph,
          { kind: ref.label, var: targetNode },
          { kind: ref.relationshipType, var: targetRel }
        ),
        "]",
        ref.multiplicity !== "many" && "[0]",
      ],
    ];
  }
  return { type: "map", map: Object.values(entries) };
};
