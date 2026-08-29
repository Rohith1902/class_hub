import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { tutorProfileInclude, serializeTutorProfile } from "@/lib/serializers";
import { upsertTutorProfileLists } from "@/lib/tutor-profile";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "tutor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.tutorProfile.findUnique({
      where: { userId: session.user.id },
      include: tutorProfileInclude,
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const serialized = serializeTutorProfile(profile);
    return NextResponse.json({
      name: serialized.name,
      email: serialized.email,
      kind: serialized.kind,
      subjects: serialized.subjects,
      grades: serialized.grades || "",
      location: serialized.location || "",
      formats: serialized.formats,
      fee: serialized.fee,
      experience: serialized.experience || "",
      bio: serialized.bio || "",
      achievements: serialized.achievements,
    });
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "tutor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, kind, subjects, grades, location, formats, fee, experience, bio, achievements } = body;

    if (name) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
      });
    }

    const updatedProfile = await prisma.tutorProfile.update({
      where: { userId: session.user.id },
      data: {
        kind: kind || "Individual tutor",
        grades: grades || null,
        location: location || null,
        fee: parseInt(fee) || 500,
        experience: experience || null,
        bio: bio || null,
      },
    });

    await upsertTutorProfileLists(updatedProfile.id, {
      subjects: subjects || [],
      formats: formats || [],
      achievements: achievements || [],
    });

    const profile = await prisma.tutorProfile.findUnique({
      where: { userId: session.user.id },
      include: tutorProfileInclude,
    });

    return NextResponse.json({ success: true, profile: profile ? serializeTutorProfile(profile) : null });
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
