"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedCard } from "@/components/ui/animated-card";
import {
  CalendarDays, Clock, BookOpen, Loader2, User,
  Sparkles, CheckCircle2, AlertCircle, XCircle, Filter
} from "lucide-react";

interface Booking {
  id: string;
  subject: string;
  date: string;
  time: string;
  status: string;
  amount: number;
  notes: string | null;
  tutorName: string;
  studentName: string;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  Confirmed: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  Pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  Completed: "bg-primary/10 text-primary border-primary/20",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  Confirmed: <CheckCircle2 className="w-3.5 h-3.5" />,
  Pending: <Clock className="w-3.5 h-3.5" />,
  Completed: <CheckCircle2 className="w-3.5 h-3.5" />,
  Cancelled: <XCircle className="w-3.5 h-3.5" />,
};

export default function BookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const isTutor = session?.user.role === "tutor";

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);
  const statuses = ["all", "Pending", "Confirmed", "Completed", "Cancelled"];

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "Pending").length,
    confirmed: bookings.filter(b => b.status === "Confirmed").length,
    completed: bookings.filter(b => b.status === "Completed").length,
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <section className="relative w-full bg-primary/10 border-b border-primary/20 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="container max-w-6xl mx-auto px-4 py-12 relative z-10">
          <div className="space-y-3">
            <Badge variant="outline" className="bg-background text-primary border-primary/30 px-3 py-1 shadow-sm gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> Bookings
            </Badge>
            <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight">
              {isTutor ? "Class Bookings" : "My Bookings"}
            </h1>
            <p className="text-muted-foreground">
              {isTutor ? "Manage student bookings and class schedule." : "Track your upcoming and past classes."}
            </p>
          </div>
        </div>
      </section>

      <div className="container max-w-6xl mx-auto px-4 -mt-6 relative z-20 space-y-8">
        {/* Stat Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[
            { label: "Total", value: stats.total, icon: BookOpen },
            { label: "Pending", value: stats.pending, icon: Clock },
            { label: "Confirmed", value: stats.confirmed, icon: CheckCircle2 },
            { label: "Completed", value: stats.completed, icon: Sparkles },
          ].map((stat, idx) => (
            <AnimatedCard key={stat.label} index={idx}>
              <Card className="bg-card border-border shadow-xl shadow-primary/5 rounded-2xl">
                <CardContent className="pt-6 pb-5 flex items-center gap-4">
                  <div className="p-2.5 bg-primary/10 rounded-xl">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold font-heading text-foreground">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs font-medium py-2 px-4 rounded-full border transition-all ${
                filter === s
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                  : "bg-card border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        <AnimatedCard index={4}>
          <Card className="bg-card border-border shadow-xl shadow-primary/5 rounded-2xl">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                {filter === "all" ? "All Bookings" : `${filter} Bookings`}
              </CardTitle>
              <CardDescription>{filtered.length} booking{filtered.length !== 1 ? "s" : ""}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <CalendarDays className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-1">No bookings found</h3>
                  <p className="text-muted-foreground max-w-sm">
                    {isTutor
                      ? "When students book your classes, they will appear here."
                      : "You haven't booked any classes yet. Explore tutors to get started."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {filtered.map((b) => (
                    <div
                      key={b.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-lg">{b.subject}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground font-medium flex-wrap">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {isTutor ? b.studentName : b.tutorName}
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-3.5 h-3.5" /> {b.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> {b.time}
                            </span>
                          </div>
                          {b.notes && (
                            <p className="text-xs text-muted-foreground mt-2 italic line-clamp-1">"{b.notes}"</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                        <p className="font-bold text-lg text-foreground">₹{b.amount}</p>
                        <Badge
                          variant="outline"
                          className={`${STATUS_STYLES[b.status] || ""} px-2.5 py-0.5 rounded-full font-medium gap-1`}
                        >
                          {STATUS_ICONS[b.status]} {b.status}
                        </Badge>
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
