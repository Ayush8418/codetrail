import mongoose, { Schema, Document } from "mongoose";

export interface ITodo extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  completed: boolean;
  type: "task" | "habit" | "reminder";
  repeat?: "daily" | "weekly" | "monthly" | "none";
  createdAt: Date;
  updatedAt: Date;
}

const todoSchema = new Schema<ITodo>(
  { 
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: { type: Date },
    completed: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ["task", "habit", "reminder"],
      default: "task",
    },
    repeat: {
      type: String,
      enum: ["daily", "weekly", "monthly", "none"],
      default: "none",
    },
  },
  { timestamps: true }
);

const TodoModel = (mongoose.models.Todo as mongoose.Model<ITodo>) || (mongoose.model<ITodo>('Todo', todoSchema));

export default TodoModel;