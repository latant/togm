import { Graph, NodeDef, Reference, RelDef } from "./define";
import { error } from "./util";

export type Identifier = {
  type: "identifier";
  identifier?: string;
};

export type CypherNode =
  | { type: "map"; map: MapEntry[] }
  | { type: "keyword"; keyword: string }
  | { type: "parameter"; parameter: string; value: unknown }
  | Identifier
  | CypherNode[]
  | string
  | undefined
  | false
  | null;

type MapEntry = [CypherNode, CypherNode];

export const keyword = (keyword: string): CypherNode => ({ type: "keyword", keyword });
export const identifier = (identifier?: string): Identifier => ({ type: "identifier", identifier });
export const parameter = (parameter: string, value: unknown): CypherNode => ({ type: "parameter", parameter, value });

export const CREATE = keyword("CREATE");
export const RETURN = keyword("RETURN");
export const DELETE = keyword("DELETE");
export const UNWIND = keyword("UNWIND");
export const MATCH = keyword("MATCH");
export const WHERE = keyword("WHERE");
export const SET = keyword("SET");
export const AS = keyword("AS");

export const generateQuery = (...root: CypherNode[]) => {
  const strings: string[] = [];
  let genIdCount = 0;
  let afterKeyword = false;
  const append = (text: string) => {
    if (afterKeyword) strings.push(" ");
    strings.push(text.trim());
    afterKeyword = false;
  };
  const appendMapEntry = ([k, v]: MapEntry) => {
    visit(k);
    append(":");
    visit(v);
  };
  const parameters: { [key: string]: unknown } = {};
  const visit = (node: CypherNode) => {
    if (!node) return;
    if (typeof node === "string") {
      append(node);
    } else if (Array.isArray(node)) {
      node.forEach(visit);
    } else if (node.type === "keyword") {
      if (!afterKeyword) append(" ");
      append(node.keyword);
      afterKeyword = true;
    } else if (node.type === "map") {
      append("{");
      for (let i = 0; i < node.map.length - 1; i++) {
        appendMapEntry(node.map[i]);
        append(",");
      }
      appendMapEntry(node.map[node.map.length - 1]);
      append("}");
    } else if (node.type === "identifier") {
      if (!node.identifier) {
        node.identifier = "v" + genIdCount++;
      }
      append(node.identifier);
    } else if (node.type === "parameter") {
      parameters[node.parameter] = node.value;
      append("$");
      append(node.parameter);
    }
  };
  visit(root);
  return { text: strings.join(), parameters };
};

type QueryNode = { [key: string]: QueryNode };

type EntityVar = {
  kind: string;
  var: Identifier;
};

const requireEntity = (graph: Graph, kind: string): NodeDef | RelDef => {
  return graph.definition[kind] ?? error(`Entity not found: ${kind}`);
};

const requireNode = (graph: Graph, label: string) => {
  const entity = requireEntity(graph, label);
  if (entity.type !== "node") error(`Entity not a node: ${label}`);
  return entity as NodeDef;
};

const requireRelationship = (graph: Graph, type: string) => {
  const entity = requireEntity(graph, type);
  if (entity.type !== "relationship") error(`Entity not a relationship: ${type}`);
  return entity as RelDef;
};

const requireRef = (lbl: string, def: NodeDef, k: string) => {
  const member = def[k] ?? error(`Node member not found: ${lbl}.${k}`);
  if (member.type !== "reference") error(`Member not reference: ${lbl}.${k}`);
  return member as Reference;
};

export const queryText = (query: QueryNode, graph: Graph, node: EntityVar, rel?: EntityVar): CypherNode => {
  const nodeDef = requireNode(graph, node.kind);
  const relDef = rel && requireRelationship(graph, rel.kind);
  const entries: { [key: string]: MapEntry } = {};
  // refs > ids > nodeProps > relProps
  if (relDef) {
    for (const k in relDef.members) {
      entries[k] = [identifier(k), [rel.var, ".", identifier(k)]];
    }
  }
  for (const k in nodeDef.members) {
    const member = nodeDef.members[k];
    if (member.type === "property") {
      entries[k] = [identifier(k), [node.var, ".", identifier(k)]];
    }
  }
  entries["id"] = ["id", ["id(", node.var, ")"]];
  if (rel) entries["relationshipId"] = ["relationshipId", ["id(", rel.var, ")"]];
  for (const k in query) {
    const ref = requireRef(node.kind, nodeDef, k);
    const targetNode = identifier();
    const targetRel = identifier();
    entries[k] = [
      identifier(k),
      [
        "[",
        ["(", node.var, ")"],
        ref.direction === "incoming" && "<",
        ["-[:", targetRel, "]-"],
        ref.direction === "outgoing" && ">",
        ["(", targetNode, ":", ref.label, ")"],
        "|",
        queryText(
          query[k],
          graph,
          { kind: ref.label, var: targetNode },
          { kind: ref.relationshipType, var: targetRel }
        ),
        "]",
        ref.multiplicity !== "many" && "[0]",
      ],
    ];
  }
  return { type: "map", map: Object.values(entries) };
};
