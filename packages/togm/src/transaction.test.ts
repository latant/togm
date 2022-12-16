import { Session } from "neo4j-driver";
import { expectException, useTestDatabase } from "./test/testUtils";
import { neo } from "./togm";

describe("transaction tests", () => {
  const driver = useTestDatabase();

  it("should run queries in a session", async () => {
    await neo.runSession(driver, async (s) => {
      expect(s).toBeInstanceOf(Session);
      const result = await s.run({ text: "CREATE (n:User) RETURN n" });
      expect(result.records.length).toBe(1);
    });
  });

  it("should get current transaction correctly", async () => {
    await expectException(neo.getTx);
    await neo.readTx(driver, async (t1) => {
      expect(neo.getTx()).toBe(t1);
      await neo.writeTx(driver, async (t2) => {
        expect(neo.getTx()).toBe(t2);
      });
      expect(neo.getTx()).toBe(t1);
    });
    await expectException(neo.getTx);
  });

  it("should run query in transaction", async () => {
    await neo.writeTx(driver, async () => {
      const result = await neo.runQuery("CREATE (n:User) RETURN n");
      expect(result.records.length).toBe(1);
    });
  });

  it("should not run query outside transactions", async () => {
    await expectException(async () => {
      await neo.runQuery("CREATE (n:User) RETURN n");
    });
  });
});
