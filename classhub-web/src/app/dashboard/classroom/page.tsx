import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { ClassroomManager } from "./classroom-manager";

export default async function ClassroomPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "tutor") redirect("/dashboard");

  const students = await prisma.booking.findMany({
    where: { tutorId: session.user.id, status: "Confirmed" },
    select: { studentId: true, student: { select: { id: true, name: true, email: true } } },
  });

  const uniqueStudents = Array.from(
    new Map(students.map((b) => [b.student.id, b.student])).values()
  );

  const today = new Date().toISOString().split("T")[0];
  const todayAttendance = await prisma.attendanceRecord.findMany({
    where: { tutorId: session.user.id, date: today },
  });

  const progressRecords = await prisma.progressRecord.findMany({
    where: { tutorId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <ClassroomManager
      tutorId={session.user.id}
      tutorName={session.user.name || "Tutor"}
      students={uniqueStudents}
      todayAttendance={todayAttendance}
      progressRecords={progressRecords}
    />
  );
}
