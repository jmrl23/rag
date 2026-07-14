import { v4 as uuidv4 } from 'uuid';
import { compile } from '../markitdown/compile';
import { createEmbeddings } from '../openai/create-embeddings';
import { CollectionDirectory } from '../util/list-collection-directories';
import { qdrantClient } from './client';

export async function upsertData(collectionDirectory: CollectionDirectory) {
  for (const file of collectionDirectory.files) {
    const embeddings = await createEmbeddings(compile(file.filePath));
    const points = [];

    for (let i = 0; i < embeddings.data.length; i++) {
      const point = {
        id: uuidv4(),
        vector: embeddings.data[i].embedding,
        payload: {
          index: embeddings.data[i].index,
          title: file.name,
          text: embeddings.chunks[i],
          filePath: file.filePath,
          collection: collectionDirectory.collection,
          timestamp: Date.now(),
        },
      };
      points.push(point);
    }

    const upsertStatus = await qdrantClient.upsert(
      collectionDirectory.collection,
      {
        points,
        wait: true,
      },
    );
    return upsertStatus;
  }
}
