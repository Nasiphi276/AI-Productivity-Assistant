import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/$threadId")({
  head: () => ({
    meta: [
      { title: "Workplace AI — Conversation" },
      { name: "description", content: "AI workplace productivity conversation." },
    ],
  }),
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = Route.useParams();
  return <AppShell activeThreadId={threadId} />;
}
