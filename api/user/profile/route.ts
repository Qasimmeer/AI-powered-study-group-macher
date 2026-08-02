import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        major: true,
        languages: true,
        level: true,
        studyTopic: true,
        skills: true,
      }
    });

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, major, languages, level, studyTopic, skills } = body;

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name,
        major,
        languages,
        level,
        studyTopic,
        skills,
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
