import { OpenAI } from 'openai';

export const llmClient = new OpenAI({
  baseURL: process.env.LLM_BASEURL ?? '',
  apiKey: process.env.LLM_API_KEY ?? '',
});
