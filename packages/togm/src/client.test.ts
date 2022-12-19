import { Session } from "neo4j-driver";
import { Neo4jClient } from "./client";
import { expectException, useTestDatabase } from "./test/testUtils";

describe("transaction tests", () => {
  const client = useTestDatabase();

  it("should run queries in a session", async () => {
    await client.runSession(async (s) => {
      expect(s).toBeInstanceOf(Session);
      const result = await s.run({ text: "CREATE (n:User) RETURN n" });
      expect(result.records.length).toBe(1);
    });
  });

  it("should get current transaction correctly", async () => {
    await expectException(Neo4jClient.getTx);
    await client.readTx(async (t1) => {
      expect(Neo4jClient.getTx()).toBe(t1);
      await client.writeTx(async (t2) => {
        expect(Neo4jClient.getTx()).toBe(t2);
      });
      expect(Neo4jClient.getTx()).toBe(t1);
    });
    await expectException(Neo4jClient.getTx);
  });

  it("should run query in transaction", async () => {
    await client.writeTx(async (t) => {
      const result = await t.run("CREATE (n:User) RETURN n");
      expect(result.records.length).toBe(1);
    });
  });
});
