export type TokenType =
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "operator"
  | "tag"
  | "attribute"
  | "attributeValue"
  | "punctuation"
  | "function"
  | "type"
  | "variable"
  | "plain";

export interface Token {
  type: TokenType;
  start: number;
  end: number;
}

export type Tokenizer = (source: string) => Token[];

/** Create a token — avoids esbuild shorthand property minification bugs */
export function tok(type: TokenType, s: number, e: number): Token {
  return { type: type, start: s, end: e };
}
