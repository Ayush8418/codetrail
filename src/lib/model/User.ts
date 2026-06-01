import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password?: string; // only for credential users
  emailVerified: boolean;

  googleId?: string;
  githubId?: string;

  isPremium: boolean

  forgotToken?: string;
  forgotTokenExp?: Date;
  verifyToken?: string;
  verifyTokenExp?: Date;

  profileImage?: string;
  bio?: string;
  role?: "user" | "admin";

  // Tracking stats
  totalQuestionsSolved: number;
  totalNotes: number;

  // Preferences
  theme: "light" | "dark";
  reminderEnabled: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String , default: ""},
    emailVerified: { type: Boolean, default: false },

    googleId: { type: String },
    githubId: { type: String },

    isPremium: {
      type: Boolean,
      default: false,
    },

    forgotToken: {type: String, defaul: ""},
    forgotTokenExp: {type: Date, default: Date.now()},
    verifyToken: {type: String, default: ""},
    verifyTokenExp: {type: Date, default: Date.now()},

    profileImage: { type: String },
    bio: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    totalQuestionsSolved: { type: Number, default: 0 },
    totalNotes: { type: Number, default: 0 },

    theme: { type: String, enum: ["light", "dark"], default: "light" },
    reminderEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const UserModel = (mongoose.models.User as mongoose.Model<IUser>) || (mongoose.model<IUser>('User', userSchema));

export default UserModel;