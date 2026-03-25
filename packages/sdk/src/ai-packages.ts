/**
 * Known AI / LLM SDK package names (npm import specifiers, without version).
 * Extend as ecosystem evolves.
 */
export const AI_SDK_PACKAGES: readonly string[] = [
  'openai',
  '@anthropic-ai/sdk',
  '@google/generative-ai',
  '@google-cloud/aiplatform',
  '@google-cloud/vertexai',
  '@azure/openai',
  '@aws-sdk/client-bedrock-runtime',
  'cohere-ai',
  '@mistralai/mistralai',
  'replicate',
  '@huggingface/inference',
  'langchain',
  '@langchain/core',
  '@langchain/openai',
  'ai',
  '@ai-sdk/openai',
  '@ai-sdk/anthropic',
  '@ai-sdk/google',
  'groq-sdk',
  '@xenova/transformers',
  'ollama',
  'together-ai',
  '@deepgram/sdk',
  'assemblyai',
  'elevenlabs',
  'anthropic',
  'vertexai',
  'openai-edge',
  '@openai/agents',
  'voyageai',
  'pinecone-client',
  '@pinecone-database/pinecone',
  'weaviate-ts-client',
  'chromadb',
  '@qdrant/js-client-rest',
];

/** Patterns in source text that suggest prohibited / high-risk use cases (heuristic). */
export const HIGH_RISK_KEYWORDS = [
  'credit score',
  'credit scoring',
  'loan approval',
  'recruitment',
  'hiring decision',
  'biometric',
  'facial recognition',
  'emotion recognition',
  'social scoring',
  'manipulation',
  'subliminal',
] as const;

export const PROHIBITED_KEYWORDS = [
  'social scoring',
  'subliminal',
  'manipulative techniques',
  'real-time remote biometric',
] as const;
