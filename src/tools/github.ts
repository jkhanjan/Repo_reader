import { env } from "@/config/env";
import { extractRepoInfo } from "@/libs/github";

const GH_HEADERS = {
  Authorization: `Bearer ${env.GITHUB_TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

export async function getRepoDetails(repoUrl: string) {
  const { owner, repo } = extractRepoInfo(repoUrl);

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}`,
    { headers: GH_HEADERS }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message ?? "Failed to fetch repo details");
  }

  return response.json();
}

export async function getRepoTree(repoUrl: string) {
  const { owner, repo } = extractRepoInfo(repoUrl);

  const repoData = await getRepoDetails(repoUrl);
  const branch = repoData.default_branch;

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers: GH_HEADERS }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message ?? "Failed to fetch repo tree");
  }

  const data = await response.json();

  if (data.truncated) {
    console.warn(`[github] tree truncated for ${owner}/${repo}`);
  }

  return data.tree.filter((node: any) => node.type === "blob");
}

export async function getFileContent(
  repoUrl: string,
  filePath: string
): Promise<string> {
  const { owner, repo } = extractRepoInfo(repoUrl);

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
    { headers: GH_HEADERS }
  );

  if (!response.ok) return "";

  const data = await response.json();
  console.log(data)
  return Buffer.from(data.content, "base64").toString("utf-8");
}

export async function getKeyFileContents(
  repoUrl: string,
  tree: any[]
): Promise<{ path: string; content: string }[]> {
  const PRIORITY_FILES = [
    "README.md",
    "package.json",
    "tsconfig.json",
    "docker-compose.yml",
    "Dockerfile",
    ".env.example",
  ];

  const PRIORITY_EXTENSIONS = [
    ".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs", ".glsl"
  ];

  const targets = tree.filter((f) => {
    if (PRIORITY_FILES.includes(f.path.split("/").pop())) return true;
    if (f.size > 50000) return false; 
    const ext = "." + f.path.split(".").pop();
    return PRIORITY_EXTENSIONS.includes(ext);
  }).slice(0, 20);

  const results = await Promise.all(
    targets.map(async (f) => ({
      path: f.path,
      content: await getFileContent(repoUrl, f.path),
    }))
  );

  return results.filter((f) => f.content.length > 0);
}