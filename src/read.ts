import { Transaction } from "neo4j-driver";
import { AS, CypherNode, identifier, Identifier, RETURN } from "./cypher";
import { getTransaction, runQuery } from "./transaction";

export type MatchProvider = {
  cypher: (n: Identifier) => CypherNode;
};

export type ExpressionProvider<R> = {
  cypher: (n: Identifier) => CypherNode;
  example: () => R;
};

export type NodeExpressionProvider<R> = ExpressionProvider<R> & {
  labels: string[];
};

export const runReadQuery = async <R>(
  match: MatchProvider,
  value: ExpressionProvider<R>,
  transaction: Transaction = getTransaction()
) => {
  const x = identifier();
  const result = await runQuery([match.cypher(x), RETURN, value.cypher(x), AS, "result"], transaction);
  return result.records.map((r) => r.get("result")) as R[];
};
