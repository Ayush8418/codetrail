import mongoose, { Schema, Document, model } from "mongoose";

export interface INote extends Document {
  user: mongoose.Types.ObjectId;
  topic: string;
  heading: string;
  importance: "low" | "medium" | "high";
  description: string;
  code?: string;
  link?: string;
  revised: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true },
    heading: { type: String, required: true },
    importance: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    description: { type: String, required: true },
    code: { type: String },
    link: { type: String },
    revised: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const NoteModel = (mongoose.models.Note as mongoose.Model<INote>) || (mongoose.model<INote>('Note', noteSchema));

export default NoteModel;