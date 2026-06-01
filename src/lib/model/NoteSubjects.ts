import mongoose, { Schema, Document } from "mongoose";

export interface INoteSubject extends Document {
  user: mongoose.Types.ObjectId;
  name: string;

  notesCount: number;

  createdAt: Date;
  updatedAt: Date;
}

const noteSubjectSchema = new Schema<INoteSubject>(
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

    notesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/* 🔥 INDEXES FOR PERFORMANCE */

// Get all subjects of a user sorted by creation date
noteSubjectSchema.index({ user: 1, createdAt: -1 });

// Ensure one subject name per user (no duplicates)
noteSubjectSchema.index({ user: 1, name: 1 }, { unique: true });

const NoteSubjectModel =
  (mongoose.models.NoteSubject as mongoose.Model<INoteSubject>) ||
  mongoose.model<INoteSubject>("NoteSubject", noteSubjectSchema);

export default NoteSubjectModel;