import mongoose, { Schema, Document } from "mongoose";

export interface IHabit extends Document {
  userId: mongoose.Types.ObjectId;

  title: string;              // "Daily Coding"
  description?: string;       // optional explanation

  color?: string;             // for UI (heatmap / cards)
  icon?: string;              // optional emoji or icon id

  frequency: "daily" | "weekly";
  targetDays?: number;        // e.g. 5 days/week (for weekly)

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const habitSchema = new Schema<IHabit>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    frequency: {
      type: String,
      enum: ["daily", "weekly"],
      default: "daily",
    },

    targetDays: { type: Number }, // used only for weekly habits

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Habit ||
  mongoose.model<IHabit>("Habit", habitSchema);
