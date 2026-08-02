import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, groupName, groupTopic } = await request.json();

    if (!receiverId || !groupName || !groupTopic) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const invite = await prisma.groupInvite.create({
      data: {
        senderId: session.userId,
        receiverId,
        groupName,
        groupTopic,
      },
      include: {
        sender: { select: { username: true, major: true } },
      },
    });

    // Trigger real-time notification to receiver
    await pusherServer.trigger(`user-${receiverId}`, "group-invite", invite);

    return NextResponse.json(invite);
  } catch (error: any) {
    console.error("Create invite error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invites = await prisma.groupInvite.findMany({
      where: {
        receiverId: session.userId,
        status: "PENDING",
      },
      include: {
        sender: { select: { username: true, major: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invites);
  } catch (error: any) {
    console.error("Fetch invites error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
