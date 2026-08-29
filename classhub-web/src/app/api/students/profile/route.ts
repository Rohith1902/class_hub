import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: { select: { name: true, email: true } },
        skills: { orderBy: { name: 'asc' } },
        achievements: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: profile.user.name,
      email: profile.user.email,
      bio: profile.bio || "",
      school: profile.school || "",
      grade: profile.grade || "",
      skills: profile.skills.map((s: { name: string }) => s.name),
      achievements: profile.achievements.map((a: { title: string }) => a.title),
    });
  } catch (error) {
    console.error("Error fetching student profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, bio, school, grade, skills = [], achievements = [] } = body;

    // Update User and StudentProfile
    await prisma.$transaction(async (tx: any) => {
      // 1. Update User name
      await tx.user.update({
        where: { id: session.user.id },
        data: { name },
      });

      // 2. Update StudentProfile basics
      const profile = await tx.studentProfile.upsert({
        where: { userId: session.user.id },
        update: { bio, school, grade },
        create: { userId: session.user.id, bio, school, grade },
      });

      // 3. Update Skills (delete existing and recreate)
      await tx.studentSkill.deleteMany({ where: { studentProfileId: profile.id } });
      if (skills.length > 0) {
        await tx.studentSkill.createMany({
          data: skills.map((s: string) => ({ studentProfileId: profile.id, name: s })),
        });
      }

      // 4. Update Achievements (delete existing and recreate)
      await tx.studentAchievement.deleteMany({ where: { studentProfileId: profile.id } });
      if (achievements.length > 0) {
        await tx.studentAchievement.createMany({
          data: achievements.map((a: string, i: number) => ({
            studentProfileId: profile.id,
            title: a,
            date: new Date().toISOString().split("T")[0],
            icon: "🏆",
            sortOrder: i,
          })),
        });
      }
    });

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating student profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
