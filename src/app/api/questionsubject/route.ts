import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import QuestionSubjectModel from "@/lib/model/QuestionSubjects";
import QuestionModel from "@/lib/model/Question"; // (create later)

/* ================= CREATE QUESTION SUBJECT ================= */

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
    const { userSubject } = body;

    if (!userSubject || typeof userSubject !== "string") {
      return NextResponse.json(
        { success: false, message: "Subject name is required" },
        { status: 400 }
      );
    }

    const subject = userSubject.toLowerCase().trim();

    const newSubject = await QuestionSubjectModel.create({
      user: userId,
      name: subject,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Question subject created successfully",
        data: newSubject,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("CREATE QUESTION SUBJECT ERROR:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Subject already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create subject" },
      { status: 500 }
    );
  }
}

/* ================= GET QUESTION SUBJECTS ================= */

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

    const subjects = await QuestionSubjectModel.find({ user: userId })
      .sort({ createdAt: -1 })
      .select("name questionsCount createdAt")
      .lean();

    return NextResponse.json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    console.error("GET QUESTION SUBJECT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}

/* ================= DELETE QUESTION SUBJECT + ALL QUESTIONS ================= */

export async function DELETE(request: NextRequest) {
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
    const subjectParam = searchParams.get("subject");

    if (!subjectParam) {
      return NextResponse.json(
        { success: false, message: "Subject is required" },
        { status: 400 }
      );
    }

    const subject = subjectParam.toLowerCase().trim();

    const subjectDoc = await QuestionSubjectModel.findOne({
      user: userId,
      name: subject,
    });

    if (!subjectDoc) {
      return NextResponse.json(
        { success: false, message: "Subject not found" },
        { status: 404 }
      );
    }

    // 🗑️ Delete all questions of this subject
    await QuestionModel.deleteMany({
      user: userId,
      subject,
    });

    // 🗑️ Delete subject itself
    await QuestionSubjectModel.deleteOne({
      _id: subjectDoc._id,
    });

    return NextResponse.json({
      success: true,
      message:
        "Question subject and all related questions deleted successfully",
    });
  } catch (error) {
    console.error("DELETE QUESTION SUBJECT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete subject" },
      { status: 500 }
    );
  }
}
