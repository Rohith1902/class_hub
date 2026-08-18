import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "tutor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.tutorProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: profile.user.name,
      email: profile.user.email,
      kind: profile.kind,
      subjects: JSON.parse(profile.subjects || "[]"),
      grades: profile.grades || "",
      location: profile.location || "",
      formats: JSON.parse(profile.formats || "[]"),
      fee: profile.fee,
      experience: profile.experience || "",
      bio: profile.bio || "",
      achievements: JSON.parse(profile.achievements || "[]"),
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

    // Update user name
    if (name) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
      });
    }

    // Update tutor profile
    const updatedProfile = await prisma.tutorProfile.update({
      where: { userId: session.user.id },
      data: {
        kind: kind || "Individual tutor",
        subjects: JSON.stringify(subjects || []),
        grades: grades || null,
        location: location || null,
        formats: JSON.stringify(formats || []),
        fee: parseInt(fee) || 500,
        experience: experience || null,
        bio: bio || null,
        achievements: JSON.stringify(achievements || []),
      },
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
