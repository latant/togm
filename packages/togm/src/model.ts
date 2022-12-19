import {
  defineGraph,
  Entities,
  GraphDefinition,
  GraphMembers,
  NodeDefinition,
  Properties,
  RelationshipDefinition,
  ValidMembers,
} from "./definition";
import { PropRecord } from "./property";
import { createNodeQueries, NodeQueries } from "./query";
import { CreateNode, CreateRelationship, Id, UpdateNode, UpdateRelationship } from "./update";

type NodeModel<E extends Entities = Entities, N extends NodeDefinition = NodeDefinition> = N & {
  // select: SelectNodeFunction<E, N>;
  create: CreateNodeFunction<E, N>;
  update: UpdateNodeFunction<N["properties"]>;
} & NodeQueries<E, N>;

type RelationshipModel<R extends RelationshipDefinition = RelationshipDefinition> = R & {
  create: CreateRelationshipFunction<R>;
  update: UpdateRelationshipFunction<R["properties"]>;
};

type GraphModel<G extends GraphDefinition = GraphDefinition> = {
  [L in keyof G["nodes"]]: NodeModel<G, G["nodes"][L]>;
} & { [T in keyof G["relationships"]]: RelationshipModel<G["relationships"][T]> };

type CreateNodeFunction<
  E extends Entities = Entities,
  N extends NodeDefinition = NodeDefinition
> = (
  props: PropRecord<N["properties"]>,
  opts?: { additionalLabels: (keyof E["nodes"])[] }
) => CreateNode;

type CreateRelationshipFunction<R extends RelationshipDefinition = RelationshipDefinition> = (
  start: Id,
  end: Id,
  props: PropRecord<R["properties"]>
) => CreateRelationship;

type UpdateNodeFunction<P extends Properties = Properties> = (
  id: Id,
  props: Partial<PropRecord<P>>
) => UpdateNode;

type UpdateRelationshipFunction<P extends Properties = Properties> = (
  id: Id,
  props: Partial<PropRecord<P>>
) => UpdateRelationship;

export const createGraph = <M extends GraphMembers & ValidMembers<M>>(members: M) => {
  return createGraphModel(defineGraph(members));
};

const createNodeModel = (graph: GraphDefinition, label: string): NodeModel => {
  const node = graph.nodes[label];
  return {
    ...node,
    ...createNodeQueries(graph, label),
    create(props: unknown, opts?: { additionalLabels?: string[] }) {
      const labels = new Set<string>(opts?.additionalLabels ?? []);
      labels.add(label);
      return {
        type: "createNode",
        labels: [...labels],
        properties: node.propertiesZodType.parse(props),
      };
    },
    update(id: Id, props: unknown) {
      return {
        type: "updateNode",
        node: id,
        properties: node.propertiesZodType.partial().parse(props),
      };
    },
  };
};

const createRelationshipModel = (graph: GraphDefinition, type: string): RelationshipModel => {
  const relationship = graph.relationships[type];
  return {
    ...relationship,
    create(start: Id, end: Id, props: unknown) {
      return {
        type: "createRelationship",
        relationshipType: type,
        start: start,
        end: end,
        properties: relationship.propertiesZodType.strict().parse(props),
      };
    },
    update(id: Id, props: unknown) {
      return {
        type: "updateRelationship",
        relationship: id,
        properties: relationship.propertiesZodType.strict().partial().parse(props),
      };
    },
  };
};

export const createGraphModel = <G extends GraphDefinition>(graph: G) => {
  return {
    ...Object.fromEntries(
      Object.keys(graph.nodes).map((label) => [label, createNodeModel(graph, label)])
    ),
    ...Object.fromEntries(
      Object.keys(graph.relationships).map((type) => [type, createRelationshipModel(graph, type)])
    ),
  } as GraphModel<G>;
};
