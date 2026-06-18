import { Link, useNavigate } from "@tanstack/react-router";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Thread } from "@/lib/threads";
import { cn } from "@/lib/utils";

export function ThreadSidebar({
  threads,
  activeId,
  onNewThread,
  onDeleteThread,
}: {
  threads: Thread[];
  activeId?: string;
  onNewThread: () => void;
  onDeleteThread: (id: string) => void;
}) {
  const navigate = useNavigate();

  return (
    <aside className="flex h-full w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">Workplace AI</span>
          <span className="text-xs text-muted-foreground">Productivity Assistant</span>
        </div>
      </div>

      <div className="p-3">
        <Button onClick={onNewThread} className="w-full justify-start gap-2" variant="default">
          <Plus className="h-4 w-4" /> New conversation
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <ul className="flex flex-col gap-1 pb-4">
          {threads.length === 0 && (
            <li className="px-3 py-6 text-center text-xs text-muted-foreground">
              No conversations yet
            </li>
          )}
          {threads.map((t) => {
            const isActive = t.id === activeId;
            return (
              <li
                key={t.id}
                className={cn(
                  "group flex items-center gap-1 rounded-md px-1",
                  isActive && "bg-sidebar-accent"
                )}
              >
                <Link
                  to="/$threadId"
                  params={{ threadId: t.id }}
                  className={cn(
                    "flex-1 truncate rounded-md px-2 py-2 text-sm transition-colors",
                    isActive
                      ? "text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                  )}
                >
                  {t.title}
                </Link>
                <button
                  type="button"
                  aria-label="Delete conversation"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const remaining = onDeleteThread(t.id);
                    void remaining;
                    if (isActive) navigate({ to: "/" });
                  }}
                  className="rounded p-1.5 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      </ScrollArea>

      <div className="border-t border-sidebar-border p-3 text-[11px] text-muted-foreground">
        Conversations are saved in this browser only.
      </div>
    </aside>
  );
}
