import { Transaction } from "neo4j-driver";
import { AS, CREATE, identifier, MATCH, parameter, RETURN, SET, UNWIND, WHERE } from "./cypher";
import { Id } from "./define";
import { getTransaction, runQuery } from "./transaction";
import { error } from "./util";

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
  properties?: { [key: string]: any };
  id?: string;
};

export type CreateRelationship = {
  type: "createRelationship";
  relationshipType: string;
  start: Id;
  end: Id;
  properties?: { [key: string]: any };
  id?: string;
};

export type UpdateNode = {
  type: "updateNode";
  node: Id;
  properties: { [key: string]: any };
};

export type UpdateRelationship = {
  type: "updateRelationship";
  relationship: Id;
  properties: { [key: string]: any };
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

export const bulkUpdate = async (commands: Command[], transaction: Transaction = getTransaction()) => {
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

export const createNodes = async (
  creations: Omit<CreateNode, "type">[],
  transaction: Transaction = getTransaction()
) => {
  if (!creations.length) return;
  const nodesByLabels: { [key: string]: Omit<CreateNode, "type">[] } = {};
  for (const c of creations) {
    const lbl = c.labels ? c.labels.map((l) => `:\`${l}\``).join("") : "";
    if (!nodesByLabels[lbl]) nodesByLabels[lbl] = [];
    nodesByLabels[lbl].push(c.properties || {});
  }
  for (const crs of Object.values(nodesByLabels)) {
    const creationsParam = parameter(
      "creations",
      crs.map((c) => c.properties || {})
    );
    const result = await runQuery(
      [
        [UNWIND, creationsParam, AS, "c"],
        [CREATE, "(n", (crs[0].labels || []).map((l) => [":", identifier(l)]), ")"],
        [SET, "n += c"],
        [RETURN, "id(n)", AS, "id"],
      ],
      transaction
    );
    for (const i in result.records) {
      crs[i].id = result.records[i].get("id");
    }
  }
};

export const createRelationships = async (
  creations: Omit<CreateRelationship, "type">[],
  transaction: Transaction = getTransaction()
) => {
  if (!creations.length) return;
  const relsByType: { [key: string]: Omit<CreateRelationship, "type">[] } = {};
  for (const c of creations) {
    const type = c.relationshipType;
    if (!relsByType[type]) relsByType[type] = [];
    relsByType[type].push(c);
  }
  for (const crs of Object.values(relsByType)) {
    const creationsParam = parameter(
      "creations",
      crs.map((c) => ({
        a: getId(c.start),
        b: getId(c.end),
        props: c.properties || {},
      }))
    );
    const result = await runQuery(
      [
        [UNWIND, creationsParam, AS, "c"],
        [MATCH, "(a)", WHERE, "id(a) = c.a"],
        [MATCH, "(b)", WHERE, "id(b) = c.b"],
        [CREATE, "(a)-[r:", identifier(crs[0].relationshipType), "]->(b)"],
        [SET, "r += c.props"],
        [RETURN, "id(r)", AS, "id"],
      ],
      transaction
    );
    if (result.records.length !== crs.length) {
      error("Not every relationships could be created");
    }
    for (const i in result.records) {
      crs[i].id = result.records[i].get("id");
    }
  }
};

export const updateNodes = async (updates: Omit<UpdateNode, "type">[], transaction: Transaction = getTransaction()) => {
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

export const updateRelationships = async (
  updates: Omit<UpdateRelationship, "type">[],
  transaction: Transaction = getTransaction()
) => {
  if (!updates.length) return;
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

export const deleteRelationships = async (
  deletions: Omit<DeleteRelationship, "type">[],
  transaction: Transaction = getTransaction()
) => {
  if (!deletions.length) return;
  await transaction.run({
    text: "MATCH ()-[r]->() WHERE id(r) IN $ids DELETE R",
    parameters: { ids: deletions.map((d) => getId(d.relationship)) },
  });
};

export const deleteNodes = async (
  deletions: Omit<DeleteNode, "type">[],
  transaction: Transaction = getTransaction()
) => {
  if (!deletions.length) return;
  await transaction.run({
    text: "MATCH (n) WHERE id(n) IN $ids DETACH DELETE n",
    parameters: { ids: deletions.map((d) => getId(d.node)) },
  });
};
