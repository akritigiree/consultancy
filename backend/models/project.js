const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    consultant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending"
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
