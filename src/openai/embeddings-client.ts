import { OpenAI } from 'openai';

export const embeddingsClient = new OpenAI({
  baseURL: process.env.EMBEDDINGS_BASEURL ?? '',
  apiKey: process.env.EMBEDDINGS_API_KEY ?? '',
});
