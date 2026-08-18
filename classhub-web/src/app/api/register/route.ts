import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, role, childEmail } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name: name || null, email, password: hashedPassword, role: role || "student" },
    });

    // Auto-create profile based on role
    if (user.role === "tutor") {
      await prisma.tutorProfile.create({
        data: { userId: user.id, subjects: "[]", formats: "[]", achievements: "[]", reviews: "[]" },
      });
    }

    if (user.role === "student") {
      await prisma.studentProfile.create({
        data: { userId: user.id },
      });
    }

    if (user.role === "parent" && childEmail) {
      const childUser = await prisma.user.findUnique({ where: { email: childEmail } });
      if (childUser) {
        await prisma.parentLink.create({
          data: { parentId: user.id, studentId: childUser.id },
        });
      }
    }

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, role: user.role } }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
