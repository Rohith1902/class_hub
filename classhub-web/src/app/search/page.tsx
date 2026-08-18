import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedCard } from "@/components/ui/animated-card";
import { MapPin, Star, GraduationCap, CheckCircle2, Search, Filter, BookOpen, ChevronRight } from "lucide-react";
import { SUBJECTS, LOCATIONS, FORMATS } from "@/lib/data";

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const subjectFilter = typeof params.subject === "string" ? params.subject : undefined;
  const locationFilter = typeof params.location === "string" ? params.location : undefined;
  const formatFilter = typeof params.format === "string" ? params.format : undefined;

  const allTutors = await prisma.tutorProfile.findMany({
    where: {
      bio: { not: null },
      subjects: { not: "[]" },
    },
    include: {
      user: {
        select: { name: true }
      }
    }
  });

  // Apply filters in JS since SQLite JSON support is limited
  const tutors = allTutors.filter(tutor => {
    const subjects: string[] = JSON.parse(tutor.subjects || "[]");
    const formats: string[] = JSON.parse(tutor.formats || "[]");

    if (subjectFilter && !subjects.some(s => s.toLowerCase().includes(subjectFilter.toLowerCase()))) {
      return false;
    }
    if (locationFilter && tutor.location && !tutor.location.toLowerCase().includes(locationFilter.toLowerCase())) {
      return false;
    }
    if (formatFilter && !formats.some(f => f.toLowerCase().includes(formatFilter.toLowerCase()))) {
      return false;
    }
    return true;
  });

  const activeFilters = [subjectFilter, locationFilter, formatFilter].filter(Boolean).length;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Page Header */}
      <section className="relative pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-primary/5 pointer-events-none"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/2"></div>

        <div className="container max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl space-y-6">
            <Badge variant="outline" className="px-4 py-1.5 border-primary/20 bg-primary/5 text-primary rounded-full font-medium shadow-sm">
              <Search className="w-3.5 h-3.5 mr-1.5" /> Browse All Tutors
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold font-heading tracking-tight text-foreground leading-tight">
              Find the perfect <span className="text-primary">tutor</span> for you
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Browse verified tutors and tuition centers across Chennai. Filter by subject, location, or teaching format to find your ideal match.
            </p>
          </div>
        </div>
      </section>

      {/* Filters + Results */}
      <section className="py-12 container max-w-7xl mx-auto">
        {/* Filter Bar */}
        <div className="mb-12 p-6 rounded-2xl bg-card border border-border/40 shadow-xl shadow-primary/5">
          <div className="flex items-center gap-2 mb-5">
            <Filter className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Filters</span>
            {activeFilters > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-xs ml-1">
                {activeFilters} active
              </Badge>
            )}
            {activeFilters > 0 && (
              <Link href="/search" className="ml-auto text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
                Clear all
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Subject Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject</label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.slice(0, 6).map(sub => {
                  const isActive = subjectFilter === sub;
                  const params = new URLSearchParams();
                  if (!isActive) params.set("subject", sub);
                  if (locationFilter) params.set("location", locationFilter);
                  if (formatFilter) params.set("format", formatFilter);
                  const href = `/search${params.toString() ? "?" + params.toString() : ""}`;

                  return (
                    <Link key={sub} href={href}>
                      <Badge
                        variant={isActive ? "default" : "outline"}
                        className={`cursor-pointer transition-all text-xs py-1.5 px-3 rounded-lg ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "hover:bg-muted/50 hover:text-foreground border-border/60"
                        }`}
                      >
                        {sub}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</label>
              <div className="flex flex-wrap gap-2">
                {LOCATIONS.slice(0, 6).map(loc => {
                  const isActive = locationFilter === loc;
                  const params = new URLSearchParams();
                  if (subjectFilter) params.set("subject", subjectFilter);
                  if (!isActive) params.set("location", loc);
                  if (formatFilter) params.set("format", formatFilter);
                  const href = `/search${params.toString() ? "?" + params.toString() : ""}`;

                  return (
                    <Link key={loc} href={href}>
                      <Badge
                        variant={isActive ? "default" : "outline"}
                        className={`cursor-pointer transition-all text-xs py-1.5 px-3 rounded-lg ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "hover:bg-muted/50 hover:text-foreground border-border/60"
                        }`}
                      >
                        {loc}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Format Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Format</label>
              <div className="flex flex-wrap gap-2">
                {FORMATS.map(fmt => {
                  const isActive = formatFilter === fmt;
                  const params = new URLSearchParams();
                  if (subjectFilter) params.set("subject", subjectFilter);
                  if (locationFilter) params.set("location", locationFilter);
                  if (!isActive) params.set("format", fmt);
                  const href = `/search${params.toString() ? "?" + params.toString() : ""}`;

                  return (
                    <Link key={fmt} href={href}>
                      <Badge
                        variant={isActive ? "default" : "outline"}
                        className={`cursor-pointer transition-all text-xs py-1.5 px-3 rounded-lg ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "hover:bg-muted/50 hover:text-foreground border-border/60"
                        }`}
                      >
                        {fmt}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-muted-foreground font-medium">
            <span className="text-foreground font-bold text-lg">{tutors.length}</span> tutor{tutors.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Tutor Grid */}
        {tutors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-heading font-bold text-foreground mb-2">No tutors found</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Try adjusting your filters or clearing them to see all available tutors.
            </p>
            <Link href="/search">
              <Button variant="outline" className="rounded-xl">Clear all filters</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tutors.map((tutor, idx) => {
              const subjects: string[] = JSON.parse(tutor.subjects || "[]");

              return (
                <AnimatedCard key={tutor.userId} index={idx}>
                  <Link href={`/tutors/${tutor.userId}`} className="group outline-none block h-full">
                    <Card className="h-full flex flex-col bg-card border-border/40 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 group-hover:-translate-y-1.5 rounded-2xl">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex gap-2 items-center">
                            <Badge variant="secondary" className="bg-primary/5 text-primary border-none shadow-none font-medium px-3 py-1">
                              {tutor.kind}
                            </Badge>
                            {tutor.verified && (
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm font-medium text-foreground bg-muted/30 px-2 py-1 rounded-lg">
                            <Star className="w-4 h-4 fill-secondary text-secondary" />
                            {tutor.rating} <span className="text-muted-foreground font-normal">({tutor.reviewsCount})</span>
                          </div>
                        </div>

                        <CardTitle className="text-2xl font-bold font-heading line-clamp-1">{tutor.user.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1.5 pt-1 line-clamp-1 font-medium text-primary/80">
                          <GraduationCap className="w-4 h-4" /> {tutor.grades}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4 flex-1">
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {tutor.bio}
                        </p>

                        <div className="flex flex-wrap gap-2 pt-2">
                          {subjects.slice(0, 3).map((sub: string) => (
                            <span key={sub} className="text-xs bg-muted text-muted-foreground font-medium px-3 py-1.5 rounded-md">
                              {sub}
                            </span>
                          ))}
                          {subjects.length > 3 && (
                            <span className="text-xs bg-muted text-muted-foreground font-medium px-3 py-1.5 rounded-md">
                              +{subjects.length - 3}
                            </span>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="border-t border-border/30 pt-5 flex items-center justify-between mt-auto bg-card">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                          <MapPin className="w-4 h-4 text-primary/70" />
                          <span className="line-clamp-1 max-w-[120px]">{tutor.location}</span>
                        </div>
                        <div className="font-semibold text-lg flex items-center gap-1 text-foreground">
                          ₹{tutor.fee} <span className="text-sm font-normal text-muted-foreground">/hr</span>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                </AnimatedCard>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
