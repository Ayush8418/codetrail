import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/dbConnect";
import Habit from "@/lib/model/Habit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import HabitLog  from "@/lib/model/HabitLog";

/* ----------------------------------------
   Helper: get authenticated user
----------------------------------------- */
async function getUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user.id;
}

/* ----------------------------------------
   CREATE HABIT
   POST /api/habit
----------------------------------------- */
export async function POST(req: NextRequest) {
  await connectDB();

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { title, description } = await req.json();

  if (!title?.trim()) {
    return NextResponse.json(
      { message: "Habit title is required" },
      { status: 400 }
    );
  }

  const habit = await Habit.create({
    userId,
    title: title.trim(),
    description: description || "",
  });

  return NextResponse.json(habit, { status: 201 });
}

/* ----------------------------------------
   GET ALL HABITS (for dashboard)
   GET /api/habit
----------------------------------------- */
export async function GET() {
  await connectDB();

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const habits = await Habit.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(habits);
}

/* ----------------------------------------
   UPDATE HABIT
   PATCH /api/habit
   (name, description, isActive)
----------------------------------------- */
export async function PATCH(req: NextRequest) {
  await connectDB();

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { habitId, title, description, isActive } = await req.json();

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

  if (title !== undefined) habit.title = title.trim();
  if (description !== undefined) habit.description = description;
  if (isActive !== undefined) habit.isActive = isActive;

  await habit.save();

  return NextResponse.json(habit);
}

/* ----------------------------------------
   DELETE HABIT
   DELETE /api/habit
----------------------------------------- */
export async function DELETE(req: NextRequest) {
  await connectDB();

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { habitId } = await req.json();

  if (!habitId || !mongoose.Types.ObjectId.isValid(habitId)) {
    return NextResponse.json(
      { message: "Valid habitId required" },
      { status: 400 }
    );
  }

  // 1️⃣ Delete habit (ensure ownership)
  const deletedHabit = await Habit.findOneAndDelete({
    _id: habitId,
    userId,
  });

  if (!deletedHabit) {
    return NextResponse.json({ message: "Habit not found" }, { status: 404 });
  }

  // 2️⃣ Cascade delete all logs for this habit
  await HabitLog.deleteMany({
    habitId,
    userId,
  });

  return NextResponse.json({ success: true });
}
