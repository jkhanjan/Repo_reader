import { loadRepo } from "@/agents/review-agent";
import { NextResponse } from "next/server";
export async function POST(
  req: Request
) {
  try {
    const { repoUrl } =
      await req.json();

    const result =
      await loadRepo(repoUrl);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown Error",
      },
      { status: 500 }
    );
  }
}