import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const groupId = parseInt(id);

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          select: { id: true, username: true, major: true }
        },
        messages: {
          include: {
            sender: { select: { username: true } }
          },
          orderBy: { createdAt: "asc" },
          take: 50
        },
        files: {
          include: {
            user: { select: { username: true } }
          },
          orderBy: { createdAt: "desc" }
        },
        _count: {
          select: { members: true }
        }
      }
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check if user is a member
    const isMember = group.members.some(m => m.id === session.userId);
    if (!isMember) {
      return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    return NextResponse.json(group);
  } catch (error: any) {
    console.error("Fetch group error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
