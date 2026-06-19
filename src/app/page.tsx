'use client'
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
          <h1>AI Software Engineer Agent</h1>
      <Button onClick={() => router.push('/analyze')}>Navigate</Button>

    </div>
  );
}
