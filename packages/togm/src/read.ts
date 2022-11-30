import { Transaction } from "neo4j-driver";
import { ZodType, z } from "zod";
import { AS, CypherNode, identifier, Identifier, RETURN } from "./cypher";
import { getTransaction, runQuery } from "./transaction";

export type MatchProvider = {
  cypher: (n: Identifier) => CypherNode;
};

export type ExpressionProvider<T extends ZodType> = {
  cypher: (n: Identifier) => CypherNode;
  type: T;
};

export type NodeExpressionProvider<R extends ZodType> = {
  labels: string[];
} & ExpressionProvider<R>;

export const runReadQuery = async <R extends ZodType>(
  match: MatchProvider,
  expression: ExpressionProvider<R>,
  transaction: Transaction = getTransaction()
) => {
  const x = identifier();
  const result = await runQuery(
    [match.cypher(x), RETURN, expression.cypher(x), AS, "result"],
    transaction
  );
  return result.records.map((r) => expression.type.parse(r.get("result"))) as z.infer<R>[];
};
