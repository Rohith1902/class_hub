import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

// POST: Tutor marks attendance for today
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "tutor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { attendance } = await req.json();
  // attendance: Record<studentId, "present" | "absent" | "late">
  const today = new Date().toISOString().split("T")[0];
  const tutorId = session.user.id;

  // Upsert each student's attendance
  for (const [studentId, status] of Object.entries(attendance as Record<string, string>)) {
    const existing = await prisma.attendanceRecord.findFirst({
      where: { tutorId, studentId, date: today },
    });

    if (existing) {
      await prisma.attendanceRecord.update({
        where: { id: existing.id },
        data: { status },
      });
    } else {
      await prisma.attendanceRecord.create({
        data: { tutorId, studentId, date: today, status },
      });
    }
  }

  return NextResponse.json({ success: true });
}

// GET: Fetch attendance for a student (used by parent)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  if (!studentId) return NextResponse.json({ error: "studentId required" }, { status: 400 });

  const records = await prisma.attendanceRecord.findMany({
    where: { studentId },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(records);
}
