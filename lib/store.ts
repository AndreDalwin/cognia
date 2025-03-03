// lib/store.ts
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

export let vectorStore: MemoryVectorStore | null = null;

export const setVectorStore = (store: MemoryVectorStore) => {
  vectorStore = store;
};