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
    const filter = searchParams.get("filter") || "all"; // all, created, joined

    let whereClause: any = {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { topic: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    };

    if (filter === "created") {
      whereClause.creatorId = session.userId;
    } else if (filter === "joined") {
      whereClause.members = {
        some: { id: session.userId }
      };
    }

    const groups = await prisma.group.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { members: true }
        },
        members: {
          where: { id: session.userId },
          select: { id: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Map to include a 'isJoined' boolean for convenience
    const formattedGroups = groups.map(group => ({
      ...group,
      isJoined: group.members.length > 0,
      members: undefined // Clean up
    }));

    return NextResponse.json(formattedGroups);
  } catch (error: any) {
    console.error("Groups fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, major, topic } = body;

    if (!name || !topic) {
      return NextResponse.json({ error: "Name and topic are required" }, { status: 400 });
    }

    const group = await prisma.group.create({
      data: {
        name,
        description,
        major,
        topic,
        creatorId: session.userId,
        members: {
          connect: { id: session.userId }
        }
      },
      include: {
        _count: {
          select: { members: true }
        }
      }
    });

    return NextResponse.json({
      message: "Group created successfully",
      group
    });
  } catch (error: any) {
    console.error("Group creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
