import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { Filter } from "bad-words";

const filter = new Filter();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: tutorUserId } = await params;
    const body = await request.json();
    const { rating, text } = body;

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Valid rating (1-5) is required" }, { status: 400 });
    }

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Review text is required" }, { status: 400 });
    }

    // Profanity check
    if (filter.isProfane(text)) {
      return NextResponse.json({ error: "Your review contains inappropriate language." }, { status: 400 });
    }

    // Check if tutor exists
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: tutorUserId },
      include: { reviews: true },
    });

    if (!tutorProfile) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    // Create the review and update tutor rating in a transaction
    await prisma.$transaction(async (tx: any) => {
      await tx.tutorReview.create({
        data: {
          tutorProfileId: tutorProfile.id,
          authorName: session.user.name || "Anonymous",
          rating: rating,
          text: text.trim(),
        },
      });

      // Recalculate average rating
      const allReviews = await tx.tutorReview.findMany({
        where: { tutorProfileId: tutorProfile.id },
      });

      const totalRating = allReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0);
      const newRating = totalRating / allReviews.length;

      await tx.tutorProfile.update({
        where: { id: tutorProfile.id },
        data: {
          rating: Number(newRating.toFixed(1)),
          reviewsCount: allReviews.length,
        },
      });
    });

    return NextResponse.json({ message: "Review submitted successfully" });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
