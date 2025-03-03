// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import pdf from 'pdf-parse';
import { Document } from 'langchain/document';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { setVectorStore } from '../../lib/store';

// Disable Next.js body parsing to handle file uploads with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const form = formidable({ multiples: false });
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(500).json({ error: 'Error parsing the file' });
        return;
      }
      const file = files.pdf;
      if (!file || Array.isArray(file)) {
        res.status(400).json({ error: 'Invalid file upload' });
        return;
      }
      // Depending on your formidable version, use file.filepath or file.path
      const filePath = file.filepath || file.path;
      try {
        // Read the file into a buffer
        const fileBuffer = fs.readFileSync(filePath);
        // Parse the PDF file using pdf-parse
        const pdfData = await pdf(fileBuffer);
        // Create a LangChain Document from the extracted text
        const doc = new Document({ pageContent: pdfData.text });
        // Create a vector store from the document (wrap in an array)
        const store = await MemoryVectorStore.fromDocuments([doc]);
        // Save the vector store globally
        setVectorStore(store);
        res.status(200).json({ message: 'PDF processed successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error processing PDF' });
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}