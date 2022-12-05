import { defineGraph, GraphDefinition, GraphMembers } from "./definition";
import { PropRecord } from "./property";
import {
  createNodeSelection,
  NodeSelection,
  NodeSelectionDefinition,
  NodeSelectionDefinitionMembers,
} from "./selection";
import { CreateNode, CreateRelationship, Id, UpdateNode, UpdateRelationship } from "./update";
import { DeepStrict } from "./util";

export type Graph<G extends GraphDefinition = GraphDefinition> = {
  definition: G;
  select: {
    [L in keyof G["nodes"]]: <M extends NodeSelectionDefinitionMembers<G, G["nodes"][L]>>(
      members: M & DeepStrict<NodeSelectionDefinitionMembers<G, G["nodes"][L]>, M>
    ) => NodeSelection<NodeSelectionDefinition<G, G["nodes"][L], M>>;
  };
  create: {
    [L in keyof G["nodes"]]: (
      props: PropRecord<G["nodes"][L]["properties"]>,
      opts?: { additionalLabels: (keyof G["nodes"])[] }
    ) => CreateNode;
  } & {
    [T in keyof G["relationships"]]: (
      start: Id,
      end: Id,
      props: PropRecord<G["relationships"][T]["properties"]>
    ) => CreateRelationship;
  };
  update: {
    [L in keyof G["nodes"]]: (
      id: Id,
      props: Partial<PropRecord<G["nodes"][L]["properties"]>>
    ) => UpdateNode;
  } & {
    [T in keyof G["relationships"]]: (
      id: Id,
      props: Partial<PropRecord<G["relationships"][T]["properties"]>>
    ) => UpdateRelationship;
  };
};

export const createGraph = <M extends GraphMembers>(members: M) =>
  createGraphOfDefinition(defineGraph(members));

export const createGraphOfDefinition = <G extends GraphDefinition>(def: G) => {
  const result: Graph<G> = {
    definition: def,
    create: {} as Graph<G>["create"],
    update: {} as Graph<G>["update"],
    select: {} as Graph<G>["select"],
  };
  for (const l in def.nodes) {
    const node = def.nodes[l];
    (result.create as any)[l] = (
      props: any,
      opts?: { additionalLabels?: string[] }
    ): CreateNode => {
      const labels = new Set<string>(opts?.additionalLabels ?? []);
      labels.add(l);
      return {
        type: "createNode",
        labels: [...labels],
        properties: node.propertiesZodType.parse(props),
      };
    };
    (result.update as any)[l] = (id: Id, props: any): UpdateNode => {
      return {
        type: "updateNode",
        node: id,
        properties: node.propertiesZodType.partial().parse(props),
      };
    };
    (result.select as any)[l] = (members: any) => createNodeSelection(def, l, node, members);
  }
  for (const t in def.relationships) {
    const relationship = def.relationships[t];
    (result.create as any)[t] = (start: Id, end: Id, props: any): CreateRelationship => {
      return {
        type: "createRelationship",
        relationshipType: t,
        start: start,
        end: end,
        properties: relationship.propertiesZodType.strict().parse(props),
      };
    };
    (result.update as any)[t] = (id: Id, props: any): UpdateRelationship => {
      return {
        type: "updateRelationship",
        relationship: id,
        properties: relationship.propertiesZodType.strict().partial().parse(props),
      };
    };
  }
  return result;
};
