import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resources = await prisma.resource.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ resources });
  } catch (error) {
    console.error("Failed to fetch resources:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, url, type, size } = await request.json();

    if (!name || !url) {
      return NextResponse.json({ error: "Name and URL are required" }, { status: 400 });
    }

    const resource = await prisma.resource.create({
      data: {
        name,
        url,
        type,
        size,
        userId: session.userId,
      },
    });

    return NextResponse.json({ resource });
  } catch (error) {
    console.error("Failed to create resource:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
