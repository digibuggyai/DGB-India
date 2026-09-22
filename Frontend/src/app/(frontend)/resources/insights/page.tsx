import type { Metadata } from "next";
import { PostIndex } from "@/components/resources/PostIndex";

export const metadata: Metadata = {
  title: "Insights",
  description: "Opinion and analysis on where infrastructure is heading, and what it means for the teams that run it.",
};

export default function InsightsPage() {
  return <PostIndex type="insight" />;
}
