'use client'
import { useState } from "react";
import RepoInput from "@/components/RepoInput";

export default function Home() {
  const [isChatActive, setIsChatActive] = useState(false);
  
  const gridPattern = `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ccc' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E")`;

  return (
    <div 
      className={`flex flex-col min-h-screen items-center font-sans p-6 transition-all duration-700 ease-in-out
        ${isChatActive ? 'pt-6' : 'pt-[15vh]'}`} // Smoothly shifts layout from center to top
      style={{
        backgroundImage: gridPattern,
        backgroundSize: '20px 20px',
      }}
    >
      {/* Container holding both header and input */}
      <div className={`flex flex-col items-center w-full max-w-7xl transition-all duration-700 
        ${isChatActive ? 'gap-2' : 'gap-1'}`}>
        
        {/* Header Section: Fades out and collapses height smoothly */}
        <div className={`text-center transition-all duration-500 ease-in-out overflow-hidden
          ${isChatActive ? 'opacity-0 max-h-0 scale-95 pointer-events-none' : 'opacity-100 max-h-40 scale-100 mb-4'}`}>
          <h1 className="text-5xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 mb-4">
            Repo-Reader
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
            Analyze repositories, chat with code.
          </p>
        </div>

        {/* Interactive Input/Chat Wrapper */}
        <div className="w-full flex justify-center">
          <RepoInput isChatActive={isChatActive} setIsChatActive={setIsChatActive} />
        </div>
      </div>
    </div>
  );
}