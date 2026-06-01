import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import NoteModel from "@/lib/model/Note";
import SubjectModel from "@/lib/model/NoteSubjects";
import UserModel from "@/lib/model/User";

/* ================= CREATE NOTE ================= */

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
      topic,
      subject,
      description,
      importance = "medium",
      revisions = [],
    } = body;

    const lowerSubject = subject.toLowerCase().trim();

    if (!topic || !lowerSubject || !description) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 🔍 ensure subject exists for this user
    const subjectDoc = await SubjectModel.findOne({
      user: userId,
      name: lowerSubject,
    });

    if (!subjectDoc) {
      return NextResponse.json(
        { success: false, message: "Subject not found" },
        { status: 404 }
      );
    }

    // 📝 create note
    const note = await NoteModel.create({
      user: userId,
      topic,
      subject: lowerSubject,
      description,
      importance,
      revisions,
    });

    // 🔥 update counters
    await Promise.all([
      SubjectModel.updateOne(
        { _id: subjectDoc._id },
        { $inc: { notesCount: 1 } }
      ),
      UserModel.updateOne(
        { _id: userId },
        { $inc: { totalNotes: 1 } }
      ),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Note created successfully",
        data: note,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE NOTE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create note" },
      { status: 500 }
    );
  }
}

/* ================= GET ALL NOTES OF USER ================= */

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

    const notes = await NoteModel.find({ user: userId })
      .sort({ createdAt: -1 }) // 🔥 latest first
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: notes,
      page,
      limit,
    });
  } catch (error) {
    console.error("GET NOTES ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}
