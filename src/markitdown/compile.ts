import { execSync } from 'node:child_process';

export function compile(filePath: string) {
  const output = execSync(`markitdown "${filePath}"`);
  return output.toString();
}
