import mongoose, { Schema, Document } from "mongoose";

export interface IRevision {
  _id?: mongoose.Types.ObjectId;
  date: Date;
  done: boolean;
}

export interface IStudySession extends Document {
  user: mongoose.Types.ObjectId;
  topic: string;
  description?: string;
  duration: number;
  startTime: Date;
  endTime: Date;
  breakTime?: number;
  createdAt: Date;
  timestamps: Date[];
  revisions: IRevision[];
}

const revisionSchema = new Schema<IRevision>(
  {
    date: { type: Date, required: true },
    done: { type: Boolean, default: false },
  },
  { _id: true }
);

const studySessionSchema = new Schema<IStudySession>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  topic: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  breakTime: { type: Number, default: 0 },
  timestamps: { type: [Date], default: [] },
  createdAt: { type: Date, default: Date.now },

  // ⭐ REVISION SYSTEM
  revisions: {
    type: [revisionSchema],
    default: [],
  },
});

studySessionSchema.index({ user: 1, createdAt: -1 });

const StudySessionModel =
  mongoose.models.StudySession ||
  mongoose.model<IStudySession>("StudySession", studySessionSchema);

export default StudySessionModel;
