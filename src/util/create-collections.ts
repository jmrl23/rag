import { createCollection } from '../qdrant/create-collection';
import { listCollectionDirectories } from './list-collection-directories';

export async function createCollections() {
  const collectionDirectories = listCollectionDirectories();
  const collections = collectionDirectories.map(
    (directory) => directory.collection,
  );

  await Promise.allSettled(
    collections.map(async (collection) => createCollection(collection)),
  );
}
