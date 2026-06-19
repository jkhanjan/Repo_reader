import { chatWithRepo } from "@/agents/chat-agent";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { repoUrl, selectedFiles, question, history } = await req.json();

  const answer = await chatWithRepo({ repoUrl, selectedFiles, question, history });

  return NextResponse.json({ answer });
}