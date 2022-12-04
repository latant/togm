import { z } from "zod";
import { Property } from "./property";
import { Reference } from "./reference";
import { NodeSelectionTypes } from "./selection";
import { PickValuesExtend, ZodObject, ZodType } from "./util";

const Name = z.string().refine((arg) => !arg.startsWith("$"), { message: "Starting with '$'" });

export type Properties = z.infer<typeof Properties>;
export const Properties = z.record(Name, Property);

export type References = z.infer<typeof References>;
export const References = z.record(Name, Reference);

export type NodeDefinition = z.infer<typeof NodeDefinition>;
export const NodeDefinition = z.object({
  type: z.literal("node"),
  properties: Properties,
  propertiesType: ZodObject,
  references: References,
});

export type RelationshipDefinition = z.infer<typeof RelationshipDefinition>;
export const RelationshipDefinition = z.object({
  type: z.literal("relationship"),
  properties: Properties,
  propertiesType: ZodObject,
});

export type EntityDefinition = z.infer<typeof EntityDefinition>;
export const EntityDefinition = NodeDefinition.or(RelationshipDefinition);

export type Nodes = z.infer<typeof Nodes>;
export const Nodes = z.record(z.string(), NodeDefinition);

export type Relationships = z.infer<typeof Relationships>;
export const Relationships = z.record(z.string(), RelationshipDefinition);

export type GraphDefinition = z.infer<typeof GraphDefinition>;
export const GraphDefinition = z.object({
  nodes: Nodes,
  relationships: Relationships,
  selectionTypes: z.record(z.string(), ZodType),
});

type NodeMembers = z.infer<typeof NodeMembers>;
const NodeMembers = z.record(Name, Property.or(Reference));

type NodeDefProps<M extends NodeMembers> = PickValuesExtend<M, Property>;
const NodeDefProps = <M extends NodeMembers>(members: M) =>
  Object.fromEntries(
    Object.entries(members).filter(([k, v]) => v.type === "property")
  ) as NodeDefProps<M>;

type NodeDefRefs<M extends NodeMembers> = PickValuesExtend<M, Reference>;
const NodeDefRefs = <M extends NodeMembers>(members: M) =>
  Object.fromEntries(
    Object.entries(members).filter(([k, v]) => v.type === "reference")
  ) as NodeDefRefs<M>;

export type GraphMembers = z.infer<typeof GraphMembers>;
const GraphMembers = z.record(Name, EntityDefinition);

type GraphDefNodes<M extends GraphMembers> = PickValuesExtend<M, NodeDefinition>;
const GraphDefNodes = <M extends GraphMembers>(members: M) =>
  Object.fromEntries(
    Object.entries(members).filter(([k, v]) => v.type === "node")
  ) as GraphDefNodes<M>;

type GraphDefRels<M extends GraphMembers> = PickValuesExtend<M, RelationshipDefinition>;
const GraphDefRels = <M extends GraphMembers>(members: M) =>
  Object.fromEntries(
    Object.entries(members).filter(([k, v]) => v.type === "relationship")
  ) as GraphDefRels<M>;

const propertiesType = (props: Properties) =>
  z.object(Object.fromEntries(Object.entries(props).map(([k, v]) => [k, v.zodType])) as any);

export const defineNode = <M extends NodeMembers>(members: M) => {
  const parsedMembers = NodeMembers.parse(members) as M;
  const properties = NodeDefProps(parsedMembers);
  return {
    type: "node",
    properties,
    propertiesType: propertiesType(properties),
    references: NodeDefRefs(parsedMembers),
  } satisfies NodeDefinition;
};

export const defineRelationship = <M extends Properties>(members: M) => {
  const parsedMembers = Properties.parse(members) as M;
  const properties = NodeDefProps(parsedMembers);
  return {
    type: "relationship",
    properties,
    propertiesType: propertiesType(properties),
  } satisfies RelationshipDefinition;
};

export const defineGraph = <M extends GraphMembers>(members: M) => {
  const parsedMembers = GraphMembers.parse(members) as M;
  const nodes = GraphDefNodes(parsedMembers);
  const relationships = GraphDefRels(parsedMembers);
  const selectionTypes = NodeSelectionTypes({ nodes, relationships });
  return { nodes, relationships, selectionTypes } satisfies GraphDefinition;
};
