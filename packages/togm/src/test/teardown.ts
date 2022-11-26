import { testGlobal } from "./testUtils";

export default async () => {
  await testGlobal.neo4j.testContainer?.stop?.();
};
