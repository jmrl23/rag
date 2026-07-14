import { CreateEmbeddingResponse } from 'openai/resources';
import { split } from '../token/split';
import { embeddingsClient } from './embeddings-client';

type CreateEmbeddingResponseWithChunks = CreateEmbeddingResponse & {
  chunks: string[];
};

export async function createEmbeddings(
  text: string,
): Promise<CreateEmbeddingResponseWithChunks> {
  const chunks = await split(text);
  const embeddings = await embeddingsClient.embeddings.create({
    model: process.env.EMBEDDINGS_MODEL ?? '',
    input: chunks,
    dimensions: Number(process.env.EMBEDDINGS_DIMENSION),
  });
  const result = { ...embeddings, chunks };

  return result;
}
