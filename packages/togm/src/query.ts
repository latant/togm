import { z } from "zod";
import { conditionCypher, NodeCondition } from "./condition";
import { AS, CypherNode, Identifier, identifier, joinCypher, MATCH, RETURN, WHERE } from "./cypher";
import { Entities, NodeDefinition } from "./definition";
import {
  defineNodeSelection,
  nodeSelectionCypher,
  NodeSelectionDefinition,
  NodeSelectionDefinitionMembers,
  NodeSelectionResult,
  nodeSelectionResultType,
} from "./selection";
import { getTransaction } from "./transaction";
import { DeepStrict } from "./util";

export type NodeQueries<
  E extends Entities = Entities,
  N extends NodeDefinition = NodeDefinition
> = {
  select: <M extends NodeSelectionDefinitionMembers<E, N>>(
    members: M & DeepStrict<NodeSelectionDefinitionMembers<E, N>, M>
  ) => Select<NodeSelectionDefinition<E, N, M>>;
} & Finder<NodeSelectionDefinition<E, N, {}>>;

type Select<S extends NodeSelectionDefinition = NodeSelectionDefinition> = {
  cypher: (n?: Identifier) => CypherNode;
  resultType: z.ZodType<NodeSelectionResult<S>>;
  definition: S;
} & Finder<S>;

type Finder<S extends NodeSelectionDefinition = NodeSelectionDefinition> = {
  findOne: FindFunction<S, NodeSelectionResult<S>>;
  findAll: FindFunction<S, NodeSelectionResult<S>[]>;
};

type FindFunction<S extends NodeSelectionDefinition, R> = <
  C extends NodeCondition<S["node"]["properties"]>
>(
  condition?: C & DeepStrict<NodeCondition<S["node"]["properties"]>, C>
) => Promise<R>;

const findFunction = (
  label: string,
  definition: NodeSelectionDefinition,
  resultType: z.ZodType
) => {
  const rootVar = identifier();
  const selectionCypher = nodeSelectionCypher(definition, rootVar);
  return async (condition: any) => {
    const condCypher = conditionCypher("all", condition, {
      properties: definition.node.properties,
      variable: rootVar,
    });
    const limitlessCypher = joinCypher([
      [MATCH, "(", rootVar, ":", identifier(label), ")", condCypher && [WHERE, condCypher]],
      [RETURN, selectionCypher, AS, "result"],
    ]);
    const result = await getTransaction().run(limitlessCypher.text, limitlessCypher.parameters);
    return resultType.parse(result.records.map((r) => r.get("result")));
  };
};

export const createNodeQueries = (entities: Entities, label: string): NodeQueries => {
  const rootVar = identifier();
  const node = entities.nodes[label];
  const select = (members: any): Select => {
    const definition = defineNodeSelection(entities, node, members);
    const resultType = nodeSelectionResultType(definition).array() as z.ZodType;
    return {
      cypher(n = rootVar) {
        return nodeSelectionCypher(definition, n);
      },
      definition,
      resultType,
      findAll: findFunction(label, definition, resultType),
      findOne: findFunction(
        label,
        definition,
        resultType.transform((r) => r[0])
      ),
    };
  };
  return {
    select: select as NodeQueries["select"],
    findAll: select({}).findAll,
    findOne: select({}).findOne,
  };
};
