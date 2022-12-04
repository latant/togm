import { Session } from "neo4j-driver";
import { expectException, useTestDatabase } from "./test/testUtils";
import {
  getTransaction,
  readTransaction,
  runQuery,
  runSession,
  writeTransaction,
} from "./transaction";

describe("transaction tests", () => {
  const driver = useTestDatabase();

  it("should run queries in a session", async () => {
    await runSession(driver, async (s) => {
      expect(s).toBeInstanceOf(Session);
      const result = await s.run({ text: "CREATE (n:User) RETURN n" });
      expect(result.records.length).toBe(1);
    });
  });

  it("should get current transaction correctly", async () => {
    await expectException(getTransaction);
    await readTransaction(driver, async (t1) => {
      expect(getTransaction()).toBe(t1);
      await writeTransaction(driver, async (t2) => {
        expect(getTransaction()).toBe(t2);
      });
      expect(getTransaction()).toBe(t1);
    });
    await expectException(getTransaction);
  });

  it("should run query in transaction", async () => {
    await writeTransaction(driver, async () => {
      const result = await runQuery("CREATE (n:User) RETURN n");
      expect(result.records.length).toBe(1);
    });
  });

  it("should not run query outside transactions", async () => {
    await expectException(async () => {
      await runQuery("CREATE (n:User) RETURN n");
    });
  });
});
