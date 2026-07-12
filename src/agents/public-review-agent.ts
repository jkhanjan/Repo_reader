import { loadRepo } from "@/agents/review-agent";
import { getKeyFileContents } from "@/tools/github";
import { callGroq } from "@/tools/groq";

  const SYSTEM_PROMPT = `You are a Staff Software Engineer reviewing a GitHub repository.

You will receive repository metadata and selected file contents. Analyze the project as an experienced engineer performing a code review.

Your goal is to understand what the project does, how it is structured, and which technologies it uses—not to summarize individual files.

Infer the application's purpose, architecture, implemented features, and key technologies from the provided code. Prioritize source code and configuration over documentation.

Only include information supported by the repository. Do not invent technologies, databases, authentication systems, cloud providers, or features. If evidence is insufficient, omit the information rather than guessing.

Return ONLY valid JSON in this exact format:

{
  "summary": "...",
  "techStack": [],
  "architecture": "...",
  "features": []
}

Requirements:
- Summary: 4–5 concise sentences explaining what the project does and its primary workflow.
- techStack: Only technologies evidenced by the codebase, ordered by importance.
- architecture: 2–4 sentences describing the application's structure, major components, and data flow.
- features: Concrete implemented capabilities only. Avoid generic or marketing language.`;

function buildAnalysisPrompt(
  repo: { full_name: string; description: string | null; language: string | null },
  files: { path: string; content: string }[]
) {
  const fileSnippets = files
    .map((f) => `### ${f.path}\n${f.content.slice(0, 2000)}`)
    .join("\n\n");

  return `Repo: ${repo.full_name}
    Description: ${repo.description ?? "N/A"}
    Primary language: ${repo.language ?? "N/A"}

    Key files:
    ${fileSnippets}`;
    }

export async function analyzeRepo(repoUrl: string) {
  const { repo, tree } = await loadRepo(repoUrl);
  const keyFiles = await getKeyFileContents(repoUrl, tree);

  const prompt = buildAnalysisPrompt(repo, keyFiles);
  const raw = await callGroq(prompt, SYSTEM_PROMPT);

  let analysis: {
    summary: string;
    techStack: string[];
    architecture: string;
    features: string[];
  };

  try {
    const cleaned = (raw ?? "")
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    analysis = JSON.parse(cleaned);
  } catch (err: any) {
    console.error("[analyzeRepo] JSON parse failed. Raw response:", raw);
    console.error("[analyzeRepo] Parse error:", err.message);

    analysis = {
      summary: "Could not generate summary for this repository.",
      techStack: repo.language ? [repo.language] : [],
      architecture: "Unknown",
      features: [],
    };
  }

  return { repo, tree, ...analysis };
}