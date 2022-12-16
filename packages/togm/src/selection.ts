/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import {
  conditionCypher,
  conditionParameters,
  ParameterEntry,
  ReferenceCondition,
  ReferenceConditionParameters,
  zReferenceCondition,
} from "./condition";
import { CypherNode, Identifier, identifier, MapEntry, WHERE } from "./cypher";
import { Entities, NodeDefinition } from "./definition";
import { coercedPropertyZodTypes } from "./property";
import { Reference, WithMultiplicity, zWithMultiplicity } from "./reference";
import { getValues, IntersectVals } from "./util";

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
            entities.relationships[reference.relationshipType].properties
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
  condition: "$where" extends keyof M ? M["$where"] : undefined;
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

export const nodeSelectionResultType = (def: NodeSelectionDefinition) => {
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

export const nodeSelectionCypher = (def: NodeSelectionDefinition, node: Identifier): CypherNode => {
  const entries: Record<string, MapEntry> = {};
  for (const k in def.node.properties) {
    entries[k] = [identifier(k), [node, ".", identifier(k)]];
  }
  for (const k in def.references) {
    entries[k] = [identifier(k), selectedReferenceCypher(def.references[k], node)];
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
  for (const k in def.references) {
    entries[k] = [identifier(k), selectedReferenceCypher(def.references[k], node)];
  }
  entries.$id = [identifier("$id"), ["id(", node, ")"]];
  entries.$rid = [identifier("$rid"), ["id(", relationship, ")"]];
  return { type: "map", map: getValues(entries) };
};

const selectedReferenceCypher = (
  def: ReferenceSelectionDefinition,
  sourceNode: Identifier
): CypherNode => {
  const targetNode = identifier();
  const targetRel = identifier();
  const condCypher =
    def.condition &&
    conditionCypher(
      "all",
      def.condition,
      { properties: def.node.properties, variable: targetNode },
      { properties: def.relationship.properties, variable: targetRel }
    );
  const r = def.reference;
  return [
    "[",
    ["(", sourceNode, ")"],
    r.direction === "in" && "<",
    ["-[", targetRel, ":", identifier(r.relationshipType), "]-"],
    r.direction === "out" && ">",
    ["(", targetNode, ":", identifier(r.label), ")"],
    condCypher && [WHERE, condCypher],
    "|",
    referenceSelectionCypher(def, targetRel, targetNode),
    "]",
    r.multiplicity !== "many" && "[0]",
  ];
};

export type NodeSelectionParameters<S extends NodeSelectionDefinition> = IntersectVals<{
  [K in keyof S["references"]]: ReferenceSelectionParameters<S["references"][K]>;
}>;

type ReferenceSelectionParameters<S extends ReferenceSelectionDefinition> =
  NodeSelectionParameters<S> &
    ReferenceConditionParameters<
      S["node"]["properties"],
      S["relationship"]["properties"],
      S["condition"]
    >;

export const nodeSelectionParameters = (definition: NodeSelectionDefinition): ParameterEntry[] => {
  return Object.values(definition.references).flatMap(referenceSelectionParametersShape);
};

const referenceSelectionParametersShape = (
  definition: ReferenceSelectionDefinition
): ParameterEntry[] => {
  return [
    ...nodeSelectionParameters(definition),
    ...conditionParameters(definition.condition ?? {}, {
      ...definition.relationship.properties,
      ...definition.node.properties,
    }),
  ];
};
