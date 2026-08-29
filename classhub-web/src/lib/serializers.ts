import type {
  TutorProfile,
  TutorSubject,
  TutorFormat,
  TutorAchievement,
  TutorReview,
  StudentProfile,
  StudentSkill,
  StudentAchievement,
  User,
} from "@prisma/client";

export const tutorProfileInclude = {
  user: { select: { name: true, email: true } },
  subjects: { orderBy: { subject: "asc" as const } },
  formats: { orderBy: { format: "asc" as const } },
  achievements: { orderBy: { sortOrder: "asc" as const } },
  reviews: { orderBy: { createdAt: "desc" as const } },
} as const;

export type TutorProfileWithRelations = TutorProfile & {
  user: Pick<User, "name" | "email">;
  subjects: TutorSubject[];
  formats: TutorFormat[];
  achievements: TutorAchievement[];
  reviews: TutorReview[];
};

export type StudentProfileWithRelations = StudentProfile & {
  skills: StudentSkill[];
  achievements: StudentAchievement[];
};

export function serializeTutorProfile(profile: TutorProfileWithRelations) {
  return {
    id: profile.userId,
    userId: profile.userId,
    name: profile.user.name,
    email: profile.user.email,
    kind: profile.kind,
    subjects: profile.subjects.map((s) => s.subject),
    grades: profile.grades,
    location: profile.location,
    formats: profile.formats.map((f) => f.format),
    fee: profile.fee,
    rating: profile.rating,
    reviewsCount: profile.reviewsCount,
    experience: profile.experience,
    verified: profile.verified,
    bio: profile.bio,
    batchSize: profile.batchSize,
    achievements: profile.achievements.map((a) => a.title),
    reviews: profile.reviews.map((r) => ({
      name: r.authorName,
      rating: r.rating,
      text: r.text,
    })),
  };
}

export function serializeStudentProfile(profile: StudentProfileWithRelations) {
  return {
    skills: profile.skills.map((s) => s.name),
    skillLevels: profile.skills.map((s) => ({ name: s.name, level: s.level })),
    achievements: profile.achievements.map((a) => ({
      title: a.title,
      date: a.date,
      icon: a.icon,
    })),
    grade: profile.grade,
    school: profile.school,
    bio: profile.bio,
  };
}

export async function syncTutorListFields(
  prisma: {
    tutorReview: { count: (args: { where: { tutorProfileId: string } }) => Promise<number> };
    tutorProfile: { update: (args: { where: { id: string }; data: { reviewsCount: number; rating: number } }) => Promise<unknown> };
  },
  tutorProfileId: string,
  reviews: { rating: number }[]
) {
  const reviewsCount = reviews.length;
  const rating =
    reviewsCount === 0
      ? 0
      : Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount) * 10) / 10;

  await prisma.tutorProfile.update({
    where: { id: tutorProfileId },
    data: { reviewsCount, rating },
  });
}
