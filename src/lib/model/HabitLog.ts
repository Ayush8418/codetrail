import mongoose, { Schema, Document } from "mongoose";

export interface IHabitLog extends Document {
  userId: mongoose.Types.ObjectId;
  habitId: mongoose.Types.ObjectId;

  date: Date;                 // normalized (00:00)
  completed: boolean;

  createdAt: Date;
}

const habitLogSchema = new Schema<IHabitLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    habitId: {
      type: Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 🚀 Prevent duplicate logs for same habit + same day
habitLogSchema.index(
  { habitId: 1, date: 1 },
  { unique: true }
);

export default mongoose.models.HabitLog ||
  mongoose.model<IHabitLog>("HabitLog", habitLogSchema);
