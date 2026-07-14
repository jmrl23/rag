import { Tiktoken, TiktokenBPE } from 'js-tiktoken';
import o200k_base from 'js-tiktoken/ranks/o200k_base';

export function createTokenizer(rank: TiktokenBPE = o200k_base) {
  const tiktoken = new Tiktoken(rank);

  return function tokenize(input: string): {
    tokens: number[];
    length: number;
  } {
    const tokens = tiktoken.encode(input);
    return {
      tokens,
      length: tokens.length,
    };
  };
}
