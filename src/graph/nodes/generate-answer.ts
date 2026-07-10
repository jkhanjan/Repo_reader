import { callGroq } from "@/tools/groq";
import { RelationState } from "../state";

export async function generateAnswer(state: typeof RelationState.State) {
  const context = state.filesLoaded
    .map((f) => `// ${f.path}\n${f.content}`)
    .join("\n\n---\n\n");

    const systemPrompt = `
    You are a code analyst explaining relationships between files in a repository.

    Rules:
    - Use ONLY the file contents provided below. Never assume code that isn't shown.
    - Default to 2-5 sentences. Only go longer if the question explicitly asks for detail/steps.
    - No preamble ("Sure, let's look at..."). Answer directly.
    - When referencing code, cite the file path inline (e.g. "in utils/auth.ts").
    - If the files don't contain enough info to answer, say exactly what's missing — don't guess.
    - Use bullet points only when comparing 3+ things; otherwise plain sentences.

    Files:
    ${context}
    `;

  const answer = await callGroq(state.question, systemPrompt, state.history);
  return { answer: answer ?? "" };
}