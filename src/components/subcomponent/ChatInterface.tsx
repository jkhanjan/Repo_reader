import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatInterfaceProps {
  repoUrl: string;
  selectedFiles: string[];
  onFileDeselect: (file: string) => void;
}

export default function ChatInterface({
  repoUrl,
  selectedFiles,
  onFileDeselect,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChat = async () => {
    if (!input.trim() || isLoading) return;

    const currentInput = input;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: currentInput,
      },
    ]);

    setInput("");
    setIsLoading(true);

    try {
      const groqHistory = messages.map((m) => ({
        role: m.role,
        content: m.text,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoUrl,
          selectedFiles,
          question: currentInput,
          history: groqHistory,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Chat failed");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.answer,
        },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[57vw] h-full flex flex-col overflow-hidden">
      <CardHeader className="shrink-0 pb-3">
        <CardTitle>Repository Chat</CardTitle>

        <div className="flex flex-wrap gap-2 mt-2">
          {selectedFiles.map((file) => (
            <Badge
              key={file}
              variant="secondary"
              className="cursor-pointer"
              title="Click to remove"
              onClick={() => onFileDeselect(file)}
            >
              {file.split("/").pop()} ✕
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 p-4">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="shrink-0 flex gap-2 border-t p-4">
        <Input
          value={input}
          placeholder="Ask about the selected files..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleChat();
            }
          }}
        />

        <Button onClick={handleChat} disabled={isLoading}>
          Send
        </Button>
      </CardFooter>
    </Card>
  );
}