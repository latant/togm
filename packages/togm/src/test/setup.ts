import { Neo4jContainer } from "testcontainers";

export default async () => {
  (global as any).neo4jContainer = await new Neo4jContainer("neo4j:5.2.0")
    .withUser("neo4j")
    .withPassword("pass")
    .withExposedPorts(7687, 7474)
    .start();
};
