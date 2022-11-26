import { Neo4jContainer } from "testcontainers";
import { testGlobal } from "./testUtils";

export default async () => {
  const testContainer = await new Neo4jContainer("neo4j:5.2.0")
    .withUser("neo4j")
    .withPassword("test")
    .withExposedPorts(7687, 7474)
    .start();
  testGlobal.neo4j = {
    testContainer,
    boltUri: testContainer.getBoltUri(),
    username: testContainer.getUsername(),
    password: testContainer.getPassword(),
  };
};
