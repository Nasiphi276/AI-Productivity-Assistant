import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { UIMessage } from "ai";
import { ChatWindow } from "./ChatWindow";
import { ThreadSidebar } from "./ThreadSidebar";
import { createThread, deriveTitle, loadThreads, saveThreads, type Thread } from "@/lib/threads";

export function AppShell({ activeThreadId }: { activeThreadId?: string }) {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    const existing = loadThreads();
    if (!activeThreadId) {
      if (existing.length > 0) {
        setThreads(existing);
        navigate({ to: "/$threadId", params: { threadId: existing[0].id }, replace: true });
      } else {
        const t = createThread();
        const next = [t];
        saveThreads(next);
        setThreads(next);
        navigate({ to: "/$threadId", params: { threadId: t.id }, replace: true });
      }
      return;
    }
    if (!existing.find((t) => t.id === activeThreadId)) {
      const t: Thread = { ...createThread(), id: activeThreadId };
      const next = [t, ...existing];
      saveThreads(next);
      setThreads(next);
    } else {
      setThreads(existing);
    }
  }, [activeThreadId, navigate]);

  const handleNewThread = useCallback(() => {
    const t = createThread();
    setThreads((prev) => {
      const next = [t, ...prev];
      saveThreads(next);
      return next;
    });
    navigate({ to: "/$threadId", params: { threadId: t.id } });
  }, [navigate]);

  const handleDelete = useCallback((id: string) => {
    setThreads((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveThreads(next);
      return next;
    });
  }, []);

  const handleMessagesChange = useCallback((threadId: string, messages: UIMessage[]) => {
    setThreads((prev) => {
      const existing = prev.find((t) => t.id === threadId);
      if (!existing) return prev;
      const sameLen = existing.messages.length === messages.length;
      if (sameLen && messages.length === 0) return prev;
      const next = prev.map((t) =>
        t.id === threadId
          ? { ...t, messages, title: deriveTitle(messages), updatedAt: Date.now() }
          : t
      );
      saveThreads(next);
      return next;
    });
  }, []);

  const active = threads.find((t) => t.id === activeThreadId);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ThreadSidebar
        threads={threads}
        activeId={activeThreadId}
        onNewThread={handleNewThread}
        onDeleteThread={handleDelete}
      />
      <main className="flex-1 min-w-0">
        {active ? (
          <ChatWindow
            key={active.id}
            threadId={active.id}
            initialMessages={active.messages}
            onMessagesChange={handleMessagesChange}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading…
          </div>
        )}
      </main>
    </div>
  );
}
