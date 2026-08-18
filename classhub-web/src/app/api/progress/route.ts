import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

// POST: Tutor posts homework / test / mark / mentorship / appreciation
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "tutor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, title, description, dueDate, studentIds, score, maxScore, month } = await req.json();

  if (!type || !title || !studentIds?.length) {
    return NextResponse.json({ error: "type, title, studentIds required" }, { status: 400 });
  }

  const records = await prisma.progressRecord.createMany({
    data: (studentIds as string[]).map((studentId: string) => ({
      tutorId: session.user.id,
      studentId,
      type,
      title,
      description: description || null,
      dueDate: dueDate || null,
      score: score ?? null,
      maxScore: maxScore ?? null,
      month: month || null,
    })),
  });

  return NextResponse.json({ success: true, count: records.count });
}

// GET: Fetch progress records for a student
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const type = searchParams.get("type");

  const records = await prisma.progressRecord.findMany({
    where: {
      ...(studentId ? { studentId } : {}),
      ...(type ? { type } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(records);
}
