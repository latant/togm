import { defineNode, defineRelationship } from "./definition";
import { createGraph } from "./graph";
import { propertyFactories } from "./property";
import { referenceFactories } from "./reference";
import {
  getTransaction,
  readTransaction,
  runQuery,
  runSession,
  writeTransaction,
} from "./transaction";
import { runCommands } from "./update";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Transaction, Session, Driver, Result } from "neo4j-driver";
import { identifier, joinCypher, keyword, parameter } from "./cypher";

/** Functions to use for creating a graph schema. */
export const ogm = {
  /** Creates a graph from named entity definitions. */
  graph: createGraph,
  /** Creates a node definition. */
  node: defineNode,
  /** Creates a relationship definition. */
  relationship: defineRelationship,
  ...propertyFactories(),
  ...referenceFactories(),
};

/** Helpers for running Neo4j queries and transactions. */
export const neo = {
  /**
   * Runs a block inside a transaction that only reads data.
   * The transaction and the session are automatically committed and closed after the block runs.
   */
  readTransaction: readTransaction,
  /**
   * Runs a block inside a transaction that can read and write data.
   * The transaction and the session are automatically committed and closed after the block runs.
   */
  writeTransaction: writeTransaction,
  /**
   * Runs commands in a transaction.
   * Commands can be: creation/update/deletion of node/relationship.
   * The commands are batched, minimizing the number of queries executed.
   */
  runCommands: runCommands,
  /**
   * Runs a block inside a driver session.
   * The session is automatically closed after the block runs.
   */
  runSession: runSession,
  /** Returns the current transaction. */
  getTransaction: getTransaction,
  /** Runs a cypher query in a transaction. */
  runQuery: runQuery,
};

/** Helpers for generating cypher query texts. */
export const cyp = {
  /**
   * Generates a cypher query from programmatic tokens.
   */
  joinCypher: joinCypher,
  /**
   * Creates a keyword token to be used as a cypher node.
   * Exactly one space is preserved before and after every keyword token.
   */
  keyword: keyword,
  /**
   * Creates an identifier token to be used as a cypher node.
   * Identifiers created this way are always escaped.
   */
  identifier: identifier,
  /**
   * Creates a parameter token to be used as a cypher node.
   * The name of the parameter can be automatically generated.
   */
  parameter: parameter,
};
