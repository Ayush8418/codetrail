import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import NoteModel from "@/lib/model/Note";

/* ================= GET NOTES OF A SUBJECT (USER-SPECIFIC) ================= */

export async function GET(
  request: NextRequest,
  { params }: { params: { subject: string } }
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
    const resolvedParams = await params;
    const subject = decodeURIComponent(resolvedParams.subject);

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const skip = (page - 1) * limit;

    const notes = await NoteModel.find({
      user: userId,
      subject,
    })
      .sort({ createdAt: -1 }) // 🔥 latest first
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: notes,
      page,
      limit,
      subject,
    });
  } catch (error) {
    console.error("GET SUBJECT NOTES ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subject notes" },
      { status: 500 }
    );
  }
}
