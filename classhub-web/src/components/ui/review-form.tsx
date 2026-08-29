"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star, Loader2, AlertCircle } from "lucide-react";

export function ReviewForm({ tutorId }: { tutorId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!session) return null; // Or show a login message

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(`/api/tutors/${tutorId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, text }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to submit review");
      } else {
        setSuccess(true);
        setText("");
        setRating(5);
        router.refresh(); // Refresh the page to show new review
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-emerald-500/20 bg-emerald-500/5">
        <CardContent className="pt-6 pb-6 text-center text-emerald-700">
          <h3 className="font-semibold text-lg mb-1">Review Submitted!</h3>
          <p className="text-sm opacity-80">Thank you for sharing your experience.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 rounded-2xl shadow-sm overflow-hidden mb-8">
      <CardHeader className="border-b border-border/30 bg-card/50">
        <CardTitle className="text-lg">Write a Review</CardTitle>
        <CardDescription>Share your experience with this tutor</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-secondary text-secondary"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Review</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What did you like? What could be improved?"
              rows={4}
              required
              className="flex w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading || text.trim() === ""}
              className="rounded-xl px-6"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Submit Review
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
