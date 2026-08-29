import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, CalendarDays, User, Users, Trophy, BookOpen,
  BarChart3, ClipboardList, GitCompareArrows, TrendingUp, Video
} from "lucide-react";

type NavItem = { href: string; label: string; icon: React.ReactNode };

const studentNav: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/dashboard/bookings", label: "Bookings", icon: <CalendarDays className="h-4 w-4" /> },
  { href: "/dashboard/achievements", label: "Achievements", icon: <Trophy className="h-4 w-4" /> },
  { href: "/dashboard/profile", label: "Profile", icon: <User className="h-4 w-4" /> },
];

const tutorNav: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/dashboard/bookings", label: "Bookings", icon: <CalendarDays className="h-4 w-4" /> },
  { href: "/dashboard/earnings", label: "Earnings", icon: <BarChart3 className="h-4 w-4" /> },
  { href: "/dashboard/profile", label: "Profile", icon: <User className="h-4 w-4" /> },
];

const parentNav: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/dashboard/progress", label: "Progress", icon: <TrendingUp className="h-4 w-4" /> },
  { href: "/dashboard/compare", label: "Compare Tutors", icon: <GitCompareArrows className="h-4 w-4" /> },
  { href: "/dashboard/homework", label: "Homework & Tests", icon: <ClipboardList className="h-4 w-4" /> },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth");

  const role = session.user.role;
  const navItems = role === "tutor" ? tutorNav : role === "parent" ? parentNav : studentNav;

  const roleColors: Record<string, string> = {
    student: "text-blue-500 bg-blue-500/10",
    tutor:   "text-primary bg-primary/10",
    parent:  "text-purple-500 bg-purple-500/10",
  };

  const roleLabel: Record<string, string> = {
    student: "Student",
    tutor: "Tutor",
    parent: "Parent",
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-background">
      {/* Role-aware Dashboard Nav */}
      <div className="border-b border-border/40 bg-card/60 backdrop-blur-md sticky top-16 z-30 shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors whitespace-nowrap"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
          <div className={`text-xs font-semibold px-3 py-1 rounded-full ${roleColors[role] || roleColors.student}`}>
            {roleLabel[role] || "Student"}
          </div>
        </div>
      </div>

      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}
