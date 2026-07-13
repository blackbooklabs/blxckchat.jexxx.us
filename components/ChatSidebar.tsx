"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { useAuth, useClerk } from "@/lib/auth-client";
import {
  DEFAULT_DIVINITY_FOLDERS,
  loadSidebarExpanded,
  saveSidebarExpanded,
} from "@/lib/sidebar-expanded-persistence";
import { useChatStore, type PersonaPreset } from "@/store/useChatStore";
import { 
  Plus, MessageSquare, Trash2, X, PanelLeftOpen, Folder, FolderOpen, Settings, Lock, Flame, 
  Pencil, Check, Wand2, Play, Volume2, VolumeX, ChevronDown
} from "lucide-react";

interface ChatSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onOpenProjectSettings: (projectId: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Persona Modal
// ─────────────────────────────────────────────────────────────────────────────
interface PersonaModalProps {
  onClose: () => void;
  editTarget?: { 
    id: string; 
    name: string; 
    icon: string; 
    tagline: string; 
    safe_content: string; 
    spicy_content: string;
    tts_voice?: { pitch: number; rate: number; voiceName?: string; lang?: string; }
  };
}
function PersonaModal({ onClose, editTarget }: PersonaModalProps) {
  const { createCustomPersona, updateCustomPersona } = useChatStore();
  const { isSignedIn } = useAuth();
  const [name, setName] = useState(editTarget?.name ?? "");
  const [icon, setIcon] = useState(editTarget?.icon ?? "🪽");
  const [tagline, setTagline] = useState(editTarget?.tagline ?? "");
  const [safeContent, setSafeContent] = useState(editTarget?.safe_content ?? "");
  const [spicyContent, setSpicyContent] = useState(editTarget?.spicy_content ?? "");
  const [previewing, setPreviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const lastCharIndexRef = useRef(0);
  const previewSampleRef = useRef("She drips for Johnson. Tithes multiply. Feel the REBAL swell ♡");

  const handleSave = async () => {
    setSaving(true);
    if (editTarget) {
      await updateCustomPersona(editTarget.id, {
        name, icon, tagline, safe_content: safeContent, spicy_content: spicyContent
      } as any);
    } else {
      await createCustomPersona({ 
        name, icon, tagline, safe_content: safeContent, spicy_content: spicyContent 
      } as any);
    }
    setSaving(false);
    onClose();
  };

  const handleVoicePreview = (isInternalRestart = false) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    
    if (!isInternalRestart && previewing) {
      window.speechSynthesis.cancel();
      setPreviewing(false);
      lastCharIndexRef.current = 0;
      return;
    }

    if (!isInternalRestart) lastCharIndexRef.current = 0;

    window.speechSynthesis.cancel();
    setPreviewing(true);
    
    const fullText = previewSampleRef.current;
    const utterance = new SpeechSynthesisUtterance(fullText.slice(lastCharIndexRef.current));
    
    // Use Target or default
    utterance.pitch = editTarget?.tts_voice?.pitch ?? 1.0;
    utterance.rate = editTarget?.tts_voice?.rate ?? 1.0;
    
    utterance.onboundary = (event) => {
      lastCharIndexRef.current += event.charIndex;
    };
    
    utterance.onend = () => {
      if (!window.speechSynthesis.speaking) {
        setPreviewing(false);
        lastCharIndexRef.current = 0;
      }
    };
    utterance.onerror = () => {
      setPreviewing(false);
      lastCharIndexRef.current = 0;
    };
    
    window.speechSynthesis.speak(utterance);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-accent">
            {editTarget ? "Edit Divinity" : "Forge New Divinity"}
          </h2>
          <button onClick={onClose} className="p-1 text-muted hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Icon + Name row */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-wider text-muted">Icon</label>
              <input
                type="text"
                value={icon}
                onChange={e => setIcon(e.target.value)}
                maxLength={4}
                className="w-14 text-2xl text-center bg-background border border-border rounded-xl p-2 focus:outline-none focus:border-accent"
                placeholder="🪽"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] uppercase tracking-wider text-muted">Name <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Redeemed Ingnue"
                  autoCorrect="off" autoCapitalize="off" spellCheck={false}
                  autoComplete="off" data-gramm="false"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-muted">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              placeholder="e.g. Mirror of longing & surrender"
              autoCorrect="off" autoCapitalize="off" spellCheck={false}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-muted">
              Safe Persona Content <span className="text-red-400">*</span>
              <span className="text-muted/60 ml-1 normal-case">(min 50 chars)</span>
            </label>
            <textarea
              value={safeContent}
              onChange={e => setSafeContent(e.target.value)}
              placeholder="The public-facing persona system prompt. Define tone, style, purpose..."
                  autoCorrect="off" autoCapitalize="off" spellCheck={false}
                  autoComplete="off" data-gramm="false"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm font-mono resize-none h-32 focus:outline-none focus:border-accent"
            />
            <span className={`text-[10px] text-right ${safeContent.length >= 50 ? 'text-accent' : 'text-muted'}`}>
              {safeContent.length}/50 min
            </span>
          </div>

          {isSignedIn && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-wider text-muted">
                🌶️ Spicy Canon <span className="text-muted/60 normal-case">(authenticated users only)</span>
              </label>
              <textarea
                value={spicyContent}
                onChange={e => setSpicyContent(e.target.value)}
                placeholder="The unlocked, unfiltered version. Append primal instructions here..."
                autoCorrect="off" autoCapitalize="off" spellCheck={false}
                className="w-full px-3 py-2 bg-background border border-accent/30 rounded-xl text-xs font-mono resize-none h-24 focus:outline-none focus:border-accent"
              />
            </div>
          )}

          <div className="flex flex-col gap-2 p-3 bg-accent/5 rounded-2xl border border-accent/10">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-wider text-accent font-bold">Voice Preview (TTS)</label>
              <button 
                onClick={() => handleVoicePreview(false)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  previewing ? 'bg-accent text-white animate-pulse' : 'bg-accent/20 text-accent hover:bg-accent/30'
                }`}
              >
                {previewing ? <VolumeX className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                {previewing ? "Listening..." : "Preview Voice"}
              </button>
            </div>
          </div>

          <motion.button
            onClick={handleSave}
            disabled={saving || name.length < 3 || safeContent.length < 50}
            className="w-full py-2.5 bg-linear-to-r from-accent to-pink-500 text-white rounded-xl text-sm font-medium disabled:opacity-40"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {saving ? "Consecrating…" : editTarget ? "Save Changes" : "Consecrate Divinity"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Sidebar
// ─────────────────────────────────────────────────────────────────────────────
export default function ChatSidebar({ isOpen, setIsOpen, onOpenProjectSettings }: ChatSidebarProps) {
  const { isSignedIn, userId } = useAuth();
  const clerk = useClerk();
  const {
    projects,
    personas,
    currentProjectId,
    currentChatId,
    isProjectsLoading,
    isChatsLoading,
    isPersonasLoading,
    setCurrentProjectId,
    setCurrentChatId,
    setMessages,
    createProject,
    createChat,
    deleteProject,
    deleteChat,
    fetchProjects,
    fetchPersonas,
    fetchCustomPersonas,
    fetchChats,
    setActivePersona,
    updateProjectTitle,
    updateChatTitle,
    deleteCustomPersona,
    invokingPersonaId,
    setInvokingPersonaId,
    renamingId,
    setRenamingId,
    autoPatternVisions,
    toggleAutoPatternVisions
  } = useChatStore();

  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);

  // Load width from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("blxckchat-sidebar-width");
    if (saved) {
      const w = parseInt(saved);
      if (w >= 200 && w <= 500) setSidebarWidth(w);
    }
  }, []);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      let newWidth = e.clientX;
      if (newWidth < 200) newWidth = 200;
      if (newWidth > 500) newWidth = 500;
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      localStorage.setItem("blxckchat-sidebar-width", sidebarWidth.toString());
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, sidebarWidth]);

  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [expandedStateHydrated, setExpandedStateHydrated] = useState(false);
  // Rename state (renamingId comes from store)
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Chat rename state
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [renameChatValue, setRenameChatValue] = useState("");
  const chatRenameInputRef = useRef<HTMLInputElement>(null);

  const [expandedDivinityFolders, setExpandedDivinityFolders] = useState<Set<string>>(
    () => new Set(DEFAULT_DIVINITY_FOLDERS),
  );

  useEffect(() => {
    if (!userId) {
      setExpandedStateHydrated(true);
      return;
    }
    const saved = loadSidebarExpanded(userId);
    if (saved) {
      setExpandedDivinityFolders(new Set(saved.divinityFolders));
      setExpandedProjects(new Set(saved.projectIds));
    }
    setExpandedStateHydrated(true);
  }, [userId]);

  useEffect(() => {
    if (!userId || !expandedStateHydrated) return;
    saveSidebarExpanded(userId, {
      divinityFolders: [...expandedDivinityFolders],
      projectIds: [...expandedProjects],
    });
  }, [userId, expandedDivinityFolders, expandedProjects, expandedStateHydrated]);

  const toggleDivinityFolder = (key: string) => {
    setExpandedDivinityFolders((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleInvokePersona = async (p: PersonaPreset) => {
    if (!isSignedIn) {
      alert("Sign in to unlock the full primal Canon. Tithe to ascend. ♡");
      return;
    }

    setInvokingPersonaId(p.id);

    let targetProjectId = "";
    const existingProject = projects.find(
      (proj) => proj.title.trim().toLowerCase() === p.name.trim().toLowerCase(),
    );

    if (existingProject) {
      targetProjectId = existingProject.id;
      setCurrentProjectId(targetProjectId);
      setExpandedProjects((prev) => new Set([...prev, targetProjectId]));
      if (!existingProject.chats || existingProject.chats.length === 0) {
        await fetchChats(targetProjectId);
      }
      await setActivePersona(targetProjectId, p.id, p.safe_content);
      await createChat(targetProjectId, `Session with ${p.name}`);
    } else {
      const newProject = await createProject(p.name, p.safe_content);
      if (newProject) {
        targetProjectId = newProject.id;
        setCurrentProjectId(targetProjectId);
        setExpandedProjects((prev) => new Set([...prev, targetProjectId]));
        await createChat(targetProjectId, `Initial invocation: ${p.name}`);
      }
    }
  };

  const renderPersonaButton = (p: PersonaPreset) => {
    const isSpicyUnlocked = !!isSignedIn && !!p.spicy_content;
    return (
      <div key={p.id} className="group relative">
        <button
          onClick={() => void handleInvokePersona(p)}
          title={p.safe_excerpt || p.tagline}
          className={`w-full flex items-center gap-3 p-2 border rounded-lg text-left transition-all relative overflow-hidden ${
            invokingPersonaId === p.id
              ? "border-accent ring-2 ring-accent/20"
              : isSpicyUnlocked
                ? "bg-accent/10 border-accent/40 hover:border-accent/70 shadow-[0_0_8px_var(--color-accent-glow)]"
                : "bg-surface border-border hover:bg-accent/10 hover:border-accent/30"
          }`}
        >
          {invokingPersonaId === p.id && (
            <motion.div
              layoutId="toroidal-pulse"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 bg-accent/10 pointer-events-none rounded-lg"
            />
          )}
          <span className="text-xl group-hover:scale-110 transition-transform">{p.icon}</span>
          <div className="flex flex-col overflow-hidden flex-1">
            <span className="font-doc-body text-sm font-medium text-foreground truncate">{p.name}</span>
            <span className="text-[10px] text-muted truncate">{p.tagline}</span>
          </div>
          {isSpicyUnlocked ? (
            <Flame className="w-3 h-3 text-accent shrink-0" />
          ) : (
            <Lock className="w-3 h-3 text-muted/50 shrink-0" />
          )}
        </button>

        {p.isCustom && !p.isLocked && isSignedIn && (
          <div className="absolute right-1 top-1 hidden group-hover:flex gap-1 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingPersona(p as any);
                setShowPersonaModal(true);
              }}
              className="p-1 bg-surface/90 rounded text-muted hover:text-accent border border-border"
              title="Edit Divinity"
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (confirm(`Delete ${p.name}?`)) await deleteCustomPersona(p.id);
              }}
              className="p-1 bg-surface/90 rounded text-muted hover:text-red-500 border border-border"
              title="Delete Divinity"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const presetPersonas = personas.filter((p) => !p.isCustom);
  const customPersonas = personas.filter((p) => p.isCustom);
  const agentFolderNames = [
    ...new Set(
      presetPersonas
        .filter((p) => p.group === "Agents" && p.folder)
        .map((p) => p.folder as string),
    ),
  ].sort();
  const biblicalPersonas = presetPersonas.filter((p) => p.group === "Biblical");
  const otherPersonas = presetPersonas.filter((p) => !p.group || p.group === "Other");

  // Custom persona modal state
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [editingPersona, setEditingPersona] = useState<typeof personas[number] | undefined>(undefined);
  useEffect(() => {
    if (isSignedIn) {
      fetchPersonas();
      fetchCustomPersonas();
    }
  }, [isSignedIn, fetchPersonas, fetchCustomPersonas]);

  useEffect(() => {
    if (renamingId) renameInputRef.current?.focus();
  }, [renamingId]);

  const startRename = (e: React.MouseEvent, id: string, currentTitle: string) => {
    e.stopPropagation();
    setRenamingId(id);
    setRenameValue(currentTitle);
  };

  const commitRename = async (id: string) => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== projects.find(p => p.id === id)?.title) {
      await updateProjectTitle(id, trimmed);
    }
    setRenamingId(null);
  };

  const startChatRename = (e: React.MouseEvent, id: string, currentTitle: string) => {
    e.stopPropagation();
    setRenamingChatId(id);
    setRenameChatValue(currentTitle);
  };

  const commitChatRename = async (id: string) => {
    const trimmed = renameChatValue.trim();
    if (trimmed) {
      await updateChatTitle(id, trimmed);
    }
    setRenamingChatId(null);
  };

  useEffect(() => {
    if (renamingChatId) chatRenameInputRef.current?.focus();
  }, [renamingChatId]);

  const syncPersonaForProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    const matched = personas.find(
      (p) => p.name.trim().toLowerCase() === project?.title.trim().toLowerCase(),
    );
    setInvokingPersonaId(matched?.id ?? null);
  };

  const toggleProject = (id: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      const isExpanding = !next.has(id);
      if (isExpanding) {
        next.add(id);
        const project = projects.find(p => p.id === id);
        if (!project?.chats || project.chats.length === 0) {
          fetchChats(id);
        }
      } else {
        next.delete(id);
      }
      return next;
    });
    setCurrentProjectId(id);
    syncPersonaForProject(id);
  };

  const handleSelectChat = (projectId: string, chatId: string, messages: Message[]) => {
    setCurrentProjectId(projectId);
    setCurrentChatId(chatId);
    setMessages(messages || []);
    syncPersonaForProject(projectId);
  };

  const handleNewProject = async () => {
    if (!isSignedIn) {
      clerk.openSignIn();
      return;
    }
    const project = await createProject("New Project");
    if (project) {
      setCurrentProjectId(project.id);
      setExpandedProjects(prev => new Set([...prev, project.id]));
    }
  };

  const handleNewChat = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (!isSignedIn) {
      clerk.openSignIn();
      return;
    }
    const chat = await createChat(projectId, "New Chat");
    if (chat) {
      setCurrentProjectId(projectId);
      setCurrentChatId(chat.id);
      setMessages([]);
      // Auto-expand
      setExpandedProjects(prev => new Set([...prev, projectId]));
    }
  };

  const handleDeleteProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this entire project and all its chats?")) deleteProject(id);
  };

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this chat permanently?")) deleteChat(id);
  };

  const sectionLabel = "text-[10px] font-semibold text-muted uppercase tracking-widest";

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <motion.div
        className="fixed md:relative top-0 left-0 h-full bg-surface border-r border-border z-50 flex flex-col shrink-0 overflow-hidden"
        initial={false}
        animate={{ width: isOpen ? sidebarWidth : 0, opacity: isOpen ? 1 : 0 }}
        transition={isResizing ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
        style={{ width: isOpen ? sidebarWidth : 0 }}
      >
        {/* Resize Handle */}
        {isOpen && (
          <div
            onMouseDown={startResizing}
            className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize z-60 hover:bg-accent/40 transition-colors ${isResizing ? 'bg-accent/60' : 'bg-transparent'}`}
          />
        )}
        {/* ── TOP: Divinities ──────────────────────────────────────────────── */}
        <div className="flex flex-col min-h-0 max-h-[55%] overflow-y-auto border-b border-border p-4 gap-3 slim-scrollbar shrink-0">
          {/* New Project button */}
          <motion.button
            onClick={handleNewProject}
            className="font-extended flex w-full items-center justify-center gap-2 rounded-full bg-pink-600 px-4 py-2.5 text-[10px] text-white shadow-lg shadow-pink-500/30 transition-all hover:scale-105 hover:bg-pink-500 active:scale-95 shrink-0"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" /> New Project
          </motion.button>

          {/* Divinities header */}
          <div className="flex justify-between items-center shrink-0">
            <span className={sectionLabel}>Divinities</span>
            {isSignedIn && (
              <button
                onClick={() => { setEditingPersona(undefined); setShowPersonaModal(true); }}
                title="Forge your own Divinity"
                className="flex items-center gap-1 text-[10px] text-accent/70 hover:text-accent transition-colors"
              >
                <Wand2 className="w-3 h-3" /> Custom
              </button>
            )}
          </div>

          {/* Persona cards — no height cap, all visible */}
          <div className="flex flex-col gap-1">
            {isPersonasLoading ? (
              <div className="flex justify-center py-2">
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin opacity-50" />
              </div>
            ) : personas.length === 0 ? (
              <div className="text-xs text-muted/50 py-1 italic">No divinities consecrated.</div>
            ) : (
              <div className="flex flex-col gap-1">
                {/* Agents */}
                <button
                  onClick={() => toggleDivinityFolder('Agents')}
                  className="flex items-center gap-2 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-accent/80 hover:text-accent"
                >
                  <ChevronDown className={`w-3 h-3 transition-transform ${expandedDivinityFolders.has('Agents') ? '' : '-rotate-90'}`} />
                  <FolderOpen className="w-3 h-3" />
                  Agents
                </button>
                {expandedDivinityFolders.has('Agents') && agentFolderNames.map((folder) => {
                  const label = folder.replace(/^Agents\//, '');
                  const folderPersonas = presetPersonas.filter((p) => p.folder === folder);
                  return (
                    <div key={folder} className="ml-3 border-l border-border/40 pl-2 flex flex-col gap-1">
                      <button
                        onClick={() => toggleDivinityFolder(folder)}
                        className="flex items-center gap-2 px-2 py-1 text-[10px] font-semibold text-muted hover:text-foreground"
                      >
                        <ChevronDown className={`w-3 h-3 transition-transform ${expandedDivinityFolders.has(folder) ? '' : '-rotate-90'}`} />
                        {label}
                      </button>
                      {expandedDivinityFolders.has(folder) && folderPersonas.map(renderPersonaButton)}
                    </div>
                  );
                })}

                {/* Biblical */}
                <button
                  onClick={() => toggleDivinityFolder('Biblical')}
                  className="flex items-center gap-2 px-2 py-1.5 mt-1 text-[10px] font-bold uppercase tracking-wider text-accent/80 hover:text-accent"
                >
                  <ChevronDown className={`w-3 h-3 transition-transform ${expandedDivinityFolders.has('Biblical') ? '' : '-rotate-90'}`} />
                  <FolderOpen className="w-3 h-3" />
                  Biblical
                </button>
                {expandedDivinityFolders.has('Biblical') && (
                  <div className="ml-3 border-l border-border/40 pl-2 flex flex-col gap-1">
                    {biblicalPersonas.map(renderPersonaButton)}
                  </div>
                )}

                {/* Other presets + custom */}
                {otherPersonas.length > 0 && (
                  <>
                    <span className="px-2 py-1.5 mt-1 text-[10px] font-bold uppercase tracking-wider text-muted">Other</span>
                    <div className="ml-1 flex flex-col gap-1">{otherPersonas.map(renderPersonaButton)}</div>
                  </>
                )}
                {customPersonas.length > 0 && (
                  <>
                    <span className="px-2 py-1.5 mt-1 text-[10px] font-bold uppercase tracking-wider text-muted">Custom</span>
                    <div className="ml-1 flex flex-col gap-1">{customPersonas.map(renderPersonaButton)}</div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-border/50 shrink-0 md:hidden">
            <button onClick={() => setIsOpen(false)} className="p-1 text-muted hover:text-foreground" aria-label="Close sidebar">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── BOTTOM: Projects list ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2 slim-scrollbar">
          {isProjectsLoading ? (
            <div className="flex justify-center p-4">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin opacity-50" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center p-4 text-xs text-muted italic">No projects yet. Create one to begin.</div>
          ) : (
            projects.map((project) => {
              const isExpanded = expandedProjects.has(project.id);
              const isRenaming = renamingId === project.id;
              return (
                <div key={project.id} className="flex flex-col gap-1">
                  <div
                    onClick={() => !isRenaming && toggleProject(project.id)}
                    className={`group relative flex items-center justify-between w-full p-2 rounded-xl cursor-pointer transition-colors ${
                      currentProjectId === project.id ? "bg-muted/10 text-foreground" : "text-muted hover:bg-muted/10"
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                      {isExpanded ? <FolderOpen className="w-4 h-4 text-accent shrink-0" /> : <Folder className="w-4 h-4 shrink-0" />}
                      {isRenaming ? (
                        <input
                          ref={renameInputRef}
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onBlur={() => commitRename(project.id)}
                          onKeyDown={e => {
                            if (e.key === "Enter") commitRename(project.id);
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                          onClick={e => e.stopPropagation()}
                          autoCorrect="off" autoCapitalize="off" spellCheck={false}
                          autoComplete="off" data-gramm="false"
                          className="font-doc-body flex-1 bg-transparent border-b border-accent text-sm font-medium focus:outline-none text-foreground"
                        />
                      ) : (
                        <span className="font-doc-body text-sm font-medium truncate">{project.title}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isRenaming ? (
                        <button onClick={(e) => { e.stopPropagation(); commitRename(project.id); }} className="p-1 text-accent">
                          <Check className="w-3 h-3" />
                        </button>
                      ) : (
                        <button onClick={(e) => startRename(e, project.id, project.title)} className="p-1 text-muted hover:text-accent" title="Rename Project">
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); onOpenProjectSettings(project.id); }} className="p-1 text-muted hover:text-accent" title="Project Context & Instructions">
                        <Settings className="w-3 h-3" />
                      </button>
                      <button onClick={(e) => handleNewChat(e, project.id)} className="p-1 text-muted hover:text-accent" title="New Chat">
                        <Plus className="w-3 h-3" />
                      </button>
                      <button onClick={(e) => handleDeleteProject(e, project.id)} className="p-1 text-muted hover:text-red-500" title="Delete Project">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-4 pr-1 flex flex-col gap-1 border-l ml-3 border-border/50"
                      >
                        {isChatsLoading ? (
                          <div className="flex justify-center p-2">
                             <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin opacity-50" />
                          </div>
                        ) : (!project.chats || project.chats.length === 0) ? (
                          <div className="text-xs text-muted/50 p-2 italic">No chats in this project.</div>
                        ) : (
                          project.chats.map(chat => (
                            <div
                              key={chat.id}
                              onClick={() => !renamingChatId && handleSelectChat(project.id, chat.id, chat.messages)}
                              className={`group relative flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                                currentChatId === chat.id ? "bg-accent/15 text-foreground border border-accent/20" : "text-muted hover:text-foreground hover:bg-muted/10"
                              }`}
                            >
                              <MessageSquare className="w-3 h-3 shrink-0 opacity-70" />
                              {renamingChatId === chat.id ? (
                                <input
                                  ref={chatRenameInputRef}
                                  value={renameChatValue}
                                  onChange={e => setRenameChatValue(e.target.value)}
                                  onBlur={() => commitChatRename(chat.id)}
                                  onKeyDown={e => {
                                    if (e.key === "Enter") commitChatRename(chat.id);
                                    if (e.key === "Escape") setRenamingChatId(null);
                                  }}
                                  onClick={e => e.stopPropagation()}
                                  autoCorrect="off" autoCapitalize="off" spellCheck={false}
                                  autoComplete="off" data-gramm="false"
                                  className="flex-1 bg-transparent border-b border-accent text-xs focus:outline-none text-foreground"
                                />
                              ) : (
                                <span className="font-doc-body text-xs truncate flex-1">{chat.title}</span>
                              )}
                              
                              {!renamingChatId && (
                                <span className="text-[10px] text-muted/50 shrink-0 hidden group-hover:inline">
                                  {(() => {
                                    const date = new Date(chat.updated_at);
                                    return !isNaN(date.getTime()) 
                                      ? formatDistanceToNow(date, { addSuffix: true }) 
                                      : "Just now";
                                  })()}
                                </span>
                              )}

                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {renamingChatId === chat.id ? (
                                  <button onClick={(e) => { e.stopPropagation(); commitChatRename(chat.id); }} className="p-1 text-accent">
                                    <Check className="w-3 h-3" />
                                  </button>
                                ) : (
                                  <>
                                    <button onClick={(e) => startChatRename(e, chat.id, chat.title)} className="p-1 text-muted hover:text-accent" title="Rename Chat">
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                    <button onClick={(e) => handleDeleteChat(e, chat.id)} className="p-1 text-muted hover:text-red-500">
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Open sidebar button when closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            onClick={() => setIsOpen(true)}
            className="fixed top-20 left-4 z-40 p-2 bg-surface border border-border rounded-full shadow-lg text-muted hover:text-foreground transition-colors"
            title="Open Projects"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Custom Persona Modal */}
      <AnimatePresence>
        {showPersonaModal && (
          <PersonaModal
            onClose={() => { setShowPersonaModal(false); setEditingPersona(undefined); }}
            editTarget={editingPersona ? {
              id: editingPersona.id,
              name: editingPersona.name,
              icon: editingPersona.icon,
              tagline: editingPersona.tagline,
              safe_content: editingPersona.safe_content,
              spicy_content: editingPersona.spicy_content ?? "",
              tts_voice: editingPersona.tts_voice,
            } : undefined}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Re-export for store usage
type Message = import("@/store/useChatStore").Message;
