import { qdrantClient } from '../qdrant/client';
import { embeddingsClient } from './embeddings-client';

export async function queryToEmbeddings(
  collection: string,
  input: string,
  limit: number = 3,
) {
  const queryEmbedding = await embeddingsClient.embeddings.create({
    model: process.env.EMBEDDINGS_MODEL ?? '',
    input,
    dimensions: Number(process.env.EMBEDDINGS_DIMENSION ?? ''),
  });
  const queryVector = queryEmbedding.data[0].embedding;
  const searchResults = await qdrantClient.search(collection, {
    vector: queryVector,
    limit,
    score_threshold: 0.5,
  });

  const contextResult = searchResults
    .map((result) => {
      if (typeof result.payload !== 'object' || result.payload === null)
        return '';
      if (typeof result.payload.text !== 'string') return '';
      return result.payload.text;
    })
    .join('\n\n---\n\n');

  return contextResult;
}
