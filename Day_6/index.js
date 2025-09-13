import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import * as dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';

import { PineconeStore } from '@langchain/pinecone';




async function indexDocument() {

const PDF_PATH = './quant.pdf';
const pdfLoader = new PDFLoader(PDF_PATH);
const rawDocs = await pdfLoader.load();
console.log("PDF loader")
// Chunking karo

const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1200,
    chunkOverlap: 200, //for not lossing context
  });
const chunkedDocs = await textSplitter.splitDocuments(rawDocs);
console.log("Chunking complete")
// Vector embedded 
const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'text-embedding-004',
  });
console.log("Embedding model congigured")

// Database configure
//initailize pinecone client
const pinecone = new Pinecone();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
console.log("Pinecone congigured")
//langchain
await PineconeStore.fromDocuments(chunkedDocs, embeddings, {
    pineconeIndex,
    maxConcurrency: 5,
  });
console.log("Data stored succesfully")





}

indexDocument();
