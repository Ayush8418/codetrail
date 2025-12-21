import mongoose, { Schema, Document } from "mongoose";

export interface IStudySession extends Document {
  user: mongoose.Types.ObjectId;
  topic: string;
  description?: string;
  duration: number; // in minutes
  startTime: Date;
  endTime: Date;
  breakTime?: number; // optional break duration
  createdAt: Date;
  timestamps: [Date];
  revisions: {
    date: Date;
    done: boolean;
  }[];
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
    timestamps: {type: [Date]},
    createdAt: {type: Date, default: Date.now},
    revisions: {type:[
      {
        date: { type: Date, required: false },
        done: { type: Boolean, default: false }
      }
    ], default: []},
  },
);

studySessionSchema.index({ user: 1, createdAt: 1 });

const StudySessionModel = (mongoose.models.StudySession as mongoose.Model<IStudySession>) || (mongoose.model<IStudySession>('StudySession', studySessionSchema));

export default StudySessionModel;