import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Star, GraduationCap, CheckCircle2, Clock, BookOpen, Award, User, ChevronRight, Quote } from "lucide-react";
import { AnimatedCard } from "@/components/ui/animated-card";
import Link from "next/link";
import { BookingForm } from "./booking-form";

interface TutorPageProps {
  params: Promise<{ id: string }>;
}

export default async function TutorPage({ params }: TutorPageProps) {
  const { id } = await params;
  const profile = await prisma.tutorProfile.findUnique({
    where: { userId: id },
    include: { user: { select: { name: true } } },
  });

  if (!profile) notFound();

  const subjects: string[] = JSON.parse(profile.subjects || "[]");
  const formats: string[] = JSON.parse(profile.formats || "[]");
  const achievements: string[] = JSON.parse(profile.achievements || "[]");
  const reviews: { name: string; rating: number; text: string }[] = JSON.parse(profile.reviews || "[]");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero */}
      <section className="relative pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/2" />
        <div className="container max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8 font-medium">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/search" className="hover:text-primary transition-colors">Tutors</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">{profile.user.name}</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-medium px-3 py-1">{profile.kind}</Badge>
              {profile.verified && (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 px-3 py-1 gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-heading tracking-tight text-foreground">{profile.user.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              {profile.grades && <span className="flex items-center gap-1.5 text-sm font-medium"><GraduationCap className="w-4 h-4 text-primary" /> {profile.grades}</span>}
              {profile.location && <span className="flex items-center gap-1.5 text-sm font-medium"><MapPin className="w-4 h-4 text-primary" /> {profile.location}</span>}
              {profile.experience && <span className="flex items-center gap-1.5 text-sm font-medium"><Clock className="w-4 h-4 text-primary" /> {profile.experience}</span>}
            </div>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-xl font-semibold text-foreground">
                <Star className="w-5 h-5 fill-secondary text-secondary" />
                <span className="text-lg">{profile.rating}</span>
                <span className="text-sm text-muted-foreground font-normal">({profile.reviewsCount} reviews)</span>
              </div>
              <div className="text-2xl font-bold text-foreground font-heading">₹{profile.fee}<span className="text-base font-normal text-muted-foreground">/hr</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 container max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Bio */}
            {profile.bio && (
              <AnimatedCard index={0}>
                <Card className="border-border/40 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden">
                  <CardHeader className="border-b border-border/30 bg-card">
                    <div className="flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-xl"><User className="w-5 h-5 text-primary" /></div><CardTitle className="text-lg">About</CardTitle></div>
                  </CardHeader>
                  <CardContent className="pt-6"><p className="text-muted-foreground leading-relaxed">{profile.bio}</p></CardContent>
                </Card>
              </AnimatedCard>
            )}

            {/* Subjects */}
            <AnimatedCard index={1}>
              <Card className="border-border/40 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden">
                <CardHeader className="border-b border-border/30 bg-card">
                  <div className="flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-xl"><BookOpen className="w-5 h-5 text-primary" /></div><CardTitle className="text-lg">Subjects & Formats</CardTitle></div>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Subjects</label>
                    <div className="flex flex-wrap gap-2">
                      {subjects.map(sub => <Badge key={sub} variant="secondary" className="bg-primary/10 text-primary border-none px-3 py-1.5 text-sm">{sub}</Badge>)}
                    </div>
                  </div>
                  {formats.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Teaching Formats</label>
                      <div className="flex flex-wrap gap-2">
                        {formats.map(fmt => <Badge key={fmt} variant="outline" className="border-border/60 px-3 py-1.5 text-sm font-medium">{fmt}</Badge>)}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedCard>

            {/* Achievements */}
            {achievements.length > 0 && (
              <AnimatedCard index={2}>
                <Card className="border-border/40 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden">
                  <CardHeader className="border-b border-border/30 bg-card">
                    <div className="flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-xl"><Award className="w-5 h-5 text-primary" /></div><CardTitle className="text-lg">Achievements</CardTitle></div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {achievements.map((ach, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span className="text-sm text-foreground">{ach}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <AnimatedCard index={3}>
                <Card className="border-border/40 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden">
                  <CardHeader className="border-b border-border/30 bg-card">
                    <div className="flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-xl"><Star className="w-5 h-5 text-primary" /></div>
                      <div><CardTitle className="text-lg">Student Reviews</CardTitle><CardDescription>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</CardDescription></div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-5">
                    {reviews.map((r, i) => (
                      <div key={i} className="p-5 bg-muted/20 rounded-xl border border-border/20 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div>
                            <span className="font-semibold text-foreground text-sm">{r.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <Star key={j} className={`w-3.5 h-3.5 ${j < r.rating ? "fill-secondary text-secondary" : "text-border"}`} />
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Quote className="w-4 h-4 text-primary/30 shrink-0 mt-0.5" />
                          <p className="text-sm text-muted-foreground leading-relaxed italic">{r.text}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </AnimatedCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-36">
              <AnimatedCard index={0}>
                <BookingForm tutorId={profile.userId} tutorName={profile.user.name || "Tutor"} fee={profile.fee} subjects={subjects} />
              </AnimatedCard>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
