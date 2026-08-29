import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { tutorProfileInclude, serializeTutorProfile } from "@/lib/serializers";

export async function GET() {
  try {
    const profiles = await prisma.tutorProfile.findMany({
      include: tutorProfileInclude,
    });

    return NextResponse.json(profiles.map(serializeTutorProfile));
  } catch (error) {
    console.error("Failed to fetch tutors:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
