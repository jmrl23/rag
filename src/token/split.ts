import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { TiktokenBPE } from 'js-tiktoken';
import o200k_base from 'js-tiktoken/ranks/o200k_base';
import { createTokenizer } from './tokenizer';

export async function split(
  text: string,
  rank: TiktokenBPE = o200k_base,
  chunkSize: number = 350,
  chunkOverlap: number = 50,
): Promise<string[]> {
  const tokenizer = createTokenizer(rank);
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    lengthFunction: (textInput: string) => {
      const { length } = tokenizer(textInput);
      return length;
    },
    separators: ['\n\n', '\n', ' ', ''],
  });

  return await splitter.splitText(text);
}
