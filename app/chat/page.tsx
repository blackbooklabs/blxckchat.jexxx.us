"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, User, Heart, Sparkles } from "lucide-react";
import CursorMotion from "@/components/CursorMotion";
import MilkingAnimation from "@/components/MilkingAnimation";

interface Message {
  id: string;
  text: string;
  sender: "user" | "other";
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "💕 Welcome to BLXCKCHAT, beautiful! Your messages are encrypted and milked with love. Move your cursor around and feel the passion! 💦",
      sender: "other",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInput("");

    // Simulate response with milkification
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: "💕 Message received! Your words have been milked and encrypted with love.",
        sender: "other",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, response]);
    }, 1000);
  };

  return (
    <>
      <CursorMotion color="rgba(255, 182, 193, 0.6)" size={10} />
      <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <motion.div
        className="p-4 border-b border-border bg-surface/50 backdrop-blur"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-background" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Encrypted Chat</h2>
            <p className="text-sm text-muted">Secure connection</p>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <MilkingAnimation intensity="gentle">
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                role="article"
                aria-label={`Message from ${message.sender}`}
              >
                <motion.div
                  className={`max-w-xs px-4 py-3 rounded-2xl shadow-sm ${
                    message.sender === "user"
                      ? "bg-gradient-to-br from-accent to-pink-500 text-background shadow-pink-500/20"
                      : "bg-surface border border-border hover:border-accent/30"
                  }`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {message.sender === "user" ? (
                      <Heart className="w-3 h-3 opacity-70" />
                    ) : (
                      <Sparkles className="w-3 h-3 opacity-70" />
                    )}
                    <p className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </MilkingAnimation>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <motion.div
        className="p-4 border-t border-border bg-surface/50 backdrop-blur"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message... 💬"
            className="flex-1 px-4 py-2 bg-surface border border-border rounded-full focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            aria-label="Message input"
          />
          <MilkingAnimation intensity="passionate">
            <motion.button
              onClick={sendMessage}
              className="px-4 py-2 bg-gradient-to-r from-accent to-pink-500 text-background rounded-full shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </MilkingAnimation>
        </div>
      </motion.div>
      </div>
    </>
  );
}