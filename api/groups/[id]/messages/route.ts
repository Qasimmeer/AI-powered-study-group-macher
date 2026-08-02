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
    const { content, socketId } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
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

    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.userId,
        groupId: groupId
      },
      include: {
        sender: { select: { username: true } }
      }
    });

    // Trigger Pusher event, excluding the sender if socketId is provided
    await pusherServer.trigger(`group-${groupId}`, "new-message", message, { socket_id: socketId });

    return NextResponse.json(message);
  } catch (error: any) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
