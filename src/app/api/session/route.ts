import { NextRequest, NextResponse } from "next/server";
import StudySessionModel from "@/lib/model/StudySession";
import connectDB from "@/lib/dbConnect";
import UserModel from "@/lib/model/User";

export async function POST(request: Request) {
  try {
    await connectDB();

    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { topic, description, timestamps = [], duration, revisions = [] } = body;

    if (!topic || !duration || !timestamps.length) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const startTime = timestamps[0];
    const endTime = timestamps[timestamps.length - 1];

    // 🔐 Check premium
    const user = await UserModel.findById(userId).select("isPremium");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const MAX_REVISIONS = user.isPremium ? 6 : 3;

    if (revisions.length > MAX_REVISIONS) {
      return NextResponse.json(
        {
          message: user.isPremium
            ? "Max 6 revisions allowed"
            : "Free users can add only 3 revisions",
        },
        { status: 403 }
      );
    }

    // ✅ sanitize revisions
    const safeRevisions = revisions.map((r: any) => ({
      date: new Date(r.date),
      done: false,
    }));

    const newSession = await StudySessionModel.create({
      user: userId,
      topic,
      description,
      timestamps,
      duration,
      startTime,
      endTime,
      revisions: safeRevisions,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { success: true, data: newSession },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST SESSION ERROR:", err);
    return NextResponse.json(
      { message: "Error saving session" },
      { status: 500 }
    );
  }
}


export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 15);
  const search = searchParams.get("search") || "";
  const sortOrder = searchParams.get("sort") === "asc" ? 1 : -1;
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");

  const skip = (page - 1) * limit;

  const query: any = { user: userId };

  // 🔍 search
  if (search) {
    query.topic = { $regex: search, $options: "i" };
  }

  // 📅 date filter
  if (fromDate || toDate) {
    query.createdAt = {};
    if (fromDate) query.createdAt.$gte = new Date(fromDate);
    if (toDate) query.createdAt.$lte = new Date(toDate);
  }

  await connectDB();

  const [sessions, total] = await Promise.all([
    StudySessionModel.find(query)
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limit),
    StudySessionModel.countDocuments(query),
  ]);

  return NextResponse.json({
    data: sessions,
    pagination: {
      totalPages: Math.ceil(total / limit),
    },
  });
}
