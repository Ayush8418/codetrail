import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import QuestionModel from "@/lib/model/Question";
import QuestionSubjectModel from "@/lib/model/QuestionSubjects";
import UserModel from "@/lib/model/User";

/* ================= CREATE QUESTION ================= */

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      subject,
      difficulty = "easy",
      importance = "medium",
      question,
      solution,
      revisions = [],
    } = body;

    if (!Array.isArray(name) || name.length === 0) {
      return NextResponse.json(
        { success: false, message: "Question name is required" },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== "string") {
      return NextResponse.json(
        { success: false, message: "Subject is required" },
        { status: 400 }
      );
    }

    const lowerSubject = subject.toLowerCase().trim();

    // 🔍 ensure question subject exists
    const subjectDoc = await QuestionSubjectModel.findOne({
      user: userId,
      name: lowerSubject,
    });

    if (!subjectDoc) {
      return NextResponse.json(
        { success: false, message: "Question subject not found" },
        { status: 404 }
      );
    }

    // 📝 create question
    const newQuestion = await QuestionModel.create({
      user: userId,
      name,
      subject: lowerSubject,
      difficulty,
      importance,
      question,
      solution,
      revisions,
    });

    // 🔥 update counters
    await Promise.all([
      QuestionSubjectModel.updateOne(
        { _id: subjectDoc._id },
        { $inc: { questionsCount: 1 } }
      ),
      UserModel.updateOne(
        { _id: userId },
        { $inc: { totalQuestionsSolved: 1 } }
      ),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Question created successfully",
        data: newQuestion,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE QUESTION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create question" },
      { status: 500 }
    );
  }
}

/* ================= GET ALL QUESTIONS OF USER ================= */

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const skip = (page - 1) * limit;

    const questions = await QuestionModel.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: questions,
      page,
      limit,
    });
  } catch (error) {
    console.error("GET QUESTIONS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
