import { readFileSync } from "fs";
import { Date as NeoDate, Node, Relationship } from "neo4j-driver";
import { loadMoviesExample } from "./test/movies";
import { expectException, useTestDatabase } from "./test/testUtils";
import { readTransaction, runQuery, writeTransaction } from "./transaction";
import { createNodes, createRelationships, updateNodes, updateRelationships } from "./update";

describe("testing graph updating functions", () => {
  const driver = useTestDatabase();

  it("should create nodes correctly", async () => {
    const node0 = {
      id: undefined as undefined | number,
    };
    const node1 = {
      id: undefined as undefined | number,
      labels: ["User"],
    };
    const node2 = {
      id: undefined as undefined | number,
      labels: ["User", "Admin"],
      properties: { username: "username" },
    };
    await writeTransaction(driver, async () => {
      await createNodes([node0, node1, node2]);
    });
    expect(typeof node0.id).toBe("number");
    expect(typeof node1.id).toBe("number");
    expect(typeof node2.id).toBe("number");
    const result = await readTransaction(driver, () => runQuery("MATCH (n) RETURN n"));
    expect(result.records.length).toBe(3);
    const nodes = result.records.map((r) => r.get("n") as Node);
    expect(nodes[0].labels).toEqual([]);
    expect(nodes[0].properties).toEqual({});
    expect(nodes[1].labels).toEqual(["User"]);
    expect(nodes[1].properties).toEqual({});
    expect(nodes[2].labels).toEqual(["User", "Admin"]);
    expect(nodes[2].properties).toEqual({ username: "username" });
  });

  it("should create relationships correctly", async () => {
    const SINCE = NeoDate.fromStandardDate(new Date());
    const node = { id: undefined as undefined | number };
    await writeTransaction(driver, async () => {
      await createNodes([node]);
    });
    const rel0 = {
      id: undefined as undefined | number,
      start: node,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      end: node.id!,
      relationshipType: "RELATES_TO",
    };
    const rel1 = {
      id: undefined as undefined | number,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      start: node.id!,
      end: node,
      relationshipType: "RELATES_TO",
      properties: { since: SINCE },
    };
    await writeTransaction(driver, async () => {
      await createRelationships([rel0, rel1]);
    });
    expect(typeof rel0.id).toBe("number");
    expect(typeof rel1.id).toBe("number");
    const result = await readTransaction(driver, () => runQuery("MATCH ()-[r]->() RETURN r"));
    const rels = result.records.map((r) => r.get("r") as Relationship);
    expect(rels[0].type).toBe("RELATES_TO");
    expect(rels[0].properties).toEqual({});
    expect(rels[1].type).toBe("RELATES_TO");
    expect(Object.keys(rels[1].properties).length).toBe(1);
    const resultSince = rels[1].properties.since as NeoDate;
    expect(resultSince.day.toNumber()).toBe(SINCE.day);
    expect(resultSince.month.toNumber()).toBe(SINCE.month);
    expect(resultSince.year.toNumber()).toBe(SINCE.year);
  });

  it("should throw exception when a necessary node is not yet created for the relationship", async () => {
    const node = { id: undefined as undefined | number };
    await writeTransaction(driver, async () => {
      await createNodes([node]);
    });
    await expectException(async () => {
      await writeTransaction(driver, async () => {
        await createRelationships([
          {
            start: node,
            end: {},
            relationshipType: "RELATES_TO",
          },
        ]);
      });
    });
  });

  it("should throw exception when a given relationship member node id is wrong", async () => {
    await expectException(async () => {
      await writeTransaction(driver, async () => {
        await createRelationships([
          {
            start: 0,
            end: 1,
            relationshipType: "RELATES_TO",
          },
        ]);
      });
    });
  });

  it("should create the same movie graph as the example cypher does", async () => {
    await writeTransaction(driver, async () => {
      await runQuery(readFileSync("src/test/movies.cypher").toString());
    });
    const originalNodes = await readTransaction(driver, async () => {
      const result = await runQuery("MATCH (n) return n");
      return result.records.map((r) => r.get("n") as Node);
    });
    const originalRelationships = await readTransaction(driver, async () => {
      const result = await runQuery("MATCH ()-[r]->() return r");
      return result.records.map((r) => r.get("r") as Relationship);
    });
    await writeTransaction(driver, async () => {
      await runQuery("MATCH (n) DETACH DELETE n");
    });
    await writeTransaction(driver, async () => {
      await loadMoviesExample();
    });
    const createdNodes = await readTransaction(driver, async () => {
      const result = await runQuery("MATCH (n) return n");
      return result.records.map((r) => r.get("n") as Node);
    });
    const createdRelationships = await readTransaction(driver, async () => {
      const result = await runQuery("MATCH ()-[r]->() return r");
      return result.records.map((r) => r.get("r") as Relationship);
    });
    expect(createdNodes.length).toBe(originalNodes.length);
    expect(createdRelationships.length).toBe(originalRelationships.length);
  });

  it("should update node properties correctly", async () => {
    await writeTransaction(driver, async () => {
      await createNodes([{}]);
    });
    let node = await readTransaction(driver, async () => {
      const result = await runQuery("MATCH (n) RETURN n");
      return result.records[0].get("n") as Node;
    });
    expect(node.properties).toEqual({});
    // adds a property if not present
    await writeTransaction(driver, async () => {
      await updateNodes([
        {
          node: node.identity.toNumber(),
          properties: { firstName: "John", lastName: "Doe" },
        },
      ]);
    });
    node = await readTransaction(driver, async () => {
      const result = await runQuery("MATCH (n) RETURN n");
      return result.records[0].get("n") as Node;
    });
    expect(node.properties).toEqual({ firstName: "John", lastName: "Doe" });
    // updates a property but does not touch others
    await writeTransaction(driver, async () => {
      await updateNodes([
        {
          node: node.identity.toNumber(),
          properties: { lastName: "Wick" },
        },
      ]);
    });
    node = await readTransaction(driver, async () => {
      const result = await runQuery("MATCH (n) RETURN n");
      return result.records[0].get("n") as Node;
    });
    expect(node.properties).toEqual({ firstName: "John", lastName: "Wick" });
    // removes a property
    await writeTransaction(driver, async () => {
      await updateNodes([
        {
          node: node.identity.toNumber(),
          properties: { lastName: null },
        },
      ]);
    });
    node = await readTransaction(driver, async () => {
      const result = await runQuery("MATCH (n) RETURN n");
      return result.records[0].get("n") as Node;
    });
    expect(node.properties).toEqual({ firstName: "John" });
  });

  it("should throw exception when a given updated node id is wrong", async () => {
    await expectException(async () => {
      await writeTransaction(driver, async () => {
        await updateNodes([
          {
            node: 0,
            properties: {},
          },
        ]);
      });
    });
  });

  it("should update relationship properties correctly", async () => {
    await writeTransaction(driver, async () => {
      await runQuery("CREATE ()-[:RELATES_TO]->()");
    });
    let rel = await readTransaction(driver, async () => {
      const result = await runQuery("MATCH ()-[r]->() RETURN r");
      return result.records[0].get("r") as Relationship;
    });
    expect(rel.properties).toEqual({});
    // adds a property if not present
    await writeTransaction(driver, async () => {
      await updateRelationships([
        {
          relationship: rel.identity.toNumber(),
          properties: { firstName: "John", lastName: "Doe" },
        },
      ]);
    });
    rel = await readTransaction(driver, async () => {
      const result = await runQuery("MATCH ()-[r]->() RETURN r");
      return result.records[0].get("r") as Relationship;
    });
    expect(rel.properties).toEqual({ firstName: "John", lastName: "Doe" });
    // updates a property but does not touch others
    await writeTransaction(driver, async () => {
      await updateRelationships([
        {
          relationship: rel.identity.toNumber(),
          properties: { lastName: "Wick" },
        },
      ]);
    });
    rel = await readTransaction(driver, async () => {
      const result = await runQuery("MATCH ()-[r]->() RETURN r");
      return result.records[0].get("r") as Relationship;
    });
    expect(rel.properties).toEqual({ firstName: "John", lastName: "Wick" });
    // removes a property
    await writeTransaction(driver, async () => {
      await updateRelationships([
        {
          relationship: rel.identity.toNumber(),
          properties: { lastName: null },
        },
      ]);
    });
    rel = await readTransaction(driver, async () => {
      const result = await runQuery("MATCH ()-[r]->() RETURN r");
      return result.records[0].get("r") as Relationship;
    });
    expect(rel.properties).toEqual({ firstName: "John" });
  });

  it("should throw exception when a given updated relationship id is wrong", async () => {
    await expectException(async () => {
      await writeTransaction(driver, async () => {
        await updateRelationships([
          {
            relationship: 0,
            properties: {},
          },
        ]);
      });
    });
  });
});
