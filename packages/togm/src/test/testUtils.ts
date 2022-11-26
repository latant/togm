import neo4j from "neo4j-driver";
import { StartedNeo4jContainer } from "testcontainers";
import { runSession } from "../transaction";

export const testGlobal: {
  neo4j: {
    testContainer?: StartedNeo4jContainer;
    boltUri: string;
    username: string;
    password: string;
  };
} = global as any;

export const useTestDatabase = () => {
  const driver = neo4j.driver(
    testGlobal.neo4j.boltUri,
    neo4j.auth.basic(testGlobal.neo4j.username, testGlobal.neo4j.password)
  );
  beforeEach(async () => {
    await runSession(driver, async (s) => {
      await s.run({ text: "MATCH (n) DETACH DELETE n" });
    });
  });
  return driver;
};

export const expectException = async (run: () => any) => {
  try {
    await run();
    fail("no exception thrown");
    // eslint-disable-next-line no-empty
  } catch (_) {}
};
