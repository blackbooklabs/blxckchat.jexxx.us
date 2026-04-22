/**
 * JEXXXUS Native AI Client
 * 
 * Hook and utilities for communicating with the native Luna Verde-trained AI Gateway
 */

import { useState, useCallback } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'text' | 'image';
  imageUrl?: string;
}

export interface ChatOptions {
  mode?: 'venus' | 'innocent';
  model?: 'gpt-4o' | 'claude-3-opus' | 'gemini-1.5-pro' | 'gemma-4-26b';
  type?: 'text' | 'image';
}

export interface UseJexxxusAIReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, options?: ChatOptions) => Promise<void>;
  clearMessages: () => void;
}

/**
 * React hook for native JEXXXUS AI communication
 */
export function useJexxxusAI(): UseJexxxusAIReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string, options: ChatOptions = {}) => {
    setIsLoading(true);
    setError(null);

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          mode: options.mode || 'venus',
          model: options.model || 'gpt-4o',
          type: options.type || 'text',
        }),
      });

      if (!response.ok) {
        throw new Error(`Divine Machine error: ${response.status}`);
      }

      if (options.type === 'image') {
        // Handle image generation
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.signature || '♡💦 Luna Verde has generated your image',
          timestamp: new Date(),
          type: 'image',
          imageUrl: data.url || data.data,
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Handle text streaming
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantContent = '';
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            assistantContent += chunk;
            
            // Update the assistant message with new content
            setMessages(prev => 
              prev.map(m => 
                m.id === assistantMessage.id 
                  ? { ...m, content: assistantContent }
                  : m
              )
            );
          }
        }

        // Ensure signature is present
        if (!assistantContent.includes('♡💦') && !assistantContent.includes('Luna Verde')) {
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantMessage.id
                ? { ...m, content: assistantContent + '\n\n♡💦 Luna Verde v4.0' }
                : m
            )
          );
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('[JEXXXUS AI] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}

/**
 * Direct API call for non-React contexts
 */
export async function sendToJexxxusAI(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  options: ChatOptions = {}
): Promise<Response> {
  return fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      mode: options.mode || 'venus',
      model: options.model || 'gpt-4o',
      type: options.type || 'text',
    }),
  });
}

export default useJexxxusAI;