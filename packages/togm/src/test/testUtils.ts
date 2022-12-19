import { StartedNeo4jContainer } from "testcontainers";
import { ZodType } from "zod";
import { Neo4jClient } from "../client";

export const testGlobal: {
  neo4j: {
    testContainer?: StartedNeo4jContainer;
    boltUri: string;
    username: string;
    password: string;
  };
} = global as any;

export const useTestDatabase = () => {
  const client = Neo4jClient.create({
    url: testGlobal.neo4j.boltUri,
    auth: {
      scheme: "basic",
      principal: testGlobal.neo4j.username,
      credentials: testGlobal.neo4j.password,
    },
    clsNamespace: "testDatabase",
  });
  beforeEach(async () => {
    await client.runSession(async (s) => {
      await s.run({ text: "MATCH (n) DETACH DELETE n" });
    });
  });
  return client;
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
  return exception;
};

export const expectValid = (x: any, type: ZodType) => {
  expect(type.safeParse(x)).toEqual({ success: true, data: expect.anything() });
};
