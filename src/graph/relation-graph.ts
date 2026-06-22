import { StateGraph, START, END } from "@langchain/langgraph";
import { RelationState } from "./state";
import { checkSufficiency } from "./nodes/check-sufficiency";
import { expandContext } from "./nodes/expand-context";
import { generateAnswer } from "./nodes/generate-answer";

const graph = new StateGraph(RelationState)
  .addNode("checkSufficiency", checkSufficiency)
  .addNode("expandContext", expandContext)
  .addNode("generateAnswer", generateAnswer)

  .addEdge(START, "checkSufficiency")
  .addConditionalEdges("checkSufficiency", (state) =>
    state.sufficient ? "generateAnswer" : "expandContext"
  )
  .addEdge("expandContext", "checkSufficiency")
  .addEdge("generateAnswer", END);

export const relationGraph = graph.compile();