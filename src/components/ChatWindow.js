// src/components/ChatWindow.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

function ChatWindow({ chat }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const { user } = useAuth();

  // Fetch messages for the selected chat
  useEffect(() => {
    async function fetchMessages() {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chat.id)
        .order('created_at', { ascending: true });
      if (error) console.error('Error fetching messages:', error);
      else setMessages(data);
    }
    fetchMessages();
  }, [chat]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!newMsg.trim()) return;
    const { data, error } = await supabase
      .from('messages')
      .insert([{ chat_id: chat.id, content: newMsg, sender_id: user.id }])
      .select();
    if (error) {
      console.error('Error sending message:', error);
      return;
    }
    if (data) {
      // Append the new message(s) to the list
      setMessages(prev => [...prev, ...(Array.isArray(data) ? data : [data])]);
      setNewMsg('');
    }
  }

  return (
    <div className="chat-window">
      <h3>{chat?.title || (chat?.id ? `Chat ${chat.id.substring(0, 6)}` : 'Select a chat')}</h3>
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className="message">
            <p>{msg.content}</p>
            <small>{new Date(msg.created_at).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default ChatWindow;