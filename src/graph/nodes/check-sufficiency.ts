// graph/nodes/check-sufficiency.ts
import { callGroq } from "@/tools/groq";
import { getRepoTree } from "@/tools/github";
import { RelationState } from "../state";

export async function checkSufficiency(state: typeof RelationState.State) {
  if (state.loopCount >= 2) {
    return { sufficient: true, loopCount: state.loopCount + 1 };
  }

  const tree = await getRepoTree(state.repoUrl);
  const fileList = tree.map((f: any) => f.path).join("\n");

  const loadedSummary = state.filesLoaded
    .map((f) => `${f.path}:\n${f.content.slice(0, 500)}`)
    .join("\n\n");

  const prompt = `
    Question: ${state.question}

    Files currently loaded:
    ${loadedSummary}

    Full repo file list:
    ${fileList}

    Already tried (don't repeat): ${state.triedPaths.join(", ") || "none"}

    Can the question be fully answered with ONLY the loaded files? 
    If yes, respond exactly: SUFFICIENT
    If no, respond with up to 3 file paths from the repo file list (comma-separated) that would help answer it — likely imports, shared types, or related modules referenced in the loaded files.
  `;

  const result = await callGroq(prompt, "You are a code dependency analyst. Be precise.", []);
  const trimmed = result?.trim() ?? "";

  if (trimmed.toUpperCase().startsWith("SUFFICIENT")) {
    return { sufficient: true, loopCount: state.loopCount + 1 };
  }

  const neededFiles = trimmed
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p && !state.triedPaths.includes(p));

  return {
    sufficient: neededFiles.length === 0,
    neededFiles,
    loopCount: state.loopCount + 1,
  };
}