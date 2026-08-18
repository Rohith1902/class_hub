import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp, CheckCircle, XCircle, Clock, BookOpen,
  FileText, Heart, Trophy, Calendar, BarChart3, Sparkles
} from "lucide-react";

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "parent") redirect("/dashboard");

  const parentLink = await prisma.parentLink.findFirst({
    where: { parentId: session.user.id },
    include: { student: { select: { id: true, name: true } } },
  });

  if (!parentLink) redirect("/dashboard");
  const { student } = parentLink;

  const attendance = await prisma.attendanceRecord.findMany({
    where: { studentId: student.id },
    orderBy: { date: "desc" },
  });

  const progressRecords = await prisma.progressRecord.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: "desc" },
  });

  const homework    = progressRecords.filter(r => r.type === "homework");
  const tests       = progressRecords.filter(r => r.type === "test");
  const marks       = progressRecords.filter(r => r.type === "mark");
  const mentorship  = progressRecords.filter(r => r.type === "mentorship");
  const appreciation = progressRecords.filter(r => r.type === "appreciation");

  const presentDays = attendance.filter(a => a.status === "present").length;
  const totalDays   = attendance.length;
  const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  // Last 30 days for calendar
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });

  const attendanceMap = Object.fromEntries(attendance.map(a => [a.date, a.status]));

  return (
    <div className="pb-24">
      {/* Header */}
      <section className="relative w-full bg-purple-500/10 border-b border-purple-500/20 overflow-hidden">
        <div className="container max-w-6xl mx-auto px-4 py-12 relative z-10">
          <Badge variant="outline" className="bg-background text-purple-500 border-purple-500/30 mb-4 gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> Progress Portal
          </Badge>
          <h1 className="text-3xl font-bold font-heading mb-2">
            <span className="text-purple-500">{student.name}&apos;s</span> Progress Report
          </h1>
          <p className="text-muted-foreground">Complete view of attendance, tests, homework and tutor feedback.</p>
        </div>
      </section>

      <div className="container max-w-6xl mx-auto px-4 mt-8 space-y-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Attendance", value: `${attendancePct}%`, sub: `${presentDays}/${totalDays} days`, icon: <CheckCircle />, color: "emerald" },
            { label: "Tests Given", value: tests.length, sub: "scheduled tests", icon: <FileText />, color: "blue" },
            { label: "Homework", value: homework.length, sub: "assignments", icon: <BookOpen />, color: "amber" },
            { label: "Appreciations", value: appreciation.length, sub: "awards received", icon: <Trophy />, color: "purple" },
          ].map((s) => (
            <Card key={s.label} className="bg-card border-border rounded-2xl">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-xl bg-${s.color}-500/10 text-${s.color}-500 flex items-center justify-center mb-3`}>
                  {s.icon}
                </div>
                <p className="text-2xl font-bold font-heading">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Attendance Heatmap */}
        <Card className="bg-card border-border rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-purple-500" /> Attendance — Last 30 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {last30.map((day) => {
                const status = attendanceMap[day];
                return (
                  <div key={day} title={`${day}: ${status || "not marked"}`}
                    className={`w-7 h-7 rounded-md transition-all hover:scale-110 cursor-default ${
                      status === "present" ? "bg-emerald-500" :
                      status === "absent"  ? "bg-red-400" :
                      status === "late"    ? "bg-amber-400" :
                      "bg-muted"
                    }`} />
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-500 rounded" /> Present</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-400 rounded" /> Late</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-400 rounded" /> Absent</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-muted rounded" /> Not Marked</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Test Marks */}
          <Card className="bg-card border-border rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-blue-500" /> Test Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {marks.length === 0 && tests.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-6">No test results yet.</p>
              )}
              {marks.map((m) => {
                const pct = m.maxScore ? Math.round(((m.score || 0) / m.maxScore) * 100) : null;
                return (
                  <div key={m.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{m.title}</span>
                      <span className={`font-bold ${pct && pct >= 75 ? "text-emerald-600" : pct && pct >= 50 ? "text-amber-600" : "text-red-600"}`}>
                        {m.score}/{m.maxScore} {pct !== null && `(${pct}%)`}
                      </span>
                    </div>
                    {pct !== null && (
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all ${pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                    )}
                  </div>
                );
              })}
              {/* Upcoming Tests */}
              {tests.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                  <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{t.title}</p>
                    {t.dueDate && <p className="text-xs text-muted-foreground">Scheduled: {t.dueDate}</p>}
                  </div>
                  <Badge variant="outline" className="ml-auto text-xs text-blue-600 border-blue-200">Upcoming</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Homework */}
          <Card className="bg-card border-border rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5 text-amber-500" /> Homework Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {homework.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-6">No homework assigned yet.</p>
              )}
              {homework.map((h) => (
                <div key={h.id} className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                  <BookOpen className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{h.title}</p>
                    {h.description && <p className="text-xs text-muted-foreground mt-0.5">{h.description}</p>}
                    {h.dueDate && <p className="text-xs text-amber-600 font-medium mt-1">Due: {h.dueDate}</p>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Mentorship Notes & Appreciation */}
        {(mentorship.length > 0 || appreciation.length > 0) && (
          <Card className="bg-gradient-to-br from-rose-500/5 to-purple-500/5 border-rose-500/20 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="w-5 h-5 text-rose-500" /> Tutor&apos;s Notes & Appreciation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mentorship.map((m) => (
                <div key={m.id} className="p-4 bg-card border border-rose-500/20 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span className="text-sm font-semibold">{m.title}</span>
                    {m.month && <Badge variant="outline" className="text-xs ml-auto">{m.month}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{m.description}</p>
                </div>
              ))}
              {appreciation.map((a) => (
                <div key={a.id} className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">🏆 {a.title}</p>
                    <p className="text-xs text-muted-foreground">Awarded by your tutor</p>
                  </div>
                  <Sparkles className="w-4 h-4 text-amber-500 ml-auto" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
