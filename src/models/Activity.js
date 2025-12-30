import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  { message: String },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);
