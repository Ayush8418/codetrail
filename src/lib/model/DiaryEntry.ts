import mongoose, { Schema, Document } from "mongoose";

export interface IDiaryEntry extends Document {
  userId: mongoose.Types.ObjectId;

  date: Date;                 // one entry per day
  content: string;            // rich text / markdown / HTML
}

const diaryEntrySchema = new Schema<IDiaryEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
    },

  },
  { timestamps: true }
);

/* 
  Enforce ONE diary entry per user per day
*/
diaryEntrySchema.index(
  { userId: 1, date: 1 },
  { unique: true }
);

export default mongoose.models.DiaryEntry ||
  mongoose.model<IDiaryEntry>("DiaryEntry", diaryEntrySchema);
