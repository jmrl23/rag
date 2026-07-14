import { listCollectionDirectories } from '../util/list-collection-directories';
import { qdrantClient } from './client';
import { upsertData } from './upsert-data';

export async function createCollection(name: string): Promise<boolean | null> {
  const response = await qdrantClient.getCollections();
  const exists = response.collections.some(
    (collection) => collection.name === name,
  );

  if (exists) return null;

  const result = await qdrantClient.createCollection(name, {
    vectors: {
      size: Number.parseInt(process.env.EMBEDDINGS_DIMENSION || '256', 10),
      distance: 'Cosine',
    },
  });

  const collectionDirectories = listCollectionDirectories();
  for (const collectionDirectory of collectionDirectories) {
    if (collectionDirectory.collection === name) {
      await upsertData(collectionDirectory);
    }
  }

  return result;
}
