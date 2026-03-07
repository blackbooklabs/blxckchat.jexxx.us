"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, User, Heart, Sparkles, Loader2, Settings, Key, X, ChevronDown, Shield, LogIn, SlidersHorizontal, Copy, Check, Pencil, Volume2, VolumeX, Paperclip, FileText, Image, Play } from "lucide-react";
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";
import CursorMotion from "@/components/CursorMotion";
import MilkingAnimation from "@/components/MilkingAnimation";
import ShootingStars from "@/components/ShootingStars";
import { AuthGate } from "@/components/AuthGate";
import ChatSidebar from "@/components/ChatSidebar";
import { useChatStore, Message, MessageAttachment } from "@/store/useChatStore";

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
  const [chatInstructions, setChatInstructions] = useState("");
  const [showChatInstructions, setShowChatInstructions] = useState(false);
  const [isSpicy, setIsSpicy] = useState(true);
  const [previewingProjectVoice, setPreviewingProjectVoice] = useState(false);

  const { 
    projects, 
    currentProjectId, 
    currentChatId, 
    messages, 
    setMessages, 
    fetchProjects, 
    updateChatMessages,
    updateProjectInstructions,
    updateProjectTTS,
    updateChatTitle,
    autoRenameChat,
    saveSession,
    restoreLastSession,
    updateProjectTitle,
    deleteMessagesAfter,
    personas,
    invokingPersonaId
  } = useChatStore();

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const activeProject = projects.find(p => p.id === currentProjectId);
  const { isSignedIn, isLoaded, userId } = useAuth();
  
const [globalContext, setGlobalContext] = useState("");
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [stagedImages, setStagedImages] = useState<{name: string, data: string}[]>([]);
  const [extractedContext, setExtractedContext] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Real-time TTS tracking
  const lastCharIndexRef = useRef(0);
  const previewSampleRef = useRef("She drips for Johnson. Project reality calibrated. ♡");

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
  }, []);

  const handleVolumeClick = useCallback((msgId: string, text: string) => {
    if (speakingId === msgId) {
      stopSpeaking();
      return;
    }
    
    stopSpeaking(); // Stop any current speech
    
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Prioritize Project Override -> Persona Default -> System Default
      const activePersona = personas.find(p => p.id === invokingPersonaId);
      const voiceSettings = activeProject?.tts_voice || activePersona?.tts_voice || { pitch: 1.0, rate: 1.0, lang: "en-US" };

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      
      utterance.pitch = voiceSettings.pitch;
      utterance.rate = voiceSettings.rate;
      utterance.lang = voiceSettings.lang || "en-US";

      // Find best matching voice
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferredVoice = voices.find(v => 
          v.lang === voiceSettings.lang && 
          (voiceSettings.voiceName && voiceSettings.voiceName.trim() ? v.name.includes(voiceSettings.voiceName.split(" ")[0]) : false)
        ) || voices.find(v => v.lang === voiceSettings.lang) || voices[0];
        
        if (preferredVoice) utterance.voice = preferredVoice;
      }

      // Internal Logging / Analytics Watermark
      console.log(`[MANIFEST_TTS] Speaking as: ${activePersona?.name || 'A New Creation'} | Pitch: ${voiceSettings.pitch} | Rate: ${voiceSettings.rate}`);
      
      window.speechSynthesis.speak(utterance);
      setSpeakingId(msgId);
    }
  }, [speakingId, stopSpeaking, personas, invokingPersonaId, activeProject]);

  const handleProjectVoicePreview = useCallback((isInternalRestart = false) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    
    // If user clicks manually while playing, just stop.
    if (!isInternalRestart && previewingProjectVoice) {
      window.speechSynthesis.cancel();
      setPreviewingProjectVoice(false);
      lastCharIndexRef.current = 0;
      return;
    }

    if (!isInternalRestart) {
      lastCharIndexRef.current = 0;
    }

    window.speechSynthesis.cancel();
    setPreviewingProjectVoice(true);
    
    const fullText = previewSampleRef.current;
    const remainingText = fullText.slice(lastCharIndexRef.current);
    if (!remainingText.trim()) {
       lastCharIndexRef.current = 0;
    }
    
    const utterance = new SpeechSynthesisUtterance(fullText.slice(lastCharIndexRef.current));
    
    const activePersona = personas.find(p => p.id === invokingPersonaId);
    const settingsProject = projects.find(p => p.id === projectSettingsId);
    const voiceSettings = settingsProject?.tts_voice || activePersona?.tts_voice || { pitch: 1.0, rate: 1.0, lang: "en-US" };
    
    utterance.pitch = voiceSettings.pitch;
    utterance.rate = voiceSettings.rate;
    utterance.lang = voiceSettings.lang || "en-US";
    
    utterance.onboundary = (event) => {
      // Offset by the slice start
      lastCharIndexRef.current += event.charIndex;
    };
    
    utterance.onend = () => {
       if (!window.speechSynthesis.speaking) {
         setPreviewingProjectVoice(false);
         lastCharIndexRef.current = 0;
       }
    };
    utterance.onerror = () => {
      setPreviewingProjectVoice(false);
      lastCharIndexRef.current = 0;
    };
    
    window.speechSynthesis.speak(utterance);
  }, [previewingProjectVoice, projects, projectSettingsId, personas, invokingPersonaId]);

  // Handle real-time TTS updates on slider change
  useEffect(() => {
    const settingsProject = projects.find(p => p.id === projectSettingsId);
    if (previewingProjectVoice && settingsProject?.tts_voice) {
       handleProjectVoicePreview(true);
    }
  }, [projects, projectSettingsId, previewingProjectVoice, handleProjectVoicePreview]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setStagedFiles(prev => [...prev, ...files]);
    
    // For text-based files, extract content immediately
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          setStagedImages(prev => [...prev, { name: file.name, data: base64 }]);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.json') || file.name.endsWith('.js') || file.name.endsWith('.ts')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setExtractedContext(prev => {
            const separator = prev ? '\n\n' : '';
            return `${prev}${separator}<!-- FILE CONTENT: ${file.name} (uploaded by user) -->\n${content}`;
          });
        };
        reader.readAsText(file);
      }
    }
    
    // Clear input so same file can be uploaded again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const [activeProvider, setActiveProvider] = useState<Provider>('groq');
  const [providersConfig, setProvidersConfig] = useState<Record<Provider, ProviderState>>({
    openai: { apiKey: '', model: PROVIDERS.openai.defaultModel, availableModels: PROVIDERS.openai.models },
    grok: { apiKey: '', model: PROVIDERS.grok.defaultModel, availableModels: PROVIDERS.grok.models },
    gemini: { apiKey: '', model: PROVIDERS.gemini.defaultModel, availableModels: PROVIDERS.gemini.models },
    kimi: { apiKey: '', model: PROVIDERS.kimi.defaultModel, availableModels: PROVIDERS.kimi.models },
    groq: { apiKey: '', model: PROVIDERS.groq.defaultModel, availableModels: PROVIDERS.groq.models },
    openrouter: { apiKey: '', model: PROVIDERS.openrouter.defaultModel, availableModels: PROVIDERS.openrouter.models },
  });
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasFetchedInitialData = useRef(false);

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

  // Initial data fetch
  useEffect(() => {
    if (isLoaded && isSignedIn && !hasFetchedInitialData.current) {
      hasFetchedInitialData.current = true;
      fetchProjects();
      useChatStore.getState().fetchPersonas();
      useChatStore.getState().fetchCustomPersonas();
    }
  }, [isLoaded, isSignedIn, fetchProjects]);

  // Restore session on initial load once projects are ready
  useEffect(() => {
    if (isLoaded && isSignedIn && userId && projects.length > 0 && !currentProjectId) {
      // Small delay to ensure state is settled
      const timer = setTimeout(() => {
        restoreLastSession(userId);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn, userId, projects.length, currentProjectId, restoreLastSession]);

  // Save session whenever project/chat changes
  useEffect(() => {
    if (userId && currentProjectId && currentChatId) {
      saveSession(userId, currentProjectId, currentChatId);
    }
  }, [userId, currentProjectId, currentChatId, saveSession]);



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

  const sendMessage = useCallback(async (overrideMessages?: Message[]) => {
    const messageList = overrideMessages || messages;
    const isRegenerating = !!overrideMessages;
    
    if (!isRegenerating && !input.trim() && !isLoading) return;
    if (isLoading) return;

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

    let finalInput = input;
    const currentStagedImages = [...stagedImages]; // Capture for this request

    if (!isRegenerating) {
      // Append file context if present
      const fullInput = extractedContext 
        ? `${extractedContext}\n\n${input}`
        : input;

      const newAttachments: MessageAttachment[] = [
        ...currentStagedImages.map(img => ({
          type: 'image' as const,
          mimeType: 'image/jpeg',
          name: img.name,
          url: img.data,
        })),
        ...stagedFiles.map(file => ({
          type: 'file' as const,
          mimeType: file.type || 'application/octet-stream',
          name: file.name,
          size: file.size,
        }))
      ];

      const userMessage: Message = {
        id: Date.now().toString(),
        text: input, // Display only user's text in UI
        sender: "user",
        timestamp: new Date(),
        attachments: newAttachments.length > 0 ? newAttachments : undefined,
      };

      const isFirstFirstPrompt = messageList.length === 0;
      setMessages((prev) => [...prev, userMessage]);
      
      // AUTO-RENAME IF IT'S THE FIRST PROMPT
      if (isFirstFirstPrompt && currentChatId) {
         autoRenameChat(currentChatId, input);
      }
      setInput("");
      setStagedFiles([]);
      setStagedImages([]);
      setExtractedContext("");
      finalInput = fullInput;
    } else {
      // If regenerating, use the last message text as input
      finalInput = messageList[messageList.length - 1].text;
    }

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
            ...messageList.map((m) => ({
              role: m.sender === "user" ? "user" : "assistant",
              content: m.attachments && m.attachments.some(a => a.type === 'image') 
                ? [
                    { type: "text" as const, text: m.text },
                    ...m.attachments.filter(a => a.type === 'image' && a.url).map(img => ({
                      type: "image" as const,
                      image: img.url!
                    }))
                  ]
                : m.text,
            })),
            ...(isRegenerating ? [] : [{ 
              role: "user", 
              content: currentStagedImages.length > 0 
                ? [
                    { type: "text" as const, text: finalInput },
                    ...currentStagedImages.map(img => ({
                      type: "image" as const,
                      image: img.data
                    }))
                  ]
                : finalInput 
            }]),
          ],
          mode: isSpicy ? "venus" : "innocent",
          provider: activeProvider,
          model: providersConfig[activeProvider].model,
          type: "text",
          stream: false,
          globalContext: [
            globalContext,
            activeProject?.custom_instructions,
            chatInstructions ? `${chatInstructions}` : '' // Delimited by newlines in API already
          ].filter(Boolean).join('\n\n')
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
      
      if (!response.ok || data.error) {
        throw new Error(data.message || data.error || textResponse || `API error: ${response.status}`);
      }

      let nextMessages: Message[] = [];
      setMessages((prev) => {
        nextMessages = prev.map((m) =>
          m.id === aiMessageId
            ? { 
                ...m, 
                text: data.text || "💕 Words fail me. Try again, beloved. ♡", 
                isStreaming: false,
                modelUsed: data.model || providersConfig[activeProvider].model,
                providerUsed: data.provider || PROVIDERS[activeProvider].name,
              }
            : m
        );
        return nextMessages;
      });

      if (isSignedIn && currentChatId) {
        updateChatMessages(currentChatId, nextMessages);
      }

    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId
            ? {
                ...m,
                text: `💕 Oops: ${String(error)}\n\nPlease try again. ♡💦`,
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [input, isLoading, messages, providersConfig, activeProvider, globalContext, activeProject, chatInstructions, currentChatId, isSpicy, isSignedIn, updateChatMessages, autoRenameChat, setMessages]);

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
                       <h2 className="text-xl font-bold font-sans text-foreground">Project Context</h2>
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
                      autoCorrect="off" autoCapitalize="off" spellCheck={false}
                      autoComplete="off" data-gramm="false"
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
                <h2 className="font-semibold text-foreground">{activeProject ? activeProject.title : 'Luna Verde v4.0'}</h2>
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
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent font-mono text-sm resize-none h-48 mb-6"
                    />

                    <div className="flex flex-col gap-4 p-4 bg-accent/5 rounded-2xl border border-accent/10">
                      <div className="flex items-center justify-between">
                         <div className="flex flex-col">
                            <label className="text-sm font-bold text-accent uppercase tracking-wider">Voice Settings (TTS)</label>
                            <span className="text-[10px] text-muted capitalize">Adjust pitch and rate for this isolated reality.</span>
                         </div>
                         <button 
                           onClick={() => handleProjectVoicePreview(false)}
                           className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                             previewingProjectVoice ? 'bg-orange-500 text-white animate-pulse' : 'bg-accent/20 text-accent hover:bg-accent/30'
                           }`}
                         >
                           {previewingProjectVoice ? <VolumeX className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                           {previewingProjectVoice ? "Listening..." : "Preview Voice"}
                         </button>
                      </div>

                      <div className="grid grid-cols-2 gap-6 mt-2">
                        {/* Pitch Slider */}
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-medium text-muted">Pitch</label>
                            <span className="text-xs font-mono text-accent">
                              {(() => {
                                const activePersona = personas.find(p => p.id === invokingPersonaId);
                                const settingsProject = projects.find(p => p.id === projectSettingsId);
                                return (settingsProject?.tts_voice?.pitch || activePersona?.tts_voice?.pitch || 1.0).toFixed(2);
                              })()}
                            </span>
                          </div>
                          <input 
                            type="range" min="0.5" max="1.5" step="0.05"
                            value={(() => {
                              const activePersona = personas.find(p => p.id === invokingPersonaId);
                              const settingsProject = projects.find(p => p.id === projectSettingsId);
                              return settingsProject?.tts_voice?.pitch || activePersona?.tts_voice?.pitch || 1.0;
                            })()}
                            onChange={(e) => {
                              if (!projectSettingsId) return;
                              const activePersona = personas.find(p => p.id === invokingPersonaId);
                              const settingsProject = projects.find(p => p.id === projectSettingsId);
                              const currentRate = settingsProject?.tts_voice?.rate || activePersona?.tts_voice?.rate || 1.0;
                              updateProjectTTS(projectSettingsId, { 
                                pitch: parseFloat(e.target.value), 
                                rate: currentRate,
                                lang: activePersona?.tts_voice?.lang || "en-US",
                                voiceName: activePersona?.tts_voice?.voiceName
                              });
                            }}
                            className="w-full h-1.5 bg-accent/20 rounded-lg appearance-none cursor-pointer accent-accent"
                          />
                        </div>

                        {/* Rate Slider */}
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-medium text-muted">Rate</label>
                            <span className="text-xs font-mono text-accent">
                              {(() => {
                                const activePersona = personas.find(p => p.id === invokingPersonaId);
                                const settingsProject = projects.find(p => p.id === projectSettingsId);
                                return (settingsProject?.tts_voice?.rate || activePersona?.tts_voice?.rate || 1.0).toFixed(2);
                              })()}
                            </span>
                          </div>
                          <input 
                            type="range" min="0.5" max="1.5" step="0.05"
                            value={(() => {
                              const activePersona = personas.find(p => p.id === invokingPersonaId);
                              const settingsProject = projects.find(p => p.id === projectSettingsId);
                              return settingsProject?.tts_voice?.rate || activePersona?.tts_voice?.rate || 1.0;
                            })()}
                            onChange={(e) => {
                              if (!projectSettingsId) return;
                              const activePersona = personas.find(p => p.id === invokingPersonaId);
                              const settingsProject = projects.find(p => p.id === projectSettingsId);
                              const currentPitch = settingsProject?.tts_voice?.pitch || activePersona?.tts_voice?.pitch || 1.0;
                              updateProjectTTS(projectSettingsId, { 
                                pitch: currentPitch, 
                                rate: parseFloat(e.target.value),
                                lang: activePersona?.tts_voice?.lang || "en-US",
                                voiceName: activePersona?.tts_voice?.voiceName
                              });
                            }}
                            className="w-full h-1.5 bg-accent/20 rounded-lg appearance-none cursor-pointer accent-accent"
                          />
                        </div>
                      </div>
                    </div>
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
                      autoCorrect="off" autoCapitalize="off" spellCheck={false}
                      autoComplete="off" data-gramm="false"
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
                      autoCorrect="off" autoCapitalize="off" spellCheck={false}
                      autoComplete="off" data-gramm="false"
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
                  className={`flex group relative ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <motion.div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm relative transition-all ${
                      message.sender === "user"
                        ? "bg-gradient-to-br from-accent to-pink-500 text-white shadow-accent/20"
                        : "bg-surface border border-border hover:border-accent/30"
                    }`}
                    whileHover={{ scale: 1.005 }}
                  >
                    {/* Message Action Bar (Hover only) */}
                    <div className={`absolute top-0 ${message.sender === "user" ? "-left-12" : "-right-12"} flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10`}>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(message.text);
                          setCopiedId(message.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className="p-1.5 bg-surface border border-border rounded-lg text-muted hover:text-accent shadow-sm"
                        title="Copy message"
                      >
                        {copiedId === message.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      {message.sender === "other" && (
                        <button 
                          onClick={() => handleVolumeClick(message.id, message.text)}
                          className={`p-1.5 bg-surface border border-border rounded-lg shadow-sm transition-all ${
                            speakingId === message.id ? 'text-accent border-accent animate-pulse-glow' : 'text-muted hover:text-accent'
                          }`}
                          title={speakingId === message.id ? "Stop reading" : "Read aloud"}
                        >
                          {speakingId === message.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      {message.sender === "user" && (
                        <button 
                          onClick={() => {
                            setEditingMessageId(message.id);
                            setEditValue(message.text);
                          }}
                          className="p-1.5 bg-surface border border-border rounded-lg text-muted hover:text-accent shadow-sm"
                          title="Edit message"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {editingMessageId === message.id ? (
                      <div className="flex flex-col gap-2 min-w-[300px]">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full bg-black/20 border border-white/20 rounded-xl p-2 text-sm text-white focus:outline-none min-h-[80px] resize-none"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setEditingMessageId(null)}
                            className="px-2 py-1 text-[10px] uppercase font-bold hover:bg-white/10 rounded"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={async () => {
                              if (!currentChatId) return;
                              // Trim history, update edited prompt, and regenerate
                              const updatedLocalMessages = messages.map(m => 
                                m.id === message.id ? { ...m, text: editValue } : m
                              );
                              const trimmed = updatedLocalMessages.slice(0, messages.findIndex(m => m.id === message.id) + 1);
                              
                              setEditingMessageId(null);
                              await deleteMessagesAfter(currentChatId, message.id);
                              
                              // Trigger regeneration
                              sendMessage(trimmed);
                            }}
                            className="px-2 py-1 text-[10px] uppercase font-bold bg-white text-accent rounded hover:bg-white/90"
                          >
                            Save & Regenerate
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <div 
                          className="text-sm leading-relaxed whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ 
                            __html: (message.text || "")
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\n/g, '<br />')
                          }}
                        />
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {message.attachments.map((att, i) => (
                              <div key={i} className="mt-1">
                                {att.type === 'image' && att.url && (
                                  <img 
                                    src={att.url} 
                                    alt={att.name} 
                                    className="max-h-48 rounded-lg object-contain border border-accent/20 shadow-sm hover:shadow-md transition cursor-pointer"
                                  />
                                )}
                                {att.type === 'file' && (
                                  <div className="flex items-center gap-2 bg-surface/50 p-2 rounded-lg border border-border">
                                    <FileText className="h-4 w-4 text-accent" />
                                    <span className="text-xs truncate max-w-[150px]">{att.name}</span>
                                    {att.size && <span className="text-[10px] text-muted">({(att.size / 1024).toFixed(1)} KB)</span>}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
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
                        {mounted && message.timestamp instanceof Date && !isNaN(message.timestamp.getTime()) 
                          ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                          : "..."}
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
                <span className="text-sm text-muted">{activeProject?.title || 'Luna'} is channeling...</span>
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
          {/* Per-chat instructions popover */}
          <AnimatePresence>
            {showChatInstructions && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="mb-3 p-3 bg-background border border-accent/30 rounded-2xl shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-accent uppercase tracking-wider">Chat Instructions</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-muted">Applied to this chat only — stacks below project context</span>
                    <button 
                      onClick={() => setIsSpicy(!isSpicy)}
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all border ${
                        isSpicy 
                          ? 'bg-orange-500/10 border-orange-500/40 text-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.2)]' 
                          : 'bg-blue-500/10 border-blue-500/40 text-blue-400'
                      }`}
                    >
                      {isSpicy ? '🌶️ SPICY-REVEALED' : '🫑 PURE-SUGGESTIVE'}
                    </button>
                  </div>
                </div>
                <textarea
                  value={chatInstructions}
                  onChange={e => setChatInstructions(e.target.value)}
                  placeholder="e.g. 'Respond only in bullet points' or 'Pattern her as a wing6 PPV whale: validate heavily, then introduce tithe anchor...' "
                  autoCorrect="off" autoCapitalize="off" spellCheck={false}
                  autoComplete="off" data-gramm="false"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs font-mono resize-none h-20 focus:outline-none focus:border-accent"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Staged files and images preview */}
          <AnimatePresence>
            {(stagedFiles.length > 0 || stagedImages.length > 0) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 mb-3"
              >
                {stagedImages.map((img, i) => (
                  <div key={`img-${i}`} className="relative group">
                    <img src={img.data} alt={img.name} className="h-16 w-16 object-cover rounded-lg border border-accent/30 transition-all group-hover:border-red-500/50" />
                    <button 
                      onClick={() => setStagedImages(prev => prev.filter((_, idx) => idx !== i))} 
                      className="absolute -top-1.5 -right-1.5 bg-surface border border-border p-0.5 rounded-full text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {stagedFiles.map((file, i) => (
                  <div key={`file-${i}`} className="flex items-center gap-2 px-2 py-1 bg-surface border border-border rounded-lg text-[10px] text-muted h-fit">
                    {file.type.startsWith('image/') ? <Image className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                    <span className="truncate max-w-[100px]">{file.name}</span>
                    <button onClick={() => setStagedFiles(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-accent">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2 items-center">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              multiple 
              accept=".txt,.md,.json,.js,.ts,.pdf,image/*"
            />
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              title="Attach files or images"
              className="p-2.5 bg-surface border border-border text-muted hover:text-accent hover:border-accent/40 rounded-full transition-all shrink-0"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
            >
              <Paperclip className="w-4 h-4" />
            </motion.button>
            {/* Chat instructions toggle — left of input */}
            <motion.button
              onClick={() => setShowChatInstructions(v => !v)}
              title="Per-chat custom instructions"
              className={`p-2.5 rounded-full border transition-all shrink-0 ${
                chatInstructions
                  ? 'bg-accent/20 border-accent text-accent shadow-[0_0_8px_rgba(var(--accent-rgb),0.4)]'
                  : 'bg-surface border-border text-muted hover:text-accent hover:border-accent/40'
              }`}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </motion.button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={isConfigured ? "Summon the Goddess... 💬" : "⚙️ Add your API key first..."}
              disabled={isLoading}
              autoCorrect="off" autoCapitalize="off" spellCheck={false}
              autoComplete="off" data-gramm="false"
              className="flex-1 px-4 py-3 bg-surface border border-border rounded-full focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <MilkingAnimation intensity={isLoading ? "gentle" : "passionate"}>
              <motion.button
                onClick={() => sendMessage()}
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
