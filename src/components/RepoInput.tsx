'use client';

import { useState } from 'react';
import ChatInterface from './subcomponent/ChatInterface';
import RepoSidebar from './subcomponent/RepoSidebar';

type TreeFile = {
  path: string;
  size: number;
  type: string;
};

type RepoMeta = {
  full_name: string;
  description: string;
  language: string;
  stars: number;
  default_branch: string;
};

export default function RepoInput() {
  const [repoUrl, setRepoUrl] = useState('');
  const [repo, setRepo] = useState<RepoMeta | null>(null);
  const [tree, setTree] = useState<TreeFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isChatActive, setIsChatActive] = useState(false);

  return (
    <div className={`w-full mx-auto transition-all duration-300 flex gap-6 ${isChatActive ? 'max-w-6xl' : 'max-w-2xl'}`}>
      <div className={`flex-shrink-0 transition-all ${isChatActive ? 'w-1/3' : 'w-full'}`}>
        <RepoSidebar 
          repoUrl={repoUrl}
          setRepoUrl={setRepoUrl}
          repo={repo}
          setRepo={setRepo}
          tree={tree}
          setTree={setTree}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          onOpenChat={() => setIsChatActive(true)}
          isChatActive={isChatActive}
        />
      </div>

      {/* Right Pane: Chat Interface */}
      {isChatActive && (
        <div className="w-2/3 flex-grow animate-in fade-in slide-in-from-right-4">
          <ChatInterface 
            repoUrl={repoUrl} 
            selectedFiles={selectedFiles} 
          />
        </div>
      )}
    </div>
  );
}