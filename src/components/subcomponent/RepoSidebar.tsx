import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileList } from './FileList';

export default function RepoSidebar({ 
  repoUrl, setRepoUrl, repo, setRepo, tree, setTree, 
  selectedFiles, setSelectedFiles, onOpenChat, isChatActive 
}: any) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load repo');
      
      setRepo(data.repo);
      setTree(data.tree);
      setSelectedFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const toggleFile = (path: string) => {
    setSelectedFiles((prev: string[]) => prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/user/repo"
          onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
        />
        <Button onClick={handleAnalyze} disabled={loading || !repoUrl.trim()}>
          {loading ? 'Analyzing...' : 'Analyze'}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {tree?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Files ({tree.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh]">
              <FileList files={tree} selectedFiles={selectedFiles} onToggle={toggleFile} />
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {selectedFiles.length > 0 && !isChatActive && (
        <Button className="w-full" onClick={onOpenChat}>
          Chat with {selectedFiles.length} file(s)
        </Button>
      )}
    </div>
  );
}