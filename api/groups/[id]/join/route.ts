import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
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

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { members: { select: { id: true } } }
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check if already a member
    const isMember = group.members.some(m => m.id === session.userId);
    if (isMember) {
      return NextResponse.json({ error: "Already a member" }, { status: 400 });
    }

    // Join group
    await prisma.group.update({
      where: { id: groupId },
      data: {
        members: {
          connect: { id: session.userId }
        }
      }
    });

    return NextResponse.json({ message: "Joined successfully" });
  } catch (error: any) {
    console.error("Join group error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
