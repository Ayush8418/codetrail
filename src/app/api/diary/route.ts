import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/dbConnect";
import DiaryEntry from "@/lib/model/DiaryEntry";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/* ----------------------------------------
   Helper: get authenticated user
----------------------------------------- */
async function getUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user.id;
}

/* ----------------------------------------
   GET DIARY ENTRIES
   GET /api/diary
   Optional query params:
   - from=YYYY-MM-DD
   - to=YYYY-MM-DD
----------------------------------------- */
export async function GET(req: NextRequest) {
  await connectDB();

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const query: any = { userId };

  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
  }

  const entries = await DiaryEntry.find(query)
    .sort({ date: -1 }) // latest first
    .lean();

  return NextResponse.json(entries);
}

/* ----------------------------------------
   CREATE / UPDATE DIARY ENTRY
   POST /api/diary
   Body: { content: string, date?: string }
----------------------------------------- */
export async function POST(req: NextRequest) {
  await connectDB();

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { content, date } = body;

  if (!content?.trim()) {
    return NextResponse.json({ message: "Content is required" }, { status: 400 });
  }

  // Normalize to start-of-day UTC so the unique index works correctly
  const entryDate = date ? new Date(date) : new Date();
  entryDate.setUTCHours(0, 0, 0, 0);

  // Upsert — if an entry exists for this user+day, update it
  const entry = await DiaryEntry.findOneAndUpdate(
    { userId, date: entryDate },
    { content: content.trim() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return NextResponse.json(entry, { status: 201 });
}