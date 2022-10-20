import { Transaction } from "neo4j-driver";
import { AS, CREATE, generateCypher, identifier, MATCH, RETURN, UNWIND, WHERE } from "./cypher";

export type Command =
  | CreateNode
  | CreateRelationship
  | UpdateNode
  | UpdateRelationship
  | DeleteRelationship
  | DeleteNode;

export type Id = { id?: number } | number;

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

const getTransaction = () => {
  // TODO
  return {} as Transaction;
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
  if (id.id) {
  }
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
    const result = await transaction.run({
      text: generateCypher(
        [UNWIND, "$creations", AS, "props"],
        [CREATE, "(n", (crs[0].labels || []).map((l) => [":", identifier(l)]), ")"],
        [RETURN, "id(n)", AS, "id"]
      ),
      parameters: { creations: crs.map((c) => c.properties || {}) },
    });
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
    const result = transaction.run({
      text: generateCypher(
        [UNWIND, "$creations", AS, "creation"],
        [MATCH, "(a)", WHERE, "id(a) = creation.a"],
        [MATCH, "(b)", WHERE, "id(b) = creation.b"],
        [CREATE, "(a)-[r:", identifier(crs[0].relationshipType), "]->(b)"],
        [RETURN, "id(r)", AS, "id"]
      ),
      parameters: { creations: crs.map((c) => ({ a: c.start })) },
    });
  }
};

export const updateNodes = async (updates: Omit<UpdateNode, "type">[], transaction: Transaction = getTransaction()) => {
  if (!updates.length) return;
};

export const updateRelationships = async (
  updates: Omit<UpdateRelationship, "type">[],
  transaction: Transaction = getTransaction()
) => {
  if (!updates.length) return;
};

export const deleteRelationships = async (
  deletions: Omit<DeleteRelationship, "type">[],
  transaction: Transaction = getTransaction()
) => {
  if (!deletions.length) return;
};

export const deleteNodes = async (
  deletions: Omit<DeleteNode, "type">[],
  transaction: Transaction = getTransaction()
) => {
  if (!deletions.length) return;
};
