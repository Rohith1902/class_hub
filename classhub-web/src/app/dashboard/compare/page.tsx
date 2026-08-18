import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitCompareArrows, MapPin, IndianRupee, Users, Star, BadgeCheck, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ComparePage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "parent") redirect("/dashboard");

  const tutors = await prisma.tutorProfile.findMany({
    where: { verified: true },
    include: { user: { select: { name: true } } },
    take: 6,
  });

  return (
    <div className="pb-24">
      {/* Header */}
      <section className="relative w-full bg-purple-500/10 border-b border-purple-500/20 overflow-hidden">
        <div className="container max-w-6xl mx-auto px-4 py-12 relative z-10">
          <Badge variant="outline" className="bg-background text-purple-500 border-purple-500/30 mb-4 gap-1.5">
            <GitCompareArrows className="w-3.5 h-3.5" /> Tutor Comparison
          </Badge>
          <h1 className="text-3xl font-bold font-heading mb-2">
            Find the <span className="text-purple-500">Perfect Tutor</span>
          </h1>
          <p className="text-muted-foreground">Compare all tutors side-by-side — fees, location, batch size & more.</p>
        </div>
      </section>

      <div className="container max-w-6xl mx-auto px-4 mt-8 space-y-6">
        {/* Comparison Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <MapPin className="w-4 h-4" />, label: "Location", color: "blue" },
            { icon: <IndianRupee className="w-4 h-4" />, label: "Monthly Fee", color: "emerald" },
            { icon: <Users className="w-4 h-4" />, label: "Batch Size", color: "amber" },
            { icon: <Star className="w-4 h-4" />, label: "Rating", color: "purple" },
          ].map((l) => (
            <div key={l.label} className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-${l.color}-500/10 text-${l.color}-600 border border-${l.color}-500/20`}>
              {l.icon}
              <span className="text-xs font-medium">{l.label}</span>
            </div>
          ))}
        </div>

        {/* Tutor Comparison Grid */}
        {tutors.length === 0 ? (
          <Card className="border-dashed border-2 rounded-2xl">
            <CardContent className="flex flex-col items-center py-16 text-center">
              <GitCompareArrows className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-lg">No Verified Tutors Yet</h3>
              <p className="text-muted-foreground text-sm">Check back soon as tutors get verified on the platform.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {tutors.map((tutor, i) => {
              const subjects: string[] = JSON.parse(tutor.subjects || "[]");
              const formats: string[] = JSON.parse(tutor.formats || "[]");

              return (
                <Card key={tutor.id}
                  className="bg-card border-border rounded-2xl hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  style={{ animationDelay: `${i * 80}ms` }}>
                  {/* Card Header */}
                  <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-400" />
                  <CardContent className="p-5 space-y-4">
                    {/* Name & Verified */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg font-heading">{tutor.user.name || "Tutor"}</h3>
                        <p className="text-xs text-muted-foreground capitalize">{tutor.kind}</p>
                      </div>
                      {tutor.verified && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 gap-1">
                          <BadgeCheck className="w-3.5 h-3.5" /> Verified
                        </Badge>
                      )}
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />, label: "Fee/month", value: `₹${tutor.fee}` },
                        { icon: <Users className="w-3.5 h-3.5 text-amber-500" />, label: "Batch Size", value: `${tutor.batchSize} students` },
                        { icon: <Star className="w-3.5 h-3.5 text-purple-500" />, label: "Rating", value: tutor.rating > 0 ? `${tutor.rating} ★` : "New" },
                        { icon: <MapPin className="w-3.5 h-3.5 text-blue-500" />, label: "Location", value: tutor.location || "Online" },
                      ].map((stat) => (
                        <div key={stat.label} className="bg-muted/40 rounded-xl p-2.5">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">{stat.icon}{stat.label}</div>
                          <p className="font-semibold text-sm">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Subjects */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><BookOpen className="w-3 h-3" /> Subjects</p>
                      <div className="flex flex-wrap gap-1">
                        {subjects.slice(0, 3).map((s) => (
                          <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                        ))}
                        {subjects.length > 3 && <Badge variant="outline" className="text-xs">+{subjects.length - 3} more</Badge>}
                        {subjects.length === 0 && <span className="text-xs text-muted-foreground">Not specified</span>}
                      </div>
                    </div>

                    {/* Format Tags */}
                    <div className="flex flex-wrap gap-1">
                      {formats.map((f) => (
                        <span key={f} className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-600 rounded-full font-medium">{f}</span>
                      ))}
                    </div>

                    {/* Experience */}
                    {tutor.experience && (
                      <p className="text-xs text-muted-foreground border-t border-border/40 pt-3">
                        🕐 {tutor.experience} experience
                      </p>
                    )}

                    <Link href={`/tutors/${tutor.userId}`} className="block">
                      <Button variant="outline" className="w-full rounded-xl border-purple-500/30 text-purple-600 hover:bg-purple-500/10">
                        View Full Profile →
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
