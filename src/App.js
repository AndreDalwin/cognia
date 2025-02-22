// src/App.js
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import './App.css';

function ChatApp() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const { user, signOut } = useAuth();

  const handleNewChat = (newChat) => {
    setChats(prevChats => {
      const existingChatIndex = prevChats.findIndex(chat => chat.id === newChat.id);
      if (existingChatIndex >= 0) {
        // Update existing chat
        const updatedChats = [...prevChats];
        updatedChats[existingChatIndex] = newChat;
        return updatedChats;
      } else {
        // Add new chat at the beginning of the array
        return [newChat, ...prevChats];
      }
    });
  };

  useEffect(() => {
    async function fetchChats() {
      const { data, error } = await supabase.from('chats').select('*');
      if (error) console.error('Error fetching chats:', error);
      else setChats(data);
    }
    if (user) fetchChats();
  }, [user]);

  if (!user) {
    return (
      <div className="auth-container">
        {showSignup ? (
          <>
            <Signup />
            <p>Already have an account? <button onClick={() => setShowSignup(false)}>Login</button></p>
          </>
        ) : (
          <>
            <Login />
            <p>Don't have an account? <button onClick={() => setShowSignup(true)}>Sign Up</button></p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <button onClick={signOut}>Sign Out</button>
      </div>
      <div className="content">
        <div className="sidebar">
          <ChatList chats={chats} setSelectedChat={setSelectedChat} onNewChat={handleNewChat} />
        </div>
        <div className="main">
          {selectedChat ? (
            <ChatWindow chat={selectedChat} />
          ) : (
            <p>Select a chat to view messages</p>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ChatApp />
    </AuthProvider>
  );
}

export default App;