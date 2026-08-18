import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedBadge } from "@/components/ui/animated-badge";
import { AnimatedCard } from "@/components/ui/animated-card";
import { MapPin, Star, GraduationCap, CheckCircle2, ChevronRight, BookOpen, Award, Users } from "lucide-react";

export default async function Home() {
  const tutors = await prisma.tutorProfile.findMany({
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Premium Split-Screen Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 rounded-bl-[100px] pointer-events-none hidden lg:block"></div>
        
        <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mx-auto max-w-7xl">
          {/* Left Column: Typography */}
          <div className="flex flex-col items-start text-left space-y-8">
            <Badge variant="outline" className="px-5 py-2 border-primary/20 bg-primary/5 text-primary rounded-full font-medium tracking-wide shadow-sm">
              The #1 Premium Learning Platform in Chennai
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold font-heading tracking-tight text-foreground leading-[1.15]">
              Master any subject with <br className="hidden md:block"/>
              <span className="text-primary">
                 top-rated experts.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Join thousands of students achieving their academic goals. Find verified tutors, schedule classes, and track your progress all in one beautifully designed place.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-6 w-full sm:w-auto">
              <Link href="/search">
                <Button size="lg" className="w-full sm:w-auto text-base h-14 px-10 rounded-2xl shadow-xl shadow-primary/20 gap-2 transition-all hover:scale-105 hover:-translate-y-1">
                  Explore Tutors <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/auth?role=tutor">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-14 px-10 rounded-2xl bg-card border-border hover:bg-muted/50 hover:text-primary transition-colors">
                  Become a Tutor
                </Button>
              </Link>
            </div>

            <div className="pt-8 flex flex-wrap items-center gap-6 text-muted-foreground text-sm font-medium">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Verified Profiles</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Secure Payments</div>
            </div>
          </div>

          {/* Right Column: Visuals / Badges */}
          <div className="relative h-[400px] lg:h-[500px] w-full hidden md:block">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl border border-primary/10 overflow-hidden shadow-2xl shadow-primary/5">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-background/50 rounded-full blur-[80px]"></div>
             </div>

             <AnimatedBadge delay={0.2} className="absolute top-[20%] left-[10%] text-sm text-foreground font-medium shadow-xl">
               <Award className="w-5 h-5 text-secondary" /> Top Tuition Centers
             </AnimatedBadge>
             <AnimatedBadge delay={0.4} yOffset={-20} className="absolute bottom-[25%] left-[15%] text-sm text-foreground font-medium shadow-xl">
               <Users className="w-5 h-5 text-primary" /> 10,000+ Students
             </AnimatedBadge>
             <AnimatedBadge delay={0.6} className="absolute top-[45%] right-[10%] text-sm text-foreground font-medium shadow-xl">
               <CheckCircle2 className="w-5 h-5 text-green-600" /> Verified Tutors
             </AnimatedBadge>
          </div>
        </div>
      </section>

      {/* Featured Tutors - Symmetrical Grid */}
      <section className="py-24 md:py-32 container max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-4xl font-bold font-heading mb-4 text-foreground">Featured Educators</h2>
            <p className="text-lg text-muted-foreground">Handpicked professionals ready to guide you.</p>
          </div>
          <Link href="/search" className="hidden sm:flex text-primary font-medium hover:underline items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-auto">
          {tutors.map((tutor, idx) => {
            const subjects = JSON.parse(tutor.subjects || "[]");
            
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
            )
          })}
        </div>
        
        <div className="mt-12 flex justify-center sm:hidden">
          <Link href="/search">
            <Button variant="outline" className="w-full h-12 rounded-xl">
              View all tutors
            </Button>
          </Link>
        </div>
      </section>

      {/* Find Tutors Near You (Google Maps Demo) */}
      <section className="py-32 bg-primary/5 border-t border-border/20 relative overflow-hidden">
        <div className="container max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-heading mb-4 text-foreground">Find Tuition Centers Near You</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore highly-rated offline tuition centers and home tutors across Chennai on our interactive map.
            </p>
          </div>
          
          <div className="relative max-w-5xl mx-auto">
            <div className="rounded-3xl overflow-hidden border border-border shadow-2xl shadow-primary/10 bg-background relative h-[550px] w-full z-10">
               <iframe 
                  src="https://maps.google.com/maps?q=tuition+centers+in+Chennai&t=&z=12&ie=UTF8&iwloc=&output=embed" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                ></iframe>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer CTA */}
      <section className="py-32 bg-background border-t border-border/20">
        <div className="container max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-foreground">Ready to start learning?</h2>
          <p className="text-muted-foreground text-xl">Create a free account to contact tutors and book trial classes.</p>
          <div className="pt-6">
            <Link href="/auth?mode=register">
              <Button size="lg" className="h-14 px-10 text-lg rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:bg-primary/90 hover:-translate-y-1 transition-all duration-300">
                Join Classhub Today
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
