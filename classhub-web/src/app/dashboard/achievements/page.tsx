"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Zap, BookOpen, Award, Target, Plus, X, Sparkles } from "lucide-react";

type Skill = { name: string; level: number }; // level 1-5
type Achievement = { title: string; date: string; icon: string; color: string };

const SKILL_ICONS: Record<string, string> = {
  Mathematics: "📐", Physics: "⚛️", Chemistry: "🧪", Biology: "🧬",
  English: "📝", History: "📜", Geography: "🌍", Computer: "💻",
};

const ALL_SKILLS = Object.keys(SKILL_ICONS);

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { title: "Perfect Attendance", date: "Aug 2026", icon: "🎯", color: "emerald" },
  { title: "Top Scorer — Math Test", date: "Jul 2026", icon: "🏆", color: "amber" },
  { title: "Completed 10 Classes", date: "Jun 2026", icon: "🎓", color: "blue" },
  { title: "Early Bird — 5 Early Logins", date: "Jun 2026", icon: "⭐", color: "purple" },
];

const DEFAULT_SKILLS: Skill[] = [
  { name: "Mathematics", level: 4 },
  { name: "Physics", level: 3 },
  { name: "Computer", level: 5 },
];

const colorMap: Record<string, string> = {
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
  amber:   "bg-amber-500/10 border-amber-500/20 text-amber-600",
  blue:    "bg-blue-500/10 border-blue-500/20 text-blue-600",
  purple:  "bg-purple-500/10 border-purple-500/20 text-purple-600",
};

function SkillBar({ skill, onRemove }: { skill: Skill; onRemove: () => void }) {
  return (
    <div className="group flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-blue-500/30 transition-all">
      <span className="text-2xl">{SKILL_ICONS[skill.name] || "📚"}</span>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">{skill.name}</span>
          <span className="text-xs text-muted-foreground">Level {skill.level}/5</span>
        </div>
        <div className="flex gap-1">
          {[1,2,3,4,5].map((l) => (
            <div key={l} className={`h-1.5 flex-1 rounded-full transition-all ${l <= skill.level ? "bg-blue-500" : "bg-muted"}`} />
          ))}
        </div>
      </div>
      <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function AchievementsPage() {
  const [skills, setSkills] = useState<Skill[]>(DEFAULT_SKILLS);
  const [achievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);
  const [addingSkill, setAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const availableSkills = ALL_SKILLS.filter((s) => !skills.find((sk) => sk.name === s));

  const addSkill = () => {
    if (!newSkill) return;
    setSkills((prev) => [...prev, { name: newSkill, level: 1 }]);
    setNewSkill("");
    setAddingSkill(false);
  };

  const removeSkill = (name: string) => setSkills((prev) => prev.filter((s) => s.name !== name));

  const totalXP = skills.reduce((sum, s) => sum + s.level * 100, 0) + achievements.length * 200;

  return (
    <div className="pb-24">
      {/* Header */}
      <section className="relative w-full bg-amber-500/10 border-b border-amber-500/20 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute text-2xl animate-bounce pointer-events-none"
            style={{ left: `${10 + i * 12}%`, top: `${10 + (i % 4) * 20}%`, animationDelay: `${i * 0.3}s`, opacity: 0.15 }}>
            ⭐
          </div>
        ))}
        <div className="container max-w-6xl mx-auto px-4 py-12 relative z-10">
          <Badge variant="outline" className="bg-background text-amber-500 border-amber-500/30 mb-4 gap-1.5">
            <Trophy className="w-3.5 h-3.5" /> Skills & Achievements
          </Badge>
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-heading mb-2">Your <span className="text-amber-500">Showcase</span></h1>
              <p className="text-muted-foreground">Display your skills and celebrate your wins.</p>
            </div>
            <div className="flex items-center gap-3 bg-card border border-amber-500/20 rounded-2xl px-5 py-3 shadow-lg">
              <Zap className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-xs text-muted-foreground">Total XP</p>
                <p className="text-2xl font-bold font-heading text-amber-500">{totalXP.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container max-w-6xl mx-auto px-4 mt-8 grid gap-8 lg:grid-cols-2">
        {/* Skills Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-bold flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" /> My Skills
            </h2>
            <Button size="sm" variant="outline" className="rounded-xl gap-1.5" onClick={() => setAddingSkill(true)}>
              <Plus className="w-4 h-4" /> Add Skill
            </Button>
          </div>

          {addingSkill && (
            <Card className="border-dashed border-2 border-blue-500/30 rounded-2xl">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-medium">Choose a skill to add:</p>
                <div className="flex flex-wrap gap-2">
                  {availableSkills.map((s) => (
                    <button key={s} onClick={() => setNewSkill(s)}
                      className={`px-3 py-1 rounded-lg text-sm border transition-all ${newSkill === s ? "bg-blue-500 text-white border-blue-500" : "bg-card border-border hover:border-blue-500/40"}`}>
                      {SKILL_ICONS[s]} {s}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white" onClick={addSkill} disabled={!newSkill}>Add</Button>
                  <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => setAddingSkill(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {skills.map((skill) => (
              <SkillBar key={skill.name} skill={skill} onRemove={() => removeSkill(skill.name)} />
            ))}
            {skills.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Add your first skill above!</p>
              </div>
            )}
          </div>

          {/* Profile Card Preview */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" /> Public Profile Card
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s.name} className="px-3 py-1 bg-background rounded-full text-xs font-medium border border-border flex items-center gap-1.5">
                    <span>{SKILL_ICONS[s.name]}</span> {s.name}
                    <span className="text-blue-500 font-bold">{"★".repeat(s.level)}</span>
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">This is how your skills appear to others on ClassHub.</p>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Panel */}
        <div className="space-y-4">
          <h2 className="text-xl font-heading font-bold flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> Achievements
          </h2>

          {/* Achievement Grid */}
          <div className="space-y-3">
            {achievements.map((ach, i) => (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border ${colorMap[ach.color] || colorMap.blue} transition-all hover:scale-[1.02]`}
                style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-3xl">{ach.icon}</div>
                <div>
                  <p className="font-semibold">{ach.title}</p>
                  <p className="text-xs opacity-70">{ach.date}</p>
                </div>
                <div className="ml-auto">
                  <Target className="w-4 h-4 opacity-50" />
                </div>
              </div>
            ))}
          </div>

          {/* Progress to next badge */}
          <Card className="bg-card border-border rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-sm">Next Badge: Study Master 🎓</p>
                  <p className="text-xs text-muted-foreground">Complete 20 classes to unlock</p>
                </div>
                <span className="text-xs font-bold text-blue-500">12/20</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-1000" style={{ width: "60%" }} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
