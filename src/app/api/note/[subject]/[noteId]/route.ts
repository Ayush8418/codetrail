import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import NoteModel from "@/lib/model/Note";
import SubjectModel from "@/lib/model/NoteSubjects";
import UserModel from "@/lib/model/User";
import { Types } from "mongoose";

/* ================= GET SINGLE NOTE ================= */

export async function GET(request: NextRequest, context: any) {
  try {
    await connectDB();

    const { noteId } = await context.params;

    if (!Types.ObjectId.isValid(noteId)) {
      return NextResponse.json(
        { success: false, message: "Invalid note ID1" },
        { status: 400 }
      );
    }

    const note = await NoteModel.findById(noteId);

    if (!note) {
      return NextResponse.json(
        { success: false, message: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: note });
  } catch (error) {
    console.error("GET NOTE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch note" },
      { status: 500 }
    );
  }
}

/* ================= DELETE NOTE ================= */

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

    const { noteId } = context.params;

    if (!Types.ObjectId.isValid(noteId)) {
      return NextResponse.json(
        { success: false, message: "Invalid note ID2" },
        { status: 400 }
      );
    }

    const note = await NoteModel.findOne({
      _id: noteId,
      user: userId,
    });

    if (!note) {
      return NextResponse.json(
        { success: false, message: "Note not found" },
        { status: 404 }
      );
    }

    await NoteModel.deleteOne({ _id: noteId });

    // 🔥 update counters
    await Promise.all([
      SubjectModel.updateOne(
        { user: userId, name: note.subject },
        { $inc: { notesCount: -1 } }
      ),
      UserModel.updateOne(
        { _id: userId },
        { $inc: { totalNotes: -1 } }
      ),
    ]);

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("DELETE NOTE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete note" },
      { status: 500 }
    );
  }
}

/* ================= UPDATE NOTE ================= */

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

    const { noteId } = context.params;

    if (!Types.ObjectId.isValid(noteId)) {
      return NextResponse.json(
        { success: false, message: "Invalid note ID3" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const note = await NoteModel.findOne({
      _id: noteId,
      user: userId,
    });

    if (!note) {
      return NextResponse.json(
        { success: false, message: "Note not found" },
        { status: 404 }
      );
    }

    // ✏️ allowed fields to update
    const allowedFields = [
      "topic",
      "description",
      "importance",
      "revisions",
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        (note as any)[field] = body[field];
      }
    });

    await note.save();

    return NextResponse.json({
      success: true,
      data: note,
      message: "Note updated successfully",
    });
  } catch (error) {
    console.error("UPDATE NOTE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update note" },
      { status: 500 }
    );
  }
}
