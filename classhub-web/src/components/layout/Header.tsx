"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, User, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-heading text-xl font-bold tracking-tight">Class<span className="text-secondary">hub</span></span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/search" className="transition-colors hover:text-foreground/80 text-foreground/60">Find a tutor</Link>
          {!session && (
            <Link href="/auth?role=tutor" className="transition-colors hover:text-foreground/80 text-foreground/60">Become a tutor</Link>
          )}
          
          <div className="flex items-center gap-4 ml-4">
            {session ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="gap-2">
                    <User className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" size="icon" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Log out</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link href="/auth?mode=register">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Nav Toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 flex flex-col gap-4">
          <Link href="/search" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Find a tutor</Link>
          {!session && <Link href="/auth?role=tutor" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Become a tutor</Link>}
          
          <div className="h-px bg-border my-2" />
          
          {session ? (
            <>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <User className="h-4 w-4" /> Dashboard
                </Button>
              </Link>
              <Button variant="destructive" className="w-full justify-start gap-2" onClick={() => { signOut(); setMobileMenuOpen(false); }}>
                <LogOut className="h-4 w-4" /> Log out
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">Log in</Button>
              </Link>
              <Link href="/auth?mode=register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
