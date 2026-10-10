
const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, "Complaint title is required"],
      trim: true,
      maxlength: 120,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: 5000,
    },

    category: {
      type: String,
      enum: [
        "Technical",
        "Billing",
        "Service",
        "Infrastructure",
        "Other",
      ],
      required: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Submitted", "In Progress", "Resolved", "Rejected"],
      default: "Submitted",
    },

    // NEW: Complaint status history
    statusHistory: [
      {
        status: {
          type: String,
          enum: ["Submitted", "In Progress", "Resolved", "Rejected"],
          required: true,
        },

        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },

        note: {
          type: String,
          trim: true,
          maxlength: 1000,
          default: "",
        },

        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resolutionNote: {
      type: String,
      default: "",
      maxlength: 2000,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

complaintSchema.pre("validate", function () {
  if (!this.complaintId && this._id) {
    this.complaintId = `SR-${this._id
      .toString()
      .slice(-8)
      .toUpperCase()}`;
  }
});

module.exports = mongoose.model("Complaint", complaintSchema);
