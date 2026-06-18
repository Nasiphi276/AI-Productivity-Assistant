import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Loader2, Mail, FileText, ListChecks, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  { icon: Mail, label: "Draft an email", prompt: "Help me draft a professional email. " },
  { icon: FileText, label: "Summarize notes", prompt: "Summarize these meeting notes and extract action items:\n\n" },
  { icon: ListChecks, label: "Plan my day", prompt: "Create a prioritized schedule for these tasks:\n\n" },
  { icon: BookOpen, label: "Research summary", prompt: "Summarize the key insights from this content:\n\n" },
];

export function ChatWindow({
  threadId,
  initialMessages,
  onMessagesChange,
}: {
  threadId: string;
  initialMessages: UIMessage[];
  onMessagesChange: (threadId: string, messages: UIMessage[]) => void;
}) {
  const transport = useRef(new DefaultChatTransport({ api: "/api/chat" })).current;
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (err) => toast.error(err.message || "Something went wrong"),
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    onMessagesChange(threadId, messages);
  }, [messages, threadId, onMessagesChange]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [threadId, status]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    await sendMessage({ text });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full flex-col bg-background">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-8">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center pt-16 text-center">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <span className="text-2xl">✦</span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                How can I help you work smarter?
              </h1>
              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                Draft emails, summarize meetings, plan your day, or distill research — ask anything.
              </p>
              <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
                {QUICK_ACTIONS.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    onClick={() => {
                      setInput(a.prompt);
                      textareaRef.current?.focus();
                    }}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition hover:border-primary/40 hover:bg-accent"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground group-hover:bg-primary/10 group-hover:text-primary">
                      <a.icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium text-foreground">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {status === "submitted" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="relative flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for an email, summary, plan, or research…"
              rows={1}
              className="min-h-[44px] flex-1 resize-none border-0 bg-transparent px-3 py-2 text-sm shadow-none focus-visible:ring-0"
              disabled={isLoading}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="h-9 w-9 shrink-0"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            AI-generated content should be reviewed before final use.
          </p>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = message.parts.map((p) => (p.type === "text" ? p.text : "")).join("");

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
          ✦
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-card border border-border text-card-foreground rounded-bl-sm"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{text}</p>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        )}
      </div>
      {isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold">
          You
        </div>
      )}
    </div>
  );
}
