import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import StudySessionModel from "@/lib/model/StudySession";
import { Types } from "mongoose";
import UserModel from "@/lib/model/User";

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

    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = context.params;

    if (!Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json(
        { message: "Invalid session ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const session = await StudySessionModel.findOne({
      _id: sessionId,
      user: userId,
    });

    if (!session) {
      return NextResponse.json(
        { message: "Session not found" },
        { status: 404 }
      );
    }

    // inside PUT (after session fetch)

    const user = await UserModel.findById(userId).select("isPremium");
    const MAX_REVISIONS = user?.isPremium ? 6 : 3;

    // ✅ revisions update (only if sent)
    if (Array.isArray(body.revisions)) {
      if (body.revisions.length > MAX_REVISIONS) {
        return NextResponse.json(
          {
            message: user?.isPremium
              ? "Max 6 revisions allowed"
              : "Free users can add only 3 revisions",
          },
          { status: 403 }
        );
      }

      // sanitize revisions
      session.revisions = body.revisions.map((r: any) => ({
        _id: r._id,               // keep existing ids
        date: new Date(r.date),
        done: !!r.done,
      }));
    }


    // =========================
    // 🔁 REVISION HANDLING
    // =========================
    if (body.revisionAction) {
      const user = await UserModel.findById(userId).select("isPremium");
      const MAX_REVISIONS = user?.isPremium ? 6 : 3;

      // ➕ ADD
      if (body.revisionAction === "add") {
        if (!body.revisionDate) {
          return NextResponse.json(
            { message: "Revision date required" },
            { status: 400 }
          );
        }

        if (session.revisions.length >= MAX_REVISIONS) {
          return NextResponse.json(
            {
              message: user?.isPremium
                ? "Max 6 revisions allowed"
                : "Free users can add only 3 revisions",
            },
            { status: 403 }
          );
        }

        session.revisions.push({
          date: new Date(body.revisionDate),
          done: false,
        });
      }

      // 🔁 TOGGLE
      if (body.revisionAction === "toggle") {
        const rev = session.revisions.id(body.revisionId);
        if (!rev) {
          return NextResponse.json(
            { message: "Revision not found" },
            { status: 404 }
          );
        }
        rev.done = !rev.done;
      }

      // ❌ REMOVE
      if (body.revisionAction === "remove") {
        session.revisions = session.revisions.filter(
          (r: any) => r._id?.toString() !== body.revisionId
        );
      }

      await session.save();

      return NextResponse.json({
        success: true,
        data: session,
        message: "Revision updated",
      });
    }

    // =========================
    // ✏️ NORMAL SESSION UPDATE
    // =========================
    const allowedFields = [
      "topic",
      "description",
      "duration",
      "timestamps",
      "breakTime",
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        session[field] = body[field];
      }
    });

    await session.save();

    return NextResponse.json({
      success: true,
      data: session,
      message: "Session updated",
    });
  } catch (err) {
    console.error("PUT SESSION ERROR:", err);
    return NextResponse.json(
      { message: "Update failed" },
      { status: 500 }
    );
  }
}
