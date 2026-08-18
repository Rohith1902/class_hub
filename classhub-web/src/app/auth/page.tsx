"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, GraduationCap, BookOpen, Users } from "lucide-react";

type Role = "student" | "tutor" | "parent";

const authSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  childEmail: z.string().email("Invalid child email").optional().or(z.literal("")),
});

const ROLES: { id: Role; label: string; sub: string; icon: React.ReactNode }[] = [
  { id: "student", label: "Student", sub: "Browse tutors & learn", icon: <GraduationCap className="w-5 h-5" /> },
  { id: "tutor", label: "Tutor", sub: "Teach & grow", icon: <BookOpen className="w-5 h-5" /> },
  { id: "parent", label: "Parent", sub: "Track your child", icon: <Users className="w-5 h-5" /> },
];

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";
  const initialRole = (searchParams.get("role") as Role) || "student";

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [role, setRole] = useState<Role>(initialRole);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: z.infer<typeof authSchema>) => {
    setLoading(true);
    setError("");

    if (mode === "register") {
      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, role }),
        });
        const json = await res.json();
        if (!res.ok) { setError(json.error || "Failed to register"); setLoading(false); return; }
        const signInRes = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
        if (signInRes?.error) { setError(signInRes.error); } else { router.push("/dashboard"); router.refresh(); }
      } catch { setError("Something went wrong"); }
    } else {
      const res = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
      if (res?.error) { setError("Invalid email or password"); } else { router.push("/dashboard"); router.refresh(); }
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-20 bg-background/50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-heading font-bold tracking-tight">
            {mode === "login" ? "Welcome back" : "Join ClassHub"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {mode === "login" ? "Enter your credentials to continue" : "Choose your role to get started"}
          </p>
        </div>

        {/* Role Selector */}
        {mode === "register" && (
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                  role === r.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40"
                }`}
              >
                {r.icon}
                <span className="text-xs font-semibold">{r.label}</span>
                <span className="text-[10px] leading-tight opacity-70">{r.sub}</span>
              </button>
            ))}
          </div>
        )}

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {mode === "register" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {role === "tutor" ? "Full name / Center name" : role === "parent" ? "Your name" : "Your name"}
                  </label>
                  <Input {...register("name")} placeholder={role === "tutor" ? "e.g. Vidya Academy" : "e.g. Ramesh Iyer"} className="bg-background/50" />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <Input {...register("email")} type="email" placeholder="you@example.com" className="bg-background/50" />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Password</label>
                <Input {...register("password")} type="password" placeholder="••••••••" className="bg-background/50" />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>

              {mode === "register" && role === "parent" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Child&apos;s Email (to link)</label>
                  <Input {...register("childEmail")} type="email" placeholder="child@example.com" className="bg-background/50" />
                  <p className="text-xs text-muted-foreground">We&apos;ll link your account to your child&apos;s profile.</p>
                  {errors.childEmail && <p className="text-xs text-destructive">{errors.childEmail.message}</p>}
                </div>
              )}

              {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (mode === "login" ? "Log in" : `Sign up as ${role}`)}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t border-border/10 pt-6">
            <button
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            >
              {mode === "login" ? "New to ClassHub? Sign up" : "Already have an account? Log in"}
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center p-20"><Loader2 className="animate-spin" /></div>}>
      <AuthForm />
    </Suspense>
  );
}
