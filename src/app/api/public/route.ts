import { analyzeRepo } from "@/agents/public-review-agent";
import { NextResponse } from "next/server";

const GITHUB_URL_REGEX = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/;

export async function POST(req: Request) {
    let body: { repoUrl?: string };

    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { success: false, error: "Invalid JSON body" },
            { status: 400 }
        );
    }
 
    const { repoUrl } = body;

    if (!repoUrl || typeof repoUrl !== "string") {
        return NextResponse.json(
            { success: false, error: "repoUrl is required" },
            { status: 400 }
        );
    }

    if (!GITHUB_URL_REGEX.test(repoUrl.trim())) {
        return NextResponse.json(
            { success: false, error: "repoUrl must be a valid GitHub repository URL" },
            { status: 400 }
        );
    }

    try {
        const cleanUrl = repoUrl.trim().replace(/\.git$/, '');
        const repo = await analyzeRepo(cleanUrl);

        return NextResponse.json({
            success: true,
            summary: repo.summary,
            techStack: repo.techStack,
            architecture: repo.architecture,
            features: repo.features,
            deepLink: `https://repo-reader-gules.vercel.app/?repo=${encodeURIComponent(repoUrl)}`,
        });
    } catch (err) {
        console.error("[analyze-repo] failed:", err);

        return NextResponse.json(
            {
                success: false,
                error: err instanceof Error ? err.message : "Analysis failed",
            },
            { status: 500 }
        );
    }
}