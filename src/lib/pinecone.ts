import { Pinecone } from '@pinecone-database/pinecone';
import { Document } from '@langchain/core/documents';

if (!process.env.PINECONE_API_KEY) {
  throw new Error('Missing PINECONE_API_KEY environment variable');
}

if (!process.env.PINECONE_INDEX) {
  throw new Error('Missing PINECONE_INDEX environment variable');
}

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!
});

export async function storeDocumentEmbeddings(
  docs: Document[],
  embeddings: number[][],
  fileName: string
) {
  const index = pinecone.index(process.env.PINECONE_INDEX!);
  
  const vectors = docs.map((doc, i) => ({
    id: `${fileName}-${i}`,
    values: embeddings[i],
    metadata: {
      text: doc.pageContent,
      fileName: fileName,
      sourceText: JSON.stringify(doc.metadata)
    },
  }));

  // Upsert vectors in batches of 100
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await index.upsert(batch);
  }
}

export async function queryDocuments(
  queryEmbedding: number[],
  topK: number = 5
) {
  const index = pinecone.index(process.env.PINECONE_INDEX!);
  
  const queryResponse = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });

  return queryResponse.matches.map(match => ({
    text: match.metadata?.text,
    fileName: match.metadata?.fileName,
    score: match.score,
  }));
} 