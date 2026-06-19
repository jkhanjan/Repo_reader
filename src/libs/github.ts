export function extractRepoInfo(repoUrl: string) {
  const match = repoUrl.match(
    /github\.com\/([^/]+)\/([^/]+)/
  );

  if (!match) {
    throw new Error("Invalid GitHub URL");
  }

  return {
    owner: match[1],
    repo: match[2].replace(".git", ""),
  };
}