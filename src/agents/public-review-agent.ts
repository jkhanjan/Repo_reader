import { loadRepo } from "@/agents/review-agent";
import { getKeyFileContents } from "@/tools/github";
import { callGroq } from "@/tools/groq";

const SYSTEM_PROMPT = `You are a senior software engineer analyzing a GitHub repository.
You will be given the repo's metadata and key file contents.
Respond with ONLY valid JSON, no markdown fences, no preamble, in this exact shape:
{
  "summary": "4-5 sentence plain-English summary of what this project does in crisp way",
  "techStack": ["list", "of", "key", "technologies"],
  "architecture": "2-3 sentence description of the overall architecture/structure",
  "features": ["list", "of", "notable", "features"]
}`;

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
    analysis = JSON.parse(raw ?? "");
  } catch {
    analysis = {
      summary: "Could not generate summary for this repository.",
      techStack: repo.language ? [repo.language] : [],
      architecture: "Unknown",
      features: [],
    };
  }

  return { repo, tree, ...analysis };
}