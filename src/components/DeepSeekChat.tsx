import React, { useState } from 'react';
import showdown from 'showdown';
import '../styles/deepseek.css';

const DeepSeekChat: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const converter = new showdown.Converter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, `User: ${input}`]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      // Add AI response
      setMessages(prev => [...prev, `AI: ${data.response}`]);
    } catch (error) {
      console.error('Error:', error);
    }

    setInput('');
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div 
            key={index}
            className={msg.startsWith('User:') ? 'user-message' : 'ai-message'}
            dangerouslySetInnerHTML={{ 
              __html: converter.makeHtml(msg)
            }}
          />
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default DeepSeekChat;