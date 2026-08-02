import { NextResponse } from "next/server";
import { getSession, signToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { major, languages, level, studyTopic, skills } = await request.json();

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        major,
        languages,
        level,
        studyTopic,
        skills,
        isOnboarded: true,
      },
    });

    // Re-issue token with isOnboarded: true
    const token = await signToken({ 
      userId: user.id, 
      email: user.email, 
      isOnboarded: true 
    });

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return NextResponse.json({
      message: "Onboarding completed successfully",
      user: { id: user.id, username: user.username, isOnboarded: user.isOnboarded },
    });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
