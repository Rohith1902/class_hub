import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import crypto from "crypto";

/**
 * Securely compares two hex strings in constant time to prevent timing attacks.
 */
function safeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return NextResponse.json({ error: "Missing required verification parameters" }, { status: 400 });
    }

    // 1. Fetch booking to verify existence, ownership, and matching order ID
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Ownership check: ensure student owns this booking
    if (booking.studentId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this booking" }, { status: 403 });
    }

    // Verify order ID matches booking order ID if present
    if (booking.razorpayOrderId && booking.razorpayOrderId !== razorpay_order_id) {
      return NextResponse.json({ error: "Order ID mismatch" }, { status: 400 });
    }

    // 2. Server-side HMAC SHA256 Signature Verification
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const isMock =
      process.env.NODE_ENV !== "production" &&
      (secret === "" || secret === "placeholder_secret") &&
      razorpay_payment_id === "pay_mock123";

    if (!isMock) {
      if (!secret || secret === "placeholder_secret") {
        console.error("Payment verification failed: RAZORPAY_KEY_SECRET is not properly configured on server.");
        return NextResponse.json(
          { error: "Server configuration error: Payment verification secret missing" },
          { status: 500 }
        );
      }

      const expectedBody = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(expectedBody)
        .digest("hex");

      const isValidSignature = safeCompare(expectedSignature, razorpay_signature);

      if (!isValidSignature) {
        console.warn(`Payment signature verification failed for booking ${bookingId}`);
        return NextResponse.json({ error: "Invalid payment signature verification" }, { status: 400 });
      }
    } else {
      console.warn(`[DEV ONLY] Accepted mock Razorpay payment for booking ${bookingId}`);
    }

    // 3. Mark booking as Confirmed in database & persist payment ID
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        status: "Confirmed",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Payment verification route error:", error);
    return NextResponse.json({ error: "Internal server error during verification" }, { status: 500 });
  }
}
