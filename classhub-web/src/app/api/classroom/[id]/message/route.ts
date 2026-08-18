import { NextResponse } from "next/server";

// In-memory message store per classroom (resets on server restart)
const classroomMessages = new Map<string, { author: string; text: string; time: string; type: string }[]>();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { text, type = "chat", author = "Anonymous" } = await req.json();

  if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });

  if (!classroomMessages.has(id)) classroomMessages.set(id, []);

  const msg = { author, text, type, time: new Date().toISOString() };
  classroomMessages.get(id)!.push(msg);

  const msgs = classroomMessages.get(id)!;
  if (msgs.length > 100) classroomMessages.set(id, msgs.slice(-100));

  return NextResponse.json({ success: true, message: msg });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json(classroomMessages.get(id) || []);
}
