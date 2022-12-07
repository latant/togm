import { z } from "zod";
import { zNodeCondition } from "./condition";
import { Property, zProperty } from "./property";
import { Reference, zReference } from "./reference";
import { nodeSelectionTypes } from "./selection";
import { error, PickValuesExtend, zZodObject, zZodType } from "./util";

const zName = z.string().refine((arg) => !arg.startsWith("$"), { message: "Starting with '$'" });

export type Properties = z.infer<typeof zProperties>;
export const zProperties = z.record(zName, zProperty);

export type References = z.infer<typeof zReferences>;
export const zReferences = z.record(zName, zReference);

export type NodeDefinition = z.infer<typeof zNodeDefinition>;
export const zNodeDefinition = z.object({
  type: z.literal("node"),
  properties: zProperties,
  propertiesZodType: zZodObject,
  references: zReferences,
});

export type RelationshipDefinition = z.infer<typeof zRelationshipDefinition>;
export const zRelationshipDefinition = z.object({
  type: z.literal("relationship"),
  properties: zProperties,
  propertiesZodType: zZodObject,
});

export type EntityDefinition = z.infer<typeof zEntityDefinition>;
export const zEntityDefinition = zNodeDefinition.or(zRelationshipDefinition);

export type Nodes = z.infer<typeof zNodes>;
export const zNodes = z.record(z.string(), zNodeDefinition);

export type Relationships = z.infer<typeof zRelationships>;
export const zRelationships = z.record(z.string(), zRelationshipDefinition);

export type Entities = z.infer<typeof zEntities>;
export const zEntities = z.strictObject({
  nodes: zNodes,
  relationships: zRelationships,
});

export type GraphDefinition = z.infer<typeof zGraphDefinition>;
export const zGraphDefinition = z.object({
  nodes: zNodes,
  relationships: zRelationships,
  selectionTypes: z.record(zName, zZodType),
  conditionTypes: z.record(zName, zZodType),
});

type NodeMembers = z.infer<typeof zNodeMembers>;
const zNodeMembers = z.record(zName, zProperty.or(zReference));

type NodeDefProps<M extends NodeMembers> = PickValuesExtend<M, Property>;
const zNodeDefProps = <M extends NodeMembers>(members: M) =>
  Object.fromEntries(
    Object.entries(members).filter(([k, v]) => v.type === "property")
  ) as NodeDefProps<M>;

type NodeDefRefs<M extends NodeMembers> = PickValuesExtend<M, Reference>;
const zNodeDefRefs = <M extends NodeMembers>(members: M) =>
  Object.fromEntries(
    Object.entries(members).filter(([k, v]) => v.type === "reference")
  ) as NodeDefRefs<M>;

export type GraphMembers = z.infer<typeof zGraphMembers>;
const zGraphMembers = z.record(zName, zEntityDefinition);

type GraphDefNodes<M extends GraphMembers> = PickValuesExtend<M, NodeDefinition>;
const graphDefNodes = <M extends GraphMembers>(members: M) =>
  Object.fromEntries(
    Object.entries(members).filter(([k, v]) => v.type === "node")
  ) as GraphDefNodes<M>;

type GraphDefRels<M extends GraphMembers> = PickValuesExtend<M, RelationshipDefinition>;
const graphDefRels = <M extends GraphMembers>(members: M) =>
  Object.fromEntries(
    Object.entries(members).filter(([k, v]) => v.type === "relationship")
  ) as GraphDefRels<M>;

const propertiesZodType = (props: Properties) =>
  z.object(Object.fromEntries(Object.entries(props).map(([k, v]) => [k, v.zodType])));

export const defineNode = <M extends NodeMembers>(members: M) => {
  const parsedMembers = zNodeMembers.parse(members) as M;
  const properties = zNodeDefProps(parsedMembers);
  return {
    type: "node",
    properties,
    propertiesZodType: propertiesZodType(properties),
    references: zNodeDefRefs(parsedMembers),
  } satisfies NodeDefinition;
};

export const defineRelationship = <M extends Properties>(members: M) => {
  const parsedMembers = zProperties.parse(members) as M;
  const properties = zNodeDefProps(parsedMembers);
  return {
    type: "relationship",
    properties,
    propertiesZodType: propertiesZodType(properties),
  } satisfies RelationshipDefinition;
};

export type ValidMembers<M extends GraphMembers> = {
  [key in keyof M]:
    | { type: "relationship" }
    | {
        type: "node";
        references: {
          [key: string]: {
            label: keyof GraphDefNodes<M>;
            relationshipType: keyof GraphDefRels<M>;
          };
        };
      };
};

export const defineGraph = <M extends GraphMembers>(members: M) => {
  const parsedMembers = zGraphMembers.parse(members) as M;
  const nodes = graphDefNodes(parsedMembers);
  const relationships = graphDefRels(parsedMembers);
  const selectionTypes = nodeSelectionTypes({ nodes, relationships });
  const conditionTypes = {} as { [key: string]: z.ZodType };
  for (const l in nodes) {
    conditionTypes[l] = zNodeCondition(nodes[l].properties);
  }
  for (const l in nodes) {
    const node = nodes[l];
    for (const r in node.references) {
      const reference = node.references[r];
      if (!(nodes as Nodes)[reference.label]) {
        error(`Node '${reference.label}' not found for reference ${l}.${r}`);
      }
      if (!(relationships as Relationships)[reference.relationshipType]) {
        error(`Relationship '${reference.relationshipType}' not found for reference ${l}.${r}`);
      }
    }
  }
  return {
    nodes,
    relationships,
    selectionTypes,
    conditionTypes,
  } satisfies GraphDefinition;
};
