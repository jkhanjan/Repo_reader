import Groq from "groq-sdk";
import { env } from "@/config/env";

const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
});

export async function callGroq(
  prompt: string,
  systemPrompt: string,
  history: { role: "user" | "assistant"; content: string }[] = []
) {
  const cleanHistory = history.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      ...cleanHistory,
      { role: "user", content: prompt },
    ],
  });

  return response.choices[0].message.content;
}