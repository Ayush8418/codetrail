import mongoose, { Schema, Document } from "mongoose";

export interface ITodo extends Document {
  userId: mongoose.Types.ObjectId;

  title: string;
  description?: string;

  completed: boolean;

  dueDate?: Date;          // optional (for future reminders)
  priority: "low" | "medium" | "high";

  createdAt: Date;
  updatedAt: Date;
}

const todoSchema = new Schema<ITodo>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    completed: {
      type: Boolean,
      default: false,
      index: true,
    },

    dueDate: {
      type: Date,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Todo ||
  mongoose.model<ITodo>("Todo", todoSchema);
