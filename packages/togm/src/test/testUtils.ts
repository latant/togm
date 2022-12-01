import neo4j from "neo4j-driver";
import { StartedNeo4jContainer } from "testcontainers";
import { ZodType } from "zod";
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
  let exception: any;
  try {
    await run();
    // eslint-disable-next-line no-empty
  } catch (e) {
    exception = e;
  }
  if (!exception) {
    fail("no exception thrown");
  }
};

export const expectValid = (x: any, type: ZodType) => {
  expect(type.safeParse(x)).toEqual({ success: true, data: expect.anything() });
};
