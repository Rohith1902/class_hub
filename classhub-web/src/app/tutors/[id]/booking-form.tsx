"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, BookOpen, Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { TIME_SLOTS } from "@/lib/data";

interface BookingFormProps {
  tutorId: string;
  tutorName: string;
  fee: number;
  subjects: string[];
}

export function BookingForm({ tutorId, tutorName, fee, subjects }: BookingFormProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [subject, setSubject] = useState(subjects[0] || "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleBook = async () => {
    if (!session) {
      router.push("/auth");
      return;
    }
    if (!subject || !date || !time) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorId, subject, date, time, amount: fee, notes }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to book.");
        setLoading(false);
        return;
      }

      const { booking, orderId } = await res.json();

      const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder";

      if (rzpKey === "rzp_test_placeholder") {
        // Mock successful payment flow
        setTimeout(async () => {
          try {
            const verifyRes = await fetch("/api/bookings/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookingId: booking.id,
                razorpay_order_id: orderId,
                razorpay_payment_id: "pay_mock123",
                razorpay_signature: "mock_signature_123",
              }),
            });
            if (verifyRes.ok) setSuccess(true);
            else setError("Mock verification failed.");
          } catch {
            setError("Mock verification error.");
          } finally {
            setLoading(false);
          }
        }, 1500);
        return;
      }

      const options = {
        key: rzpKey,
        amount: fee * 100,
        currency: "INR",
        name: "ClassHub",
        description: `Booking for ${subject} with ${tutorName}`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/bookings/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookingId: booking.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            if (verifyRes.ok) {
              setSuccess(true);
            } else {
              setError("Payment verification failed.");
            }
          } catch (err) {
            setError("Payment verification error.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        theme: {
          color: "#3b82f6",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-border/40 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden">
        <CardContent className="py-12 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-heading font-bold text-foreground">Booking Confirmed!</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Your class with {tutorName} has been booked. You can manage your bookings from the dashboard.
          </p>
          <Button onClick={() => router.push("/dashboard/bookings")} className="rounded-xl mt-2">
            View My Bookings
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Card className="border-border/40 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden">
        <CardHeader className="border-b border-border/30 bg-card">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Book a Class</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">₹{fee} per hour</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-5">
        {/* Subject */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Subject</label>
          <div className="flex flex-wrap gap-2">
            {subjects.map(sub => (
              <button
                key={sub}
                onClick={() => setSubject(sub)}
                className={`text-xs font-medium py-2 px-3 rounded-xl border transition-all ${
                  subject === sub
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-card border-border text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" /> Date
          </label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="bg-background/50"
          />
        </div>

        {/* Time */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Time Slot
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TIME_SLOTS.map(slot => (
              <button
                key={slot}
                onClick={() => setTime(slot)}
                className={`text-xs font-medium py-2.5 px-3 rounded-xl border transition-all ${
                  time === slot
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-card border-border text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any specific topics or requirements..."
            rows={2}
            className="flex w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Summary */}
        <div className="p-4 bg-muted/30 rounded-xl space-y-2">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subject</span><span className="font-medium text-foreground">{subject || "—"}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Date</span><span className="font-medium text-foreground">{date || "—"}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Time</span><span className="font-medium text-foreground">{time || "—"}</span></div>
          <div className="h-px bg-border/40 my-2" />
          <div className="flex justify-between text-sm"><span className="font-semibold text-foreground">Total</span><span className="font-bold text-lg text-foreground">₹{fee}</span></div>
        </div>

        <Button
          onClick={handleBook}
          disabled={loading}
          className="w-full h-12 rounded-xl shadow-xl shadow-primary/20 hover:-translate-y-0.5 transition-all text-base gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
          {loading ? "Processing..." : session ? "Pay & Book Now" : "Log in to Book"}
        </Button>
      </CardContent>
    </Card>
    </>
  );
}
