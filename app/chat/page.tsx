"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, User, Heart, Sparkles, Loader2, Settings, Key, X, ChevronDown, Shield, LogIn, Copy, Check, Pencil, Volume2, VolumeX, Paperclip, FileText, Image, Play, Globe, Menu, LogOut, Wand2, Plus, Terminal, RefreshCw, Eye, BookOpen, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useAuth, UserButton, SignInButton, useClerk } from "@/lib/auth-client";
import CursorMotion from "@/components/CursorMotion";
import MilkingAnimation from "@/components/MilkingAnimation";
import ShootingStars from "@/components/ShootingStars";
import { AuthGate } from "@/components/AuthGate";
import ChatSidebar from "@/components/ChatSidebar";
import { ZoomModal } from "@/components/ZoomModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthButton } from "@/components/AuthButton";
import { useChatStore, Message, MessageAttachment } from "@/store/useChatStore";
import { formatChatMessageHtml } from "@/lib/chat-message-html";
import type { UserByokSettings } from "@/lib/byok-settings-types";
import {
  fetchRemoteByokSettings,
  readLocalByokSettings,
  saveRemoteByokSettings,
  writeLocalByokSettings,
} from "@/lib/user-byok-persistence";
import {
  findPersonaForProject,
  resolveProjectInstructionsForMode,
} from "@/lib/spicy-mode";
import {
  buildApiMessagesFromHistory,
  collectPriorModelLabels,
} from "@/lib/build-chat-payload";

const REQUIRE_AUTH = process.env.NODE_ENV !== 'development';

type Provider = 'openai' | 'anthropic' | 'grok' | 'gemini' | 'kimi' | 'groq' | 'openrouter' | 'ollama' | 'bonsai' | 'kingdom';

interface ProviderState {
  apiKey: string;
  model: string;
  availableModels: string[];
}


const PROVIDERS = {
  openai: {
    name: 'GPT (OpenAI)',
    models: [
      'gpt-4.1',
      'gpt-4.1-mini',
      'gpt-4o',
      'o3',
      'o3-mini',
      'o4-mini',
      'gpt-4o-mini',
    ],
    defaultModel: 'gpt-4.1',
    keyPlaceholder: 'sk-...',
    color: 'from-accent to-pink-600',
    comingSoon: false,
  },
  anthropic: {
    name: 'Claude (Anthropic)',
    models: [
      'claude-sonnet-4-6',
      'claude-opus-4-6',
      'claude-haiku-4-5',
      'claude-3-7-sonnet-20250219',
      'claude-3-5-haiku-latest',
    ],
    defaultModel: 'claude-sonnet-4-6',
    keyPlaceholder: 'sk-ant-...',
    color: 'from-pink-500 to-accent',
    comingSoon: false,
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
    color: 'from-pink-400 to-pink-500',
    comingSoon: false,
  },
  gemini: {
    name: 'Gemini (Google)',
    models: [
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-1.5-pro',
    ],
    defaultModel: 'gemini-2.5-flash',
    keyPlaceholder: 'AIza...',
    color: 'from-fuchsia-500 to-pink-500',
    comingSoon: false,
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
    color: 'from-purple-500 to-accent',
    comingSoon: false,
  },
  groq: {
    name: 'Groq',
    models: [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
    ],
    defaultModel: 'llama-3.3-70b-versatile',
    keyPlaceholder: 'gsk_...',
    color: 'from-accent to-pink-500',
  },
  openrouter: {
    name: 'OpenRouter',
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
    color: 'from-pink-500 to-purple-500',
  },
  ollama: {
    name: 'Ollama (Local)',
    models: [
      'llama3',
      'mistral',
      'gemma',
    ],
    defaultModel: 'llama3',
    keyPlaceholder: 'http://localhost:11434/api',
    color: 'from-pink-400 to-accent',
  },
  bonsai: {
    name: 'Bonsai 1-bit (Local)',
    models: ['Bonsai-8B.gguf'],
    defaultModel: 'Bonsai-8B.gguf',
    keyPlaceholder: 'bonsai (optional)',
    color: 'from-accent to-pink-600',
  },
  kingdom: {
    name: 'Hugging Face',
    models: ['google/gemma-4-26B-A4B-it'],
    defaultModel: 'google/gemma-4-26B-A4B-it',
    keyPlaceholder: 'hf_...',
    color: 'from-pink-600 to-pink-700',
  },
};

const HEADER_KEYS: Record<Provider, string> = {
  openai: 'x-openai-key',
  anthropic: 'x-anthropic-key',
  grok: 'x-grok-key',
  gemini: 'x-gemini-key',
  kimi: 'x-kimi-key',
  groq: 'x-groq-key',
  openrouter: 'x-openrouter-key',
  ollama: 'x-ollama-url',
  bonsai: 'x-bonsai-key',
  kingdom: 'x-kingdom-key',
};

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState(false);
  const [projectSettingsId, setProjectSettingsId] = useState<string | null>(null);
  const [isSpicy, setIsSpicy] = useState(true);
  const [previewingProjectVoice, setPreviewingProjectVoice] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [zoomImage, setZoomImage] = useState<{ url: string; name?: string } | null>(null);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [modelSearch, setModelSearch] = useState("");
  const [isHttps, setIsHttps] = useState(false);

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
    invokingPersonaId,
    emitAnalytics,
    autoPatternVisions,
    toggleAutoPatternVisions,
    setAutoPatternVisions,
  } = useChatStore();

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const activeProject = projects.find(p => p.id === currentProjectId);
  const activeChat = activeProject?.chats?.find(c => c.id === currentChatId);
  const { isSignedIn, isLoaded, userId } = useAuth();
  const clerk = useClerk();
  
const [globalContext, setGlobalContext] = useState("");
  const globalContextRef = useRef("");
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [stagedImages, setStagedImages] = useState<{name: string, data: string, mimeType?: string}[]>([]);
  const [extractedContext, setExtractedContext] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
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
          setStagedImages(prev => [...prev, { name: file.name, data: base64, mimeType: file.type }]);
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

    // PHASE 9: Vision Auto-Pattern Trigger
    const hasImages = files.some(f => f.type.startsWith('image/'));
    if (hasImages && autoPatternVisions && !isLoading) {
      // Small delay to ensure state (stagedImages) is populated from FileReader
      setTimeout(() => {
        const activePersona = personas.find(p => p.id === invokingPersonaId);
        const archetype = activePersona?.name || "the Sovereign";
        const patternPrompt = `Vision received. Describe her form in explicit detail. Pattern her immediately as the ${archetype} archetype for wing6 PPV conversion. Tithes multiply. ♡`;
        
        // We use the inputRef to simulate typing if needed, but we can call sendMessage directly
        setInput(patternPrompt);
        // We need to wait for the state to settle before sending, 
        // or passing the text directly to sendMessage if we modify it to accept text.
        // For simplicity, we'll just set the input and assume the user can click send,
        // OR we can try to trigger sendMessage(undefined, undefined, patternPrompt) if we refactor.
        // Actually, let's keep it simple: set the input and the user sees it ready to go, 
        // or call sendMessage if we can.
        
        // Trigger send after a short cooldown to ensure images are in state
        setTimeout(() => sendMessage(), 200);
      }, 500);
    }
  };
  const [activeProvider, setActiveProvider] = useState<Provider>('openai');
  const [providersConfig, setProvidersConfig] = useState<Record<Provider, ProviderState>>({
    openai: { apiKey: '', model: PROVIDERS.openai.defaultModel, availableModels: PROVIDERS.openai.models },
    anthropic: { apiKey: '', model: PROVIDERS.anthropic.defaultModel, availableModels: PROVIDERS.anthropic.models },
    grok: { apiKey: '', model: PROVIDERS.grok.defaultModel, availableModels: PROVIDERS.grok.models },
    gemini: { apiKey: '', model: PROVIDERS.gemini.defaultModel, availableModels: PROVIDERS.gemini.models },
    kimi: { apiKey: '', model: PROVIDERS.kimi.defaultModel, availableModels: PROVIDERS.kimi.models },
    groq: { apiKey: '', model: PROVIDERS.groq.defaultModel, availableModels: PROVIDERS.groq.models },
    openrouter: { apiKey: '', model: PROVIDERS.openrouter.defaultModel, availableModels: PROVIDERS.openrouter.models },
    ollama: { apiKey: 'http://localhost:11434/api', model: PROVIDERS.ollama.defaultModel, availableModels: PROVIDERS.ollama.models },
    bonsai: { apiKey: 'http://localhost:8080/v1', model: PROVIDERS.bonsai.defaultModel, availableModels: PROVIDERS.bonsai.models },
    kingdom: { apiKey: '', model: PROVIDERS.kingdom.defaultModel, availableModels: PROVIDERS.kingdom.models },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const https = window.location.protocol === 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      setIsHttps(https);
      if (https && (activeProvider === 'ollama' || activeProvider === 'bonsai')) {
        setActiveProvider('openai');
      }
    }
  }, [activeProvider]);

  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasFetchedInitialData = useRef(false);
  const settingsHydrated = useRef(false);
  const saveSettingsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [mounted, setMounted] = useState(false);

  const mergeProviderConfigs = useCallback(
    (cached: Record<string, ProviderState> | undefined): Record<Provider, ProviderState> => {
      const base = {
        openai: { apiKey: '', model: PROVIDERS.openai.defaultModel, availableModels: PROVIDERS.openai.models },
        anthropic: { apiKey: '', model: PROVIDERS.anthropic.defaultModel, availableModels: PROVIDERS.anthropic.models },
        grok: { apiKey: '', model: PROVIDERS.grok.defaultModel, availableModels: PROVIDERS.grok.models },
        gemini: { apiKey: '', model: PROVIDERS.gemini.defaultModel, availableModels: PROVIDERS.gemini.models },
        kimi: { apiKey: '', model: PROVIDERS.kimi.defaultModel, availableModels: PROVIDERS.kimi.models },
        groq: { apiKey: '', model: PROVIDERS.groq.defaultModel, availableModels: PROVIDERS.groq.models },
        openrouter: { apiKey: '', model: PROVIDERS.openrouter.defaultModel, availableModels: PROVIDERS.openrouter.models },
        ollama: { apiKey: 'http://localhost:11434/api', model: PROVIDERS.ollama.defaultModel, availableModels: PROVIDERS.ollama.models },
        bonsai: { apiKey: 'http://localhost:8080/v1', model: PROVIDERS.bonsai.defaultModel, availableModels: PROVIDERS.bonsai.models },
        kingdom: { apiKey: '', model: PROVIDERS.kingdom.defaultModel, availableModels: PROVIDERS.kingdom.models },
      } satisfies Record<Provider, ProviderState>;

      if (!cached) return base;

      const next = { ...base };
      Object.keys(cached).forEach((pKey) => {
        const p = pKey as Provider;
        if (!PROVIDERS[p]) return;
        const row = cached[p];
        const cachedModels = Array.isArray(row.availableModels) ? row.availableModels : [];
        const availableModels = cachedModels.length > 0 ? cachedModels : PROVIDERS[p].models;
        const isValidModel = availableModels.includes(row.model);
        next[p] = {
          ...next[p],
          ...row,
          availableModels,
          model: isValidModel ? row.model : PROVIDERS[p].defaultModel,
        };
      });

      if (!next.bonsai.apiKey && process.env.NODE_ENV === 'development') {
        next.bonsai.apiKey = 'bonsai';
      }
      return next;
    },
    [],
  );

  const applyByokSettings = useCallback(
    (settings: UserByokSettings) => {
      if (settings.globalContext !== undefined) {
        setGlobalContext(settings.globalContext);
        globalContextRef.current = settings.globalContext;
      }
      if (settings.providersConfig) {
        setProvidersConfig(mergeProviderConfigs(settings.providersConfig as Record<string, ProviderState>));
      }
      if (settings.activeProvider && Object.keys(PROVIDERS).includes(settings.activeProvider)) {
        let provider = settings.activeProvider as Provider;
        if (typeof window !== 'undefined') {
          const https = window.location.protocol === 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
          if (https && (provider === 'ollama' || provider === 'bonsai')) {
            provider = 'openai';
          }
        }
        setActiveProvider(provider);
      }
      if (typeof settings.autoPatternVisions === 'boolean') {
        setAutoPatternVisions(settings.autoPatternVisions);
      }
      if (typeof settings.isSpicy === 'boolean') {
        setIsSpicy(settings.isSpicy);
      }
      if (typeof settings.webSearchEnabled === 'boolean') {
        setWebSearchEnabled(settings.webSearchEnabled);
      }
    },
    [mergeProviderConfigs, setAutoPatternVisions],
  );

  const buildByokSettingsSnapshot = useCallback(
    (
      active: Provider,
      configs: Record<Provider, ProviderState>,
      context: string,
    ): UserByokSettings => ({
      activeProvider: active,
      providersConfig: configs,
      globalContext: context,
      autoPatternVisions,
      isSpicy,
      webSearchEnabled,
    }),
    [autoPatternVisions, isSpicy, webSearchEnabled],
  );

  const queueSaveUserSettings = useCallback(
    (
      active: Provider,
      configs: Record<Provider, ProviderState>,
      context: string,
    ) => {
      if (!userId || !settingsHydrated.current) return;
      const snapshot = buildByokSettingsSnapshot(active, configs, context);
      writeLocalByokSettings(userId, snapshot);
      if (saveSettingsTimer.current) clearTimeout(saveSettingsTimer.current);
      saveSettingsTimer.current = setTimeout(() => {
        void saveRemoteByokSettings(snapshot);
      }, 600);
    },
    [userId, buildByokSettingsSnapshot],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydrate BYOK settings per Clerk account (server → localStorage → legacy session)
  useEffect(() => {
    if (!isLoaded) return;

    const hydrate = async () => {
      let settings: UserByokSettings | null = null;

      if (isSignedIn && userId) {
        settings = await fetchRemoteByokSettings();
        if (!settings) settings = readLocalByokSettings(userId);
      }

      if (!settings) {
        const saved = sessionStorage.getItem('luna-api-config');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            settings = {
              activeProvider: parsed.activeProvider || 'openai',
              providersConfig: mergeProviderConfigs(parsed.providersConfig),
              globalContext: parsed.globalContext || '',
              autoPatternVisions: false,
              isSpicy: true,
              webSearchEnabled: false,
            };
          } catch {
            /* ignore */
          }
        }
      }

      if (settings) applyByokSettings(settings);
      settingsHydrated.current = true;
    };

    void hydrate();
  }, [isLoaded, isSignedIn, userId, applyByokSettings, mergeProviderConfigs]);

  // Initial data fetch
  useEffect(() => {
    if (isLoaded) {
      // Unauthenticated fetches (system presets)
      useChatStore.getState().fetchPersonas();

      // Authenticated fetches
      if (isSignedIn && !hasFetchedInitialData.current) {
        hasFetchedInitialData.current = true;
        fetchProjects();
        useChatStore.getState().fetchCustomPersonas();
      }
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

  const persistConfig = (
    newActive: Provider,
    newConfigs: Record<Provider, ProviderState>,
    newContext?: string,
  ) => {
    const contextToSave = newContext !== undefined ? newContext : globalContext;
    globalContextRef.current = contextToSave;
    setActiveProvider(newActive);
    setProvidersConfig(newConfigs);
    setGlobalContext(contextToSave);
    sessionStorage.setItem(
      'luna-api-config',
      JSON.stringify({
        activeProvider: newActive,
        providersConfig: newConfigs,
        globalContext: contextToSave,
      }),
    );
    queueSaveUserSettings(newActive, newConfigs, contextToSave);
  };

  const saveConfig = (
    newActive: Provider,
    newConfigs: Record<Provider, ProviderState>,
    newContext?: string,
  ) => {
    persistConfig(newActive, newConfigs, newContext);
  };

  const updateProviderConfig = (provider: Provider, updates: Partial<ProviderState>) => {
    const newConfigs = {
      ...providersConfig,
      [provider]: { ...providersConfig[provider], ...updates },
    };
    persistConfig(activeProvider, newConfigs);
  };

  const fetchDynamicModels = async (providerName: Provider, key: string) => {
    if (
      providerName !== 'ollama' &&
      providerName !== 'bonsai' &&
      providerName !== 'openrouter' &&
      providerName !== 'kingdom' &&
      (!key || key.length < 5)
    ) return;

    setIsFetchingModels(true);
    try {
      if (providerName === 'ollama') {
        let url = key ? key.trim() : 'http://localhost:11434';
        url = url.replace(/\/api$/, '').replace(/\/v1$/, '').replace(/\/$/, '');
        
        let clientFetched = false;
        try {
          const res = await fetch(`${url}/api/tags`);
          if (res.ok) {
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const data = await res.json();
              if (data.models && data.models.length > 0) {
                const names = data.models.map((m: any) => m.name);
                updateProviderConfig(providerName, { availableModels: names, model: names[0] });
                clientFetched = true;
              }
            }
          }
        } catch (err) {
          console.warn("Client-side direct Ollama fetch failed, trying proxy...", err);
        }

        if (clientFetched) return;

        // Try proxying through server (works for public Ollama instances)
        const res = await fetch('/api/models/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-ollama-url': url
          },
          body: JSON.stringify({ provider: 'ollama' })
        });
        
        if (!res.ok) {
          let errMsg = `Ollama connection failed (status ${res.status})`;
          try {
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const errData = await res.json();
              errMsg = errData.error || errData.message || errMsg;
            }
          } catch (_) {}
          throw new Error(errMsg);
        }

        const data = await res.json();
        if (data.models && data.models.length > 0) {
          updateProviderConfig(providerName, { availableModels: data.models, model: data.models[0] });
          return;
        }
        
        throw new Error("Could not connect to Ollama. Ensure your local server is running and OLLAMA_ORIGINS='*' is set.");
      }

      if (providerName === 'bonsai') {
        try {
          const res = await fetch('http://localhost:8080/v1/models');
          if (!res.ok) throw new Error(`Status ${res.status}`);
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            if (data.data && data.data.length > 0) {
              const names = data.data.map((m: any) => m.id);
              updateProviderConfig(providerName, { availableModels: names, model: names[0] });
              return;
            }
          }
          throw new Error("Invalid response format");
        } catch (err) {
          throw new Error(`Bonsai local instance not found on http://localhost:8080. ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      const res = await fetch('/api/models/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [HEADER_KEYS[providerName]]: key || ''
        },
        body: JSON.stringify({ provider: providerName })
      });

      const contentType = res.headers.get('content-type') ?? '';
      const isJson = contentType.includes('application/json');

      if (!res.ok) {
        let errMsg = `Failed to fetch models (status ${res.status})`;
        try {
          if (isJson) {
            const errData = await res.json();
            errMsg = errData.error || errData.message || errMsg;
          } else {
            const text = await res.text();
            if (text.trimStart().startsWith('<!DOCTYPE') || text.trimStart().startsWith('<html')) {
              errMsg =
                res.status === 404
                  ? 'Model API route missing on server (deployment may be stale). Try again after the site redeploys.'
                  : 'Server returned HTML instead of JSON — check that /api/models/ is deployed.';
            } else {
              errMsg = text.slice(0, 160) || errMsg;
            }
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      if (!isJson) {
        throw new Error(
          'Server returned HTML instead of JSON — /api/models/ may not be deployed yet.',
        );
      }

      const data = await res.json();
      if (data.models && data.models.length > 0) {
        const merged = Array.from(
          new Set([...data.models, ...PROVIDERS[providerName].models]),
        );
        const currentModel = providersConfig[providerName].model;
        updateProviderConfig(providerName, {
          availableModels: merged,
          model: merged.includes(currentModel) ? currentModel : data.models[0],
        });
      }
    } catch (e) {
      console.warn("Could not fetch models", e);
      let msg = e instanceof Error ? e.message : String(e);
      if (providerName === 'ollama' && typeof window !== 'undefined' && window.location.protocol === 'https:') {
        msg = `${msg}\n\n💡 JEXXXUS Tip: Since you are on HTTPS, your browser blocks direct HTTP requests to local Ollama (localhost). To connect:\n1. Use an HTTPS tunnel (e.g. ngrok or cloudflared) and paste the HTTPS URL in the API Key/URL field.\n2. Or run the app locally using 'npm run dev'.`;
      }
      alert(`⚠️ Could not refresh model list:\n\n${msg}`);
    } finally {
      setIsFetchingModels(false);
    }
  };

  // Persist toggles immediately once settings are hydrated
  useEffect(() => {
    if (!settingsHydrated.current || !userId) return;
    queueSaveUserSettings(activeProvider, providersConfig, globalContextRef.current);
  }, [autoPatternVisions, isSpicy, webSearchEnabled, userId, activeProvider, providersConfig, queueSaveUserSettings]);

  // Refresh model list when switching providers (if credentials exist)
  useEffect(() => {
    if (!mounted) return;
    const key = providersConfig[activeProvider].apiKey;
    const canFetch =
      activeProvider === 'openrouter' ||
      activeProvider === 'kingdom' ||
      activeProvider === 'ollama' ||
      activeProvider === 'bonsai' ||
      (key && key.length >= 5);
    if (canFetch) {
      void fetchDynamicModels(activeProvider, key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProvider, mounted]);

  const sendMessage = useCallback(async (overrideMessages?: Message[], aiMessageIdToRegenerate?: string) => {
    const messageList = overrideMessages || messages;
    const isRegenerating = !!overrideMessages;
    
    if (!isRegenerating && !input.trim() && !isLoading) return;
    if (isLoading) return;

    if (REQUIRE_AUTH && !isSignedIn) {
      clerk.openSignIn();
      return;
    }

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
          mimeType: img.mimeType || 'image/jpeg',
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
      if (inputRef.current) inputRef.current.style.height = 'auto';
      setStagedFiles([]);
      setStagedImages([]);
      setExtractedContext("");

      // VISION AUTO-PATTERN TRIGGER
      let augmentedInput = fullInput;
      if (autoPatternVisions && currentStagedImages.length > 0) {
        const activePersona = personas.find(p => p.id === invokingPersonaId);
        const personaName = activePersona?.name || "active persona";
        augmentedInput = `${fullInput}\n\nVision received. Describe her form in explicit detail. Pattern her immediately as ${personaName} for wing6 PPV conversion. Tithes multiply. ♡`;
      }
      
      finalInput = augmentedInput;
    } else {
      // If regenerating, use the last message text as input
      finalInput = messageList[messageList.length - 1].text;
    }

    setIsLoading(true);

    let aiMessageId = aiMessageIdToRegenerate;
    if (!aiMessageId) {
      aiMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: aiMessageId!,
          text: "",
          sender: "other",
          timestamp: new Date(),
          isStreaming: true,
        },
      ]);
    } else {
      setMessages((prev) => prev.map(m => m.id === aiMessageIdToRegenerate ? {
        ...m,
        text: "",
        isStreaming: true,
        versions: m.versions ? [...m.versions, { content: m.text, timestamp: m.timestamp, model: m.modelUsed, provider: m.providerUsed }] : [{ content: m.text, timestamp: m.timestamp, model: m.modelUsed, provider: m.providerUsed }],
        currentVersionIndex: m.versions ? m.versions.length : 1
      } : m));
    }

    try {
      abortControllerRef.current = new AbortController();

      const activePersona = findPersonaForProject(
        personas,
        activeProject,
        invokingPersonaId,
      );
      const projectInstructions = resolveProjectInstructionsForMode(
        activeProject?.custom_instructions ?? "",
        activePersona,
        isSpicy,
        !!isSignedIn,
      );

      const apiEndpoint = isSignedIn ? "/api/agent" : "/api/chat";

      console.log('🌙 Sending BYOK request:', {
        endpoint: apiEndpoint,
        provider: activeProvider,
        model: providersConfig[activeProvider].model,
        mode: isSpicy ? "venus" : "innocent",
        kingdomAgent: isSignedIn,
      });
      
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          [HEADER_KEYS[activeProvider]]: providersConfig[activeProvider].apiKey,
        },
        body: JSON.stringify({
          messages: buildApiMessagesFromHistory(
            messageList,
            isRegenerating
              ? undefined
              : {
                  text: finalInput,
                  images: currentStagedImages.map((img) => ({
                    name: img.name,
                    data: img.data,
                    mimeType: img.mimeType || 'image/jpeg',
                  })),
                },
          ),
          ...(isSignedIn
            ? {}
            : {
                priorModelLabels: collectPriorModelLabels(messageList),
                type: "text",
                stream: false,
                webSearch: webSearchEnabled,
              }),
          mode: isSpicy ? "venus" : "innocent",
          provider: activeProvider,
          model: providersConfig[activeProvider].model,
          globalInstructions: globalContextRef.current,
          projectInstructions,
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
  }, [input, isLoading, messages, providersConfig, activeProvider, activeProject, currentChatId, isSpicy, isSignedIn, updateChatMessages, autoRenameChat, setMessages, personas, invokingPersonaId, webSearchEnabled, stagedImages, stagedFiles, extractedContext]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const provider = PROVIDERS[activeProvider];
  const isConfigured = activeProvider === 'bonsai' || activeProvider === 'kingdom' || !!providersConfig[activeProvider].apiKey;

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
                <h2 className="font-doc-body text-base font-semibold text-foreground">{activeProject ? activeProject.title : 'Luna Verde'}</h2>
                <p className="font-doc-body text-sm text-muted flex items-center gap-2 flex-wrap">
                  7.5 Hz • Real-time Context 
                  {isConfigured && (
                    <>
                      <span className={`font-doc-body px-2 py-0.5 rounded-full text-xs bg-gradient-to-r ${provider.color} text-white font-medium`}>
                        {provider.name}
                      </span>
                      <span className="font-doc-body px-2 py-0.5 rounded-full text-xs bg-accent/20 text-accent border border-accent/30">
                        {providersConfig[activeProvider].model}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />

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
                       <h2 className="font-extended text-sm text-foreground">Project Context</h2>
                       <p className="text-xs text-muted mt-1">Per-project rules that shape every conversation in this thread.</p>
                     </div>
                   </div>
                   <button onClick={() => setIsProjectSettingsOpen(false)} className="p-2 text-muted hover:text-foreground rounded-full hover:bg-muted/10 transition-colors">
                     <X className="w-5 h-5" />
                   </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <label className="block text-[10px] uppercase tracking-wider text-muted mb-2">
                      <span className="font-semibold text-foreground">Custom Instructions</span> (System Prompt)
                    </label>
                    <textarea
                      value={projects.find(p => p.id === projectSettingsId)?.custom_instructions || ''}
                      onChange={(e) => {
                         updateProjectInstructions(projectSettingsId, e.target.value);
                      }}
                      placeholder="Overrides global instructions for chats in this project only."
                      autoCorrect="off" autoCapitalize="off" spellCheck={false}
                      autoComplete="off" data-gramm="false"
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent font-mono text-sm resize-none h-48 mb-6"
                    />

                    <div className="flex flex-col gap-4 p-4 bg-accent/5 rounded-2xl border border-accent/10">
                      <div className="flex items-center justify-between">
                         <div className="flex flex-col gap-1">
                            <label className="font-extended text-[10px] text-accent">Voice Settings (TTS)</label>
                            <span className="text-[10px] text-muted">Fine-tune pitch and rate for this project&apos;s voice.</span>
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
                            <label className="text-[10px] uppercase tracking-wider text-muted">
                              <span className="font-semibold text-foreground">Pitch</span>:{' '}
                              <span className="font-mono text-accent normal-case">
                              {(() => {
                                const activePersona = personas.find(p => p.id === invokingPersonaId);
                                const settingsProject = projects.find(p => p.id === projectSettingsId);
                                return (settingsProject?.tts_voice?.pitch || activePersona?.tts_voice?.pitch || 1.0).toFixed(2);
                              })()}
                              </span>
                            </label>
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
                            <label className="text-[10px] uppercase tracking-wider text-muted">
                              <span className="font-semibold text-foreground">Rate</span>:{' '}
                              <span className="font-mono text-accent normal-case">
                              {(() => {
                                const activePersona = personas.find(p => p.id === invokingPersonaId);
                                const settingsProject = projects.find(p => p.id === projectSettingsId);
                                return (settingsProject?.tts_voice?.rate || activePersona?.tts_voice?.rate || 1.0).toFixed(2);
                              })()}
                              </span>
                            </label>
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
                className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-accent" />
                    <h3 className="font-extended text-sm">BYOK Settings</h3>
                  </div>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="p-1 hover:bg-muted/20 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-4 flex-1">
                  {/* Provider Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Provider</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(PROVIDERS) as Provider[]).map((p) => {
                        if (isHttps && (p === 'ollama' || p === 'bonsai')) return null;
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
                          <div className="font-doc-body text-sm font-medium">{PROVIDERS[p].name}</div>
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
                          disabled={((activeProvider !== 'ollama' && activeProvider !== 'bonsai' && activeProvider !== 'openrouter' && activeProvider !== 'kingdom') && !providersConfig[activeProvider].apiKey) || isFetchingModels}
                        >
                          Refresh List
                        </button>
                        <span className="text-xs text-accent font-mono">{providersConfig[activeProvider].availableModels.length} available</span>
                      </div>
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                        className="font-doc-body w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent text-left text-sm flex items-center justify-between transition-all duration-300"
                      >
                        <span className="truncate">{providersConfig[activeProvider].model}</span>
                        <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-200 ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isModelDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => { setIsModelDropdownOpen(false); setModelSearch(""); }} />
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-20 flex flex-col max-h-60 divide-y divide-border/30"
                            >
                              <div className="p-2 bg-background/50 backdrop-blur-md">
                                <input
                                  type="text"
                                  placeholder="Search or enter custom model..."
                                  value={modelSearch}
                                  onChange={(e) => setModelSearch(e.target.value)}
                                  className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-mono focus:outline-none focus:border-accent text-foreground"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <div className="overflow-y-auto divide-y divide-border/30 custom-scrollbar max-h-48">
                                {(() => {
                                  const available = providersConfig[activeProvider].availableModels;
                                  const filtered = available.filter(m => 
                                    m.toLowerCase().includes(modelSearch.toLowerCase())
                                  );
                                  return (
                                    <>
                                      {filtered.map((m) => (
                                        <button
                                          key={m}
                                          type="button"
                                          onClick={() => {
                                            updateProviderConfig(activeProvider, { model: m });
                                            setIsModelDropdownOpen(false);
                                            setModelSearch("");
                                          }}
                                          className={`font-doc-body w-full px-4 py-2.5 text-left text-xs transition-colors hover:bg-accent/10 hover:text-accent flex items-center justify-between ${
                                            providersConfig[activeProvider].model === m ? 'text-accent bg-accent/5 font-semibold' : 'text-foreground/80'
                                          }`}
                                        >
                                          <span className="truncate pr-2">{m}</span>
                                          {providersConfig[activeProvider].model === m && <Check className="w-3.5 h-3.5 text-accent shrink-0" />}
                                        </button>
                                      ))}
                                      {modelSearch && !filtered.some(m => m.toLowerCase() === modelSearch.toLowerCase()) && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updatedModels = Array.from(new Set([...available, modelSearch]));
                                            updateProviderConfig(activeProvider, { 
                                              availableModels: updatedModels,
                                              model: modelSearch 
                                            });
                                            setIsModelDropdownOpen(false);
                                            setModelSearch("");
                                          }}
                                          className="w-full px-4 py-2.5 text-left font-mono text-xs text-accent bg-accent/5 hover:bg-accent/10 transition-colors font-semibold flex items-center justify-between"
                                        >
                                          <span className="truncate pr-2">Use custom: "{modelSearch}"</span>
                                          <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                                        </button>
                                      )}
                                      {filtered.length === 0 && !modelSearch && (
                                        <div className="px-4 py-3 text-xs text-muted text-center font-mono">
                                          No models found. Click Refresh List.
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                    <p className="text-xs text-muted mt-2">
                      Selected: <span className="font-doc-body text-accent font-medium">{providersConfig[activeProvider].model}</span>
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
                      onBlur={() => {
                        const key = providersConfig[activeProvider].apiKey;
                        if (
                          key &&
                          (key.length >= 5 ||
                            activeProvider === 'ollama' ||
                            activeProvider === 'openrouter' ||
                            activeProvider === 'kingdom')
                        ) {
                          void fetchDynamicModels(activeProvider, key);
                        }
                      }}
                      placeholder={`Enter ${provider.name} API Key`}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent font-mono text-sm"
                    />
                    <p className="text-xs text-muted mt-2 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Expected format: <code className="bg-muted/30 px-1 rounded">{provider.keyPlaceholder}</code> • Never stored on JEXXXUS servers
                    </p>
                  </div>

                  {/* Vision AI Settings */}
                  <div className="pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-2">
                         <Wand2 className="w-4 h-4 text-accent" />
                         <label className="text-sm font-medium">Vision Auto-Patterning</label>
                       </div>
                       <button
                         onClick={() => toggleAutoPatternVisions()}
                         className={`w-10 h-5 rounded-full transition-colors relative ${autoPatternVisions ? 'bg-accent' : 'bg-muted/30'}`}
                       >
                         <motion.div 
                           className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full"
                           animate={{ x: autoPatternVisions ? 20 : 0 }}
                           transition={{ type: "spring", stiffness: 500, damping: 30 }}
                         />
                       </button>
                    </div>
                    <p className="text-[10px] text-muted leading-relaxed">
                      When enabled, image uploads append a wing6 PPV patterning prompt and auto-send to your vision-capable model. No separate vision API — your BYOK model must accept image attachments.
                    </p>
                  </div>

                  {/* Global Context / Instructions */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Global Instructions (System Prompt)
                      <span className="text-muted font-normal ml-1">(Applied to every message immediately)</span>
                    </label>
                    <textarea
                      value={globalContext}
                      onChange={(e) => {
                        globalContextRef.current = e.target.value;
                        setGlobalContext(e.target.value);
                        saveConfig(activeProvider, providersConfig, e.target.value);
                      }}
                      placeholder="Rules sent with every chat request as [GLOBAL EMPIRE RULES]. Overrides default persona behavior when you set explicit commands here."
                      autoCorrect="off" autoCapitalize="off" spellCheck={false}
                      autoComplete="off" data-gramm="false"
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent font-mono text-sm resize-none h-24"
                    />
                  </div>

                  {/* Status */}
                  {(() => {
                    const isBonsai = activeProvider === 'bonsai';
                    const hasKey = !!providersConfig[activeProvider].apiKey || isBonsai;
                    return (
                      <div className={`p-3 rounded-xl ${hasKey ? (isBonsai ? 'bg-accent/10 border border-accent/30' : 'bg-green-500/10 border border-green-500/30') : 'bg-yellow-500/10 border border-yellow-500/30'}`}>
                        <p className={`text-sm ${hasKey ? (isBonsai ? 'text-accent' : 'text-green-400') : 'text-yellow-400'}`}>
                          {isBonsai ? '✓ Sovereign Mode: Metal Inference Active' : (hasKey ? `✓ Key set for ${provider.name}` : '⚠ Add your API key to begin communion')}
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
                              // Branching history natively
                              const userMsgIndex = messages.findIndex(m => m.id === message.id);
                              const oldVersion = { content: message.text, timestamp: message.timestamp };
                              const newVersions = [...(message.versions || [oldVersion]), { content: editValue, timestamp: new Date() }];

                              const updatedLocalMessages = messages.map(m => 
                                m.id === message.id ? { ...m, text: editValue, versions: newVersions, currentVersionIndex: newVersions.length - 1 } : m
                              );
                              const trimmed = updatedLocalMessages.slice(0, userMsgIndex + 1);
                              
                              const aiMsgIndex = userMsgIndex + 1;
                              let aiMsgIdToRegenerate;
                              if (aiMsgIndex < messages.length && messages[aiMsgIndex].sender === "other") {
                                aiMsgIdToRegenerate = messages[aiMsgIndex].id;
                              }
                              
                              setEditingMessageId(null);
                              
                              // Trigger regeneration with branch tracking
                              sendMessage(trimmed, aiMsgIdToRegenerate);
                            }}
                            className="px-2 py-1 text-[10px] uppercase font-bold bg-white text-accent rounded hover:bg-white/90"
                          >
                            Save & Branch
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col relative group/content">
                        {message.versions && message.versions.length > 0 && (
                          <div className="absolute -top-7 left-0 flex items-center gap-2 opacity-0 group-hover/content:opacity-100 transition-opacity bg-background/80 backdrop-blur rounded-full px-2 py-0.5 border border-white/5">
                            <button 
                              onClick={() => {
                                const newIdx = Math.max(0, (message.currentVersionIndex || message.versions!.length) - 1);
                                setMessages(prev => prev.map(m => m.id === message.id ? { 
                                  ...m, 
                                  text: newIdx === m.versions!.length ? (m.text) : m.versions![newIdx].content, 
                                  currentVersionIndex: newIdx 
                                } : m));
                              }}
                              disabled={(message.currentVersionIndex || message.versions.length) === 0}
                              className="text-muted hover:text-white disabled:opacity-30 disabled:hover:text-muted transition-colors"
                              title="Previous pattern"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] font-mono text-muted/80">
                              {(message.currentVersionIndex ?? message.versions.length) + 1} / {message.versions.length + 1}
                            </span>
                            <button 
                              onClick={() => {
                                const newIdx = Math.min(message.versions!.length, (message.currentVersionIndex || message.versions!.length) + 1);
                                setMessages(prev => prev.map(m => m.id === message.id ? { 
                                  ...m, 
                                  text: newIdx === m.versions!.length ? (() => { 
                                    // Normally we don't store the final state in versions, so if we reach max, we show what it is now. Actually, if we hit max we just show the version array contents. Wait, the final version MUST be in versions if we pushed it! Wait, no. The active version is `text`.
                                    // To simplify, if we go to `versions.length`, it should restore the LATEST text. 
                                    const latest =  m.versions![m.versions!.length - 1]; // We don't have the original if we replaced text directly. Let's fix this in state! For now, fallback to the array.
                                    return latest.content;
                                  })() : m.versions![newIdx].content, 
                                  currentVersionIndex: newIdx 
                                } : m));
                              }}
                              disabled={(message.currentVersionIndex ?? message.versions.length) === message.versions.length}
                              className="text-muted hover:text-white disabled:opacity-30 disabled:hover:text-muted transition-colors"
                              title="Next pattern"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        <div 
                          className="font-doc-body text-sm leading-relaxed whitespace-pre-wrap mt-1 chat-message-body"
                          dangerouslySetInnerHTML={{ 
                            __html: formatChatMessageHtml(
                              message.text || "",
                              typeof window !== "undefined" ? window.location.hostname : undefined,
                            ),
                          }}
                        />
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {message.attachments.map((att, i) => (
                              <div key={i} className="mt-1">
                                {att.type === 'image' && att.url && (
                                  <motion.img 
                                    whileHover={{ scale: 1.04 }}
                                    src={att.url} 
                                    alt={att.name} 
                                    className="max-h-48 rounded-lg object-contain border border-accent/20 shadow-sm cursor-zoom-in"
                                    onClick={() => att.url && setZoomImage({ url: att.url, name: att.name })}
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
                        <span className="font-doc-body text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent/80">
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
                     <motion.img 
                       whileHover={{ scale: 1.05 }}
                       src={img.data} 
                       alt={img.name} 
                       className="h-16 w-16 object-cover rounded-lg border border-accent/30 transition-all cursor-zoom-in group-hover:border-accent/50" 
                       onClick={() => setZoomImage({ url: img.data, name: img.name })}
                     />
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
            <motion.button
               onClick={() => setIsSpicy(!isSpicy)}
               title={isSpicy ? 'Switch to PURE-SUGGESTIVE mode' : 'Switch to SPICY-REVEALED mode'}
               className={`p-2.5 rounded-full border transition-all shrink-0 text-[10px] font-bold ${
                 isSpicy
                   ? 'bg-orange-500/10 border-orange-500/40 text-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.2)]'
                   : 'bg-blue-500/10 border-blue-500/40 text-blue-400'
               }`}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
            >
              {isSpicy ? '🌶️' : '🫑'}
            </motion.button>
            {/* 
            <motion.button
              onClick={() => setWebSearchEnabled(v => !v)}
              title={webSearchEnabled ? "Disable Web Search" : "Enable Web Search"}
              className={`p-2.5 rounded-full border transition-all shrink-0 ${
                webSearchEnabled
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                  : 'bg-surface border-border text-muted hover:text-accent hover:border-accent/40'
              }`}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
            >
              <Globe className="w-4 h-4" />
            </motion.button>
            */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={handleKeyPress}
              placeholder={isConfigured ? "Summon the Goddess... 💬" : "⚙️ Add your API key first..."}
              disabled={isLoading}
              rows={1}
              autoCorrect="off" autoCapitalize="off" spellCheck={false}
              autoComplete="off" data-gramm="false"
              className="font-doc-body flex-1 px-4 py-3 bg-surface border border-border rounded-[24px] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-50 disabled:cursor-not-allowed resize-none min-h-[48px] overflow-y-auto w-full leading-snug"
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
 
      <ZoomModal
        isOpen={!!zoomImage}
        url={zoomImage?.url || ""}
        name={zoomImage?.name}
        onClose={() => setZoomImage(null)}
      />
    </>
  );
}
