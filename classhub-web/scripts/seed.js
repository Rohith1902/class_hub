const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ── 2 Tutors ──────────────────────────────────────────────────────────
const TUTORS = [
  {
    id: "t1",
    name: "Lakshmi Narayanan",
    kind: "Individual tutor",
    subjects: ["Mathematics", "Physics"],
    grades: "Grades 9–12, CBSE & State Board",
    location: "Adyar",
    formats: ["Home visit", "Online"],
    fee: 650,
    rating: 4.8,
    reviewsCount: 63,
    experience: "11 years",
    verified: true,
    batchSize: 8,
    bio: "Former HOD of Mathematics at a CBSE school in Adyar, now teaching full-time. Focuses on problem-solving speed for board and entrance exams.",
    achievements: [
      "94% of students scored above 85 in Class 12 CBSE boards (2025 batch)",
      "Coached 40+ students into JEE Main qualification since 2019",
      "Author of a self-published Class 10 Maths practice workbook"
    ],
    reviews: [
      { name: "Meera S.", rating: 5, text: "My son went from a C to an A in one term. Explains concepts patiently." },
      { name: "Ganesh R.", rating: 5, text: "Very structured. Sends a WhatsApp summary after every class." },
      { name: "Priya K.", rating: 4, text: "Great teaching, slots fill up fast so book a few weeks ahead." }
    ]
  },
  {
    id: "t2",
    name: "Vidya Achievers Academy",
    kind: "Tuition center",
    subjects: ["Chemistry", "Biology", "Physics"],
    grades: "NEET & Class 11–12",
    location: "Velachery",
    formats: ["At center"],
    fee: 900,
    rating: 4.6,
    reviewsCount: 128,
    experience: "9 years running",
    verified: true,
    batchSize: 18,
    bio: "A NEET-focused center with five full-time faculty and weekly mock tests. Batches capped at 18 students so doubt-clearing sessions stay personal.",
    achievements: [
      "212 NEET qualifiers in the last 3 years",
      "6 students in Government Medical College, Chennai (2025)",
      "Weekly All-India-style mock test with rank sheet"
    ],
    reviews: [
      { name: "Divya M.", rating: 5, text: "The mock tests are exactly the difficulty level of the real exam. Huge help." },
      { name: "Suresh V.", rating: 4, text: "Good faculty, though the center can get crowded during peak evening slots." }
    ]
  }
];

// ── 5 Parents (created FIRST so their accounts exist) ─────────────────
const PARENTS = [
  { id: "p1", name: "Ramesh Sharma",  email: "ramesh.parent@classhub.dev",  childId: "s1" },
  { id: "p2", name: "Sunita Nair",    email: "sunita.parent@classhub.dev",   childId: "s2" },
  { id: "p3", name: "Vijay Mehta",    email: "vijay.parent@classhub.dev",    childId: "s3" },
  { id: "p4", name: "Kavitha Pillai", email: "kavitha.parent@classhub.dev",  childId: "s4" },
  { id: "p5", name: "Aruna Kumar",    email: "aruna.parent@classhub.dev",    childId: "s5" },
];

// ── 5 Students (created AFTER parents) ───────────────────────────────
const STUDENTS = [
  {
    id: "s1",
    name: "Arjun Sharma",
    email: "arjun.student@classhub.dev",
    tutorId: "t1",
    grade: "Class 11",
    school: "DAV Public School",
    skills: ["Mathematics", "Physics"],
    achievements: [
      { title: "Top Scorer — Maths Test", date: "Jul 2026", icon: "🏆" },
      { title: "Perfect Attendance — June", date: "Jun 2026", icon: "🎯" }
    ]
  },
  {
    id: "s2",
    name: "Priya Nair",
    email: "priya.student@classhub.dev",
    tutorId: "t2",
    grade: "Class 12",
    school: "Kendriya Vidyalaya",
    skills: ["Biology", "Chemistry"],
    achievements: [
      { title: "NEET Mock — All India Rank 245", date: "Aug 2026", icon: "⭐" }
    ]
  },
  {
    id: "s3",
    name: "Rohan Mehta",
    email: "rohan.student@classhub.dev",
    tutorId: "t1",
    grade: "Class 10",
    school: "SBOA School",
    skills: ["Mathematics", "Computer"],
    achievements: [
      { title: "Completed 10 Classes", date: "Jun 2026", icon: "🎓" }
    ]
  },
  {
    id: "s4",
    name: "Sneha Pillai",
    email: "sneha.student@classhub.dev",
    tutorId: "t2",
    grade: "Class 12",
    school: "Chettinad Vidyashram",
    skills: ["Chemistry", "Biology", "Physics"],
    achievements: [
      { title: "Star Performer — July", date: "Jul 2026", icon: "🌟" },
      { title: "100% Homework Submission", date: "Jun 2026", icon: "📚" }
    ]
  },
  {
    id: "s5",
    name: "Aditya Kumar",
    email: "aditya.student@classhub.dev",
    tutorId: "t1",
    grade: "Class 11",
    school: "Velammal School",
    skills: ["Physics", "Mathematics"],
    achievements: [
      { title: "Early Bird — 5 Early Logins", date: "Jun 2026", icon: "⏰" }
    ]
  }
];

// ── Sample Bookings ───────────────────────────────────────────────────
const BOOKINGS = [
  { studentId: "s1", tutorId: "t1", subject: "Mathematics", date: "2026-08-20", time: "5:00 PM", amount: 650, status: "Confirmed" },
  { studentId: "s3", tutorId: "t1", subject: "Physics",     date: "2026-08-21", time: "4:00 PM", amount: 650, status: "Confirmed" },
  { studentId: "s5", tutorId: "t1", subject: "Mathematics", date: "2026-08-22", time: "6:00 PM", amount: 650, status: "Pending" },
  { studentId: "s2", tutorId: "t2", subject: "Chemistry",   date: "2026-08-19", time: "7:00 AM", amount: 900, status: "Completed" },
  { studentId: "s4", tutorId: "t2", subject: "Biology",     date: "2026-08-20", time: "8:00 AM", amount: 900, status: "Confirmed" },
];

// ── Sample Attendance (last 7 days for students at t1) ────────────────
function last7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

// ── Sample Progress records ────────────────────────────────────────────
const PROGRESS = [
  // Homework for t1 students
  { tutorId: "t1", studentId: "s1", type: "homework", title: "Chapter 5 — Quadratic Equations", description: "Solve exercises 5.1 to 5.4", dueDate: "2026-08-22" },
  { tutorId: "t1", studentId: "s3", type: "homework", title: "Chapter 5 — Quadratic Equations", description: "Solve exercises 5.1 to 5.4", dueDate: "2026-08-22" },
  { tutorId: "t1", studentId: "s5", type: "homework", title: "Newton's Laws — Problems Set 2", description: "Complete all 15 problems from the worksheet", dueDate: "2026-08-23" },
  // Test schedule
  { tutorId: "t1", studentId: "s1", type: "test", title: "Unit Test — Calculus", description: "Chapters 4 and 5 included", dueDate: "2026-08-28" },
  { tutorId: "t2", studentId: "s2", type: "test", title: "NEET Mock Test #8", description: "Full syllabus — 3 hours", dueDate: "2026-08-25" },
  { tutorId: "t2", studentId: "s4", type: "test", title: "NEET Mock Test #8", description: "Full syllabus — 3 hours", dueDate: "2026-08-25" },
  // Marks
  { tutorId: "t1", studentId: "s1", type: "mark", title: "Unit Test — Algebra", score: 88, maxScore: 100 },
  { tutorId: "t1", studentId: "s3", type: "mark", title: "Unit Test — Algebra", score: 72, maxScore: 100 },
  { tutorId: "t2", studentId: "s2", type: "mark", title: "NEET Mock Test #7", score: 520, maxScore: 720 },
  { tutorId: "t2", studentId: "s4", type: "mark", title: "NEET Mock Test #7", score: 480, maxScore: 720 },
  // Mentorship notes
  { tutorId: "t1", studentId: "s1", type: "mentorship", title: "Monthly Mentorship Note", description: "Arjun has shown remarkable improvement in calculus this month. His problem-solving speed has increased by 40%. Encourage him to attempt JEE-level problems next.", month: "2026-08" },
  { tutorId: "t2", studentId: "s2", type: "mentorship", title: "Monthly Mentorship Note", description: "Priya is consistent and hardworking. Her biology scores are excellent. Focus on improving organic chemistry — specifically reaction mechanisms.", month: "2026-08" },
  // Appreciation
  { tutorId: "t1", studentId: "s1", type: "appreciation", title: "Most Improved Student — August 2026" },
  { tutorId: "t2", studentId: "s4", type: "appreciation", title: "Star Performer — July 2026" },
];

async function main() {
  console.log("🌱 Starting seed...\n");

  // Clean slate — order matters due to foreign keys
  console.log("  Clearing existing data...");
  await prisma.progressRecord.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.parentLink.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.tutorProfile.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 10);

  // ── 1. Create Tutors ──────────────────────────────────────────────
  console.log("  Creating 2 tutors...");
  for (const t of TUTORS) {
    const user = await prisma.user.create({
      data: { id: t.id, email: `tutor_${t.id}@classhub.dev`, name: t.name, password, role: "tutor" }
    });
    await prisma.tutorProfile.create({
      data: {
        userId: user.id,
        kind: t.kind,
        subjects: JSON.stringify(t.subjects),
        grades: t.grades,
        location: t.location,
        formats: JSON.stringify(t.formats),
        fee: t.fee,
        rating: t.rating,
        reviewsCount: t.reviewsCount,
        experience: t.experience,
        verified: t.verified,
        batchSize: t.batchSize,
        bio: t.bio,
        achievements: JSON.stringify(t.achievements),
        reviews: JSON.stringify(t.reviews),
      }
    });
    console.log(`    ✓ Tutor: ${t.name} (${user.email})`);
  }

  // ── 2. Create Parents FIRST ───────────────────────────────────────
  console.log("\n  Creating 5 parents first...");
  const parentUsers = {};
  for (const p of PARENTS) {
    const user = await prisma.user.create({
      data: { id: p.id, email: p.email, name: p.name, password, role: "parent" }
    });
    parentUsers[p.id] = user;
    console.log(`    ✓ Parent: ${p.name} (${p.email})  [will link to student ${p.childId}]`);
  }

  // ── 3. Create Students AFTER parents ──────────────────────────────
  console.log("\n  Creating 5 students...");
  for (const s of STUDENTS) {
    const user = await prisma.user.create({
      data: { id: s.id, email: s.email, name: s.name, password, role: "student" }
    });
    await prisma.studentProfile.create({
      data: {
        userId: user.id,
        grade: s.grade,
        school: s.school,
        skills: JSON.stringify(s.skills),
        achievements: JSON.stringify(s.achievements),
        friends: JSON.stringify([]),
      }
    });
    console.log(`    ✓ Student: ${s.name} (${s.email})`);
  }

  // ── 4. Link Parents ↔ Students ────────────────────────────────────
  console.log("\n  Linking parents to students...");
  for (const p of PARENTS) {
    await prisma.parentLink.create({
      data: { parentId: p.id, studentId: p.childId }
    });
    const parent  = PARENTS.find(x => x.id === p.id);
    const student = STUDENTS.find(x => x.id === p.childId);
    console.log(`    ✓ ${parent.name} → ${student.name}`);
  }

  // ── 5. Seed Bookings ──────────────────────────────────────────────
  console.log("\n  Seeding bookings...");
  for (const b of BOOKINGS) {
    await prisma.booking.create({ data: b });
  }
  console.log(`    ✓ ${BOOKINGS.length} bookings created`);

  // ── 6. Seed Attendance (last 7 days) ─────────────────────────────
  console.log("\n  Seeding attendance records...");
  const days = last7Days();
  const statuses = ["present", "present", "present", "present", "late", "present", "absent"];
  const t1Students = ["s1", "s3", "s5"];
  const t2Students = ["s2", "s4"];

  for (const [i, day] of days.entries()) {
    for (const studentId of t1Students) {
      await prisma.attendanceRecord.create({
        data: { tutorId: "t1", studentId, date: day, status: statuses[i], subject: "Mathematics" }
      });
    }
    for (const studentId of t2Students) {
      await prisma.attendanceRecord.create({
        data: { tutorId: "t2", studentId, date: day, status: i === 3 ? "absent" : "present", subject: "Biology" }
      });
    }
  }
  console.log(`    ✓ Attendance for last 7 days created`);

  // ── 7. Seed Progress Records ──────────────────────────────────────
  console.log("\n  Seeding progress records (homework / tests / marks / mentorship)...");
  for (const rec of PROGRESS) {
    await prisma.progressRecord.create({ data: rec });
  }
  console.log(`    ✓ ${PROGRESS.length} progress records created`);

  // ── Summary ───────────────────────────────────────────────────────
  console.log("\n✅ Seed complete!\n");
  console.log("  Login credentials (all use password: password123)");
  console.log("  ─────────────────────────────────────────────────");
  console.log("  TUTORS:");
  console.log("    tutor_t1@classhub.dev  →  Lakshmi Narayanan");
  console.log("    tutor_t2@classhub.dev  →  Vidya Achievers Academy");
  console.log("  PARENTS (created first):");
  for (const p of PARENTS) {
    const child = STUDENTS.find(s => s.id === p.childId);
    console.log(`    ${p.email.padEnd(35)} →  ${p.name} (parent of ${child.name})`);
  }
  console.log("  STUDENTS (created after):");
  for (const s of STUDENTS) {
    const tutor = TUTORS.find(t => t.id === s.tutorId);
    console.log(`    ${s.email.padEnd(35)} →  ${s.name} (enrolled with ${tutor.name})`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
