import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/dbConnect";
import Habit from "@/lib/model/Habit";
import HabitLog from "@/lib/model/HabitLog";

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
   Helper: normalize date (00:00)
----------------------------------------- */
function normalizeDate(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/* ----------------------------------------
   TOGGLE HABIT LOG (done / undone)
   POST /api/habitlog
----------------------------------------- */
export async function POST(req: NextRequest) {
  await connectDB();

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { habitId, date } = await req.json();

  if (!habitId || !mongoose.Types.ObjectId.isValid(habitId)) {
    return NextResponse.json(
      { message: "Valid habitId required" },
      { status: 400 }
    );
  }

  const habit = await Habit.findOne({ _id: habitId, userId });
  if (!habit) {
    return NextResponse.json({ message: "Habit not found" }, { status: 404 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ❌ block past/future
  if (date) {
    const clientDate = new Date(date);
    clientDate.setHours(0, 0, 0, 0);

    if (clientDate.getTime() !== today.getTime()) {
      return NextResponse.json(
        { message: "Past and future are not in your hands." },
        { status: 403 }
      );
    }
  }

  const existingLog = await HabitLog.findOne({
    habitId,
    userId,
    date: today,
  });

  if (existingLog) {
    existingLog.completed = !existingLog.completed;
    await existingLog.save();
    return NextResponse.json(existingLog);
  }

  const log = await HabitLog.create({
    habitId,
    userId,
    date: today,
    completed: true,
  });

  return NextResponse.json(log, { status: 201 });
}


/* ----------------------------------------
   GET HABIT LOGS
   GET /api/habitlog?habitId=&from=&to=
----------------------------------------- */
export async function GET(req: NextRequest) {
  await connectDB();

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const habitId = searchParams.get("habitId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const query: any = { userId };

  if (habitId) {
    if (!mongoose.Types.ObjectId.isValid(habitId)) {
      return NextResponse.json(
        { message: "Invalid habitId" },
        { status: 400 }
      );
    }
    query.habitId = habitId;
  }

  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = normalizeDate(new Date(from));
    if (to) query.date.$lte = normalizeDate(new Date(to));
  }

  const logs = await HabitLog.find(query)
    .sort({ date: 1 })
    .lean();

  return NextResponse.json(logs);
}

/* ----------------------------------------
   DELETE HABIT LOG (rare case)
   DELETE /api/habitlog
----------------------------------------- */
export async function DELETE(req: NextRequest) {
  await connectDB();

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { logId } = await req.json();

  if (!logId || !mongoose.Types.ObjectId.isValid(logId)) {
    return NextResponse.json(
      { message: "Valid logId required" },
      { status: 400 }
    );
  }

  const deleted = await HabitLog.findOneAndDelete({
    _id: logId,
    userId,
  });

  if (!deleted) {
    return NextResponse.json({ message: "Log not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
