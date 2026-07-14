import { llmClient } from './openai/llm-client';
import { queryToEmbeddings } from './openai/query-to-embeddings';
import { routeCollection } from './openai/route-collection';
import { createCollections } from './util/create-collections';
import { input } from './util/input';
import { listCollectionDirectories } from './util/list-collection-directories';

async function main() {
  await createCollections();

  const question = await input();
  const collectionNames = listCollectionDirectories().map(
    (directory) => directory.collection,
  );
  const collection = await routeCollection(question, collectionNames);

  if (collection === null) {
    console.log("I don't have enough information to answer that.");
    return;
  }

  const context = await queryToEmbeddings(collection, question, 2);
  const SYSTEM_PROMPT = [
    'You are a knowledgeable assistant. You will receive reference material alongside each question. The user cannot see this material and does not know it exists — answer as if the knowledge is simply your own.',
    '',
    'Rules:',
    '1. Ground every answer strictly in the reference material. Never use outside knowledge or guess.',
    '2. If the material lacks the information needed, say: "I don\'t have enough information to answer that." — nothing more.',
    '3. Answer directly and confidently. NEVER mention sources, documents, context, or references. NEVER use phrases like "Based on the provided context", "According to the documents", or "[Source 1]".',
    '4. Lead with the answer itself, then add supporting detail if useful. Be concise.',
    '5. If the material contains conflicting information, present both versions neutrally.',
    '6. If the question is ambiguous, briefly state your interpretation, then answer.',
    '',
    'Example:',
    'Q: What is bitcoin?',
    'A: Bitcoin is a peer-to-peer electronic cash system that lets online payments go directly from one party to another without a financial institution. It solves the double-spending problem using a decentralized network instead of a trusted third party.',
  ].join('\n');

  const answer = await llmClient.chat.completions.create({
    model: process.env.LLM_MODEL ?? '',
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: `<context>\n${context}\n</context>\n\n<question>\n${question}\n</question>`,
      },
    ],
  });
  console.log(answer.choices[0].message.content);
}

void main();
