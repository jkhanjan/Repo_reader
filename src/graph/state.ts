import { Annotation } from "@langchain/langgraph";

export const RelationState = Annotation.Root({
  repoUrl: Annotation<string>(),
  question: Annotation<string>(),
  history: Annotation<{ role: "user" | "assistant"; content: string }[]>(),

  filesLoaded: Annotation<{ path: string; content: string }[]>({
    reducer: (curr, update) => [...curr, ...update],
    default: () => [],
  }),
  triedPaths: Annotation<string[]>({
    reducer: (curr, update) => [...curr, ...update],
    default: () => [],
  }),
  sufficient: Annotation<boolean>(),
  neededFiles: Annotation<string[]>(),
  loopCount: Annotation<number>({ reducer: (_, v) => v, default: () => 0 }),

  answer: Annotation<string>(),
});