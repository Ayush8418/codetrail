import mongoose, { Schema, Document } from "mongoose";

export interface IFeedback extends Document {
  user?: mongoose.Types.ObjectId;
  message: string;
  type: "bug" | "suggestion" | "feature";
  createdAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["bug", "suggestion", "feature"],
      default: "suggestion",
    },
  },
  { timestamps: true }
);

const FeedbackModel = (mongoose.models.Feedback as mongoose.Model<IFeedback>) || (mongoose.model<IFeedback>('Feedback', feedbackSchema));

export default FeedbackModel;