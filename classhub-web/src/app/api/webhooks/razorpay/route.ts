import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

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
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing x-razorpay-signature header" }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("Webhook processing error: RAZORPAY_WEBHOOK_SECRET is not configured.");
      return NextResponse.json({ error: "Server webhook configuration error" }, { status: 500 });
    }

    // Read raw body as text for cryptographic signature check
    const rawBody = await req.text();

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (!safeCompare(expectedSignature, signature)) {
      console.warn("Invalid Razorpay webhook signature received.");
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const eventData = JSON.parse(rawBody);
    const eventType = eventData.event;

    console.log(`Received valid Razorpay webhook event: ${eventType}`);

    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = eventData.payload?.payment?.entity;
      const orderEntity = eventData.payload?.order?.entity;

      const orderId = paymentEntity?.order_id || orderEntity?.id;
      const paymentId = paymentEntity?.id;
      const bookingIdFromNotes = paymentEntity?.notes?.bookingId || orderEntity?.notes?.bookingId;

      if (!orderId && !bookingIdFromNotes) {
        console.warn("Webhook payload missing order ID and booking notes.");
        return NextResponse.json({ status: "ignored", reason: "Missing identifiers" });
      }

      // Find booking by ID or Razorpay Order ID
      const booking = await prisma.booking.findFirst({
        where: bookingIdFromNotes
          ? { id: bookingIdFromNotes }
          : { razorpayOrderId: orderId },
      });

      if (booking) {
        if (booking.status !== "Confirmed") {
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              status: "Confirmed",
              razorpayPaymentId: paymentId || booking.razorpayPaymentId,
            },
          });
          console.log(`[Webhook] Booking ${booking.id} status updated to Confirmed.`);
        } else {
          console.log(`[Webhook] Booking ${booking.id} is already Confirmed.`);
        }
      } else {
        console.warn(`[Webhook] No matching booking found for order ID ${orderId}`);
      }
    }

    return NextResponse.json({ status: "ok", message: "Webhook event processed successfully" });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Webhook handler internal server error" }, { status: 500 });
  }
}
