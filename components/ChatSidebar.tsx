"use client";

import { motion, AnimatePresence } from "motion/react";
import { Plus, MessageSquare, Trash2, Edit2, Check, X, PanelLeftClose, PanelLeftOpen, Folder, FolderOpen, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { useChatStore } from "@/store/useChatStore";

interface ChatSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onOpenProjectSettings: (projectId: string) => void;
}

export default function ChatSidebar({ isOpen, setIsOpen, onOpenProjectSettings }: ChatSidebarProps) {
  const { 
    projects, 
    currentProjectId, 
    currentChatId, 
    isProjectsLoading, 
    setCurrentProjectId,
    setCurrentChatId,
    setMessages,
    createProject,
    createChat,
    deleteProject,
    deleteChat
  } = useChatStore();

  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  // Auto-expand current project
  useEffect(() => {
    if (currentProjectId && !expandedProjects.has(currentProjectId)) {
      setExpandedProjects(prev => new Set(prev).add(currentProjectId));
    }
  }, [currentProjectId]);

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

  const handleNewProject = async () => {
    const proj = await createProject("New Project", "");
    if (proj) {
      setCurrentProjectId(proj.id);
      setExpandedProjects(prev => new Set(prev).add(proj.id));
    }
  };

  const handleNewChat = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    const chat = await createChat(projectId, "New Chat", []);
    if (chat) {
      setCurrentProjectId(projectId);
      setCurrentChatId(chat.id);
      setMessages([]);
      if (!isOpen) setIsOpen(true);
    }
  };

  const handleSelectChat = (projectId: string, chatId: string, messages: any[]) => {
    setCurrentProjectId(projectId);
    setCurrentChatId(chatId);
    setMessages(messages || []);
  };

  const handleDeleteProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this entire project and all its chats?")) {
      deleteProject(id);
    }
  };

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this chat permanently?")) {
      deleteChat(id);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <motion.div
        className={`fixed md:relative top-0 left-0 h-full bg-surface border-r border-border z-50 flex flex-col shrink-0 overflow-hidden w-64`}
        initial={false}
        animate={{ width: isOpen ? 256 : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="p-4 border-b border-border flex flex-col gap-2">
          <motion.button
            onClick={handleNewProject}
            className="flex w-full items-center justify-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-xl border border-accent/20 transition-colors font-medium text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" />
            New Project
          </motion.button>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">Your Empire</span>
            <button onClick={() => setIsOpen(false)} className="md:hidden p-1 text-muted hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {isProjectsLoading ? (
            <div className="flex justify-center p-4">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin opacity-50" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center p-4 text-sm text-muted">
              No projects found. Create one to begin building.
            </div>
          ) : (
            projects.map((project) => {
              const isExpanded = expandedProjects.has(project.id);
              return (
                <div key={project.id} className="flex flex-col gap-1">
                  {/* PROJECT ROW */}
                  <div
                    onClick={() => toggleProject(project.id)}
                    className={`group relative flex items-center justify-between w-full p-2 rounded-xl cursor-pointer transition-colors ${
                      currentProjectId === project.id ? "bg-muted/10 text-foreground" : "text-muted hover:bg-muted/10"
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                      {isExpanded ? <FolderOpen className="w-4 h-4 text-accent shrink-0" /> : <Folder className="w-4 h-4 shrink-0" />}
                      <span className="text-sm font-medium truncate">{project.title}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); onOpenProjectSettings(project.id); }} className="p-1 text-muted hover:text-accent" title="Project Context & Instructions">
                        <Settings className="w-3 h-3" />
                      </button>
                      <button onClick={(e) => handleNewChat(e, project.id)} className="p-1 text-muted hover:text-green-400" title="New Chat in Project">
                        <Plus className="w-3 h-3" />
                      </button>
                      <button onClick={(e) => handleDeleteProject(e, project.id)} className="p-1 text-muted hover:text-red-500" title="Delete Project">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* NESTED CHATS (if expanded) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-4 pr-1 flex flex-col gap-1 border-l ml-3 border-border/50"
                      >
                        {(!project.chats || project.chats.length === 0) ? (
                          <div className="text-xs text-muted/50 p-2 italic">No chats in this project.</div>
                        ) : (
                          project.chats.map(chat => (
                            <div
                              key={chat.id}
                              onClick={() => handleSelectChat(project.id, chat.id, chat.messages)}
                              className={`group relative flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                                currentChatId === chat.id ? "bg-accent/15 text-foreground border border-accent/20" : "text-muted hover:text-foreground hover:bg-muted/10"
                              }`}
                            >
                              <MessageSquare className="w-3 h-3 shrink-0 opacity-70" />
                              <span className="text-xs truncate flex-1">{chat.title}</span>
                              <button onClick={(e) => handleDeleteChat(e, chat.id)} className="p-1 opacity-0 group-hover:opacity-100 text-muted hover:text-red-500 transition-opacity absolute right-1">
                                <Trash2 className="w-3 h-3" />
                              </button>
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

      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => setIsOpen(true)}
            className="fixed top-20 left-4 z-40 p-2 bg-surface border border-border rounded-full shadow-lg text-muted hover:text-foreground transition-colors"
            title="Open Projects"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
