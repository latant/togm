import { createNamespace } from "cls-hooked";
import neo4jDriver, { AuthToken, Config, Driver, Session, Transaction } from "neo4j-driver";
import { error } from "./util";

type Neo4jClientConfig = { url: string; auth?: AuthToken; config?: Config; clsNamespace?: string };

type TransactionBlock<R> = (transaction: Transaction) => Promise<R>;

export class Neo4jClient {
  private static clsNamespace = createNamespace("neo4jClient");

  private constructor(public readonly driver: Driver) {}

  public static create(opts: Neo4jClientConfig) {
    return new Neo4jClient(neo4jDriver.driver(opts.url, opts.auth, opts.config));
  }

  public async runSession<R>(block: (session: Session) => Promise<R>) {
    const session = this.driver.session();
    try {
      return await block(session);
    } finally {
      await session.close();
    }
  }

  private wrapTransactionblock<R>(block: TransactionBlock<R>) {
    const ns = Neo4jClient.clsNamespace;
    if (ns) {
      return async (transaction: Transaction) =>
        ns.runAndReturn(async () => {
          ns.set("transaction", transaction);
          return await block(transaction);
        });
    } else {
      return block;
    }
  }

  public static getTx() {
    return (Neo4jClient.clsNamespace.get("transaction") ??
      error("Not in a transaction")) as Transaction;
  }

  public async readTx<R>(block: TransactionBlock<R>) {
    return this.runSession((s) => s.readTransaction(this.wrapTransactionblock(block)));
  }

  public async writeTx<R>(block: TransactionBlock<R>) {
    return this.runSession((s) => s.writeTransaction(this.wrapTransactionblock(block)));
  }
}
