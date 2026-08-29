import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tutorId, subject, date, time, amount, notes } = await req.json();

    if (!tutorId || !subject || !date || !time || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify the tutor exists
    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: tutorId },
    });

    if (!tutor) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        studentId: session.user.id,
        tutorId,
        subject,
        date,
        time,
        amount: parseInt(amount),
        notes: notes || null,
        status: "Pending",
      },
    });

    // Create Razorpay Order
    try {
      const options = {
        amount: parseInt(amount) * 100, // amount in paise
        currency: "INR",
        receipt: `receipt_${booking.id}`,
        notes: {
          bookingId: booking.id,
          studentId: session.user.id,
          tutorId,
        },
      };
      const order = await razorpay.orders.create(options);

      // Update booking with Razorpay Order ID
      const updatedBooking = await prisma.booking.update({
        where: { id: booking.id },
        data: { razorpayOrderId: order.id },
      });

      return NextResponse.json({ success: true, booking: updatedBooking, orderId: order.id }, { status: 201 });
    } catch (rzpError) {
      console.error("Razorpay order creation failed:", rzpError);
      return NextResponse.json({ error: "Payment initialization failed. Please try again." }, { status: 500 });
    }
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isTutor = session.user.role === "tutor";

    const bookings = await prisma.booking.findMany({
      where: isTutor ? { tutorId: session.user.id } : { studentId: session.user.id },
      include: {
        student: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // For student bookings, also get tutor names
    const enrichedBookings = await Promise.all(
      bookings.map(async (b) => {
        const tutorUser = await prisma.user.findUnique({
          where: { id: b.tutorId },
          select: { name: true },
        });
        return {
          ...b,
          tutorName: tutorUser?.name || "Unknown",
          studentName: b.student.name || b.student.email,
        };
      })
    );

    return NextResponse.json(enrichedBookings);
  } catch (error) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
