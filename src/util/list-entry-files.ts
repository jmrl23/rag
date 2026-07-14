import fs from 'node:fs';
import path from 'node:path';

export function listEntryfiles(
  directory: string,
): { name: string; filePath: string }[] {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((item) => item.isFile())
    .map((item) => ({
      name: item.name,
      filePath: path.resolve(directory, item.name),
    }));
}
