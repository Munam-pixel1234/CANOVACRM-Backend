import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    source: String,
    date: Date,
    location: String,
    language: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    status: { type: String, default: "Ongoing" },
    type: String,
    scheduledDate: Date
  },
  { timestamps: true }
);

// Indexes for performance (SRD requirement)
leadSchema.index({ language: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ status: 1 });

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
