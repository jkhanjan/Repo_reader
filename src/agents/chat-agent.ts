import { getFileContent } from "@/tools/github";
import { callGroq } from "@/tools/groq";

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
  console.log(selectedFiles)
  const contents = await Promise.all(
    selectedFiles.map(async (path) => ({
      path,
      content: await getFileContent(repoUrl, path),
    }))
  );

  const context = contents
    .filter((f) => f.content.length > 0)
    .map((f) => `// ${f.path}\n${f.content}`)
    .join("\n\n---\n\n");

  const systemPrompt = `
    You are a code analyst. Answer questions about the repository based only on the files provided.
    If the answer isn't in the files, say so.
    and try to keep the response crisp and breif untill the user ask for detailed explaination
    Repository files:
    ${context}
  `;

  return await callGroq(question, systemPrompt, history);
}
