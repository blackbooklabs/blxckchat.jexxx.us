import { create } from 'zustand';
export interface TTSVoice {
  pitch: number;
  rate: number;
  voiceName?: string;
  lang?: string;
}

export interface MessageAttachment {
  type: 'image' | 'file' | 'pdf' | 'code';
  mimeType: string;
  name: string;
  url?: string;
  size?: number;
  previewUrl?: string;
}

export interface MessageVersion {
  content: string;
  timestamp: Date;
  model?: string;
  provider?: string;
  editedFromId?: string;
}

export interface Message {
  id: string;
  text: string; // active/current version text
  sender: "user" | "other";
  timestamp: Date;
  isStreaming?: boolean;
  modelUsed?: string;
  providerUsed?: string;
  attachments?: MessageAttachment[];
  versions?: MessageVersion[];
  currentVersionIndex?: number;
}

export interface PersonaPreset {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  safe_content: string;    // The full system prompt (Safe)
  spicy_content: string | null; // The full system prompt (Spicy)
  safe_excerpt?: string;   // UI-only short summary
  spicy_excerpt?: string;  // UI-only short summary (Spicy)
  content: string;
  isCustom?: boolean;   // true = user-created, false = system preset
  isLocked?: boolean;   // true = preset, cannot be edited/deleted
  tts_voice?: TTSVoice;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  custom_instructions: string;
  context_json: any;
  created_at: string;
  updated_at: string;
  chats?: Chat[];
  tts_voice?: TTSVoice;
}

export interface Chat {
  id: string;
  project_id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

interface ChatState {
  projects: Project[];
  personas: PersonaPreset[];
  currentProjectId: string | null;
  currentChatId: string | null;
  messages: Message[];
  isProjectsLoading: boolean;
  isChatsLoading: boolean;
  isPersonasLoading: boolean;
  invokingPersonaId: string | null;

  // Actions
  setProjects: (projects: Project[]) => void;
  setCurrentProjectId: (id: string | null) => void;
  setInvokingPersonaId: (id: string | null) => void;

  setCurrentChatId: (id: string | null) => void;
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  setActivePersona: (projectId: string, personaId: string, contentOverride?: string) => Promise<void>;
  
  // Async thunks (fetching)
  fetchProjects: () => Promise<void>;
  fetchPersonas: () => Promise<void>;
  createProject: (title: string, custom_instructions?: string) => Promise<Project | null>;
  fetchChats: (projectId: string) => Promise<void>;
  createChat: (projectId: string, title?: string, initialMessages?: Message[]) => Promise<Chat | null>;
  updateChatMessages: (chatId: string, messages: Message[]) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  updateProjectTitle: (projectId: string, title: string) => Promise<void>;
  updateProjectInstructions: (projectId: string, instructions: string) => Promise<void>;
  updateProjectTTS: (projectId: string, tts_voice: TTSVoice) => Promise<void>;
  updateChatTitle: (chatId: string, title: string) => Promise<void>;
  autoRenameChat: (chatId: string, firstMessage: string) => Promise<void>;
  fetchCustomPersonas: () => Promise<void>;
  restoreLastSession: (userId: string) => void;
  saveSession: (userId: string, projectId: string, chatId: string) => void;
  createCustomPersona: (p: { name: string; icon: string; tagline: string; safe_content: string; spicy_content: string; tts_voice?: TTSVoice }) => Promise<void>;
  updateCustomPersona: (id: string, p: Partial<{ name: string; icon: string; tagline: string; safe_content: string; spicy_content: string; tts_voice: TTSVoice }>) => Promise<void>;
  deleteCustomPersona: (id: string) => Promise<void>;
  deleteMessagesAfter: (chatId: string, messageId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  projects: [],
  personas: [],
  currentProjectId: null,
  currentChatId: null,
  messages: [],
  isProjectsLoading: false,
  isChatsLoading: false,
  isPersonasLoading: false,
  invokingPersonaId: null,

  setProjects: (projects) => set({ projects }),
  setCurrentProjectId: (id) => set({ currentProjectId: id }),
  setInvokingPersonaId: (id) => set({ invokingPersonaId: id }),
  setCurrentChatId: (id) => set({ currentChatId: id }),
  setMessages: (messages) => set((state) => ({
    messages: typeof messages === 'function' ? messages(state.messages) : messages
  })),

  saveSession: (userId, projectId, chatId) => {
    try {
      localStorage.setItem(
        `blxckchat-session-${userId}`,
        JSON.stringify({ projectId, chatId, ts: Date.now() })
      );
    } catch (_) {}
  },

  restoreLastSession: (userId) => {
    try {
      const raw = localStorage.getItem(`blxckchat-session-${userId}`);
      if (!raw) return;
      const { projectId, chatId } = JSON.parse(raw);
      const { projects } = get();
      const project = projects.find(p => p.id === projectId);
      if (!project) return;
      const chat = project.chats?.find(c => c.id === chatId);
      const msgs = hydrateMessages(chat?.messages ?? []);
      set({ currentProjectId: projectId, currentChatId: chatId, messages: msgs });
    } catch (_) {}
  },


  fetchProjects: async () => {
    set({ isProjectsLoading: true });
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const text = await res.text();
        const data = text ? JSON.parse(text) : [];
        if (Array.isArray(data)) {
          const hydrated = data.map((p: any) => ({
            ...p,
            tts_voice: p.context_json?.tts_voice as TTSVoice || undefined
          }));
          set({ projects: hydrated });
        }
      }
    } catch (e) {
      console.error('Failed to fetch projects', e);
    } finally {
      set({ isProjectsLoading: false });
    }
  },

  fetchPersonas: async () => {
    set({ isPersonasLoading: true });
    try {
      const res = await fetch('/api/personas');
      if (res.ok) {
        const data = await res.json();
        const presets = (data.personas || []).map((p: PersonaPreset) => {
          let tts_voice: TTSVoice = { pitch: 1.0, rate: 1.0, lang: "en-US" };
          
          if (p.name.includes('Luna Verde')) {
            tts_voice = { pitch: 0.92, rate: 0.94, voiceName: "Google UK English Female", lang: "en-GB" };
          } else if (p.name.includes('Lil\' Bible')) {
            tts_voice = { pitch: 0.78, rate: 0.92, voiceName: "Google UK English Male", lang: "en-GB" };
          } else if (p.name.includes('Bathsheba')) {
            tts_voice = { pitch: 1.12, rate: 0.88, voiceName: "Google UK English Female", lang: "en-GB" };
          } else if (p.name.includes('DRIZL')) {
            tts_voice = { pitch: 0.58, rate: 1.02, voiceName: "Google US English Male", lang: "en-US" };
          } else if (p.name.includes('SolomonAI')) {
            tts_voice = { pitch: 0.85, rate: 0.96, voiceName: "Google US English Male", lang: "en-US" };
          } else if (p.name.includes('Xena') || p.name.includes('Venus')) {
            tts_voice = { pitch: 1.05, rate: 0.98, voiceName: "Google UK English Female", lang: "en-GB" };
          }

          return {
            ...p,
            isCustom: false,
            isLocked: true,
            tts_voice
          };
        });
        set((state) => {
          // Keep custom ones, replace presets
          const customs = state.personas.filter(p => p.isCustom);
          return { personas: [...presets, ...customs] };
        });
      }
    } catch (e) {
      console.error('Failed to fetch personas', e);
    } finally {
      set({ isPersonasLoading: false });
    }
  },

  setActivePersona: async (projectId: string, personaId: string, contentOverride?: string) => {
    const state = get();
    const persona = state.personas.find(p => p.id === personaId);
    if (!persona) return;
    
    // Use client-provided content (with spicy appended) if supplied, else fall back to safe_content
    const content = contentOverride ?? persona.safe_content ?? '';
    await state.updateProjectInstructions(projectId, content);
    
    // Automatically apply persona's TTS settings to the project
    if (persona.tts_voice) {
      await state.updateProjectTTS(projectId, persona.tts_voice);
    }

    // Fire-and-forget analytics event — non-blocking
    fetch('/api/admin/divinity-analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personaId: personaId,
        projectId,
        eventType: 'persona_selected',
      }),
    }).catch(() => {}); // silent fail — empire must not stall for tracking
  },

  createProject: async (title: string, custom_instructions: string = '') => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, custom_instructions })
      });
      if (res.ok) {
        const text = await res.text();
        const newProject = text ? JSON.parse(text) : null;
        if (newProject) {
          set((state) => ({ projects: [newProject, ...state.projects] }));
          return newProject;
        }
      } else {
        const errText = await res.text();
        console.error(`[createProject] ${res.status} ${res.statusText}:`, errText);
        // Surface the error to the user
        alert(`⚠️ Failed to create project (${res.status}): ${errText || res.statusText}`);
      }
    } catch (e) {
      console.error('Failed to create project', e);
      alert('⚠️ Network error creating project. Check console.');
    }
    return null;
  },

  fetchChats: async (projectId: string) => {
    set({ isChatsLoading: true }); // Clear previous chats while loading
    try {
      const res = await fetch(`/api/chats?projectId=${projectId}`);
      if (res.ok) {
         const text = await res.text();
         const data = text ? JSON.parse(text) : [];
          if (Array.isArray(data)) {
            const hydratedData = data.map(chat => ({
              ...chat,
              messages: hydrateMessages(chat.messages || [])
            }));
            set((state) => ({
              projects: state.projects.map(p => p.id === projectId ? { ...p, chats: hydratedData } : p)
            }));
          }
      }
    } catch (e) {
      console.error('Failed to fetch chats', e);
    } finally {
      set({ isChatsLoading: false });
    }
  },

  createChat: async (projectId: string, title: string = 'New Chat', initialMessages: Message[] = []) => {
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, title, messages: initialMessages })
      });
      if (res.ok) {
        const text = await res.text();
        const newChat = text ? JSON.parse(text) : null;
        if (newChat) {
           const hydratedMessages = hydrateMessages(newChat.messages || []);
           set((state) => ({
             projects: state.projects.map(p => p.id === projectId ? { ...p, chats: [{ ...newChat, messages: hydratedMessages }, ...(p.chats || [])] } : p),
             currentChatId: newChat.id,
             messages: hydratedMessages
           }));
           return newChat;
        }
      }
    } catch (e) {
      console.error('Failed to create chat', e);
    }
    return null;
  },

  updateChatMessages: async (chatId: string, messages: Message[]) => {
    try {
      // Optimistic update
      set((state) => ({
        projects: state.projects.map(p => ({
          ...p,
          chats: p.chats?.map(c => c.id === chatId ? { ...c, messages, updated_at: new Date().toISOString() } : c)
        }))
      }));
      
      const res = await fetch('/api/chats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: chatId, messages })
      });
      if (!res.ok) console.error('Failed to sync chat messages to DB');
    } catch (e) {
      console.error('Error updating chat', e);
    }
  },
  
  deleteProject: async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects?id=${projectId}`, { method: 'DELETE' });
      if (res.ok) {
        set((state) => ({
          projects: state.projects.filter(p => p.id !== projectId),
          currentProjectId: state.currentProjectId === projectId ? null : state.currentProjectId,

          currentChatId: state.currentProjectId === projectId ? null : state.currentChatId
        }));
      }
    } catch (e) {
      console.error('Failed to delete project', e);
    }
  },

  deleteChat: async (chatId: string) => {
    try {
      const res = await fetch(`/api/chats?id=${chatId}`, { method: 'DELETE' });
      if (res.ok) {
         set((state) => ({
           projects: state.projects.map(p => ({
             ...p,
             chats: p.chats?.filter(c => c.id !== chatId)
           })),
           currentChatId: state.currentChatId === chatId ? null : state.currentChatId,
           messages: state.currentChatId === chatId ? [] : state.messages
         }));
      }
    } catch (e) {
      console.error('Failed to delete chat', e);
    }
  },

  updateProjectInstructions: async (projectId: string, custom_instructions: string) => {
     try {
       set((state) => ({
         projects: state.projects.map(p => p.id === projectId ? { ...p, custom_instructions } : p)
       }));
       const res = await fetch('/api/projects', {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ id: projectId, custom_instructions })
       });
       if (!res.ok) console.error('Failed to sync instructions to DB');
     } catch (e) {
       console.error('Error updating instructions', e);
     }
  },

  updateProjectTTS: async (projectId: string, tts_voice: TTSVoice) => {
    try {
      const { projects } = get();
      const project = projects.find(p => p.id === projectId);
      const context_json = { ...(project?.context_json || {}), tts_voice };
      
      set((state) => ({
        projects: state.projects.map(p => p.id === projectId ? { ...p, tts_voice, context_json } : p)
      }));

      const res = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, context_json })
      });
      if (!res.ok) console.error('Failed to sync project TTS to DB');
    } catch (e) {
      console.error('Error updating project TTS', e);
    }
  },

  updateProjectTitle: async (projectId: string, title: string) => {
    try {
      set((state) => ({
        projects: state.projects.map(p => p.id === projectId ? { ...p, title } : p)
      }));
      const res = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, title })
      });
      if (!res.ok) console.error('Failed to rename project in DB');
    } catch (e) {
      console.error('Error updating project title', e);
    }
  },

  updateChatTitle: async (chatId, title) => {
    try {
      set((state) => ({
        projects: state.projects.map(p => ({
          ...p,
          chats: p.chats?.map(c => c.id === chatId ? { ...c, title } : c)
        }))
      }));
      const res = await fetch('/api/chats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: chatId, title })
      });
      if (!res.ok) console.error('Failed to update chat title in DB');
    } catch (e) {
      console.error('Failed to update chat title', e);
    }
  },

  autoRenameChat: async (chatId, firstMessage) => {
    // Generate a summary (first 6 words, max 40 chars)
    const words = firstMessage.trim().split(/\s+/);
    let summary = words.slice(0, 6).join(' ');
    if (summary.length > 40) summary = summary.substring(0, 37) + '...';
    else if (words.length > 6) summary += '...';
    
    if (summary) {
      await get().updateChatTitle(chatId, summary);
    }
  },

  fetchCustomPersonas: async () => {
    try {
      const res = await fetch('/api/custom-personas');
      if (!res.ok) return;
      const data = await res.json();
      const customs = Array.isArray(data) ? data : (data.personas || []);
      const customMapped: PersonaPreset[] = (customs ?? []).map((c: any) => ({
        id: c.id,
        name: c.name,
        tagline: c.tagline || '',
        icon: c.icon || '🪽',
        safe_content: c.safe_content || '',
        spicy_content: c.spicy_content || null,
        safe_excerpt: c.tagline || '', 
        spicy_excerpt: '', 
        content: c.safe_content || '',
        isCustom: true,
        isLocked: false,
        tts_voice: c.tts_voice as TTSVoice,
      }));
      // Merge: presets first (isLocked), customs after
      set((state) => {
        const presets = state.personas.filter(p => !p.isCustom);
        return { personas: [...presets, ...customMapped] };
      });
    } catch (e) {
      console.error('Failed to fetch custom personas', e);
    }
  },

  createCustomPersona: async (p: any) => {
    try {
      const res = await fetch('/api/custom-personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      });
      if (res.ok) {
        await get().fetchCustomPersonas();
      } else {
        const err = await res.json();
        alert(`⚠️ ${err.error}`);
      }
    } catch (e) {
      console.error('Failed to create custom persona', e);
    }
  },

  updateCustomPersona: async (id, p: any) => {
    try {
      const res = await fetch('/api/custom-personas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...p }),
      });
      if (res.ok) {
        await get().fetchCustomPersonas();
      }
    } catch (e) {
      console.error('Failed to update custom persona', e);
    }
  },

  deleteCustomPersona: async (id) => {
    try {
      const res = await fetch(`/api/custom-personas?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        set((state) => ({ personas: state.personas.filter(p => p.id !== id) }));
      }
    } catch (e) {
      console.error('Failed to delete custom persona', e);
    }
  },

  deleteMessagesAfter: async (chatId, messageId) => {
    const { projects, updateChatMessages } = get();
    // Find the project and chat
    let targetChat: Chat | undefined;
    for (const p of projects) {
      const found = p.chats?.find(c => c.id === chatId);
      if (found) {
        targetChat = found;
        break;
      }
    }

    if (!targetChat) return;

    const msgIndex = targetChat.messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;

    // Truncate messages: keep everything up to (and including) the message we're editing
    const newMessages = targetChat.messages.slice(0, msgIndex + 1);

    // Update locally and in Supabase
    await updateChatMessages(chatId, newMessages);

    // If this is the current chat, update the active message list too
    if (get().currentChatId === chatId) {
      set({ messages: newMessages });
    }
  },
}));

function hydrateMessages(messages: any[]): Message[] {
  return (messages || []).map(m => ({
    ...m,
    text: m.text || m.content || "",
    timestamp: m.timestamp instanceof Date ? m.timestamp : new Date(m.timestamp),
  }));
}
