import { NextRequest, NextResponse } from 'next/server';
import { WebPDFLoader } from '@langchain/community/document_loaders/web/pdf';
import { OpenAIEmbeddings } from '@langchain/openai';
import { ChatOpenAI } from '@langchain/openai';
import { RetrievalQAChain } from 'langchain/chains';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PromptTemplate } from '@langchain/core/prompts';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const question = formData.get('question') as string;
    
    if (!files.length || !question) {
      return NextResponse.json(
        { error: 'Valid PDF files and question are required' },
        { status: 400 }
      );
    }

    console.log(`Processing ${files.length} PDF files...`);
    
    try {
      // Process all files in parallel
      const processFilePromises = files.map(async (file) => {
        try {
          console.log(`Processing file: ${file.name}`);
          const bytes = await file.arrayBuffer();
          const blob = new Blob([bytes], { type: 'application/pdf' });
          const loader = new WebPDFLoader(blob);
          const docs = await loader.load();
          console.log(`Successfully loaded ${docs.length} pages from ${file.name}`);
          return docs;
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          throw error;
        }
      });

      const allDocs = (await Promise.all(processFilePromises)).flat();
      console.log(`Loaded ${allDocs.length} pages from all PDFs`);

      // Split all documents into chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const splitDocs = await textSplitter.splitDocuments(allDocs);
      console.log(`Split into ${splitDocs.length} chunks`);

      // Create vector store and add documents
      const embeddings = new OpenAIEmbeddings();
      const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);

      // Create chat model
      const model = new ChatOpenAI({
        modelName: 'gpt-3.5-turbo',
        temperature: 0.2,
      });

      // Retrieve relevant documents
      const relevantDocs = await vectorStore.similaritySearch(question, 4);

      // Create prompt template
      const prompt = PromptTemplate.fromTemplate(`
        Based on the following context from PDF documents, please answer the question. 
        If the answer cannot be found in the context, please say so.

        Context:
        {context}

        Question: {question}

        Please provide a clear and accurate answer based solely on the provided context.
      `);

      // Generate answer
      const formattedPrompt = await prompt.format({
        context: relevantDocs.map(doc => doc.pageContent).join('\n\n'),
        question: question
      });
      
      const answer = await model.call([
        { role: 'user', content: formattedPrompt }
      ]);

      return NextResponse.json({ 
        answer: answer.content,
        sources: relevantDocs.map(doc => ({
          pageContent: doc.pageContent.substring(0, 150) + '...'
        }))
      });
    } catch (error) {
      console.error('Error processing files:', error);
      throw error;
    }
  } catch (error: any) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 