'use client';

import React from 'react';
import ChatInterface from './subcomponent/ChatInterface';
import RepoSidebar from './subcomponent/RepoSidebar';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

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

interface RepoInputProps {
  isChatActive: boolean;
  setIsChatActive: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function RepoInput({ isChatActive, setIsChatActive }: RepoInputProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [repoUrl, setRepoUrl] = React.useState(() => {
    return searchParams.get('repo') ?? '';
  });
  const [repo, setRepo] = React.useState<RepoMeta | null>(null);
  const [tree, setTree] = React.useState<TreeFile[]>([]);
  const [selectedFiles, setSelectedFiles] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (searchParams.get('repo')) {
      router.replace(pathname);
    }
  }, [])

  const handleFileDeselect = (fileToRemove: string) => {
    setSelectedFiles(prev => prev.filter(file => file !== fileToRemove));
  };
  return (
    <div 
      className={`w-full mx-auto transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col md:flex-row gap-6 p-6
        bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl
        border border-zinc-200/80 dark:border-zinc-800/50 
        rounded-3xl shadow-2xl shadow-zinc-200/40 dark:shadow-none
        ${isChatActive ? 'max-w-7xl' : 'max-w-xl'}`}
    >
      <div 
        className={`flex-shrink-0 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col
          ${isChatActive ? 'w-full md:w-[35%]' : 'w-full'}`}
      >
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

      {isChatActive && (
              <div className="w-2/3 flex-grow animate-in fade-in slide-in-from-right-4 h-[calc(100vh-100px)]">
                <ChatInterface
                  repoUrl={repoUrl}
                  selectedFiles={selectedFiles}
                  onFileDeselect={handleFileDeselect}
                />
              </div>
            )}
    </div>
  );
}