import { z } from "zod";
import { Property, zProperty } from "./property";
import { Reference, zReference } from "./reference";
import { nodeSelectionTypes } from "./selection";
import { PickValuesExtend, zZodObject, zZodType } from "./util";

const Name = z.string().refine((arg) => !arg.startsWith("$"), { message: "Starting with '$'" });

export type Properties = z.infer<typeof zProperties>;
export const zProperties = z.record(Name, zProperty);

export type References = z.infer<typeof zReferences>;
export const zReferences = z.record(Name, zReference);

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

export type GraphDefinition = z.infer<typeof zGraphDefinition>;
export const zGraphDefinition = z.object({
  nodes: zNodes,
  relationships: zRelationships,
  selectionTypes: z.record(z.string(), zZodType),
});

type NodeMembers = z.infer<typeof zNodeMembers>;
const zNodeMembers = z.record(Name, zProperty.or(zReference));

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
const zGraphMembers = z.record(Name, zEntityDefinition);

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
  z.object(Object.fromEntries(Object.entries(props).map(([k, v]) => [k, v.zodType])) as any);

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

export const defineGraph = <M extends GraphMembers>(members: M) => {
  const parsedMembers = zGraphMembers.parse(members) as M;
  const nodes = graphDefNodes(parsedMembers);
  const relationships = graphDefRels(parsedMembers);
  const selectionTypes = nodeSelectionTypes({ nodes, relationships });
  // TODO: schema integrity validation
  return { nodes, relationships, selectionTypes } satisfies GraphDefinition;
};
