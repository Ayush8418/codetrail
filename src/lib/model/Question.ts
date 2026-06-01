import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  user: mongoose.Types.ObjectId;
  subject: string;
  name: string[];
  difficulty: "easy" | "medium" | "hard";
  importance: "low" | "medium" | "high";
  question: string;
  solution: string;
  createdAt: Date;
  updatedAt: Date;
  revisions: {
    date: Date;
    done: boolean;
  }[];
}

const questionSchema = new Schema<IQuestion>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: [{ type: String, required: true }],
    subject: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
    importance: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    question: { type: String },
    solution: { type: String },
    revisions: [
      {
        date: { type: Date, required: true },
        done: { type: Boolean, default: false }
      }
    ],
  },
  { timestamps: true }
);

const QuestionModel = (mongoose.models.Question as mongoose.Model<IQuestion>) || (mongoose.model<IQuestion>('Question', questionSchema));

export default QuestionModel;
