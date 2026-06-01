import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import QuestionModel from "@/lib/model/Question";
import QuestionSubjectModel from "@/lib/model/QuestionSubjects";
import UserModel from "@/lib/model/User";
import { Types } from "mongoose";

/* ================= GET SINGLE QUESTION ================= */

export async function GET(request: NextRequest, context: any) {
  try {
    await connectDB();

    const { questionId } = await context.params;

    if (!Types.ObjectId.isValid(questionId)) {
      return NextResponse.json(
        { success: false, message: "Invalid question ID" },
        { status: 400 }
      );
    }

    const question = await QuestionModel.findById(questionId);

    if (!question) {
      return NextResponse.json(
        { success: false, message: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("GET QUESTION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch question" },
      { status: 500 }
    );
  }
}

/* ================= DELETE QUESTION ================= */

export async function DELETE(request: NextRequest, context: any) {
  try {
    await connectDB();

    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { questionId } = await context.params;

    if (!Types.ObjectId.isValid(questionId)) {
      return NextResponse.json(
        { success: false, message: "Invalid question ID" },
        { status: 400 }
      );
    }

    const question = await QuestionModel.findOne({
      _id: questionId,
      user: userId,
    });

    if (!question) {
      return NextResponse.json(
        { success: false, message: "Question not found" },
        { status: 404 }
      );
    }

    await QuestionModel.deleteOne({ _id: questionId });

    // 🔥 update counters
    await Promise.all([
      QuestionSubjectModel.updateOne(
        { user: userId, name: question.subject },
        { $inc: { questionsCount: -1 } }
      ),
      UserModel.updateOne(
        { _id: userId },
        { $inc: { totalQuestionsSolved: -1 } }
      ),
    ]);

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("DELETE QUESTION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete question" },
      { status: 500 }
    );
  }
}

/* ================= UPDATE QUESTION ================= */

export async function PUT(request: NextRequest, context: any) {
  try {
    await connectDB();

    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { questionId } = await context.params;

    if (!Types.ObjectId.isValid(questionId)) {
      return NextResponse.json(
        { success: false, message: "Invalid question ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const question = await QuestionModel.findOne({
      _id: questionId,
      user: userId,
    });

    if (!question) {
      return NextResponse.json(
        { success: false, message: "Question not found" },
        { status: 404 }
      );
    }

    // ✏️ allowed fields to update
    const allowedFields = [
      "name",
      "difficulty",
      "importance",
      "question",
      "solution",
      "revisions",
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        (question as any)[field] = body[field];
      }
    });

    const oldSubject = question.subject;

if (body.subject && body.subject !== oldSubject) {
  // ensure new subject exists
  const newSubject = await QuestionSubjectModel.findOne({
    user: userId,
    name: body.subject,
  });

  if (!newSubject) {
    return NextResponse.json(
      { success: false, message: "New subject not found" },
      { status: 404 }
    );
  }

  // update counters
  await Promise.all([
    QuestionSubjectModel.updateOne(
      { user: userId, name: oldSubject },
      { $inc: { questionsCount: -1 } }
    ),
    QuestionSubjectModel.updateOne(
      { user: userId, name: body.subject },
      { $inc: { questionsCount: 1 } }
    ),
  ]);

  question.subject = body.subject;
}


    await question.save();

    return NextResponse.json({
      success: true,
      data: question,
      message: "Question updated successfully",
    });
  } catch (error) {
    console.error("UPDATE QUESTION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update question" },
      { status: 500 }
    );
  }
}
