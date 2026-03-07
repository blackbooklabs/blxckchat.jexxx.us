import { create } from 'zustand';
export interface Message {
  id: string;
  text: string;
  sender: "user" | "other";
  timestamp: Date;
  isStreaming?: boolean;
  modelUsed?: string;
  providerUsed?: string;
}

export interface PersonaPreset {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  safe_content: string;
  spicy_content: string | null;
  content: string;
  isCustom?: boolean;   // true = user-created, false = system preset
  isLocked?: boolean;   // true = preset, cannot be edited/deleted
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

  // Actions
  setProjects: (projects: Project[]) => void;
  setCurrentProjectId: (id: string | null) => void;

  setCurrentChatId: (id: string | null) => void;
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  setActivePersona: (projectId: string, personaId: string, contentOverride?: string) => Promise<void>;
  
  // Async thunks (fetching)
  fetchProjects: () => Promise<void>;
  fetchPersonas: () => Promise<void>;
  personasAuthenticated: boolean;
  createProject: (title: string, custom_instructions?: string) => Promise<Project | null>;
  fetchChats: (projectId: string) => Promise<void>;
  createChat: (projectId: string, title?: string, initialMessages?: Message[]) => Promise<Chat | null>;
  updateChatMessages: (chatId: string, messages: Message[]) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  updateProjectTitle: (projectId: string, title: string) => Promise<void>;
  updateProjectInstructions: (projectId: string, instructions: string) => Promise<void>;
  fetchCustomPersonas: () => Promise<void>;
  createCustomPersona: (p: { name: string; icon: string; tagline: string; safe_content: string; spicy_content: string }) => Promise<void>;
  updateCustomPersona: (id: string, p: Partial<{ name: string; icon: string; tagline: string; safe_content: string; spicy_content: string }>) => Promise<void>;
  deleteCustomPersona: (id: string) => Promise<void>;
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
  personasAuthenticated: false,

  setProjects: (projects) => set({ projects }),
  setCurrentProjectId: (id) => set({ currentProjectId: id }),

  setCurrentChatId: (id) => set({ currentChatId: id }),
  setMessages: (messages) => set((state) => ({
    messages: typeof messages === 'function' ? messages(state.messages) : messages
  })),

  fetchProjects: async () => {
    set({ isProjectsLoading: true });
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const text = await res.text();
        const data = text ? JSON.parse(text) : [];
        if (Array.isArray(data)) {
          set({ projects: data });
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
        const presets = (data.personas || []).map((p: PersonaPreset) => ({
          ...p,
          isCustom: false,
          isLocked: true,
        }));
        set({ personas: presets });
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
           set((state) => ({
             projects: state.projects.map(p => p.id === projectId ? { ...p, chats: data } : p)
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
           set((state) => ({
             projects: state.projects.map(p => p.id === projectId ? { ...p, chats: [newChat, ...(p.chats || [])] } : p),
             currentChatId: newChat.id,
             messages: newChat.messages || []
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

  fetchCustomPersonas: async () => {
    try {
      const res = await fetch('/api/custom-personas');
      if (!res.ok) return;
      const customs = await res.json();
      const customMapped: PersonaPreset[] = (customs ?? []).map((c: Record<string, unknown>) => ({
        id: c.id as string,
        name: c.name as string,
        tagline: (c.tagline as string) || '',
        icon: (c.icon as string) || '🪽',
        safe_content: (c.safe_content as string) || '',
        spicy_content: (c.spicy_content as string) || null,
        content: (c.safe_content as string) || '',
        isCustom: true,
        isLocked: false,
      }));
      // Merge: presets first (isLocked), customs after
      set((state) => {
        const presets = state.personas.filter(p => p.isLocked !== false);
        return { personas: [...presets, ...customMapped] };
      });
    } catch (e) {
      console.error('Failed to fetch custom personas', e);
    }
  },

  createCustomPersona: async (p) => {
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

  updateCustomPersona: async (id, p) => {
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
}));
