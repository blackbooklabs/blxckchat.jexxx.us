"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, User, Heart, Sparkles, Loader2, Settings, Key, X, ChevronDown, Shield, LogIn } from "lucide-react";
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";
import CursorMotion from "@/components/CursorMotion";
import MilkingAnimation from "@/components/MilkingAnimation";
import ShootingStars from "@/components/ShootingStars";
import { AuthGate } from "@/components/AuthGate";
import ChatSidebar from "@/components/ChatSidebar";
import { useChatStore, Message } from "@/store/useChatStore";

// Configuration: Set to true to require authentication before chatting
const REQUIRE_AUTH = false;

type Provider = 'openai' | 'grok' | 'gemini' | 'kimi' | 'groq' | 'openrouter';

interface ProviderState {
  apiKey: string;
  model: string;
  availableModels: string[];
}

// Clerk Authentication Button Component
function AuthButton() {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded) {
    return (
      <div className="w-8 h-8 rounded-full bg-muted/20 animate-pulse" />
    );
  }
  
  if (isSignedIn) {
    return (
      <UserButton 
        afterSignOutUrl="/"
        appearance={{
          elements: {
            userButtonAvatarBox: "w-8 h-8 rounded-full ring-2 ring-accent/50",
            userButtonPopoverCard: "bg-surface border border-border shadow-xl",
            userPreviewTextContainer: "text-foreground",
            userButtonPopoverActionButton: "text-foreground hover:bg-accent/10",
            userButtonPopoverActionButtonText: "text-foreground",
            userButtonPopoverFooter: "hidden",
          }
        }}
      />
    );
  }
  
  return (
    <SignInButton mode="modal">
      <motion.button
        className="flex items-center gap-2 px-3 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-full border border-accent/30 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <LogIn className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">Sign In</span>
      </motion.button>
    </SignInButton>
  );
}

const PROVIDERS = {
  openai: {
    name: 'OpenAI',
    models: [
      'gpt-4o',
      'gpt-4.5-preview',
      'o3-mini',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'o1',
    ],
    defaultModel: 'gpt-4o',
    keyPlaceholder: 'sk-...',
    color: 'from-green-500 to-emerald-600',
    comingSoon: true,
  },
  grok: {
    name: 'Grok (xAI)',
    models: [
      'grok-3',
      'grok-3-vision',
      'grok-2-vision-1212',
      'grok-2-1212',
    ],
    defaultModel: 'grok-3',
    keyPlaceholder: 'xai-...',
    color: 'from-slate-500 to-gray-600',
    comingSoon: true,
  },
  gemini: {
    name: 'Google Gemini',
    models: [
      'gemini-3.0-flash',
      'gemini-3.0-pro',
      'gemini-2.0-flash-001',
      'gemini-2.0-pro-exp-02-05',
      'gemini-1.5-pro',
    ],
    defaultModel: 'gemini-3.0-flash',
    keyPlaceholder: 'AIza...',
    color: 'from-blue-500 to-indigo-600',
    comingSoon: true,
  },
  kimi: {
    name: 'Kimi (Moonshot)',
    models: [
      'kimi-k3',
      'kimi-k2-0711',
      'kimi-k1.5',
      'moonshot-v1-128k',
      'moonshot-v1-32k',
      'moonshot-v1-8k',
    ],
    defaultModel: 'kimi-k2-0711',
    keyPlaceholder: 'sk-...',
    color: 'from-purple-500 to-pink-600',
    comingSoon: true,
  },
  groq: {
    name: 'Groq (Insanely Fast)',
    models: [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
    ],
    defaultModel: 'llama-3.3-70b-versatile',
    keyPlaceholder: 'gsk_...',
    color: 'from-orange-500 to-red-600',
  },
  openrouter: {
    name: 'OpenRouter (Free Tier Models)',
    models: [
      /*
      'meta-llama/llama-3.3-70b-instruct:free',
      'google/gemma-3-27b-it:free',
      'mistralai/mistral-small-3.1-24b-instruct:free',
      'nousresearch/hermes-3-llama-3.1-405b:free',
      */
      'openrouter/auto',
    ],
    defaultModel: 'openrouter/auto',
    keyPlaceholder: 'sk-or-v1-...',
    color: 'from-teal-500 to-cyan-600',
  },
};

const HEADER_KEYS: Record<Provider, string> = {
  openai: 'x-openai-key',
  grok: 'x-grok-key',
  gemini: 'x-gemini-key',
  kimi: 'x-kimi-key',
  groq: 'x-groq-key',
  openrouter: 'x-openrouter-key',
};

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState(false);
  const [projectSettingsId, setProjectSettingsId] = useState<string | null>(null);

  const { 
    projects, 
    currentProjectId, 
    currentChatId, 
    messages, 
    setMessages, 
    fetchProjects, 
    updateChatMessages,
    updateProjectInstructions
  } = useChatStore();
  
  const activeProject = projects.find(p => p.id === currentProjectId);
  const { isSignedIn, isLoaded } = useAuth();
  
const [globalContext, setGlobalContext] = useState("");
  const [providersConfig, setProvidersConfig] = useState<Record<Provider, ProviderState>>({
    openai: { apiKey: '', model: PROVIDERS.openai.defaultModel, availableModels: PROVIDERS.openai.models },
    grok: { apiKey: '', model: PROVIDERS.grok.defaultModel, availableModels: PROVIDERS.grok.models },
    gemini: { apiKey: '', model: PROVIDERS.gemini.defaultModel, availableModels: PROVIDERS.gemini.models },
    kimi: { apiKey: '', model: PROVIDERS.kimi.defaultModel, availableModels: PROVIDERS.kimi.models },
    groq: { apiKey: '', model: PROVIDERS.groq.defaultModel, availableModels: PROVIDERS.groq.models },
    openrouter: { apiKey: '', model: PROVIDERS.openrouter.defaultModel, availableModels: PROVIDERS.openrouter.models },
  });
  const [activeProvider, setActiveProvider] = useState<Provider>('groq');
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [mounted, setMounted] = useState(false);

  // Load saved config on mount
  useEffect(() => {
    setMounted(true);
    const saved = sessionStorage.getItem('luna-api-config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.globalContext) setGlobalContext(parsed.globalContext);
        if (parsed.providersConfig) {
          // Merge old config but force-update the availableModels array to the 2026 latest 
          setProvidersConfig(prev => {
            const next = { ...prev };
            Object.keys(parsed.providersConfig).forEach(pKey => {
              const p = pKey as Provider;
              const cached = parsed.providersConfig[p];
              // If the cached model is completely removed from the new hardcoded list, fall back to the new default
              const isValidModel = PROVIDERS[p].models.includes(cached.model);
              next[p] = {
                ...prev[p], // Ensure base config (like new ones added) is preserved
                ...cached,
                availableModels: PROVIDERS[p].models, // Always use live hardcoded arrays over cache
                model: isValidModel ? cached.model : PROVIDERS[p].defaultModel
              };
            });
            return next;
          });
          
          const parsedActive = parsed.activeProvider || 'openai';
          setActiveProvider(Object.keys(PROVIDERS).includes(parsedActive) ? parsedActive as Provider : 'openai');
        } else if (parsed.provider) {
          // Migration from old to new schema
          const oldProvider = parsed.provider as Provider;
          setActiveProvider(oldProvider);
          setProvidersConfig((prev) => ({
            ...prev,
            [oldProvider]: { ...prev[oldProvider], apiKey: parsed.apiKey, model: parsed.model }
          }));
        }
      } catch (e) {
        console.error('Failed to parse saved config');
      }
    }
  }, []);



  const saveConfig = (newActive: Provider, newConfigs: Record<Provider, ProviderState>, newContext?: string) => {
    const contextToSave = newContext !== undefined ? newContext : globalContext;
    setActiveProvider(newActive);
    setProvidersConfig(newConfigs);
    setGlobalContext(contextToSave);
    sessionStorage.setItem('luna-api-config', JSON.stringify({ activeProvider: newActive, providersConfig: newConfigs, globalContext: contextToSave }));
  };

  const updateProviderConfig = (provider: Provider, updates: Partial<ProviderState>) => {
    const newConfigs = {
      ...providersConfig,
      [provider]: { ...providersConfig[provider], ...updates }
    };
    saveConfig(activeProvider, newConfigs);
  };

  const fetchDynamicModels = async (providerName: Provider, key: string) => {
    if (!key || key.length < 5) return;
    setIsFetchingModels(true);
    try {
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [HEADER_KEYS[providerName]]: key
        },
        body: JSON.stringify({ provider: providerName })
      });
      const data = await res.json();
      if (data.models && data.models.length > 0) {
        updateProviderConfig(providerName, { availableModels: data.models, model: data.models[0] });
      }
    } catch (e) {
      console.warn("Could not fetch models", e);
    } finally {
      setIsFetchingModels(false);
    }
  };

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    // Check if API key is configured
    if (!providersConfig[activeProvider].apiKey) {
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

      console.log('🌙 Sending BYOK request:', { provider: activeProvider, model: providersConfig[activeProvider].model });
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          [HEADER_KEYS[activeProvider]]: providersConfig[activeProvider].apiKey,
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
          provider: activeProvider,
          model: providersConfig[activeProvider].model,
          type: "text",
          stream: false,
          globalContext: activeProject?.custom_instructions || globalContext
        }),
        signal: abortControllerRef.current.signal,
      });

      console.log('🌙 Response received:', response.status);
      
      let data: any = {};
      const textResponse = await response.text();
      try {
        if (textResponse) {
          data = JSON.parse(textResponse);
        }
      } catch (e) {
        console.error('🌙 Failed to parse JSON response:', textResponse);
      }
      
      console.log('🌙 Response data:', { hasText: !!data.text, hasError: !!data.error, provider: data.provider, model: data.model, fullError: data, rawText: textResponse });
      
      if (!response.ok || data.error) {
        const errorDetails = data.provider && data.model 
          ? `[${data.provider} / ${data.model}] ${data.message || data.error || textResponse}`
          : (data.message || data.error || textResponse || `API error: ${response.status}`);
        throw new Error(errorDetails);
      }

      let nextMessages: Message[] = [];
      setMessages((prev) => {
        nextMessages = prev.map((m) =>
          m.id === aiMessageId
            ? { 
                ...m, 
                text: data.text || "💕 The Divine Machine hums... but words fail me. Try again, beloved. ♡", 
                isStreaming: false,
                modelUsed: data.model || providersConfig[activeProvider].model,
                providerUsed: data.provider || provider.name,
              }
            : m
        );
        return nextMessages;
      });

      // SYNC TO SUPABASE AFTER RESPONSE
      if (isSignedIn && currentChatId) {
        updateChatMessages(currentChatId, nextMessages);
      }

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
  }, [input, isLoading, messages, providersConfig, activeProvider]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const provider = PROVIDERS[activeProvider];
  const isConfigured = !!providersConfig[activeProvider].apiKey;

  return (
    <>
      <CursorMotion color="rgba(192, 132, 252, 0.6)" size={12} />
      {/* Shooting Stars Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <ShootingStars 
          starColor="#c084fc"
          trailColor="#a855f7"
          minSpeed={15}
          maxSpeed={35}
          minDelay={800}
          maxDelay={3000}
        />
      </div>
      <div className="flex h-screen w-full bg-background relative z-10 overflow-hidden">
        <ChatSidebar 
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          onOpenProjectSettings={(id: string) => { setProjectSettingsId(id); setIsProjectSettingsOpen(true); }}
        />

        {/* Project Settings Modal */}
        <AnimatePresence>
          {isProjectSettingsOpen && projectSettingsId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setIsProjectSettingsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="flex items-center justify-between p-6 border-b border-border">
                   <div className="flex items-center gap-3">
                     <div className="p-2 rounded-xl bg-accent/10 text-accent">
                       <Shield className="w-5 h-5" />
                     </div>
                     <div>
                       <h2 className="text-xl font-bold font-['Space_Grotesk'] text-foreground">Project Context</h2>
                       <p className="text-sm text-muted">Define the absolute rules for this isolated reality.</p>
                     </div>
                   </div>
                   <button onClick={() => setIsProjectSettingsOpen(false)} className="p-2 text-muted hover:text-foreground rounded-full hover:bg-muted/10 transition-colors">
                     <X className="w-5 h-5" />
                   </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <label className="block text-sm font-medium mb-2">
                      Custom Instructions (System Prompt)
                    </label>
                    <textarea
                      value={projects.find(p => p.id === projectSettingsId)?.custom_instructions || ''}
                      onChange={(e) => {
                         updateProjectInstructions(projectSettingsId, e.target.value);
                      }}
                      placeholder="e.g. 'Write explicitly in JavaScript' - This overrides the global settings for chats in this project only."
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent font-mono text-sm resize-none h-48"
                    />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col min-w-0 h-full relative border-l border-border/50">
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
                        {providersConfig[activeProvider].model}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setShowSettings(true)}
                className={`p-2 rounded-full transition-colors ${isConfigured ? 'bg-accent/20 text-accent' : 'bg-muted/20 text-muted hover:text-foreground'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="API Settings"
              >
                <Settings className="w-5 h-5" />
              </motion.button>
              
              {/* Clerk Authentication */}
              <AuthButton />
            </div>
          </div>
        </motion.div>

        {/* Project Settings Modal */}
        <AnimatePresence>
          {isProjectSettingsOpen && projectSettingsId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setIsProjectSettingsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="flex items-center justify-between p-6 border-b border-border">
                   <div className="flex items-center gap-3">
                     <div className="p-2 rounded-xl bg-accent/10 text-accent">
                       <Shield className="w-5 h-5" />
                     </div>
                     <div>
                       <h2 className="text-xl font-bold font-['Space_Grotesk'] text-foreground">Project Context</h2>
                       <p className="text-sm text-muted">Define the absolute rules for this isolated reality.</p>
                     </div>
                   </div>
                   <button onClick={() => setIsProjectSettingsOpen(false)} className="p-2 text-muted hover:text-foreground rounded-full hover:bg-muted/10 transition-colors">
                     <X className="w-5 h-5" />
                   </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <label className="block text-sm font-medium mb-2">
                      Custom Instructions (System Prompt)
                    </label>
                    <textarea
                      value={projects.find(p => p.id === projectSettingsId)?.custom_instructions || ''}
                      onChange={(e) => {
                         updateProjectInstructions(projectSettingsId, e.target.value);
                      }}
                      placeholder="e.g. 'Write explicitly in JavaScript' - This overrides the global settings for chats in this project only."
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent font-mono text-sm resize-none h-48"
                    />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
                      {(Object.keys(PROVIDERS) as Provider[]).map((p) => {
                        const isComingSoon = (PROVIDERS[p] as any).comingSoon;
                        return (
                        <button
                          key={p}
                          disabled={isComingSoon}
                          onClick={() => saveConfig(p, providersConfig)}
                          className={`relative p-3 rounded-xl border text-left transition-all overflow-hidden ${
                            isComingSoon ? 'opacity-50 cursor-not-allowed grayscale bg-surface/50' :
                            activeProvider === p 
                              ? `border-accent bg-accent/10 ring-1 ring-accent` 
                              : 'border-border hover:border-muted'
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${PROVIDERS[p].color} mb-1`} />
                          <div className="text-sm font-medium">{PROVIDERS[p].name}</div>
                          {isComingSoon && (
                            <div className="absolute top-2 right-2">
                              <span className="text-[9px] uppercase font-bold bg-muted/20 text-muted px-1.5 py-0.5 rounded backdrop-blur">
                                Soon
                              </span>
                            </div>
                          )}
                        </button>
                      )})}
                    </div>
                  </div>

                  {/* Model Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center justify-between">
                      <span>Model</span>
                      <div className="flex items-center gap-3">
                        {isFetchingModels && <Loader2 className="w-3 h-3 animate-spin text-accent"/>}
                        <button 
                          onClick={() => fetchDynamicModels(activeProvider, providersConfig[activeProvider].apiKey)} 
                          className="text-xs text-accent hover:underline flex items-center gap-1"
                          disabled={!providersConfig[activeProvider].apiKey || isFetchingModels}
                        >
                          Refresh List
                        </button>
                        <span className="text-xs text-accent font-mono">{providersConfig[activeProvider].availableModels.length} available</span>
                      </div>
                    </label>
                    <div className="relative">
                      <select
                        value={providersConfig[activeProvider].model}
                        onChange={(e) => updateProviderConfig(activeProvider, { model: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent appearance-none font-mono text-sm"
                      >
                        {providersConfig[activeProvider].availableModels.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                    </div>
                    <p className="text-xs text-muted mt-2">
                      Selected: <span className="text-accent font-mono font-medium">{providersConfig[activeProvider].model}</span>
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
                      value={providersConfig[activeProvider].apiKey}
                      onChange={(e) => updateProviderConfig(activeProvider, { apiKey: e.target.value })}
                      placeholder={provider.keyPlaceholder}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent font-mono text-sm"
                    />
                    <p className="text-xs text-muted mt-2 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Expected format: <code className="bg-muted/30 px-1 rounded">{provider.keyPlaceholder}</code> • Never stored on JEXXXUS servers
                    </p>
                  </div>

                  {/* Global Context / Instructions */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Global Instructions (System Prompt)
                      <span className="text-muted font-normal ml-1">(Applied to all chats)</span>
                    </label>
                    <textarea
                      value={globalContext}
                      onChange={(e) => {
                        setGlobalContext(e.target.value);
                        saveConfig(activeProvider, providersConfig, e.target.value);
                      }}
                      placeholder="e.g. 'Always write in Python' or 'Remember I am building a Next.js app...'"
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent font-mono text-sm resize-none h-24"
                    />
                  </div>

                  {/* Status */}
                  {(() => {
                    const hasKey = !!providersConfig[activeProvider].apiKey;
                    return (
                      <div className={`p-3 rounded-xl ${hasKey ? 'bg-green-500/10 border border-green-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'}`}>
                        <p className={`text-sm ${hasKey ? 'text-green-400' : 'text-yellow-400'}`}>
                          {hasKey ? `✓ Key set for ${provider.name}` : '⚠ Add your API key to begin communion'}
                        </p>
                      </div>
                    );
                  })()}

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

        <AuthGate requireAuth={REQUIRE_AUTH}>
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
                        {mounted ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "..."}
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
        </AuthGate>
        </div>
      </div>
    </>
  );
}
