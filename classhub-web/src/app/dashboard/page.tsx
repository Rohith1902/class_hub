import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AnimatedCard } from "@/components/ui/animated-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CalendarDays, DollarSign, Users, BookOpen, Clock, ArrowRight,
  Activity, TrendingUp, Sparkles, Trophy, UserPlus, Video,
  GitCompareArrows, BarChart3, ClipboardList, Star
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const { role } = session.user;

  // ─── STUDENT DATA ───────────────────────────────────────────
  if (role === "student") {
    const bookingCount = await prisma.booking.count({ where: { studentId: session.user.id } });
    const studentProfile = await prisma.studentProfile.findUnique({ 
      where: { userId: session.user.id },
      include: { skills: true, achievements: true } 
    });
    const recentBookings = await prisma.booking.findMany({
      where: { studentId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 4,
    });
    const skills = studentProfile?.skills.map((s) => s.name) || [];
    const achievements = studentProfile?.achievements || [];
    
    const friendCount = await prisma.friendship.count({
      where: {
        OR: [
          { requesterId: session.user.id, status: "accepted" },
          { addresseeId: session.user.id, status: "accepted" }
        ]
      }
    });

    return (
      <div className="pb-24">
        {/* Welcome Banner */}
        <section className="relative w-full bg-blue-500/10 border-b border-blue-500/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
          <div className="container max-w-6xl mx-auto px-4 py-16 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <Badge variant="outline" className="bg-background text-blue-500 border-blue-500/30 px-3 py-1 shadow-sm gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Student Dashboard
              </Badge>
              <h1 className="text-4xl font-bold font-heading text-foreground tracking-tight">
                Hey, <span className="text-blue-500">{session.user.name || "Student"}</span> 👋
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">Ready to learn? Here is your upcoming schedule and progress.</p>
            </div>
            <Link href="/search">
              <Button size="lg" className="rounded-xl shadow-xl bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20 hover:-translate-y-0.5 transition-all">
                Find a Tutor <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        <div className="container max-w-6xl mx-auto px-4 mt-8 space-y-8">
          {/* Stat Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            {[
              { label: "Classes Booked", value: bookingCount, icon: <BookOpen className="w-5 h-5" />, sub: "Keep it up!" },
              { label: "Skills", value: skills.length, icon: <Star className="w-5 h-5" />, sub: "Add more skills" },
              { label: "Achievements", value: achievements.length, icon: <Trophy className="w-5 h-5" />, sub: "Great work!" },
              { label: "Friends", value: friendCount, icon: <Users className="w-5 h-5" />, sub: "Expand your circle" },
            ].map((stat, i) => (
              <AnimatedCard key={stat.label} index={i}>
                <Card className="bg-card border-border shadow-xl shadow-blue-500/5 rounded-2xl h-full overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <div className="w-16 h-16 text-blue-500">{stat.icon}</div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">{stat.icon}</div>
                      <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold font-heading">{stat.value}</div>
                    <p className="text-sm text-muted-foreground mt-2">{stat.sub}</p>
                  </CardContent>
                </Card>
              </AnimatedCard>
            ))}
          </div>

          {/* Quick Actions */}
          <AnimatedCard index={4}>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { href: "/dashboard/achievements", label: "My Achievements", desc: "Showcase your skills & wins", icon: <Trophy />, color: "amber" },
                { href: "/search", label: "Browse Tutors", desc: "Find your perfect teacher", icon: <BookOpen />, color: "emerald" },
              ].map((a) => (
                <Link key={a.href} href={a.href}>
                  <Card className="hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer bg-card border-border rounded-2xl">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-${a.color}-500/10 text-${a.color}-500`}>{a.icon}</div>
                      <div>
                        <p className="font-semibold">{a.label}</p>
                        <p className="text-xs text-muted-foreground">{a.desc}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </AnimatedCard>

          {/* Recent Bookings */}
          <AnimatedCard index={5}>
            <Card className="bg-card border-border shadow-xl rounded-2xl">
              <CardHeader className="border-b border-border/40 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-heading flex items-center gap-2"><Activity className="w-5 h-5 text-blue-500" /> Recent Classes</CardTitle>
                  <CardDescription>Your upcoming scheduled sessions</CardDescription>
                </div>
                <Link href="/dashboard/bookings"><Button variant="ghost" className="text-blue-500 hover:bg-blue-500/10">View All</Button></Link>
              </CardHeader>
              <CardContent className="p-0">
                {recentBookings.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-center">
                    <CalendarDays className="w-10 h-10 text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">No classes yet. <Link href="/search" className="text-blue-500 underline">Find a tutor</Link></p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {recentBookings.map((b) => (
                      <div key={b.id} className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-semibold">{b.subject}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                              <CalendarDays className="w-3 h-3" /> {b.date} <Clock className="w-3 h-3" /> {b.time}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{b.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>
      </div>
    );
  }

  // ─── TUTOR DATA ───────────────────────────────────────────
  if (role === "tutor") {
    const bookingCount = await prisma.booking.count({ where: { tutorId: session.user.id } });
    const completedBookings = await prisma.booking.findMany({ where: { tutorId: session.user.id, status: "Completed" } });
    const revenue = completedBookings.reduce((acc, b) => acc + b.amount, 0);
    const recentBookings = await prisma.booking.findMany({
      where: { tutorId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 4,
    });
    const uniqueStudents = new Set(completedBookings.map((b) => b.studentId)).size;

    return (
      <div className="pb-24">
        <section className="relative w-full bg-primary/10 border-b border-primary/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
          <div className="container max-w-6xl mx-auto px-4 py-16 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <Badge variant="outline" className="bg-background text-primary border-primary/30 px-3 py-1 gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Tutor Dashboard
              </Badge>
              <h1 className="text-4xl font-bold font-heading tracking-tight">
                Welcome, <span className="text-primary">{session.user.name || "Tutor"}</span> 🎓
              </h1>
              <p className="text-lg text-muted-foreground">Here is your earnings and student activity overview.</p>
            </div>
          </div>
        </section>

        <div className="container max-w-6xl mx-auto px-4 mt-8 space-y-8">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { label: "Total Revenue", value: `₹${revenue}`, icon: <DollarSign />, sub: "+20.1% from last month", color: "emerald" },
              { label: "Total Bookings", value: bookingCount, icon: <CalendarDays />, sub: "+12% from last month", color: "primary" },
              { label: "Active Students", value: uniqueStudents, icon: <Users />, sub: "Across all classes", color: "blue" },
            ].map((stat, i) => (
              <AnimatedCard key={stat.label} index={i}>
                <Card className="bg-card border-border shadow-xl shadow-primary/5 rounded-2xl h-full overflow-hidden relative group">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-xl text-primary">{stat.icon}</div>
                      <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold font-heading">{stat.value}</div>
                    <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium mt-2">
                      <TrendingUp className="w-4 h-4" /><span>{stat.sub}</span>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            ))}
          </div>

          {/* Quick Actions */}
          <AnimatedCard index={3}>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { href: "/dashboard/earnings", label: "Earnings Report", desc: "View revenue & profit analytics", icon: <BarChart3 /> },
                { href: "/dashboard/profile", label: "Edit Profile", desc: "Customise your tutor showcase", icon: <Star /> },
              ].map((a) => (
                <Link key={a.href} href={a.href}>
                  <Card className="hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer bg-card border-border rounded-2xl">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary">{a.icon}</div>
                      <div><p className="font-semibold">{a.label}</p><p className="text-xs text-muted-foreground">{a.desc}</p></div>
                      <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </AnimatedCard>

          {/* Recent Bookings */}
          <AnimatedCard index={4}>
            <Card className="bg-card border-border shadow-xl rounded-2xl">
              <CardHeader className="border-b border-border/40 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl font-heading"><Activity className="w-5 h-5 text-primary" /> Recent Bookings</CardTitle>
                  <CardDescription>Latest class bookings from students</CardDescription>
                </div>
                <Link href="/dashboard/bookings"><Button variant="ghost" className="text-primary hover:bg-primary/10">View All</Button></Link>
              </CardHeader>
              <CardContent className="p-0">
                {recentBookings.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-center">
                    <CalendarDays className="w-10 h-10 text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">No bookings yet. Share your profile to attract students.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {recentBookings.map((b) => (
                      <div key={b.id} className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{b.subject}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                              <CalendarDays className="w-3 h-3" /> {b.date} <Clock className="w-3 h-3" /> {b.time}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-foreground">₹{b.amount}</span>
                          <Badge variant="outline">{b.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>
      </div>
    );
  }

  // ─── PARENT DATA ───────────────────────────────────────────
  const parentLink = await prisma.parentLink.findFirst({
    where: { parentId: session.user.id },
    include: { student: { select: { id: true, name: true, email: true } } },
  });
  const student = parentLink?.student;

  let todayAttendance = null;
  let upcomingHomework: { id: string; title: string; dueDate: string | null; type: string }[] = [];
  let recentMarks: { id: string; title: string; score: number | null; maxScore: number | null; type: string }[] = [];

  if (student) {
    const today = new Date().toISOString().split("T")[0];
    todayAttendance = await prisma.attendanceRecord.findFirst({
      where: { studentId: student.id, date: today },
    });
    const homeworkRaw = await prisma.progressRecord.findMany({
      where: { studentId: student.id, type: "homework" },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
    upcomingHomework = homeworkRaw.map((h) => ({ id: h.id, title: h.title, dueDate: h.dueDate, type: h.type }));
    const marksRaw = await prisma.progressRecord.findMany({
      where: { studentId: student.id, type: "mark" },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
    recentMarks = marksRaw.map((m) => ({ id: m.id, title: m.title, score: m.score, maxScore: m.maxScore, type: m.type }));
  }

  return (
    <div className="pb-24">
      <section className="relative w-full bg-purple-500/10 border-b border-purple-500/20 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="container max-w-6xl mx-auto px-4 py-16 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Badge variant="outline" className="bg-background text-purple-500 border-purple-500/30 px-3 py-1 gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Parent Dashboard
            </Badge>
            <h1 className="text-4xl font-bold font-heading tracking-tight">
              Hello, <span className="text-purple-500">{session.user.name || "Parent"}</span> 👨‍👩‍👧
            </h1>
            <p className="text-lg text-muted-foreground">
              {student ? `Monitoring ${student.name}'s progress and activity.` : "Link your child's account to get started."}
            </p>
          </div>
          <Link href="/dashboard/compare">
            <Button size="lg" className="rounded-xl bg-purple-500 hover:bg-purple-600 text-white shadow-xl shadow-purple-500/20 hover:-translate-y-0.5 transition-all">
              <GitCompareArrows className="w-4 h-4 mr-2" /> Compare Tutors
            </Button>
          </Link>
        </div>
      </section>

      <div className="container max-w-6xl mx-auto px-4 mt-8 space-y-8">
        {/* Today's Quick Status */}
        {student && (
          <AnimatedCard index={0}>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-card border-border rounded-2xl shadow-xl">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${todayAttendance?.status === "present" ? "bg-emerald-500/10 text-emerald-500" : todayAttendance?.status === "absent" ? "bg-red-500/10 text-red-500" : "bg-muted text-muted-foreground"}`}>
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Today&apos;s Attendance</p>
                    <p className="font-bold capitalize">{todayAttendance?.status || "Not marked yet"}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border rounded-2xl shadow-xl">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500"><ClipboardList className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Pending Homework</p>
                    <p className="font-bold">{upcomingHomework.length} assignments</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border rounded-2xl shadow-xl">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500"><BarChart3 className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Recent Test Results</p>
                    <p className="font-bold">{recentMarks.length} results</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedCard>
        )}

        {/* Quick Actions */}
        <AnimatedCard index={1}>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { href: "/dashboard/progress", label: "View Progress", desc: "Attendance, marks & mentorship", icon: <TrendingUp /> },
              { href: "/dashboard/compare", label: "Compare Tutors", desc: "Find the best fit for your child", icon: <GitCompareArrows /> },
              { href: "/dashboard/homework", label: "Homework & Tests", desc: "Track assignments and schedules", icon: <ClipboardList /> },
            ].map((a) => (
              <Link key={a.href} href={a.href}>
                <Card className="hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer bg-card border-border rounded-2xl">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">{a.icon}</div>
                    <div><p className="font-semibold">{a.label}</p><p className="text-xs text-muted-foreground">{a.desc}</p></div>
                    <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </AnimatedCard>

        {!student && (
          <AnimatedCard index={2}>
            <Card className="bg-card border-dashed border-2 border-purple-500/30 rounded-2xl">
              <CardContent className="p-10 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-heading font-bold">No Child Linked Yet</h3>
                <p className="text-muted-foreground max-w-sm">
                  Your account is not yet linked to a student. Please contact support or re-register with your child&apos;s email address.
                </p>
              </CardContent>
            </Card>
          </AnimatedCard>
        )}
      </div>
    </div>
  );
}
