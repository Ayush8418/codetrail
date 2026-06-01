import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import SubjectModel from "@/lib/model/NoteSubjects";
import NoteModel from "@/lib/model/Note";


/* ================= CREATE SUBJECT ================= */

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
    const subject = userSubject.toLowerCase().trim();


    if (!subject || typeof subject !== "string") {
      return NextResponse.json(
        { success: false, message: "Subject name is required" },
        { status: 400 }
      );
    }

    // ✅ Create subject directly
    // Duplicate prevention handled by unique index (user + name)
    const newSubject = await SubjectModel.create({
      user: userId,
      name: subject.trim(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Subject created successfully",
        data: newSubject,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("CREATE SUBJECT ERROR:", error);

    // 🔥 Handle duplicate subject error
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

/* ================= GET SUBJECTS ================= */

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

    const subjects = await SubjectModel.find({ user: userId })
      .sort({ createdAt: -1 })
      .select("name notesCount createdAt")
      .lean();

    return NextResponse.json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    console.error("GET SUBJECT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}



/* ================= DELETE SUBJECT + ALL NOTES ================= */

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

    // 🔍 Check subject exists
    const subjectDoc = await SubjectModel.findOne({
      user: userId,
      name: subject,
    });

    if (!subjectDoc) {
      return NextResponse.json(
        { success: false, message: "Subject not found" },
        { status: 404 }
      );
    }

    // 🗑️ Delete all notes of this subject
    await NoteModel.deleteMany({
      user: userId,
      subject,
    });

    // 🗑️ Delete subject itself
    await SubjectModel.deleteOne({
      _id: subjectDoc._id,
    });

    return NextResponse.json({
      success: true,
      message: "Subject and all related notes deleted successfully",
    });
  } catch (error) {
    console.error("DELETE SUBJECT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete subject" },
      { status: 500 }
    );
  }
}
