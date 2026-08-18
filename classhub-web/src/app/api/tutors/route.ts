import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const profiles = await prisma.tutorProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
          }
        }
      }
    });

    const formattedProfiles = profiles.map(p => ({
      id: p.userId, // use userId as the tutor identifier for bookings
      name: p.user.name,
      kind: p.kind,
      subjects: JSON.parse(p.subjects),
      grades: p.grades,
      location: p.location,
      formats: JSON.parse(p.formats),
      fee: p.fee,
      rating: p.rating,
      reviewsCount: p.reviewsCount,
      experience: p.experience,
      verified: p.verified,
      bio: p.bio,
      achievements: JSON.parse(p.achievements || "[]"),
      reviews: JSON.parse(p.reviews || "[]")
    }));

    return NextResponse.json(formattedProfiles);
  } catch (error) {
    console.error("Failed to fetch tutors:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
