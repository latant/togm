/* eslint-disable @typescript-eslint/no-explicit-any */
import { Transaction } from "neo4j-driver";
import { z } from "zod";
import {
  conditionCypher,
  NodeCondition,
  nodeMatchProvider,
  ReferenceCondition,
  zReferenceCondition,
} from "./condition";
import { CypherNode, Identifier, identifier, MapEntry, WHERE } from "./cypher";
import { Entities, GraphDefinition, NodeDefinition } from "./definition";
import { coercedPropertyZodTypes } from "./property";
import { MatchProvider, NodeExpressionProvider, runReadQuery } from "./read";
import { Reference, WithMultiplicity, zWithMultiplicity } from "./reference";
import { getValues } from "./util";

export type NodeSelectionDefinitionMembers<E extends Entities, N extends NodeDefinition> = {
  [K in keyof N["references"]]?: ReferenceSelectionDefinitionMembers<E, N["references"][K]>;
};

type ReferenceSelectionDefinitionMembers<
  E extends Entities,
  R extends Reference
> = NodeSelectionDefinitionMembers<E, E["nodes"][R["label"]]> & {
  $where?: ReferenceCondition<
    E["nodes"][R["label"]]["properties"],
    E["relationships"][R["relationshipType"]]["properties"]
  >;
};

export type NodeSelectionTypes<E extends Entities> = {
  [L in keyof E["nodes"]]: z.ZodType<NodeSelectionDefinitionMembers<E, E["nodes"][L]>>;
};

export const nodeSelectionTypes = <E extends Entities>(entities: E) => {
  const refTypes = {} as { [key: string]: { [key: string]: z.ZodType } };
  const nodeFields = {} as { [key: string]: { [key: string]: z.ZodType } };
  for (const l in entities.nodes) {
    const node = entities.nodes[l];
    nodeFields[l] = {};
    for (const r in node.references) {
      nodeFields[l][r] = z.lazy(() => refTypes[l][r]);
    }
  }
  for (const l in entities.nodes) {
    const node = entities.nodes[l];
    refTypes[l] = {};
    for (const r in node.references) {
      const reference = node.references[r];
      refTypes[l][r] = z
        .strictObject({
          $where: zReferenceCondition(
            node.properties,
            entities.relationships[reference.relationshipType]?.properties ?? {}
          ),
          ...nodeFields[reference.label],
        })
        .partial();
    }
  }
  const result = {} as { [key: string]: z.ZodType };
  for (const l in nodeFields) {
    result[l] = z.strictObject(nodeFields[l]).partial();
  }
  return result as NodeSelectionTypes<E>;
};

export type NodeSelectionDefinition<
  E extends Entities = Entities,
  N extends NodeDefinition = NodeDefinition,
  M = any
> = {
  node: N;
  references: {
    [K in keyof M & keyof N["references"]]: ReferenceSelectionDefinition<
      E,
      N["references"][K],
      M[K]
    >;
  };
};

type ReferenceSelectionDefinition<
  E extends Entities = Entities,
  R extends Reference = Reference,
  M = any
> = NodeSelectionDefinition<E, E["nodes"][R["label"]], M> & {
  reference: R;
  relationship: E["relationships"][R["relationshipType"]];
  condition?: ReferenceCondition;
};

export const defineNodeSelection = <E extends Entities, N extends NodeDefinition, M>(
  entities: E,
  node: N,
  members: M
): NodeSelectionDefinition<E, N, M> => {
  const references = {} as any;
  for (const k in members) {
    references[k] = defineReferenceSelection(entities, node.references[k], members[k]);
  }
  return { node, references };
};

const defineReferenceSelection = <E extends Entities, R extends Reference, M>(
  entities: E,
  reference: R,
  members: M
): ReferenceSelectionDefinition<E, R, M> => {
  const references = {} as any;
  const node = entities.nodes[reference.label] as any;
  const relationship = entities.relationships[reference.relationshipType] as any;
  for (const k in members) {
    if (!k.startsWith("$")) {
      references[k] = defineReferenceSelection(entities, node.references[k], members[k]);
    }
  }
  return { node, references, reference, relationship, condition: (members as any).$where };
};

export type NodeSelection<S extends NodeSelectionDefinition = NodeSelectionDefinition> =
  NodeSelectionImpl<S, NodeSelectionResult<S>>;

type NodeSelectionImpl<S extends NodeSelectionDefinition = NodeSelectionDefinition, T = unknown> = {
  definition: S;
  match: (p: MatchProvider, t?: Transaction) => Promise<T[]>;
  matchOne: (p: MatchProvider, t?: Transaction) => Promise<T | undefined>;
  find: (f: NodeCondition<S["node"]["properties"]>, t?: Transaction) => Promise<T[]>;
  findOne: (f: NodeCondition<S["node"]["properties"]>, t?: Transaction) => Promise<T | undefined>;
};

export type NodeSelectionResult<S extends NodeSelectionDefinition> = { $id: number } & {
  [K in keyof S["references"]]: ReferenceSelectionResult<S["references"][K]>;
} & {
  [K in Exclude<keyof S["node"]["properties"], keyof S["references"]>]: z.infer<
    S["node"]["properties"][K]["zodType"]
  >;
};

type ReferenceSelectionResult<S extends ReferenceSelectionDefinition> = WithMultiplicity<
  S["reference"]["multiplicity"],
  NodeSelectionResult<S> & { $rid: number } & {
    [K in Exclude<
      keyof S["relationship"]["properties"],
      keyof S["node"]["properties"] | keyof S["references"]
    >]: z.infer<S["relationship"]["properties"][K]["zodType"]>;
  }
>;

const nodeSelectionResultType = (def: NodeSelectionDefinition) => {
  const fields = {} as { [key: string]: z.ZodType };
  for (const k in def.node.properties) {
    fields[k] = def.node.properties[k].zodType;
  }
  for (const k in def.references) {
    fields[k] = referenceSelectionResultType(def.references[k]);
  }
  fields.$id = coercedPropertyZodTypes.number;
  return z.strictObject(fields);
};

const referenceSelectionResultType = (def: ReferenceSelectionDefinition) => {
  const fields = {} as { [key: string]: z.ZodType };
  for (const k in def.relationship.properties) {
    fields[k] = def.relationship.properties[k].zodType;
  }
  for (const k in def.node.properties) {
    fields[k] = def.node.properties[k].zodType;
  }
  for (const k in def.references) {
    fields[k] = referenceSelectionResultType(def.references[k]);
  }
  fields.$id = coercedPropertyZodTypes.number;
  fields.$rid = coercedPropertyZodTypes.number;
  const type = z.strictObject(fields);
  return zWithMultiplicity(def.reference.multiplicity, type);
};

const nodeSelectionCypher = (def: NodeSelectionDefinition, node: Identifier): CypherNode => {
  const entries: { [key: string]: MapEntry } = {};
  for (const k in def.node.properties) {
    entries[k] = [identifier(k), [node, ".", identifier(k)]];
  }
  for (const k in def.references) {
    const reference = def.references[k].reference;
    const targetNode = identifier();
    const targetRel = identifier();
    entries[k] = [
      identifier(k),
      [
        "[",
        ["(", node, ")"],
        reference.direction === "in" && "<",
        ["-[", targetRel, ":", identifier(reference.relationshipType), "]-"],
        reference.direction === "out" && ">",
        ["(", targetNode, ":", identifier(reference.label), ")"],
        "|",
        referenceSelectionCypher(def.references[k], targetRel, targetNode),
        "]",
        reference.multiplicity !== "many" && "[0]",
      ],
    ];
  }
  entries.$id = [identifier("$id"), ["id(", node, ")"]];
  return { type: "map", map: getValues(entries) };
};

const referenceSelectionCypher = (
  def: ReferenceSelectionDefinition,
  relationship: Identifier,
  node: Identifier
): CypherNode => {
  const entries: { [key: string]: MapEntry } = {};
  for (const k in def.relationship.properties) {
    entries[k] = [identifier(k), [relationship, ".", identifier(k)]];
  }
  for (const k in def.node.properties) {
    entries[k] = [identifier(k), [node, ".", identifier(k)]];
  }
  const condCypher =
    def.condition &&
    conditionCypher(
      "all",
      def.condition,
      { properties: def.node.properties, variable: node },
      { properties: def.relationship.properties, variable: relationship }
    );
  for (const k in def.references) {
    const reference = def.references[k].reference;
    const targetNode = identifier();
    const targetRel = identifier();
    entries[k] = [
      identifier(k),
      [
        "[",
        ["(", node, ")"],
        reference.direction === "in" && "<",
        ["-[", targetRel, ":", identifier(reference.relationshipType), "]-"],
        reference.direction === "out" && ">",
        ["(", targetNode, ":", identifier(reference.label), ")"],
        condCypher && [WHERE, condCypher],
        "|",
        referenceSelectionCypher(def.references[k], targetRel, targetNode),
        "]",
        reference.multiplicity !== "many" && "[0]",
      ],
    ];
  }
  entries.$id = [identifier("$id"), ["id(", node, ")"]];
  entries.$rid = [identifier("$rid"), ["id(", relationship, ")"]];
  return { type: "map", map: getValues(entries) };
};

export const createNodeSelection = (
  graph: GraphDefinition,
  label: string,
  node: NodeDefinition,
  members: any
): NodeSelection => {
  const def = defineNodeSelection(graph, node, members);
  const conditionType = graph.conditionTypes[label];
  const exp: NodeExpressionProvider<any> = {
    labels: [label],
    cypher(n) {
      return nodeSelectionCypher(def, n);
    },
    type: nodeSelectionResultType(def),
  };
  return {
    definition: def,
    match: async (p, t) => runReadQuery(p, exp, t),
    matchOne: async (p, t) => {
      const result = await runReadQuery(p, exp, t);
      return result[0];
    },
    find: async (c, t) =>
      runReadQuery(nodeMatchProvider(label, node, conditionType.parse(c)), exp, t),
    findOne: async (c, t) => {
      const result = await runReadQuery(
        nodeMatchProvider(label, node, conditionType.parse(c)),
        exp,
        t
      );
      return result[0];
    },
  };
};
