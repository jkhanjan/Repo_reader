import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from "react-markdown";

export default function ChatInterface({ repoUrl, selectedFiles, onFileDeselect }: { repoUrl: string, selectedFiles: string[], onFileDeselect: (file: string) => void; }) {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleChat = async () => {
    if (!input.trim() || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', text: input }]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const groqHistory = messages.map(m => ({
        role: m.role,
        content: m.text,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl,
          selectedFiles,
          question: currentInput,
          history: groqHistory,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Chat failed');
      }

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: data.answer }
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col w-[57vw]">
      <CardHeader className="pb-3"> 
        <CardTitle>Repository Chat</CardTitle>
        {selectedFiles.map((file) => (
          <Badge
            key={file}
            variant="secondary"
            className="truncate max-w-[200px] cursor-pointer"
            title="Click to remove"
            onClick={() => onFileDeselect(file)}
          >
            {file.split('/').pop()} ✕
          </Badge>
        ))}
      </CardHeader>
      
      <CardContent className="flex-grow">
        <ScrollArea className="pr-4">
          <div className="space-y-2">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`p-3 rounded-lg max-w-[90%] whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                <ReactMarkdown >
                  {msg.text}
                </ReactMarkdown >
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

      <CardFooter className="flex gap-2">
        <Input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder="Ask about the selected files..." 
          onKeyDown={(e) => e.key === 'Enter' && handleChat()}
        />
        <Button onClick={handleChat}>Send</Button>
      </CardFooter>
    </Card>
  );
}