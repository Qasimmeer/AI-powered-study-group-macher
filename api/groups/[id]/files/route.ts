import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

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
    const { name, url, type, size, socketId } = await request.json();

    if (!name || !url) {
      return NextResponse.json({ error: "Name and URL are required" }, { status: 400 });
    }

    // Verify membership
    const membership = await prisma.group.findFirst({
      where: {
        id: groupId,
        members: { some: { id: session.userId } }
      }
    });

    if (!membership) {
      return NextResponse.json({ error: "Not a member of this group" }, { status: 403 });
    }

    const groupFile = await prisma.groupFile.create({
      data: {
        name,
        url,
        type,
        size,
        groupId,
        userId: session.userId,
      },
      include: {
        user: { select: { username: true } }
      }
    });

    // Trigger Pusher event
    await pusherServer.trigger(`group-${groupId}`, "new-file", groupFile, { socket_id: socketId });

    return NextResponse.json(groupFile);
  } catch (error: any) {
    console.error("Upload group file error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
