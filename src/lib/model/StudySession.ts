import mongoose, { Schema, Document, model } from "mongoose";

export interface IStudySession extends Document {
  user: mongoose.Types.ObjectId;
  topic: string;
  description?: string;
  duration: number; // in minutes
  startTime: Date;
  endTime: Date;
  breakTime?: number; // optional break duration
  createdAt: Date;
}

const studySessionSchema = new Schema<IStudySession>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true },
    description: { type: String },
    duration: { type: Number, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    breakTime: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const StudySessionModel = (mongoose.models.StudySession as mongoose.Model<IStudySession>) || (mongoose.model<IStudySession>('StudySession', studySessionSchema));

export default StudySessionModel;