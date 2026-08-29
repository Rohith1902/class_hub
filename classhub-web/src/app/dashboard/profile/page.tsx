"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Save, User, MapPin, BookOpen, GraduationCap,
  IndianRupee, X, Plus, Sparkles, CheckCircle2, AlertCircle, Award
} from "lucide-react";

const FORMAT_OPTIONS = ["Home visit", "Online", "At center"];
const KIND_OPTIONS = ["Individual tutor", "Tuition center"];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const isStudent = session?.user.role === "student";
  const isTutor = session?.user.role === "tutor";

  // Common Form state
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [achievements, setAchievements] = useState<string[]>([]);
  const [achievementInput, setAchievementInput] = useState("");

  // Tutor Form state
  const [kind, setKind] = useState("Individual tutor");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [grades, setGrades] = useState("");
  const [location, setLocation] = useState("");
  const [formats, setFormats] = useState<string[]>([]);
  const [fee, setFee] = useState(500);
  const [experience, setExperience] = useState("");

  // Student Form state
  const [school, setSchool] = useState("");
  const [studentGrade, setStudentGrade] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
      return;
    }
    if (status === "authenticated" && (isStudent || isTutor)) {
      fetchProfile();
    } else if (status === "authenticated" && !isStudent && !isTutor) {
      setLoading(false);
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      const endpoint = isStudent ? "/api/students/profile" : "/api/tutors/profile";
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setName(data.name || "");
        setBio(data.bio || "");
        setAchievements(data.achievements || []);

        if (isTutor) {
          setKind(data.kind || "Individual tutor");
          setSubjects(data.subjects || []);
          setGrades(data.grades || "");
          setLocation(data.location || "");
          setFormats(data.formats || []);
          setFee(data.fee || 500);
          setExperience(data.experience || "");
        } else if (isStudent) {
          setSchool(data.school || "");
          setStudentGrade(data.grade || "");
          setSkills(data.skills || []);
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const endpoint = isStudent ? "/api/students/profile" : "/api/tutors/profile";
      const body = isStudent
        ? { name, bio, school, grade: studentGrade, skills, achievements }
        : { name, kind, subjects, grades, location, formats, fee, experience, bio, achievements };

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save profile");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const addSubject = () => {
    const trimmed = subjectInput.trim();
    if (trimmed && !subjects.includes(trimmed)) {
      setSubjects([...subjects, trimmed]);
      setSubjectInput("");
    }
  };
  const removeSubject = (sub: string) => setSubjects(subjects.filter((s) => s !== sub));

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };
  const removeSkill = (sk: string) => setSkills(skills.filter((s) => s !== sk));

  const addAchievement = () => {
    const trimmed = achievementInput.trim();
    if (trimmed) {
      setAchievements([...achievements, trimmed]);
      setAchievementInput("");
    }
  };
  const removeAchievement = (idx: number) => setAchievements(achievements.filter((_, i) => i !== idx));

  const toggleFormat = (fmt: string) => {
    if (formats.includes(fmt)) setFormats(formats.filter((f) => f !== fmt));
    else setFormats([...formats, fmt]);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (session?.user.role === "parent") {
    return (
      <div className="container max-w-3xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-heading font-bold">Parent Account</h2>
        <p className="text-muted-foreground">Profile editing is available for student and tutor accounts. You can update your name and email from settings.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1 gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> Edit Profile
          </Badge>
        </div>
        <h1 className="text-3xl font-bold font-heading tracking-tight text-foreground">
          Your {isStudent ? "Student" : "Tutor"} Profile
        </h1>
        <p className="text-muted-foreground">
          {isStudent
            ? "Complete your profile to share your interests, school, and individual performance."
            : "Complete your profile to appear on the homepage and attract students."}
        </p>
      </div>

      {/* Basic Info */}
      <Card className="border-border/40 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden">
        <CardHeader className="border-b border-border/30 bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>Your display name {isTutor && "and tutor type"}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Display Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="bg-background/50"
            />
          </div>

          {isTutor && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Type</label>
              <div className="flex gap-3">
                {KIND_OPTIONS.map((k) => (
                  <button
                    key={k}
                    onClick={() => setKind(k)}
                    className={`flex-1 text-sm font-medium py-2.5 px-4 rounded-xl border transition-all ${
                      kind === k
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                        : "bg-card border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Bio / Overview</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={isStudent ? "Tell tutors about your goals and interests..." : "Tell students about your teaching style, methodology, and what makes you unique..."}
              rows={4}
              className="flex w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tutor: Subjects & Grades OR Student: Education & Interests */}
      <Card className="border-border/40 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden">
        <CardHeader className="border-b border-border/30 bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{isStudent ? "Education & Interests" : "Subjects & Grades"}</CardTitle>
              <CardDescription>{isStudent ? "Your school, grade, and subjects of interest" : "What you teach and to whom"}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          {isStudent ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">School</label>
                  <Input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="e.g. DAV Public School" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Grade / Class</label>
                  <Input value={studentGrade} onChange={(e) => setStudentGrade(e.target.value)} placeholder="e.g. Class 11" className="bg-background/50" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Interests / Skills</label>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                    placeholder="Type an interest (e.g. Physics) and press Enter"
                    className="bg-background/50"
                  />
                  <Button onClick={addSkill} variant="outline" size="icon" className="shrink-0 rounded-xl">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {skills.map((sk) => (
                      <Badge key={sk} variant="secondary" className="bg-primary/10 text-primary border-none px-3 py-1.5 gap-1.5 text-sm">
                        {sk}
                        <button onClick={() => removeSkill(sk)} className="hover:text-destructive transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Subjects</label>
                <div className="flex gap-2">
                  <Input
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubject(); } }}
                    placeholder="Type a subject and press Enter"
                    className="bg-background/50"
                  />
                  <Button onClick={addSubject} variant="outline" size="icon" className="shrink-0 rounded-xl">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {subjects.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {subjects.map((sub) => (
                      <Badge key={sub} variant="secondary" className="bg-primary/10 text-primary border-none px-3 py-1.5 gap-1.5 text-sm">
                        {sub}
                        <button onClick={() => removeSubject(sub)} className="hover:text-destructive transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Grades / Levels</label>
                <Input value={grades} onChange={(e) => setGrades(e.target.value)} placeholder="e.g. Grades 9–12, CBSE" className="bg-background/50" />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tutor Only: Location & Formats */}
      {isTutor && (
        <Card className="border-border/40 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden">
          <CardHeader className="border-b border-border/30 bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Location & Teaching Formats</CardTitle>
                <CardDescription>Where and how you teach</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Location</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Adyar, Chennai"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Teaching Formats</label>
              <div className="flex flex-wrap gap-3">
                {FORMAT_OPTIONS.map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => toggleFormat(fmt)}
                    className={`text-sm font-medium py-2.5 px-5 rounded-xl border transition-all ${
                      formats.includes(fmt)
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                        : "bg-card border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tutor Only: Fee & Experience */}
      {isTutor && (
        <Card className="border-border/40 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden">
          <CardHeader className="border-b border-border/30 bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <IndianRupee className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Pricing & Experience</CardTitle>
                <CardDescription>Your hourly rate and teaching experience</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Hourly Fee (₹)</label>
                <Input type="number" value={fee} onChange={(e) => setFee(Number(e.target.value))} min={0} className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Experience</label>
                <Input value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. 11 years" className="bg-background/50" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Common: Achievements / Performance */}
      <Card className="border-border/40 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden">
        <CardHeader className="border-b border-border/30 bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{isStudent ? "Individual Performance" : "Achievements"}</CardTitle>
              <CardDescription>{isStudent ? "Highlight your test scores or improvements" : "Highlight your key accomplishments"}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2">
            <Input
              value={achievementInput}
              onChange={(e) => setAchievementInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAchievement(); } }}
              placeholder={isStudent ? "e.g. Scored 95% in Physics Mock Test" : "e.g. 94% of students scored above 85 in boards"}
              className="bg-background/50"
            />
            <Button onClick={addAchievement} variant="outline" size="icon" className="shrink-0 rounded-xl">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {achievements.length > 0 && (
            <div className="space-y-2 pt-2">
              {achievements.map((ach, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl group">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm flex-1 text-foreground">{ach}</span>
                  <button
                    onClick={() => removeAchievement(idx)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Actions */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Profile saved successfully!
        </div>
      )}

      <div className="flex justify-end gap-4 pb-8">
        <Button variant="outline" className="rounded-xl px-6" onClick={() => router.push("/dashboard")}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving} className="rounded-xl px-8 shadow-xl shadow-primary/20 hover:-translate-y-0.5 transition-all gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}
