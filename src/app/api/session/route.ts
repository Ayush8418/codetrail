import { NextRequest, NextResponse } from "next/server";
import StudySessionModel from "@/lib/model/StudySession";
import connectDB from "@/lib/dbConnect";
import UserModel from "@/lib/model/User";

export async function POST(request: Request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
    const body = await request.json();
    const { topic, description, timestamps, duration } = body;
    const startTime = timestamps[0];
    const endTime = timestamps[timestamps.length - 1];
    await connectDB();
    // ✅ 1. Get user & premium status
    const user = await UserModel.findById(userId).select("isPremium");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const DAILY_LIMIT = user.isPremium ? 10 : 4;

    // ✅ 2. Get today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // ✅ 3. Count today's sessions
    const todayCount = await StudySessionModel.countDocuments({
      user: userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    // ✅ 4. Block if limit reached
    if (todayCount >= DAILY_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          message: user.isPremium
            ? "Daily limit of 10 sessions reached"
            : "Free users can only add 4 sessions per day. Upgrade to Premium!",
        },
        { status: 403 }
      );
    }

    // ✅ 5. Create session if under limit
    const newSession = await StudySessionModel.create({
      user: userId,
      topic,
      description,
      timestamps,
      duration,
      startTime,
      endTime,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "Study session saved!", data: newSession },
      { status: 201 }
    );
  } catch (err) {
    console.log(JSON.stringify(err));
    return NextResponse.json({ message: "Error saving session" }, { status: 500 });
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
