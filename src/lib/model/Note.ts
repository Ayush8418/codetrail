import mongoose, { Schema, Document } from "mongoose";

export interface INote extends Document {
  user: mongoose.Types.ObjectId;
  topic: string;
  subject: string;
  importance: "low" | "medium" | "high";
  description: string;
  createdAt: Date;
  updatedAt: Date;
  revisions: {
    date: Date;
    done: boolean;
  }[];
}

const noteSchema = new Schema<INote>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true },
    subject: { type: String, required: true },
    importance: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    revisions: [
      {
        date: { type: Date, required: true },
        done: { type: Boolean, default: false }
      }
    ],
  },
  { timestamps: true }
);

noteSchema.index({ user: 1, subject: 1, createdAt: -1 });

const NoteModel = (mongoose.models.Note as mongoose.Model<INote>) || (mongoose.model<INote>('Note', noteSchema));

export default NoteModel;