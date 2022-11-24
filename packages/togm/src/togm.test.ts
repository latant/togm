import {} from "./togm";
import neo4j from "neo4j-driver";

describe("togm tests", () => {
  it("should run", async () => {
    const neo4jContainer = (global as any).neo4jContainer;
    const driver = neo4j.driver(
      neo4jContainer.getBoltUri(),
      neo4j.auth.basic(neo4jContainer.getUsername(), neo4jContainer.getPassword())
    );
    const s = driver.session();
    const result = await s.run("match (n) return n");
  });
});
