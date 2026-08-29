import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "student" && session.user.role !== "parent")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const shortlists = await prisma.shortlist.findMany({
      where: { userId: session.user.id },
      select: { tutorId: true },
    });

    const tutorIds = shortlists.map((s: { tutorId: string }) => s.tutorId);
    return NextResponse.json(tutorIds);
  } catch (error) {
    console.error("Error fetching shortlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "student" && session.user.role !== "parent")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { tutorId } = body;

    if (!tutorId) {
      return NextResponse.json({ error: "tutorId is required" }, { status: 400 });
    }

    const existing = await prisma.shortlist.findUnique({
      where: {
        userId_tutorId: {
          userId: session.user.id,
          tutorId: tutorId,
        },
      },
    });

    if (existing) {
      // Remove from shortlist
      await prisma.shortlist.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ message: "Removed from shortlist", shortlisted: false });
    } else {
      // Add to shortlist
      await prisma.shortlist.create({
        data: {
          userId: session.user.id,
          tutorId: tutorId,
        },
      });
      return NextResponse.json({ message: "Added to shortlist", shortlisted: true });
    }
  } catch (error) {
    console.error("Error toggling shortlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
