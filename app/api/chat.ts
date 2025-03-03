// pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'langchain/llms/openai';
import { createRetrievalChain } from 'langchain/chains';
import { CallbackManager } from 'langchain_core/callbacks';
import { vectorStore } from '../../lib/store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { question } = req.body;
    if (!question) {
      res.status(400).json({ error: 'No question provided' });
      return;
    }
    if (!vectorStore) {
      res.status(400).json({ error: 'PDF not uploaded or processed yet' });
      return;
    }
    try {
      // Initialize the OpenAI model (ensure OPENAI_API_KEY is set in your environment)
      const model = new OpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0.2,
      });

      // Set up a callback manager for tracing chain events
      const callbackManager = CallbackManager.fromHandlers({
        handleChainStart: (...args) => console.log('Chain started:', args),
        handleChainEnd: (...args) => console.log('Chain ended:', args),
        handleLLMStart: (...args) => console.log('LLM started:', args),
        handleLLMEnd: (...args) => console.log('LLM ended:', args),
      });

      // Create the Retrieval chain with tracing enabled
      const chain = createRetrievalChain({
        retriever: vectorStore.asRetriever(),
        llm: model,
        callbackManager,
      });

      const result = await chain.call({ input: question });
      res.status(200).json({ answer: result.output });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error processing chat query' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}