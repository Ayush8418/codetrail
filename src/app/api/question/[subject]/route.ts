import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import QuestionModel from "@/lib/model/Question";

/* ================= GET QUESTIONS OF A SUBJECT (USER-SPECIFIC) ================= */

export async function GET(
  request: NextRequest,
  { params }: {params: Promise<{ subject: string }> }
) {
  try {
    await connectDB();

    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { subject } = await params;
    const decodedSubject = decodeURIComponent(subject);

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const skip = (page - 1) * limit;

    const questions = await QuestionModel.find({
      user: userId,
      subject: decodedSubject,
    })
      .sort({ createdAt: -1 }) // 🔥 latest first
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: questions,
      page,
      limit,
      subject: decodedSubject,
    });
  } catch (error) {
    console.error("GET SUBJECT QUESTIONS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subject questions" },
      { status: 500 }
    );
  }
}
