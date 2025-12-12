import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import StudySessionModel from "@/lib/model/StudySession";
import { Types } from "mongoose";

// ✅ GET SINGLE SESSION
export async function GET(request: NextRequest, context: any) {
  try {
    await connectDB();

    const params = await context.params;
    const sessionId = params.sessionId;

    if (!Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json(
        { success: false, message: "Invalid session ID" },
        { status: 400 }
      );
    }

    const session = await StudySessionModel.findById(sessionId);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: session });
  } catch (err) {
    console.error("GET SESSION ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Error fetching session" },
      { status: 500 }
    );
  }
}

// ✅ DELETE SESSION
export async function DELETE(request: NextRequest, context: any) {
  try {
    await connectDB();

    const params = await context.params;
    const sessionId = params.sessionId;

    if (!Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json(
        { success: false, message: "Invalid session ID" },
        { status: 400 }
      );
    }

    const deleted = await StudySessionModel.findByIdAndDelete(sessionId);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (err) {
    console.error("DELETE SESSION ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Delete failed" },
      { status: 500 }
    );
  }
}

// ✅ UPDATE SESSION
export async function PUT(request: NextRequest, context: any) {
  try {
    await connectDB();

    const params = await context.params;
    const sessionId = params.sessionId;

    if (!Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json(
        { success: false, message: "Invalid session ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const updated = await StudySessionModel.findByIdAndUpdate(
      sessionId,
      body,
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Session updated successfully",
    });
  } catch (err) {
    console.error("UPDATE SESSION ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Update failed" },
      { status: 500 }
    );
  }
}
