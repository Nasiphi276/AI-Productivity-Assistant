import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Workplace AI — Productivity Assistant" },
      {
        name: "description",
        content:
          "AI-powered workplace productivity assistant for emails, meeting summaries, task planning, and research.",
      },
      { property: "og:title", content: "Workplace AI — Productivity Assistant" },
      {
        property: "og:description",
        content:
          "Draft emails, summarize meetings, plan your day, and distill research with an AI assistant built for professionals.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <AppShell />;
}
