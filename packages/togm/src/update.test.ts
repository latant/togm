import { readFileSync } from "fs";
import { Date as NeoDate, Node, Relationship } from "neo4j-driver";
import { loadMoviesExample } from "./test/movies";
import { loadNorthwindExample } from "./test/northwind";
import { expectException, useTestDatabase } from "./test/testUtils";
import { readTransaction, runQuery, writeTransaction } from "./transaction";
import {
  bulkUpdate,
  CreateNode,
  createNodes,
  CreateRelationship,
  createRelationships,
  deleteNodes,
  deleteRelationships,
  updateNodes,
  updateRelationships,
} from "./update";

describe("testing graph updating functions", () => {
  const driver = useTestDatabase();

  it("should create nodes correctly", async () => {
    const node0: CreateNode = {
      type: "createNode",
      id: undefined,
    };
    const node1: CreateNode = {
      type: "createNode",
      id: undefined,
      labels: ["User"],
    };
    const node2: CreateNode = {
      type: "createNode",
      id: undefined,
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
    const node: CreateNode = {
      type: "createNode",
      id: undefined,
    };
    await writeTransaction(driver, async () => {
      await createNodes([node]);
    });
    const rel0: CreateRelationship = {
      type: "createRelationship",
      id: undefined,
      start: node,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      end: node.id!,
      relationshipType: "RELATES_TO",
    };
    const rel1: CreateRelationship = {
      type: "createRelationship",
      id: undefined,
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
    const node: CreateNode = {
      type: "createNode",
      id: undefined,
    };
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

  it("should create the same northwind graph as the example cypher does", async () => {
    await writeTransaction(driver, async () => {
      await runQuery(readFileSync("src/test/northwind.cypher").toString());
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
      await loadNorthwindExample();
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

  it("should delete node correctly", async () => {
    await writeTransaction(driver, async () => {
      await createNodes([{}]);
    });
    const node = await readTransaction(driver, async () => {
      const result = await runQuery("MATCH (n) RETURN n");
      return result.records[0].get("n") as Node;
    });
    await writeTransaction(driver, async () => {
      await deleteNodes([{ node: node.identity.toNumber() }]);
    });
    const result = await readTransaction(driver, () => runQuery("MATCH (n) RETURN n"));
    expect(result.records.length).toBe(0);
  });

  it("should delete relationship correctly", async () => {
    await writeTransaction(driver, async () => {
      await runQuery("CREATE ()-[:RELATES_TO]->()");
    });
    const rel = await readTransaction(driver, async () => {
      const result = await runQuery("MATCH ()-[r]->() RETURN r");
      return result.records[0].get("r") as Relationship;
    });
    await writeTransaction(driver, async () => {
      await deleteRelationships([{ relationship: rel.identity.toNumber() }]);
    });
    const result = await readTransaction(driver, () => runQuery("MATCH ()-[r]->() RETURN r"));
    expect(result.records.length).toBe(0);
  });

  it("should not do anything when bulkCreate is called with an empty array", async () => {
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
      await bulkUpdate([]);
    });
    const leftNodes = await readTransaction(driver, async () => {
      const result = await runQuery("MATCH (n) return n");
      return result.records.map((r) => r.get("n") as Node);
    });
    const leftRelationships = await readTransaction(driver, async () => {
      const result = await runQuery("MATCH ()-[r]->() return r");
      return result.records.map((r) => r.get("r") as Relationship);
    });
    expect(leftNodes).toEqual(originalNodes);
    expect(leftRelationships).toEqual(originalRelationships);
  });

  it("should take command order into account on bulk updates", async () => {
    const node0: CreateNode = {
      id: undefined,
      type: "createNode",
      labels: ["NewNode"],
    };
    const node1: CreateNode = {
      id: undefined,
      type: "createNode",
      labels: ["NewUpdatedNode"],
    };
    const node2: CreateNode = {
      id: undefined,
      type: "createNode",
      labels: ["NewDeletedNode"],
    };
    const rel0: CreateRelationship = {
      id: undefined,
      type: "createRelationship",
      start: node0,
      end: node1,
      relationshipType: "NEW_REL",
    };
    const rel1: CreateRelationship = {
      id: undefined,
      type: "createRelationship",
      start: node1,
      end: node0,
      relationshipType: "NEW_UPDATED_REL",
    };
    const rel2: CreateRelationship = {
      id: undefined,
      type: "createRelationship",
      start: node0,
      end: node1,
      relationshipType: "NEW_DELETED_REL",
    };
    const rel3: CreateRelationship = {
      id: undefined,
      type: "createRelationship",
      start: node1,
      end: node2,
      relationshipType: "NEW_IMPLICITLY_DELETED_REL",
    };
    await writeTransaction(driver, async () => {
      await bulkUpdate([
        node0,
        node1,
        node2,
        rel0,
        rel1,
        rel2,
        {
          type: "updateNode",
          node: node1,
          properties: { description: "updated node" },
        },
        {
          type: "updateRelationship",
          relationship: rel1,
          properties: { description: "updated relationship" },
        },
        { type: "deleteNode", node: node2 },
        { type: "deleteRelationship", relationship: rel2 },
      ]);
    });
    const nodes = await readTransaction(driver, async () => {
      const result = await runQuery("MATCH (n) RETURN n");
      return result.records.map((r) => r.get("n") as Node);
    });
    const rels = await readTransaction(driver, async () => {
      const result = await runQuery("MATCH ()-[r]->() RETURN r");
      return result.records.map((r) => r.get("r") as Relationship);
    });
    expect(nodes.length).toBe(2);
    expect(rels.length).toBe(2);
    const resultNode0 = nodes.find((n) => n.identity.toNumber() === node0.id) ?? fail();
    const resultNode1 = nodes.find((n) => n.identity.toNumber() === node1.id) ?? fail();
    const resultRel0 = rels.find((n) => n.identity.toNumber() === rel0.id) ?? fail();
    const resultRel1 = rels.find((n) => n.identity.toNumber() === rel1.id) ?? fail();
    expect(resultNode0.properties).toEqual({});
    expect(resultNode1.properties).toEqual({ description: "updated node" });
    expect(resultRel0.properties).toEqual({});
    expect(resultRel1.properties).toEqual({ description: "updated relationship" });
    expect(resultRel0.start.toNumber()).toEqual(node0.id);
    expect(resultRel0.end.toNumber()).toEqual(node1.id);
    expect(resultRel1.start.toNumber()).toEqual(node1.id);
    expect(resultRel1.end.toNumber()).toEqual(node0.id);
  });
});
