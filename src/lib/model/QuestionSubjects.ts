import mongoose, { Schema, Document } from "mongoose";

export interface IQuestionSubject extends Document {
  user: mongoose.Types.ObjectId;
  name: string;

  questionsCount: number;

  createdAt: Date;
  updatedAt: Date;
}

const questionSubjectSchema = new Schema<IQuestionSubject>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    questionsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/* 🔥 INDEXES */

// Get all subjects of a user sorted by creation date
questionSubjectSchema.index({ user: 1, createdAt: -1 });

// Prevent duplicate subject names per user
questionSubjectSchema.index({ user: 1, name: 1 }, { unique: true });

const QuestionSubjectModel =
  (mongoose.models.QuestionSubject as mongoose.Model<IQuestionSubject>) ||
  mongoose.model<IQuestionSubject>(
    "QuestionSubject",
    questionSubjectSchema
  );

export default QuestionSubjectModel;
