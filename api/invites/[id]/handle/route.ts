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
    const inviteId = parseInt(id);
    const { action } = await request.json(); // "ACCEPT" or "REJECT"

    const invite = await prisma.groupInvite.findUnique({
      where: { id: inviteId },
      include: {
        sender: { select: { id: true, username: true } },
        receiver: { select: { id: true, username: true } },
      },
    });

    if (!invite || invite.receiverId !== session.userId) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (invite.status !== "PENDING") {
      return NextResponse.json({ error: "Invite already handled" }, { status: 400 });
    }

    if (action === "ACCEPT") {
      // Create a new group with both users as members
      const group = await prisma.group.create({
        data: {
          name: invite.groupName,
          topic: invite.groupTopic,
          creatorId: invite.senderId,
          members: {
            connect: [{ id: invite.senderId }, { id: invite.receiverId }],
          },
        },
      });

      // Mark invite as accepted
      await prisma.groupInvite.update({
        where: { id: inviteId },
        data: { status: "ACCEPTED" },
      });

      // Notify the original sender in real-time
      await pusherServer.trigger(`user-${invite.senderId}`, "invite-accepted", {
        groupId: group.id,
        groupName: group.name,
        receiverName: invite.receiver.username,
      });

      return NextResponse.json({ success: true, groupId: group.id });
    } else {
      await prisma.groupInvite.update({
        where: { id: inviteId },
        data: { status: "REJECTED" },
      });

      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    console.error("Handle invite error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
