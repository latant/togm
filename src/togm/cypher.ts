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

export type MapEntry = [CypherNode, CypherNode];

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
      append(`\`${node.identifier}\``);
    } else if (node.type === "parameter") {
      parameters[node.parameter] = node.value;
      append("$");
      append(node.parameter);
    }
  };
  visit(root);
  return { text: strings.join(), parameters };
};
