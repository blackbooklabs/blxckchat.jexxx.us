"use client";

import { motion, AnimatePresence } from "motion/react";
import { Plus, MessageSquare, Trash2, X, PanelLeftOpen, Folder, FolderOpen, Settings, Lock, Flame, Pencil, Check, Wand2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@clerk/nextjs";
import { useChatStore } from "@/store/useChatStore";

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
  editTarget?: { id: string; name: string; icon: string; tagline: string; safe_content: string; spicy_content: string };
}
function PersonaModal({ onClose, editTarget }: PersonaModalProps) {
  const { createCustomPersona, updateCustomPersona } = useChatStore();
  const { isSignedIn } = useAuth();
  const [name, setName] = useState(editTarget?.name ?? "");
  const [icon, setIcon] = useState(editTarget?.icon ?? "🪽");
  const [tagline, setTagline] = useState(editTarget?.tagline ?? "");
  const [safeContent, setSafeContent] = useState(editTarget?.safe_content ?? "");
  const [spicyContent, setSpicyContent] = useState(editTarget?.spicy_content ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    if (editTarget) {
      await updateCustomPersona(editTarget.id, {
        name, icon, tagline, safe_content: safeContent, spicy_content: spicyContent
      });
    } else {
      await createCustomPersona({ name, icon, tagline, safe_content: safeContent, spicy_content: spicyContent });
    }
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
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
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-accent"
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
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono resize-none h-28 focus:outline-none focus:border-accent"
            />
            <span className={`text-[10px] text-right ${safeContent.length >= 50 ? 'text-green-400' : 'text-muted'}`}>
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
                className="w-full px-3 py-2 bg-background border border-orange-500/30 rounded-xl text-xs font-mono resize-none h-24 focus:outline-none focus:border-orange-400"
              />
            </div>
          )}

          <motion.button
            onClick={handleSave}
            disabled={saving || name.length < 3 || safeContent.length < 50}
            className="w-full py-2.5 bg-gradient-to-r from-accent to-pink-500 text-white rounded-xl text-sm font-medium disabled:opacity-40"
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
  const { isSignedIn } = useAuth();
  const {
    projects,
    personas,
    currentProjectId,
    currentChatId,
    isProjectsLoading,
    isPersonasLoading,
    setCurrentProjectId,
    setCurrentChatId,
    setMessages,
    createProject,
    createChat,
    deleteProject,
    deleteChat,
    fetchPersonas,
    fetchCustomPersonas,
    setActivePersona,
    updateProjectTitle,
    updateChatTitle,
    deleteCustomPersona,
    invokingPersonaId,
    setInvokingPersonaId,
  } = useChatStore();

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  useEffect(() => {
    if (isSignedIn) fetchCustomPersonas();
  }, [isSignedIn, fetchCustomPersonas]);

  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  // Rename state
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Chat rename state
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [renameChatValue, setRenameChatValue] = useState("");
  const chatRenameInputRef = useRef<HTMLInputElement>(null);

  // Custom persona modal state
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [editingPersona, setEditingPersona] = useState<typeof personas[number] | undefined>(undefined);

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

  const toggleProject = (id: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setCurrentProjectId(id);
  };

  const handleSelectChat = (projectId: string, chatId: string, messages: Message[]) => {
    setCurrentProjectId(projectId);
    setCurrentChatId(chatId);
    setMessages(messages || []);
  };

  const handleNewProject = async () => {
    const project = await createProject("New Project");
    if (project) {
      setCurrentProjectId(project.id);
      setExpandedProjects(prev => new Set([...prev, project.id]));
    }
  };

  const handleNewChat = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    const chat = await createChat(projectId, "New Chat");
    if (chat) {
      setCurrentProjectId(projectId);
      setCurrentChatId(chat.id);
      setMessages([]);
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
        className="fixed md:relative top-0 left-0 h-full bg-surface border-r border-border z-50 flex flex-col shrink-0 overflow-hidden w-64"
        initial={false}
        animate={{ width: isOpen ? 256 : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* ── TOP: Divinities ──────────────────────────────────────────────── */}
        <div className="flex flex-col min-h-0 max-h-[55%] overflow-y-auto border-b border-border p-4 gap-3 slim-scrollbar shrink-0">
          {/* New Project button */}
          <motion.button
            onClick={handleNewProject}
            className="flex w-full items-center justify-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-xl border border-accent/20 transition-colors font-medium text-sm shrink-0"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
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
              personas.map(p => {
                const isSpicyUnlocked = !!isSignedIn && !!p.spicy_content;
                return (
                  <div key={p.id} className="group relative">
                    <button
                      onClick={async () => {
                        if (!isSignedIn) { alert("Sign in to unlock the full primal Canon. Tithe to ascend. ♡"); return; }
                        
                        setInvokingPersonaId(p.id);
                        try {
                          const isSpicyUnlocked = !!isSignedIn && !!p.spicy_content;
                          const gatedCanon = isSpicyUnlocked
                            ? `${p.safe_content}\n\n---\n<!-- 🌶️ SPICY-REVEALED — Authenticated & Unlocked -->\n\n${p.spicy_content}`
                            : p.safe_content;

                          let targetProjectId = "";
                          const existingProject = projects.find(proj => 
                            proj.title.trim().toLowerCase() === p.name.trim().toLowerCase()
                          );

                          if (existingProject) {
                            targetProjectId = existingProject.id;
                            setCurrentProjectId(targetProjectId);
                            await setActivePersona(targetProjectId, p.id, gatedCanon);
                            await createChat(targetProjectId, `New Chat with ${p.name}`);
                          } else {
                            const newProject = await createProject(p.name, gatedCanon);
                            if (newProject) {
                              targetProjectId = newProject.id;
                              setCurrentProjectId(targetProjectId);
                              await createChat(targetProjectId, `Initial invocation: ${p.name}`);
                            }
                          }
                        } finally {
                          setInvokingPersonaId(null);
                        }
                      }}
                      className={`w-full flex items-center gap-3 p-2 border rounded-lg text-left transition-all relative overflow-hidden ${
                        invokingPersonaId === p.id 
                          ? "border-accent ring-2 ring-accent/20"
                          : isSpicyUnlocked
                            ? "bg-orange-950/20 border-orange-500/40 hover:border-orange-400/70 shadow-[0_0_8px_rgba(249,115,22,0.2)]"
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
                        <span className="text-sm font-medium text-foreground truncate">{p.name}</span>
                        <span className="text-[10px] text-muted truncate">{p.tagline}</span>
                      </div>
                      {isSpicyUnlocked
                        ? <Flame className="w-3 h-3 text-orange-400 shrink-0" />
                        : <Lock className="w-3 h-3 text-muted/50 shrink-0" />}
                    </button>

                    {/* Edit / Delete — custom only */}
                    {p.isCustom && !p.isLocked && isSignedIn && (
                      <div className="absolute right-1 top-1 hidden group-hover:flex gap-1 z-10">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingPersona(p as typeof editingPersona); setShowPersonaModal(true); }}
                          className="p-1 bg-surface/90 rounded text-muted hover:text-accent border border-border"
                          title="Edit Divinity"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={async (e) => { e.stopPropagation(); if (confirm(`Delete ${p.name}?`)) await deleteCustomPersona(p.id); }}
                          className="p-1 bg-surface/90 rounded text-muted hover:text-red-500 border border-border"
                          title="Delete Divinity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Your Empire header */}
          <div className="flex justify-between items-center pt-2 border-t border-border/50 shrink-0">
            <span className={sectionLabel}>Your Empire</span>
            <button onClick={() => setIsOpen(false)} className="md:hidden p-1 text-muted hover:text-foreground">
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
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck={false}
                          className="flex-1 bg-transparent border-b border-accent text-sm font-medium focus:outline-none text-foreground"
                        />
                      ) : (
                        <span className="text-sm font-medium truncate">{project.title}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isRenaming ? (
                        <button onClick={(e) => { e.stopPropagation(); commitRename(project.id); }} className="p-1 text-green-400">
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
                      <button onClick={(e) => handleNewChat(e, project.id)} className="p-1 text-muted hover:text-green-400" title="New Chat">
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
                        {(!project.chats || project.chats.length === 0) ? (
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
                                  autoCorrect="off"
                                  autoCapitalize="off"
                                  spellCheck={false}
                                  className="flex-1 bg-transparent border-b border-accent text-xs focus:outline-none text-foreground"
                                />
                              ) : (
                                <span className="text-xs truncate flex-1">{chat.title}</span>
                              )}
                              
                              {!renamingChatId && (
                                <span className="text-[10px] text-muted/50 shrink-0 hidden group-hover:inline">
                                  {formatDistanceToNow(new Date(chat.updated_at), { addSuffix: true })}
                                </span>
                              )}

                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {renamingChatId === chat.id ? (
                                  <button onClick={(e) => { e.stopPropagation(); commitChatRename(chat.id); }} className="p-1 text-green-400">
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
            } : undefined}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Re-export for store usage
type Message = import("@/store/useChatStore").Message;
