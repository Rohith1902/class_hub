"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Users, CheckCircle, XCircle, Clock, Video, BookOpen,
  ClipboardList, FileText, Heart, Plus, Send, Calendar, Trophy, ArrowRight
} from "lucide-react";
import Link from "next/link";

type Student = { id: string; name: string | null; email: string };
type AttendanceRecord = { studentId: string; status: string };
type ProgressRecord = { id: string; type: string; title: string; description: string | null; dueDate: string | null; createdAt: Date };

type Props = {
  tutorId: string;
  tutorName: string;
  students: Student[];
  todayAttendance: AttendanceRecord[];
  progressRecords: ProgressRecord[];
};

type AttendanceStatus = "present" | "absent" | "late";

export function ClassroomManager({ tutorId, tutorName, students, todayAttendance, progressRecords }: Props) {
  const [tab, setTab] = useState<"attendance" | "homework" | "mentorship">("attendance");
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(() => {
    const init: Record<string, AttendanceStatus> = {};
    todayAttendance.forEach((a) => { init[a.studentId] = a.status as AttendanceStatus; });
    students.forEach((s) => { if (!init[s.id]) init[s.id] = "present"; });
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Homework / Test form
  const [hwTitle, setHwTitle] = useState("");
  const [hwDesc, setHwDesc] = useState("");
  const [hwDue, setHwDue] = useState("");
  const [hwType, setHwType] = useState<"homework" | "test">("homework");
  const [hwStudent, setHwStudent] = useState("all");
  const [postingSaved, setPostingSaved] = useState(false);

  // Mentorship form
  const [mentorStudent, setMentorStudent] = useState(students[0]?.id || "");
  const [mentorText, setMentorText] = useState("");
  const [appreciation, setAppreciation] = useState("");
  const [mentorSaved, setMentorSaved] = useState(false);

  const handleAttendance = async () => {
    setSaving(true);
    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendance }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePostHomework = async () => {
    if (!hwTitle) return;
    const studentIds = hwStudent === "all" ? students.map((s) => s.id) : [hwStudent];
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: hwType, title: hwTitle, description: hwDesc, dueDate: hwDue, studentIds }),
    });
    setHwTitle(""); setHwDesc(""); setHwDue("");
    setPostingSaved(true);
    setTimeout(() => setPostingSaved(false), 3000);
  };

  const handlePostMentorship = async () => {
    if (!mentorText && !appreciation) return;
    if (mentorText) {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "mentorship", title: "Monthly Mentorship Note", description: mentorText, studentIds: [mentorStudent], month: new Date().toISOString().slice(0,7) }),
      });
    }
    if (appreciation) {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "appreciation", title: appreciation, studentIds: [mentorStudent] }),
      });
    }
    setMentorText(""); setAppreciation("");
    setMentorSaved(true);
    setTimeout(() => setMentorSaved(false), 3000);
  };

  const presentCount = Object.values(attendance).filter(v => v === "present").length;
  const absentCount  = Object.values(attendance).filter(v => v === "absent").length;

  return (
    <div className="pb-24">
      {/* Header */}
      <section className="relative w-full bg-primary/10 border-b border-primary/20 overflow-hidden">
        <div className="container max-w-6xl mx-auto px-4 py-12 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <Badge variant="outline" className="bg-background text-primary border-primary/30 mb-3 gap-1.5">
              <Video className="w-3.5 h-3.5" /> Classroom Manager
            </Badge>
            <h1 className="text-3xl font-bold font-heading">Manage Your <span className="text-primary">Classroom</span></h1>
            <p className="text-muted-foreground mt-1">{students.length} enrolled students · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
          <Link href={`/classroom/${tutorId}`}>
            <Button size="lg" className="rounded-xl gap-2 shadow-xl shadow-primary/20 hover:-translate-y-0.5 transition-all">
              <Video className="w-4 h-4" /> Enter Virtual Class
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <div className="container max-w-6xl mx-auto px-4 mt-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-emerald-500/5 border-emerald-500/20 rounded-2xl">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
              <div><p className="text-2xl font-bold font-heading text-emerald-600">{presentCount}</p><p className="text-xs text-muted-foreground">Present</p></div>
            </CardContent>
          </Card>
          <Card className="bg-red-500/5 border-red-500/20 rounded-2xl">
            <CardContent className="p-4 flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-500" />
              <div><p className="text-2xl font-bold font-heading text-red-600">{absentCount}</p><p className="text-xs text-muted-foreground">Absent</p></div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20 rounded-2xl">
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div><p className="text-2xl font-bold font-heading">{students.length}</p><p className="text-xs text-muted-foreground">Total</p></div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 bg-muted/50 p-1 rounded-xl w-fit">
          {([
            { id: "attendance", label: "Attendance", icon: <CheckCircle className="w-4 h-4" /> },
            { id: "homework", label: "Homework & Tests", icon: <ClipboardList className="w-4 h-4" /> },
            { id: "mentorship", label: "Mentorship", icon: <Heart className="w-4 h-4" /> },
          ] as const).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Attendance Tab */}
        {tab === "attendance" && (
          <Card className="bg-card border-border rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary" /> Today&apos;s Attendance</CardTitle>
              <CardDescription>Mark each student&apos;s attendance for today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {students.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No confirmed students yet.</p>
              )}
              {students.map((student) => (
                <div key={student.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                    {student.name?.[0] || "?"}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{student.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                  </div>
                  <div className="flex gap-2">
                    {(["present", "late", "absent"] as AttendanceStatus[]).map((s) => (
                      <button key={s} onClick={() => setAttendance(prev => ({ ...prev, [student.id]: s }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border ${
                          attendance[student.id] === s
                            ? s === "present" ? "bg-emerald-500 text-white border-emerald-500"
                              : s === "absent" ? "bg-red-500 text-white border-red-500"
                              : "bg-amber-500 text-white border-amber-500"
                            : "bg-card border-border text-muted-foreground hover:border-primary/40"
                        }`}>
                        {s === "present" ? "✓" : s === "absent" ? "✗" : "~"} {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {students.length > 0 && (
                <Button className="w-full rounded-xl mt-2" onClick={handleAttendance} disabled={saving}>
                  {saving ? "Saving..." : saved ? "✓ Attendance Saved!" : "Save Today's Attendance"}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Homework / Test Tab */}
        {tab === "homework" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-card border-border rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-primary" /> Post Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  {(["homework", "test"] as const).map((t) => (
                    <button key={t} onClick={() => setHwType(t)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all border ${hwType === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"}`}>
                      {t === "homework" ? <><BookOpen className="w-4 h-4 inline mr-1" />Homework</> : <><FileText className="w-4 h-4 inline mr-1" />Test</>}
                    </button>
                  ))}
                </div>
                <input value={hwTitle} onChange={(e) => setHwTitle(e.target.value)} placeholder="Title (e.g. Chapter 3 Problems)" className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                <textarea value={hwDesc} onChange={(e) => setHwDesc(e.target.value)} placeholder="Description or instructions..." rows={3} className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40" />
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1"><Calendar className="w-3 h-3" /> Due Date</label>
                    <input type="date" value={hwDue} onChange={(e) => setHwDue(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Assign to</label>
                    <select value={hwStudent} onChange={(e) => setHwStudent(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none">
                      <option value="all">All Students</option>
                      {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <Button className="w-full rounded-xl gap-2" onClick={handlePostHomework} disabled={!hwTitle}>
                  <Send className="w-4 h-4" /> {postingSaved ? "✓ Posted!" : `Post ${hwType}`}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ClipboardList className="w-5 h-5 text-primary" /> Recent Posts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {progressRecords.filter(r => r.type === "homework" || r.type === "test").slice(0, 5).map((r) => (
                  <div key={r.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                    <div className={`p-2 rounded-lg ${r.type === "test" ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"}`}>
                      {r.type === "test" ? <FileText className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{r.title}</p>
                      {r.dueDate && <p className="text-xs text-muted-foreground">Due: {r.dueDate}</p>}
                    </div>
                    <Badge variant="outline" className="ml-auto text-xs capitalize">{r.type}</Badge>
                  </div>
                ))}
                {progressRecords.filter(r => r.type === "homework" || r.type === "test").length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-4">No posts yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Mentorship Tab */}
        {tab === "mentorship" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-card border-border rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Heart className="w-5 h-5 text-rose-500" /> Monthly Mentorship</CardTitle>
                <CardDescription>Write a personal note and appreciation for a student</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Select Student</label>
                  <select value={mentorStudent} onChange={(e) => setMentorStudent(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none">
                    {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Mentorship Note</label>
                  <textarea value={mentorText} onChange={(e) => setMentorText(e.target.value)} placeholder="Write a personal message about their progress, attitude, and areas to improve..." rows={4} className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-500/40" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1"><Trophy className="w-3 h-3 text-amber-500" /> Appreciation / Award</label>
                  <input value={appreciation} onChange={(e) => setAppreciation(e.target.value)} placeholder="e.g. Most Improved Student, Star Performer..." className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
                </div>
                <Button className="w-full rounded-xl bg-rose-500 hover:bg-rose-600 text-white gap-2" onClick={handlePostMentorship} disabled={!mentorText && !appreciation}>
                  <Heart className="w-4 h-4" /> {mentorSaved ? "✓ Sent to Parent!" : "Send Mentorship Note"}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" /> Recent Mentorship</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {progressRecords.filter(r => r.type === "mentorship" || r.type === "appreciation").slice(0, 5).map((r) => (
                  <div key={r.id} className={`p-4 rounded-2xl border ${r.type === "appreciation" ? "bg-amber-500/5 border-amber-500/20" : "bg-rose-500/5 border-rose-500/20"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {r.type === "appreciation" ? <Trophy className="w-4 h-4 text-amber-500" /> : <Heart className="w-4 h-4 text-rose-500" />}
                      <span className="font-medium text-sm">{r.title}</span>
                    </div>
                    {r.description && <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>}
                  </div>
                ))}
                {progressRecords.filter(r => r.type === "mentorship" || r.type === "appreciation").length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-4">No mentorship notes yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
