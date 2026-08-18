import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, BookOpen, FileText, Calendar, Clock } from "lucide-react";

export default async function HomeworkPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "parent") redirect("/dashboard");

  const parentLink = await prisma.parentLink.findFirst({
    where: { parentId: session.user.id },
    include: { student: { select: { id: true, name: true } } },
  });

  if (!parentLink) redirect("/dashboard");
  const { student } = parentLink;

  const records = await prisma.progressRecord.findMany({
    where: { studentId: student.id, type: { in: ["homework", "test"] } },
    orderBy: { createdAt: "desc" },
  });

  const homework = records.filter(r => r.type === "homework");
  const tests    = records.filter(r => r.type === "test");

  return (
    <div className="pb-24">
      <section className="relative w-full bg-amber-500/10 border-b border-amber-500/20 overflow-hidden">
        <div className="container max-w-6xl mx-auto px-4 py-12 relative z-10">
          <Badge variant="outline" className="bg-background text-amber-500 border-amber-500/30 mb-4 gap-1.5">
            <ClipboardList className="w-3.5 h-3.5" /> Homework & Tests
          </Badge>
          <h1 className="text-3xl font-bold font-heading mb-2">
            <span className="text-amber-500">{student.name}&apos;s</span> Assignments
          </h1>
          <p className="text-muted-foreground">All homework and upcoming test schedules assigned by the tutor.</p>
        </div>
      </section>

      <div className="container max-w-6xl mx-auto px-4 mt-8 grid gap-6 lg:grid-cols-2">
        {/* Homework */}
        <Card className="bg-card border-border rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" /> Homework ({homework.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {homework.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-8">No homework assigned yet.</p>
            )}
            {homework.map((h) => (
              <div key={h.id} className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-2">
                <div className="flex items-start justify-between">
                  <p className="font-semibold">{h.title}</p>
                  {h.dueDate && (
                    <span className="text-xs bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {h.dueDate}
                    </span>
                  )}
                </div>
                {h.description && <p className="text-sm text-muted-foreground">{h.description}</p>}
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Assigned {new Date(h.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tests */}
        <Card className="bg-card border-border rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" /> Tests Scheduled ({tests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tests.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-8">No tests scheduled yet.</p>
            )}
            {tests.map((t) => (
              <div key={t.id} className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-2">
                <div className="flex items-start justify-between">
                  <p className="font-semibold">{t.title}</p>
                  {t.dueDate && (
                    <span className="text-xs bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {t.dueDate}
                    </span>
                  )}
                </div>
                {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
