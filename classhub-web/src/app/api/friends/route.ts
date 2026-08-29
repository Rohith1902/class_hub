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

  const existingFriendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: session.user.id, addresseeId: friendId },
        { requesterId: friendId, addresseeId: session.user.id }
      ]
    }
  });

  if (existingFriendship) {
    return NextResponse.json({ error: "Already friends or request pending" }, { status: 400 });
  }

  await prisma.friendship.create({
    data: {
      requesterId: session.user.id,
      addresseeId: friendId,
      status: "pending"
    }
  });

  return NextResponse.json({ success: true });
}

// GET: Get friend list with profiles
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { requesterId: session.user.id, status: "accepted" },
        { addresseeId: session.user.id, status: "accepted" }
      ]
    },
    include: {
      requester: { select: { id: true, name: true, email: true } },
      addressee: { select: { id: true, name: true, email: true } }
    }
  });

  const friends = friendships.map(f => 
    f.requesterId === session.user.id ? f.addressee : f.requester
  );

  return NextResponse.json(friends);
}
