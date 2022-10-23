import { Transaction } from "neo4j-driver";
import { ZodType } from "zod";
import { AS, CypherNode, identifier, Identifier, RETURN } from "./cypher";
import { getTransaction, runQuery } from "./transaction";
import { z } from "zod";

export type MatchProvider = {
  cypher: (n: Identifier) => CypherNode;
};

export type ExpressionProvider<R extends ZodType> = {
  cypher: (n: Identifier) => CypherNode;
  type: z.infer<R>;
};

export type NodeExpressionProvider<R extends ZodType> = {
  labels: string[];
} & ExpressionProvider<R>;

export const runReadQuery = async <R extends ZodType>(
  match: MatchProvider,
  value: ExpressionProvider<R>,
  transaction: Transaction = getTransaction()
) => {
  const x = identifier();
  const result = await runQuery([match.cypher(x), RETURN, value.cypher(x), AS, "result"], transaction);
  return result.records.map((r) => r.get("result")) as z.infer<R>[];
};
