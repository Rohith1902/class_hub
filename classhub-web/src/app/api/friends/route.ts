import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

// POST: Send friend request (add friend by user ID)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { friendId } = await req.json();
  if (!friendId) return NextResponse.json({ error: "friendId required" }, { status: 400 });

  const myProfile = await prisma.studentProfile.findUnique({ where: { userId: session.user.id } });
  if (!myProfile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const friends: string[] = JSON.parse(myProfile.friends || "[]");
  if (friends.includes(friendId)) {
    return NextResponse.json({ error: "Already friends" }, { status: 400 });
  }

  friends.push(friendId);
  await prisma.studentProfile.update({
    where: { userId: session.user.id },
    data: { friends: JSON.stringify(friends) },
  });

  return NextResponse.json({ success: true, friends });
}

// GET: Get friend list with profiles
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const myProfile = await prisma.studentProfile.findUnique({ where: { userId: session.user.id } });
  const friendIds: string[] = myProfile ? JSON.parse(myProfile.friends || "[]") : [];

  const friends = await prisma.user.findMany({
    where: { id: { in: friendIds } },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json(friends);
}
