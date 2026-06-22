import { getFileContent } from "@/tools/github";
import { relationGraph } from "@/graph/relation-graph";

export async function chatWithRepo({
  repoUrl,
  selectedFiles,
  question,
  history,
}: {
  repoUrl: string;
  selectedFiles: string[];
  question: string;
  history: { role: "user" | "assistant"; content: string }[];
}) {
  const initialFiles = await Promise.all(
    selectedFiles.map(async (path) => ({
      path,
      content: await getFileContent(repoUrl, path),
    }))
  );

  const result = await relationGraph.invoke({
    repoUrl,
    question,
    history,
    filesLoaded: initialFiles.filter((f) => f.content.length > 0),
    triedPaths: selectedFiles,
  });

  return result.answer;
}