// The tokenizer primitives now live in @particle-academy/fancy-file-commons
// (the shared pure core). Re-exported here so fancy-code's tokenizers and
// engine keep their existing `../tokenizer` import paths unchanged.
export type { Token, TokenType, Tokenizer } from "@particle-academy/fancy-file-commons";
export { tok } from "@particle-academy/fancy-file-commons";
