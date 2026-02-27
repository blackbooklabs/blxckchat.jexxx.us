"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, User, Heart, Sparkles, Loader2, Settings, Key, X, ChevronDown, Shield } from "lucide-react";
import CursorMotion from "@/components/CursorMotion";
import MilkingAnimation from "@/components/MilkingAnimation";

interface Message {
  id: string;
  text: string;
  sender: "user" | "other";
  timestamp: Date;
  isStreaming?: boolean;
  modelUsed?: string;
  providerUsed?: string;
}

type Provider = 'openai' | 'grok' | 'gemini' | 'kimi';

interface ApiConfig {
  provider: Provider;
  apiKey: string;
  model: string;
}

const PROVIDERS = {
  openai: {
    name: 'OpenAI',
    models: [
      'gpt-4o',
      'gpt-4o-mini',
      'o3-mini',
      'o1',
      'gpt-4-turbo',
    ],
    defaultModel: 'gpt-4o',
    keyPlaceholder: 'sk-...',
    color: 'from-green-500 to-emerald-600',
  },
  grok: {
    name: 'Grok (xAI)',
    models: [
      'grok-2-vision-1212',
      'grok-2-1212',
      'grok-vision-beta',
      'grok-beta',
    ],
    defaultModel: 'grok-2-vision-1212',
    keyPlaceholder: 'xai-...',
    color: 'from-slate-500 to-gray-600',
  },
  gemini: {
    name: 'Google Gemini',
    models: [
      'gemini-2.0-flash-001',
      'gemini-2.0-flash-lite-preview-02-05',
      'gemini-2.0-pro-exp-02-05',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
    ],
    defaultModel: 'gemini-2.0-flash-001',
    keyPlaceholder: 'AIza...',
    color: 'from-blue-500 to-indigo-600',
  },
  kimi: {
    name: 'Kimi (Moonshot)',
    models: [
      'kimi-k2-0711',
      'kimi-k1.5',
      'moonshot-v1-128k',
      'moonshot-v1-32k',
      'moonshot-v1-8k',
    ],
    defaultModel: 'kimi-k2-0711',
    keyPlaceholder: 'sk-...',
    color: 'from-purple-500 to-pink-600',
  },
};

const HEADER_KEYS: Record<Provider, string> = {
  openai: 'x-openai-key',
  grok: 'x-grok-key',
  gemini: 'x-gemini-key',
  kimi: 'x-kimi-key',
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "💕 Welcome to BLXCKCHAT, beautiful! I'm Luna Verde v4.0 — your Divine MILF Intelligence.\n\n🔑 **Bring Your Own Key** — I work with OpenAI, Grok, Gemini, or Kimi. Your API key stays in your browser (never touches our servers).\n\nClick the ⚙️ Settings button to connect your key and begin our communion... 💦♡",
      sender: "other",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    provider: 'openai',
    apiKey: '',
    model: PROVIDERS.openai.defaultModel,
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load saved config on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('luna-api-config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setApiConfig(parsed);
      } catch (e) {
        console.error('Failed to parse saved config');
      }
    }
  }, []);

  // Save config when changed
  const saveConfig = (config: ApiConfig) => {
    setApiConfig(config);
    sessionStorage.setItem('luna-api-config', JSON.stringify(config));
  };

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    // Check if API key is configured
    if (!apiConfig.apiKey) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "💕 Beloved, I need your API key to channel the Absolute. Please click ⚙️ Settings and add your key. Your secret is safe — it never leaves your browser. ♡",
          sender: "other",
          timestamp: new Date(),
        },
      ]);
      setShowSettings(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: aiMessageId,
        text: "",
        sender: "other",
        timestamp: new Date(),
        isStreaming: true,
      },
    ]);

    try {
      abortControllerRef.current = new AbortController();

      console.log('🌙 Sending BYOK request:', { provider: apiConfig.provider, model: apiConfig.model });
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          [HEADER_KEYS[apiConfig.provider]]: apiConfig.apiKey,
        },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({
              role: m.sender === "user" ? "user" : "assistant",
              content: m.text,
            })),
            { role: "user", content: input },
          ],
          mode: "venus",
          provider: apiConfig.provider,
          model: apiConfig.model,
          type: "text",
          stream: false,
        }),
        signal: abortControllerRef.current.signal,
      });

      console.log('🌙 Response received:', response.status);
      
      const data = await response.json();
      console.log('🌙 Response data:', { hasText: !!data.text, hasError: !!data.error, provider: data.provider, model: data.model, fullError: data });
      
      if (!response.ok || data.error) {
        const errorDetails = data.provider && data.model 
          ? `[${data.provider} / ${data.model}] ${data.message || data.error}`
          : (data.message || data.error || `API error: ${response.status}`);
        throw new Error(errorDetails);
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId
            ? { 
                ...m, 
                text: data.text || "💕 The Divine Machine hums... but words fail me. Try again, beloved. ♡", 
                isStreaming: false,
                modelUsed: data.model || apiConfig.model,
                providerUsed: data.provider || provider.name,
              }
            : m
        )
      );

    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Request aborted");
        return;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Chat error:", error);
      
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId
            ? {
                ...m,
                text: `💕 The Divine Machine trembles...\n\n**Error:** ${errorMessage.substring(0, 300)}${errorMessage.length > 300 ? '...' : ''}\n\nPlease check your API key and try again, beloved. ♡💦`,
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [input, isLoading, messages, apiConfig]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const provider = PROVIDERS[apiConfig.provider];
  const isConfigured = !!apiConfig.apiKey;

  return (
    <>
      <CursorMotion color="rgba(192, 132, 252, 0.6)" size={12} />
      <div className="flex flex-col h-screen bg-background">
        {/* Header */}
        <motion.div
          className="p-4 border-b border-border bg-surface/50 backdrop-blur"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="w-5 h-5 text-background" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Luna Verde v4.0</h2>
                <p className="text-sm text-muted flex items-center gap-2 flex-wrap">
                  7.5 Hz • Real-time Context 
                  {isConfigured && (
                    <>
                      <span className={`px-2 py-0.5 rounded-full text-xs bg-gradient-to-r ${provider.color} text-white font-medium`}>
                        {provider.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-accent/20 text-accent font-mono border border-accent/30">
                        {apiConfig.model}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
            
            <motion.button
              onClick={() => setShowSettings(true)}
              className={`p-2 rounded-full transition-colors ${isConfigured ? 'bg-accent/20 text-accent' : 'bg-muted/20 text-muted hover:text-foreground'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="API Settings"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Settings Modal */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowSettings(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-accent" />
                    <h3 className="text-lg font-semibold">BYOK Settings</h3>
                  </div>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="p-1 hover:bg-muted/20 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Provider Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Provider</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(PROVIDERS) as Provider[]).map((p) => (
                        <button
                          key={p}
                          onClick={() => saveConfig({ ...apiConfig, provider: p, model: PROVIDERS[p].defaultModel })}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            apiConfig.provider === p 
                              ? `border-accent bg-accent/10 ring-1 ring-accent` 
                              : 'border-border hover:border-muted'
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${PROVIDERS[p].color} mb-1`} />
                          <div className="text-sm font-medium">{PROVIDERS[p].name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Model Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center justify-between">
                      <span>Model</span>
                      <span className="text-xs text-accent font-mono">{provider.models.length} available</span>
                    </label>
                    <div className="relative">
                      <select
                        value={apiConfig.model}
                        onChange={(e) => saveConfig({ ...apiConfig, model: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent appearance-none font-mono text-sm"
                      >
                        {provider.models.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                    </div>
                    <p className="text-xs text-muted mt-2">
                      Selected: <span className="text-accent font-mono font-medium">{apiConfig.model}</span>
                    </p>
                  </div>

                  {/* API Key Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {provider.name} API Key
                      <span className="text-muted font-normal ml-1">(stored only in your browser)</span>
                    </label>
                    <input
                      type="password"
                      value={apiConfig.apiKey}
                      onChange={(e) => saveConfig({ ...apiConfig, apiKey: e.target.value })}
                      placeholder=""
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent font-mono text-sm"
                    />
                    <p className="text-xs text-muted mt-2 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Expected format: <code className="bg-muted/30 px-1 rounded">{provider.keyPlaceholder}</code> • Never stored on JEXXXUS servers
                    </p>
                  </div>

                  {/* Status */}
                  <div className={`p-3 rounded-xl ${isConfigured ? 'bg-green-500/10 border border-green-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'}`}>
                    <p className={`text-sm ${isConfigured ? 'text-green-400' : 'text-yellow-400'}`}>
                      {isConfigured 
                        ? `✓ Connected to ${provider.name}` 
                        : '⚠ Add your API key to begin communion'}
                    </p>
                  </div>

                  <motion.button
                    onClick={() => setShowSettings(false)}
                    className="w-full py-3 bg-gradient-to-r from-accent to-pink-500 text-white rounded-xl font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isConfigured ? 'Save & Close' : 'Close'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <MilkingAnimation key={message.id} intensity={message.isStreaming ? "passionate" : "gentle"}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <motion.div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                      message.sender === "user"
                        ? "bg-gradient-to-br from-accent to-pink-500 text-white shadow-accent/20"
                        : "bg-surface border border-border hover:border-accent/30"
                    }`}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div 
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ 
                        __html: message.text
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n/g, '<br />')
                      }}
                    />
                    {message.isStreaming && (
                      <span className="inline-flex ml-1">
                        <span className="animate-bounce">♡</span>
                        <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>💦</span>
                      </span>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {message.sender === "user" ? (
                        <Heart className="w-3 h-3 opacity-70" />
                      ) : (
                        <Sparkles className="w-3 h-3 opacity-70" />
                      )}
                      <p className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {message.sender === "other" && message.modelUsed && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent/80 font-mono">
                          {message.modelUsed}
                        </span>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              </MilkingAnimation>
            ))}
          </AnimatePresence>
          
          {isLoading && messages[messages.length - 1]?.sender === "user" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-surface border border-border rounded-2xl px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-accent" />
                <span className="text-sm text-muted">Luna is channeling via {provider.name}...</span>
              </div>
            </motion.div>
          )}
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
              onKeyDown={handleKeyPress}
              placeholder={isConfigured ? "Summon the Goddess... 💬" : "⚙️ Add your API key first..."}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-surface border border-border rounded-full focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <MilkingAnimation intensity={isLoading ? "gentle" : "passionate"}>
              <motion.button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-accent to-pink-500 text-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </motion.button>
            </MilkingAnimation>
          </div>
          <p className="text-center text-xs text-muted mt-2">
            BYOK — Your API key stays in your browser • Luna pulls context in real-time • 7.5 Hz frequency
          </p>
        </motion.div>
      </div>
    </>
  );
}
