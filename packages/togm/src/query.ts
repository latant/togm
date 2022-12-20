import { z } from "zod";
import { Neo4jClient } from "./client";
import { conditionCypher, NodeCondition } from "./condition";
import { AS, identifier, joinCypher, LIMIT, MATCH, Query, RETURN, WHERE } from "./cypher";
import { GraphDefinition, NodeDefinition } from "./definition";
import {
  defineNodeSelection,
  nodeSelectionCypher,
  NodeSelectionDefinition,
  NodeSelectionDefinitionMembers,
  NodeSelectionResult,
  nodeSelectionResultType,
} from "./selection";
import { DeepStrict } from "./util";

export type NodeQueries<
  G extends GraphDefinition = GraphDefinition,
  N extends NodeDefinition = NodeDefinition
> = {
  select: <M extends NodeSelectionDefinitionMembers<G, N>>(
    members: M & DeepStrict<NodeSelectionDefinitionMembers<G, N>, M>
  ) => Select<NodeSelectionDefinition<G, N, M>>;
} & Finder<NodeSelectionDefinition<G, N, {}>>;

type Select<S extends NodeSelectionDefinition = NodeSelectionDefinition> = {
  cypher: (n?: string) => Query;
  resultType: z.ZodType<NodeSelectionResult<S>>;
  definition: S;
} & Finder<S>;

type Finder<S extends NodeSelectionDefinition = NodeSelectionDefinition> = {
  findOne: FindFunction<S, NodeSelectionResult<S>>;
  findAll: FindFunction<S, NodeSelectionResult<S>[]>;
};

type FindFunction<S extends NodeSelectionDefinition, R> = (
  condition?: NodeCondition<S["node"]["properties"]>
) => Promise<R>;

const findFunction = (
  graph: GraphDefinition,
  label: string,
  definition: NodeSelectionDefinition,
  resultType: z.ZodType,
  single: boolean
) => {
  const rootVar = identifier();
  const selectionCypher = nodeSelectionCypher(definition, rootVar);
  const valuesType = resultType.array();
  const conditionType = graph.conditionTypes[label];
  return async (condition: any) => {
    const parsedCondition = conditionType.parse(condition ?? {});
    const condCypher = conditionCypher("all", parsedCondition, {
      properties: definition.node.properties,
      variable: rootVar,
    });
    const cypher = joinCypher([
      [MATCH, "(", rootVar, ":", identifier(label), ")", condCypher && [WHERE, condCypher]],
      [RETURN, selectionCypher, AS, "result"],
      single && [LIMIT, "1"],
    ]);
    const result = await Neo4jClient.getTx().run(cypher.text, cypher.parameters);
    const values = valuesType.parse(result.records.map((r) => r.get("result")));
    return single ? values[0] : values;
  };
};

export const createNodeQueries = (graph: GraphDefinition, label: string): NodeQueries => {
  const rootVar = identifier();
  const node = graph.nodes[label];
  const selectionType = graph.selectionTypes[label];
  const select = (members: any): Select => {
    const parsedMembers = selectionType.parse(members);
    const definition = defineNodeSelection(graph, node, parsedMembers);
    const resultType = nodeSelectionResultType(definition) as z.ZodType;
    return {
      cypher(n) {
        const v = n ? identifier(n) : rootVar;
        return joinCypher(nodeSelectionCypher(definition, v));
      },
      definition,
      resultType,
      findAll: findFunction(graph, label, definition, resultType, false),
      findOne: findFunction(graph, label, definition, resultType, true),
    };
  };
  return {
    select: select as NodeQueries["select"],
    findAll: select({}).findAll,
    findOne: select({}).findOne,
  };
};
