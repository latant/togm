import { createNamespace } from "cls-hooked";
import { Driver, Result, Session, Transaction } from "neo4j-driver";
import { CypherNode, generateQuery } from "./cypher";
import { error } from "./util";

export const runSession = async <R>(driver: Driver, block: (session: Session) => Promise<R>) => {
  const session = driver.session();
  try {
    return await block(session);
  } finally {
    await session.close();
  }
};

const transactionCLS = createNamespace("neo4j-transactions");

export const getTransaction = () =>
  (transactionCLS.get("transaction") ?? error("Not in a transaction")) as Transaction;

type TransactionBlock<R> = (transaction: Transaction) => Promise<R>;

const wrapTransactionblock =
  <R>(block: TransactionBlock<R>) =>
  async (transaction: Transaction) =>
    transactionCLS.runAndReturn(async () => {
      transactionCLS.set("transaction", transaction);
      return await block(transaction);
    });

export const readTransaction = async <R>(driver: Driver, block: TransactionBlock<R>) =>
  runSession(driver, (s) => s.readTransaction(wrapTransactionblock(block)));

export const writeTransaction = async <R>(driver: Driver, block: TransactionBlock<R>) =>
  runSession(driver, (s) => s.writeTransaction(wrapTransactionblock(block)));

export const runQuery = (
  cypher: CypherNode,
  transaction: Transaction = getTransaction()
): Result => {
  return transaction.run(generateQuery(cypher));
};
