"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold font-heading mb-2">Something went wrong</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        We ran into an unexpected error loading your dashboard. Your data is safe.
      </p>
      <Button onClick={reset} className="rounded-xl gap-2">
        <RefreshCw className="w-4 h-4" /> Try again
      </Button>
    </div>
  );
}
