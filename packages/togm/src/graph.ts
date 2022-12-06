import {
  defineGraph,
  Entities,
  GraphDefinition,
  GraphMembers,
  NodeDefinition,
  Properties,
  RelationshipDefinition,
} from "./definition";
import { PropRecord } from "./property";
import {
  createNodeSelection,
  NodeSelection,
  NodeSelectionDefinition,
  NodeSelectionDefinitionMembers,
} from "./selection";
import { CreateNode, CreateRelationship, Id, UpdateNode, UpdateRelationship } from "./update";
import { DeepStrict } from "./util";

type SelectNodeFunction<
  E extends Entities = Entities,
  N extends NodeDefinition = NodeDefinition
> = <M extends NodeSelectionDefinitionMembers<E, N>>(
  members: M & DeepStrict<NodeSelectionDefinitionMembers<E, N>, M>
) => NodeSelection<NodeSelectionDefinition<E, N, M>>;

type SelectNodeFunctions<E extends Entities = Entities> = {
  [L in keyof E["nodes"]]: SelectNodeFunction<E, E["nodes"][L]>;
};

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

type CreateEntityFunctions<E extends Entities = Entities> = {
  [L in keyof E["nodes"]]: CreateNodeFunction<E, E["nodes"][L]>;
} & {
  [T in keyof E["relationships"]]: CreateRelationshipFunction<E["relationships"][T]>;
};

type UpdateNodeFunction<P extends Properties = Properties> = (
  id: Id,
  props: Partial<PropRecord<P>>
) => UpdateNode;

type UpdateRelationshipFunction<P extends Properties = Properties> = (
  id: Id,
  props: Partial<PropRecord<P>>
) => UpdateRelationship;

type UpdateEntityFunctions<E extends Entities = Entities> = {
  [L in keyof E["nodes"]]: UpdateNodeFunction<E["nodes"][L]["properties"]>;
} & {
  [T in keyof E["relationships"]]: UpdateRelationshipFunction<E["relationships"][T]["properties"]>;
};

export type Graph<G extends GraphDefinition = GraphDefinition> = {
  definition: G;
  select: SelectNodeFunctions<G>;
  create: CreateEntityFunctions<G>;
  update: UpdateEntityFunctions<G>;
};

export const createGraph = <M extends GraphMembers>(members: M) =>
  createGraphOfDefinition(defineGraph(members));

const createNodeFunctions = (graph: GraphDefinition) => {
  const result = {} as Record<string, CreateNodeFunction>;
  for (const l in graph.nodes) {
    const node = graph.nodes[l];
    result[l] = (props: unknown, opts?: { additionalLabels?: string[] }): CreateNode => {
      const labels = new Set<string>(opts?.additionalLabels ?? []);
      labels.add(l);
      return {
        type: "createNode",
        labels: [...labels],
        properties: node.propertiesZodType.parse(props),
      };
    };
  }
  return result;
};

const createRelationshipFunctions = (graph: GraphDefinition) => {
  const result = {} as Record<string, CreateRelationshipFunction>;
  for (const t in graph.relationships) {
    const relationship = graph.relationships[t];
    result[t] = (start: Id, end: Id, props: unknown): CreateRelationship => {
      return {
        type: "createRelationship",
        relationshipType: t,
        start: start,
        end: end,
        properties: relationship.propertiesZodType.strict().parse(props),
      };
    };
  }
  return result;
};

const updateNodeFunctions = (graph: GraphDefinition) => {
  const result = {} as Record<string, UpdateNodeFunction>;
  for (const l in graph.nodes) {
    const node = graph.nodes[l];
    result[l] = (id: Id, props: unknown): UpdateNode => {
      return {
        type: "updateNode",
        node: id,
        properties: node.propertiesZodType.partial().parse(props),
      };
    };
  }
  return result;
};

const updateRelationshipFunctions = (graph: GraphDefinition) => {
  const result = {} as Record<string, UpdateRelationshipFunction>;
  for (const t in graph.relationships) {
    const relationship = graph.relationships[t];
    result[t] = (id: Id, props: unknown): UpdateRelationship => {
      return {
        type: "updateRelationship",
        relationship: id,
        properties: relationship.propertiesZodType.strict().partial().parse(props),
      };
    };
  }
  return result;
};

const selectNodeFunctions = (graph: GraphDefinition) => {
  const result = {} as Record<string, SelectNodeFunction>;
  for (const l in graph.nodes) {
    const node = graph.nodes[l];
    result[l] = (members: unknown) =>
      createNodeSelection(graph, l, node, graph.selectionTypes[l].parse(members));
  }
  return result;
};

export const createGraphOfDefinition = <G extends GraphDefinition>(graph: G) => {
  return {
    definition: graph,
    select: selectNodeFunctions(graph),
    create: { ...createNodeFunctions(graph), ...createRelationshipFunctions(graph) },
    update: { ...updateNodeFunctions(graph), ...updateRelationshipFunctions(graph) },
  } as Graph<G>;
};
