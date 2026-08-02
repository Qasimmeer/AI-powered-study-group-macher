import { NextResponse } from "next/server";
import { getRecommendations } from "@/lib/recommendations";

export async function GET() {
  try {
    const data = await getRecommendations();

    if (!data) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Recommendations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

