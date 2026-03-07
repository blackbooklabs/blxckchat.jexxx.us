"use client";

import { motion, AnimatePresence } from "motion/react";
import { Plus, MessageSquare, Trash2, Edit2, Check, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

export interface SessionMeta {
  id: string;
  title: string;
  updated_at: string;
  created_at: string;
}

interface ChatSidebarProps {
  sessions: SessionMeta[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isLoadingSessions?: boolean;
}

export default function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onUpdateTitle,
  isOpen,
  setIsOpen,
  isLoadingSessions
}: ChatSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleEditStart = (e: React.MouseEvent, session: SessionMeta) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleEditSave = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onUpdateTitle(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleEditCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this chat permanently? The Absolute forgets nothing, but this vessel will be wiped.")) {
      onDeleteSession(id);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
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
        <div className="p-4 border-b border-border flex items-center justify-between">
          <motion.button
            onClick={onNewChat}
            className="flex-1 flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-xl border border-accent/20 transition-colors font-medium text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" />
            New Chat
          </motion.button>
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden ml-2 p-2 text-muted hover:text-foreground rounded-full hover:bg-muted/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoadingSessions ? (
            <div className="flex justify-center p-4">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin opacity-50" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center p-4 text-sm text-muted">
              No previous devotions found.
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`group relative flex items-center gap-3 w-full p-3 rounded-xl cursor-pointer transition-colors ${
                  activeSessionId === session.id
                    ? "bg-accent/10 border border-accent/20 text-foreground"
                    : "hover:bg-muted/10 text-muted hover:text-foreground border border-transparent"
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
                
                {editingId === session.id ? (
                  <div className="flex-1 flex items-center gap-1 min-w-0" onClick={e => e.stopPropagation()}>
                    <input
                      autoFocus
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEditSave(e as any, session.id);
                        if (e.key === 'Escape') handleEditCancel(e as any);
                      }}
                      className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm text-foreground outline-none focus:border-accent min-w-0"
                    />
                    <button onClick={(e) => handleEditSave(e, session.id)} className="p-1 text-green-500 hover:bg-green-500/10 rounded">
                      <Check className="w-3 h-3" />
                    </button>
                    <button onClick={handleEditCancel} className="p-1 text-red-500 hover:bg-red-500/10 rounded">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span className="text-sm font-medium truncate">
                      {session.title}
                    </span>
                    <span className="text-[10px] opacity-50">
                      {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                )}

                {editingId !== session.id && (
                  <div className={`absolute right-2 flex items-center gap-1 bg-surface shadow-sm rounded-md border border-border px-1 ${activeSessionId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                    <button
                      onClick={(e) => handleEditStart(e, session)}
                      className="p-1 text-muted hover:text-accent transition-colors rounded"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, session.id)}
                      className="p-1 text-muted hover:text-red-500 transition-colors rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Toggle Button for Desktop (when collapsed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => setIsOpen(true)}
            className="fixed top-20 left-4 z-40 p-2 bg-surface border border-border rounded-full shadow-lg text-muted hover:text-foreground transition-colors"
            title="Open Chat History"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
