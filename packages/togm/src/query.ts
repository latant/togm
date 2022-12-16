import { z } from "zod";
import {
  conditionCypher,
  conditionParameters,
  ConditionParameters,
  NodeCondition,
  ParameterEntry,
  QueryParameter,
} from "./condition";
import { AS, CypherNode, Identifier, identifier, joinCypher, MATCH, RETURN, WHERE } from "./cypher";
import { Entities, NodeDefinition } from "./definition";
import {
  defineNodeSelection,
  nodeSelectionCypher,
  NodeSelectionDefinition,
  NodeSelectionDefinitionMembers,
  nodeSelectionParameters,
  NodeSelectionParameters,
  NodeSelectionResult,
  nodeSelectionResultType,
} from "./selection";
import { getTransaction } from "./transaction";
import { DeepStrict, error } from "./util";

export type NodeQueries<
  E extends Entities = Entities,
  N extends NodeDefinition = NodeDefinition
> = {
  select: <M extends NodeSelectionDefinitionMembers<E, N>>(
    members: M & DeepStrict<NodeSelectionDefinitionMembers<E, N>, M, QueryParameter>
  ) => Select<NodeSelectionDefinition<E, N, M>>;
  where: WhereFunction<{ node: N; references: {} }>;
} & Finder<NodeSelectionResult<NodeSelectionDefinition<E, N, {}>>, {}>;

type WhereFunction<S extends NodeSelectionDefinition> = <
  C extends NodeCondition<S["node"]["properties"]>
>(
  condition: C & DeepStrict<NodeCondition<S["node"]["properties"]>, C, QueryParameter>
) => Where<
  NodeSelectionResult<S>,
  NodeSelectionParameters<S> & ConditionParameters<S["node"]["properties"], C>
>;

type Select<S extends NodeSelectionDefinition = NodeSelectionDefinition> = {
  cypher: (n?: Identifier) => CypherNode;
  resultType: z.ZodType<NodeSelectionResult<S>>;
  definition: S;
  parametersType: z.ZodType<NodeSelectionParameters<S>>;
  where: WhereFunction<S>;
} & Finder<NodeSelectionResult<S>, NodeSelectionParameters<S>>;

type Where<T = any, P = any> = {
  cypherQuery: Query;
  parametersType: z.ZodType<P>;
} & Finder<T, P>;

type Finder<T, P> = {
  findOne: object extends P ? () => Promise<T> : (parameters: P) => Promise<T>;
  findAll: object extends P ? () => Promise<T[]> : (parameters: P) => Promise<T[]>;
};

export const createNodeQueries = (entities: Entities, label: string): NodeQueries => {
  const rootVar = identifier();
  const node = entities.nodes[label];
  const select = (members: any): Select => {
    const definition = defineNodeSelection(entities, node, members);
    const resultType = nodeSelectionResultType(definition) as z.ZodType;
    const selectionParams = nodeSelectionParameters(definition);
    const selectionCypher = nodeSelectionCypher(definition, rootVar);
    const where = (condition: any): Where => {
      const conditionParams = conditionParameters(condition, node.properties);
      const parametersType = createParametersType([...selectionParams, ...conditionParams]);
      const condCypher = conditionCypher("all", condition, {
        properties: node.properties,
        variable: rootVar,
      });
      const limitlessCypher = joinCypher([
        [MATCH, "(", rootVar, ":", identifier(label), ")", condCypher && [WHERE, condCypher]],
        [RETURN, selectionCypher, AS, "result"],
      ]);
      const resultArrayType = resultType.array();
      const resultOptionalType = resultType.optional();
      return {
        cypherQuery: limitlessCypher,
        parametersType,
        findAll: async (parameters?: unknown) => {
          const result = await getTransaction().run(limitlessCypher.text, {
            ...limitlessCypher.parameters,
            p: parametersType.parse(parameters ?? {}),
          });
          return resultArrayType.parse(result.records.map((r) => r.get("result")));
        },
        findOne: async (parameters?: unknown) => {
          const result = await getTransaction().run(`${limitlessCypher.text} LIMIT 1`, {
            ...limitlessCypher.parameters,
            p: parametersType.parse(parameters ?? {}),
          });
          return resultOptionalType.parse(result.records[0]?.get("result"));
        },
      };
    };
    return {
      cypher(n = rootVar) {
        return nodeSelectionCypher(definition, n);
      },
      definition,
      resultType,
      findAll: where({}).findAll,
      findOne: where({}).findOne,
      parametersType: createParametersType(selectionParams),
      where,
    };
  };
  const where = select({}).where;
  const emptyWhere = where({});
  return {
    select: select as NodeQueries["select"],
    where,
    findAll: emptyWhere.findAll,
    findOne: emptyWhere.findOne,
  };
};

const createParametersType = (entries: ParameterEntry[]) => {
  const shape: z.ZodRawShape = {};
  for (const e of entries) {
    if (shape[e.name]) {
      error(`Duplicated parameter: '${e.name}'`);
    }
    shape[e.name] = e.type;
  }
  return z.strictObject(shape);
};
