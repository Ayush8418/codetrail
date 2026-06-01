import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/dbConnect";
import Todo from "@/lib/model/Todo";

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
   CREATE TODO
   POST /api/todo
----------------------------------------- */
export async function POST(req: NextRequest) {
  await connectDB();

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { title, description, priority, dueDate } = await req.json();

  if (!title?.trim()) {
    return NextResponse.json(
      { message: "Title is required" },
      { status: 400 }
    );
  }

  const todo = await Todo.create({
    userId,
    title: title.trim(),
    description: description || "",
    priority: priority || "medium",
    dueDate: dueDate ? new Date(dueDate) : undefined,
  });

  return NextResponse.json(todo, { status: 201 });
}

/* ----------------------------------------
   GET TODOS
   GET /api/todo?completed=&priority=
----------------------------------------- */
export async function GET(req: NextRequest) {
  await connectDB();

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const completed = searchParams.get("completed");
  const priority = searchParams.get("priority");

  const query: any = { userId };

  if (completed !== null) {
    query.completed = completed === "true";
  }

  if (priority) {
    query.priority = priority;
  }

  const todos = await Todo.find(query)
    .sort({ completed: 1, createdAt: -1 })
    .lean();

  return NextResponse.json(todos);
}

/* ----------------------------------------
   UPDATE TODO
   PATCH /api/todo
----------------------------------------- */
export async function PATCH(req: NextRequest) {
  await connectDB();

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { todoId, title, description, completed, priority, dueDate } =
    await req.json();

  if (!todoId || !mongoose.Types.ObjectId.isValid(todoId)) {
    return NextResponse.json(
      { message: "Valid todoId required" },
      { status: 400 }
    );
  }

  const todo = await Todo.findOne({ _id: todoId, userId });
  if (!todo) {
    return NextResponse.json({ message: "Todo not found" }, { status: 404 });
  }

  if (title !== undefined) todo.title = title.trim();
  if (description !== undefined) todo.description = description;
  if (completed !== undefined) todo.completed = completed;
  if (priority !== undefined) todo.priority = priority;
  if (dueDate !== undefined)
    todo.dueDate = dueDate ? new Date(dueDate) : undefined;

  await todo.save();

  return NextResponse.json(todo);
}

/* ----------------------------------------
   DELETE TODO
   DELETE /api/todo
----------------------------------------- */
export async function DELETE(req: NextRequest) {
  await connectDB();

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { todoId } = await req.json();

  if (!todoId || !mongoose.Types.ObjectId.isValid(todoId)) {
    return NextResponse.json(
      { message: "Valid todoId required" },
      { status: 400 }
    );
  }

  const deleted = await Todo.findOneAndDelete({
    _id: todoId,
    userId,
  });

  if (!deleted) {
    return NextResponse.json({ message: "Todo not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
