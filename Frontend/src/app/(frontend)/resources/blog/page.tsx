import type { Metadata } from "next";
import { PostIndex } from "@/components/resources/PostIndex";

export const metadata: Metadata = {
  title: "Blog",
  description: "Practical guides to specifying storage, compute and workstations — sizing, RAID, drives and the trade-offs that decide them.",
};

export default function BlogPage() {
  return <PostIndex type="blog" />;
}
