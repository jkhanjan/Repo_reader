import { getFileContent } from "@/tools/github";
import { RelationState } from "../state";

export async function expandContext(state: typeof RelationState.State) {
  const newFiles = await Promise.all(
    state.neededFiles.map(async (path) => ({
      path,
      content: await getFileContent(state.repoUrl, path),
    }))
  );

  return {
    filesLoaded: newFiles.filter((f) => f.content.length > 0),
    triedPaths: state.neededFiles,
  };
}