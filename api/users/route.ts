import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { isOnboarded: true },
          { id: { not: session.userId } }, // Don't show current user
          {
            OR: [
              { username: { contains: search, mode: "insensitive" } },
              { major: { contains: search, mode: "insensitive" } },
              { studyTopic: { contains: search, mode: "insensitive" } },
              { skills: { hasSome: search ? [search] : [] } }, // This might be tricky with partial matches, let's keep it simple for now
            ],
          },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        major: true,
        level: true,
        studyTopic: true,
        skills: true,
      },
      take: 20,
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Users search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
