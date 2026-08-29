"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export function ShortlistButton({ tutorId }: { tutorId: string }) {
  const { data: session } = useSession();
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [loading, setLoading] = useState(true);

  const canShortlist = session?.user.role === "student" || session?.user.role === "parent";

  useEffect(() => {
    if (canShortlist) {
      fetch("/api/shortlist")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setIsShortlisted(data.includes(tutorId));
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [canShortlist, tutorId]);

  const toggleShortlist = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent triggering Link navigation
    e.stopPropagation();

    if (!canShortlist) return;

    const previousState = isShortlisted;
    setIsShortlisted(!previousState);

    try {
      const res = await fetch("/api/shortlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorId }),
      });
      if (!res.ok) {
        setIsShortlisted(previousState);
      }
    } catch {
      setIsShortlisted(previousState);
    }
  };

  if (!canShortlist || loading) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleShortlist}
      className={`rounded-full shadow-sm z-20 ${
        isShortlisted ? "text-red-500 bg-red-50 hover:bg-red-100" : "text-muted-foreground bg-background hover:bg-muted"
      }`}
    >
      <Heart className={`w-5 h-5 ${isShortlisted ? "fill-current" : ""}`} />
    </Button>
  );
}
