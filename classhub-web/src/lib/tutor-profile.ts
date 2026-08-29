import { prisma } from "@/lib/db";

export async function upsertTutorProfileLists(
  tutorProfileId: string,
  data: {
    subjects?: string[];
    formats?: string[];
    achievements?: string[];
    reviews?: { name: string; rating: number; text: string }[];
  }
) {
  const { subjects, formats, achievements, reviews } = data;

  if (subjects !== undefined) {
    await prisma.tutorSubject.deleteMany({ where: { tutorProfileId } });
    if (subjects.length > 0) {
      await prisma.tutorSubject.createMany({
        data: subjects.map((subject) => ({ tutorProfileId, subject })),
      });
    }
  }

  if (formats !== undefined) {
    await prisma.tutorFormat.deleteMany({ where: { tutorProfileId } });
    if (formats.length > 0) {
      await prisma.tutorFormat.createMany({
        data: formats.map((format) => ({ tutorProfileId, format })),
      });
    }
  }

  if (achievements !== undefined) {
    await prisma.tutorAchievement.deleteMany({ where: { tutorProfileId } });
    if (achievements.length > 0) {
      await prisma.tutorAchievement.createMany({
        data: achievements.map((title, sortOrder) => ({ tutorProfileId, title, sortOrder })),
      });
    }
  }

  if (reviews !== undefined) {
    await prisma.tutorReview.deleteMany({ where: { tutorProfileId } });
    if (reviews.length > 0) {
      await prisma.tutorReview.createMany({
        data: reviews.map((review) => ({
          tutorProfileId,
          authorName: review.name,
          rating: review.rating,
          text: review.text,
        })),
      });
      const count = reviews.length;
      const rating =
        count === 0
          ? 0
          : Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10;
      await prisma.tutorProfile.update({
        where: { id: tutorProfileId },
        data: { reviewsCount: count, rating },
      });
    }
  }
}

export async function upsertStudentProfileLists(
  studentProfileId: string,
  data: {
    skills?: string[] | { name: string; level?: number }[];
    achievements?: { title: string; date: string; icon?: string }[];
  }
) {
  const { skills, achievements } = data;

  if (skills !== undefined) {
    await prisma.studentSkill.deleteMany({ where: { studentProfileId } });
    if (skills.length > 0) {
      await prisma.studentSkill.createMany({
        data: skills.map((skill) =>
          typeof skill === "string"
            ? { studentProfileId, name: skill, level: 1 }
            : { studentProfileId, name: skill.name, level: skill.level ?? 1 }
        ),
      });
    }
  }

  if (achievements !== undefined) {
    await prisma.studentAchievement.deleteMany({ where: { studentProfileId } });
    if (achievements.length > 0) {
      await prisma.studentAchievement.createMany({
        data: achievements.map((achievement, sortOrder) => ({
          studentProfileId,
          title: achievement.title,
          date: achievement.date,
          icon: achievement.icon ?? "🏆",
          sortOrder,
        })),
      });
    }
  }
}
