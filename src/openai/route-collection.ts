import { llmClient } from './llm-client';

const NO_MATCH = 'NONE';

export async function routeCollection(
  question: string,
  collections: string[],
): Promise<string | null> {
  if (collections.length === 0) return null;

  const systemPrompt = [
    "You are a routing assistant. Your only job is to pick which knowledge-base collection is most relevant to the user's question.",
    '',
    `Available collections: ${collections.join(', ')}`,
    '',
    'Rules:',
    '1. Respond with the exact name of exactly one collection from the list above, and nothing else.',
    `2. If none of the collections are relevant to the question, respond with exactly: ${NO_MATCH}`,
    '3. Do not explain your choice. Do not add punctuation or extra words.',
  ].join('\n');

  let raw: string;
  try {
    const response = await llmClient.chat.completions.create({
      model: process.env.LLM_MODEL ?? '',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
    });

    raw = response.choices[0].message.content?.trim() ?? '';
  } catch {
    return null;
  }

  const matched = collections.find(
    (collection) => collection.toLowerCase() === raw.toLowerCase(),
  );

  return matched ?? null;
}
