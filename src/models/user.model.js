import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: string,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // password should be at least 6 characters
  },
  role: {
    type: String,
    enum: ["user", "admin"], // only allowed values
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const user = mongoose.model("user", userSchema);
