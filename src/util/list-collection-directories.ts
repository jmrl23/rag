import fs from 'node:fs';
import path from 'node:path';
import { listEntryfiles } from './list-entry-files';

export type CollectionDirectory = {
  collection: string;
  dirPath: string;
  files: Array<{ name: string; filePath: string }>;
};

export function listCollectionDirectories(): Array<CollectionDirectory> {
  const collectionsDir = path.resolve(
    __dirname,
    '../../',
    process.env.COLLECTIONS_DIR ?? '',
  );
  const directories = fs
    .readdirSync(collectionsDir, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => ({
      collection: item.name,
      dirPath: path.resolve(collectionsDir, item.name),
      files: listEntryfiles(path.resolve(collectionsDir, item.name)),
    }));
  return directories;
}
