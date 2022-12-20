export type Identifier = {
  type: "identifier";
  identifier?: string;
};

export type CypherNode =
  | { type: "map"; map: MapEntry[] }
  | { type: "keyword"; keyword: string }
  | { type: "parameter"; parameter: Identifier; value: unknown }
  | Identifier
  | CypherNode[]
  | string
  | undefined
  | false
  | null;

export type MapEntry = [CypherNode, CypherNode];

export const keyword = (keyword: string): CypherNode => ({
  type: "keyword",
  keyword,
});
export const identifier = (identifier?: string): Identifier => ({
  type: "identifier",
  identifier,
});
export const cypherParameter = (parameter: string | undefined, value?: unknown): CypherNode => ({
  type: "parameter",
  parameter: identifier(parameter),
  value,
});

export const CONTAINS = keyword("CONTAINS");
export const STARTS = keyword("STARTS");
export const CREATE = keyword("CREATE");
export const RETURN = keyword("RETURN");
export const DELETE = keyword("DELETE");
export const UNWIND = keyword("UNWIND");
export const MATCH = keyword("MATCH");
export const WHERE = keyword("WHERE");
export const LIMIT = keyword("LIMIT");
export const WITH = keyword("WITH");
export const NULL = keyword("NULL");
export const ENDS = keyword("ENDS");
export const SET = keyword("SET");
export const AND = keyword("AND");
export const NOT = keyword("NOT");
export const AS = keyword("AS");
export const IN = keyword("IN");
export const IS = keyword("IS");
export const OR = keyword("OR");

export type Query = {
  text: string;
  parameters: Record<string, unknown>;
};

export const joinCypher = (...root: CypherNode[]): Query => {
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
  const handleIdentifier = (node: Identifier) => {
    if (!node.identifier) {
      node.identifier = "v" + genIdCount++;
    }
    return node.identifier;
  };
  const parameters: { [key: string]: unknown } = {};
  const visit = (node: CypherNode) => {
    if (!node) return;
    if (typeof node === "string") {
      append(node);
    } else if (Array.isArray(node)) {
      node.forEach(visit);
    } else if (node.type === "keyword") {
      if (!afterKeyword) strings.push(" ");
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
      append(`\`${handleIdentifier(node)}\``);
    } else if (node.type === "parameter") {
      const name = handleIdentifier(node.parameter);
      parameters[name] = node.value;
      append(`$\`${name}\``);
    }
  };
  visit(root);
  return { text: strings.join(""), parameters };
};
