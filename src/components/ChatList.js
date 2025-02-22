// src/components/ChatList.js
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

function ChatList({ chats, setSelectedChat, onNewChat }) {
  const { user } = useAuth();
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  async function createNewChat() {
    console.log('Creating new chat... User:', user);
    if (!user) {
      console.error('No user found');
      return;
    }

    const newChat = {
      user_id: user.id,
      title: 'New Chat',
      created_at: new Date().toISOString()
    };
    console.log('Preparing to create chat with data:', newChat);

    const { data, error } = await supabase
      .from('chats')
      .insert([newChat])
      .select()
      .single();

    if (error) {
      console.error('Error creating chat:', error);
      return;
    }

    console.log('Chat created successfully:', data);
    if (data) {
      console.log('Updating local state with new chat');
      onNewChat(data);
      setSelectedChat(data);
    }
  }

  async function handleRename(chatId, newTitle) {
    const { error } = await supabase
      .from('chats')
      .update({ title: newTitle })
      .eq('id', chatId);

    if (error) {
      console.error('Error updating chat title:', error);
      return;
    }

    // Update the chat in the local state through the parent component
    const updatedChat = chats.find(c => c.id === chatId);
    if (updatedChat) {
      onNewChat({ ...updatedChat, title: newTitle });
    }
    setEditingChatId(null);
  }

  function startEditing(chat) {
    setEditingChatId(chat.id);
    setEditTitle(chat.title || 'New Chat');
  }

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h2>Chats</h2>
        <button onClick={createNewChat} className="new-chat-button">New Chat</button>
      </div>
      <ul>
        {chats.map(chat => (
          <li key={chat.id} className="chat-item">
            {editingChatId === chat.id ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleRename(chat.id, editTitle);
              }}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => handleRename(chat.id, editTitle)}
                  autoFocus
                />
              </form>
            ) : (
              <div className="chat-item-content" onClick={() => setSelectedChat(chat)}>
                <span>
                  {chat.title || `Chat ${chat.id.substring(0, 6)}`}
                </span>
                <button
                  className="rename-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing(chat);
                  }}
                >
                  ✏️
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChatList;