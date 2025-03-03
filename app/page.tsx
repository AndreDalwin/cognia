// pages/index.tsx
import { useState, FormEvent, ChangeEvent } from 'react';

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState<string[]>([]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!pdfFile) return;
    setUploadStatus('Uploading...');
    const formData = new FormData();
    formData.append('pdf', pdfFile);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      setUploadStatus('PDF processed successfully!');
    } else {
      setUploadStatus('Error uploading PDF.');
    }
  };

  const handleChatSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!chatInput) return;
    // Log user question
    setChatLog((prev) => [...prev, `User: ${chatInput}`]);
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: chatInput }),
    });
    const data = await res.json();
    setChatLog((prev) => [...prev, `Bot: ${data.answer}`]);
    setChatInput('');
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>LangChain RAG PDF Chat</h1>
      <section style={{ marginBottom: '2rem' }}>
        <h2>Upload PDF</h2>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <button onClick={handleUpload} style={{ marginLeft: '1rem' }}>
          Upload PDF
        </button>
        <p>{uploadStatus}</p>
      </section>

      <section>
        <h2>Chat</h2>
        <form onSubmit={handleChatSubmit}>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask a question..."
            style={{ width: '300px' }}
          />
          <button type="submit" style={{ marginLeft: '1rem' }}>
            Send
          </button>
        </form>
        <div style={{ marginTop: '1rem', background: '#f4f4f4', padding: '1rem' }}>
          {chatLog.map((msg, idx) => (
            <p key={idx}>{msg}</p>
          ))}
        </div>
      </section>
    </div>
  );
}