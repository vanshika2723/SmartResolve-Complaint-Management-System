
const Complaint = require("../models/Complaint");

// Submit a complaint
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    if (!title?.trim() || !description?.trim() || !category) {
      return res.status(400).json({
        message: "Title, description and category are required",
      });
    }

    if (
      title.trim().length > 120 ||
      description.trim().length > 5000
    ) {
      return res.status(400).json({
        message: "Title or description exceeds the allowed length",
      });
    }

    const complaint = await Complaint.create({
      title: title.trim(),
      description: description.trim(),
      category,
      priority: priority || "Medium",
      user: req.user._id,
      statusHistory: [
        {
          status: "Submitted",
          changedBy: req.user._id,
          note: "Complaint submitted successfully",
          changedAt: new Date(),
        },
      ],
    });

    return res.status(201).json({
      message: "Complaint submitted successfully",
      complaint,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error("Create complaint error:", error.message);

    return res.status(500).json({
      message: "Unable to submit complaint",
    });
  }
};

// Get complaints belonging to the logged-in user
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error("Fetch complaints error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch complaints",
    });
  }
};

// Public complaint tracking by Complaint ID
exports.getMyComplaintById = async (req, res) => {
  try {
    const complaintId = req.params.complaintId?.trim().toUpperCase();

    if (!complaintId) {
      return res.status(400).json({
        message: "Complaint ID is required",
      });
    }

    const complaint = await Complaint.findOne({
      complaintId,
    }).select(
      "complaintId title description category priority status statusHistory resolutionNote resolvedAt createdAt updatedAt"
    );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found. Please check your Complaint ID.",
      });
    }

    return res.status(200).json({
      complaint,
    });
  } catch (error) {
    console.error("Track complaint error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch complaint",
    });
  }
};
