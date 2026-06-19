import { getRepoDetails, getRepoTree, getKeyFileContents } from "@/tools/github";
import { callGroq } from "@/tools/groq";

export async function loadRepo(repoUrl: string) {
   const repo = await getRepoDetails(repoUrl);
  const tree = await getRepoTree(repoUrl);

  return {
    repo: {
      full_name: repo.full_name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
    },
    tree: tree.map((f: any) => ({ path: f.path, size: f.size })),
  };
}