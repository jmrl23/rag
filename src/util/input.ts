import { createInterface } from 'node:readline';

export async function input() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise<string>((resolve) => {
    rl.question('>> ', (input) => {
      rl.close();
      resolve(input);
    });
  });
}
