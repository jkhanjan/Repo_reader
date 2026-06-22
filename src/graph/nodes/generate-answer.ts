import { callGroq } from "@/tools/groq";
import { RelationState } from "../state";

export async function generateAnswer(state: typeof RelationState.State) {
  const context = state.filesLoaded
    .map((f) => `// ${f.path}\n${f.content}`)
    .join("\n\n---\n\n");

  const systemPrompt = `
    You are a code analyst explaining relationships between files in a repository.
    Use only the provided file contents. If something is still unclear, say so.
    Keep responses crisp and brief unless detail is requested.

    Files:
    ${context}
  `;

  const answer = await callGroq(state.question, systemPrompt, state.history);
  return { answer: answer ?? "" };
}