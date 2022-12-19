import { Integer, Transaction } from "neo4j-driver";
import { Neo4jClient } from "./client";
import {
  AS,
  CREATE,
  identifier,
  MATCH,
  cypherParameter,
  RETURN,
  SET,
  UNWIND,
  WHERE,
  joinCypher,
} from "./cypher";
import { error, getValues } from "./util";

export type Id = { id?: number } | number;

export type Command =
  | CreateNode
  | CreateRelationship
  | UpdateNode
  | UpdateRelationship
  | DeleteRelationship
  | DeleteNode;

export type CreateNode = {
  type: "createNode";
  labels?: string[];
  properties?: { [key: string]: unknown };
  id?: number;
};

export type CreateRelationship = {
  type: "createRelationship";
  relationshipType: string;
  start: Id;
  end: Id;
  properties?: { [key: string]: unknown };
  id?: number;
};

export type UpdateNode = {
  type: "updateNode";
  node: Id;
  properties: { [key: string]: unknown };
};

export type UpdateRelationship = {
  type: "updateRelationship";
  relationship: Id;
  properties: { [key: string]: unknown };
};

export type DeleteRelationship = {
  type: "deleteRelationship";
  relationship: Id;
};

export type DeleteNode = {
  type: "deleteNode";
  node: Id;
};

const filterCommands = <T extends Command["type"]>(commands: Command[], type: T) => {
  return commands.filter((c) => c.type === type) as (Command & { type: T })[];
};

export const runCommands = async (
  commands: Command[],
  transaction: Transaction = Neo4jClient.getTx()
) => {
  await createNodes(filterCommands(commands, "createNode"), transaction);
  await createRelationships(filterCommands(commands, "createRelationship"), transaction);
  await updateNodes(filterCommands(commands, "updateNode"), transaction);
  await updateRelationships(filterCommands(commands, "updateRelationship"), transaction);
  await deleteRelationships(filterCommands(commands, "deleteRelationship"), transaction);
  await deleteNodes(filterCommands(commands, "deleteNode"), transaction);
};

const getId = (id: Id): number => {
  if (typeof id === "number") {
    return id;
  }
  return id.id ?? error("unresolved id");
};

const createNodes = async (creations: Omit<CreateNode, "type">[], transaction: Transaction) => {
  if (!creations.length) return;
  const nodesByLabels: { [key: string]: Omit<CreateNode, "type">[] } = {};
  for (const c of creations) {
    const lbl = c.labels ? c.labels.map((l) => `:\`${l}\``).join("") : "";
    if (!nodesByLabels[lbl]) nodesByLabels[lbl] = [];
    nodesByLabels[lbl].push(c);
  }
  for (const crs of getValues(nodesByLabels)) {
    const creationsParam = cypherParameter(
      "creations",
      crs.map((c) => c.properties || {})
    );
    const result = await transaction.run(
      joinCypher(
        [UNWIND, creationsParam, AS, "c"],
        [CREATE, "(n", (crs[0].labels || []).map((l) => [":", identifier(l)]), ")"],
        [SET, "n += c"],
        [RETURN, "id(n)", AS, "id"]
      )
    );
    for (const i in result.records) {
      crs[i].id = (result.records[i].get("id") as Integer).toNumber();
    }
  }
};

const createRelationships = async (
  creations: Omit<CreateRelationship, "type">[],
  transaction: Transaction
) => {
  if (!creations.length) return;
  const relsByType: { [key: string]: Omit<CreateRelationship, "type">[] } = {};
  for (const c of creations) {
    const type = c.relationshipType;
    if (!relsByType[type]) relsByType[type] = [];
    relsByType[type].push(c);
  }
  for (const crs of getValues(relsByType)) {
    const creationsParam = cypherParameter(
      "creations",
      crs.map((c) => ({
        a: getId(c.start),
        b: getId(c.end),
        props: c.properties || {},
      }))
    );
    const result = await transaction.run(
      joinCypher(
        [UNWIND, creationsParam, AS, "c"],
        [MATCH, "(a)", WHERE, "id(a) = c.a"],
        [MATCH, "(b)", WHERE, "id(b) = c.b"],
        [CREATE, "(a)-[r:", identifier(crs[0].relationshipType), "]->(b)"],
        [SET, "r += c.props"],
        [RETURN, "id(r)", AS, "id"]
      )
    );
    if (result.records.length !== crs.length) {
      error("Not every relationships could be created");
    }
    for (const i in result.records) {
      crs[i].id = (result.records[i].get("id") as Integer).toNumber();
    }
  }
};

const updateNodes = async (updates: Omit<UpdateNode, "type">[], transaction: Transaction) => {
  if (!updates.length) return;
  const result = await transaction.run({
    text: "UNWIND $updates AS u MATCH (n) WHERE id(n) = u.id SET n += u.props RETURN u.id AS id",
    parameters: {
      updates: updates.map((u) => ({
        id: getId(u.node),
        props: u.properties,
      })),
    },
  });
  if (result.records.length !== updates.length) {
    error("Not every node could be updated");
  }
};

const updateRelationships = async (
  updates: Omit<UpdateRelationship, "type">[],
  transaction: Transaction
) => {
  if (!updates.length) return;
  const result = await transaction.run({
    text: "UNWIND $updates AS u MATCH ()-[r]->() WHERE id(r) = u.id SET r += u.props RETURN u.id AS id",
    parameters: {
      updates: updates.map((u) => ({
        id: getId(u.relationship),
        props: u.properties,
      })),
    },
  });
  if (result.records.length !== updates.length) {
    error("Not every relationship could be updated");
  }
};

const deleteNodes = async (deletions: Omit<DeleteNode, "type">[], transaction: Transaction) => {
  if (!deletions.length) return;
  await transaction.run({
    text: "MATCH (n) WHERE id(n) IN $ids DETACH DELETE n",
    parameters: { ids: deletions.map((d) => getId(d.node)) },
  });
};

const deleteRelationships = async (
  deletions: Omit<DeleteRelationship, "type">[],
  transaction: Transaction
) => {
  if (!deletions.length) return;
  await transaction.run({
    text: "MATCH ()-[r]->() WHERE id(r) IN $ids DELETE r",
    parameters: { ids: deletions.map((d) => getId(d.relationship)) },
  });
};
