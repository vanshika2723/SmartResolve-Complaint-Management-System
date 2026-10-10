const Complaint = require("../models/Complaint");

// ==========================================
// GET DASHBOARD STATISTICS
// ==========================================
exports.getDashboardStats = async (req, res) => {
  try {
    const [total, submitted, inProgress, resolved, rejected] =
      await Promise.all([
        Complaint.countDocuments(),
        Complaint.countDocuments({ status: "Submitted" }),
        Complaint.countDocuments({ status: "In Progress" }),
        Complaint.countDocuments({ status: "Resolved" }),
        Complaint.countDocuments({ status: "Rejected" }),
      ]);

    const resolutionRate =
      total > 0 ? Math.round((resolved / total) * 100) : 0;

    res.status(200).json({
      stats: {
        total,
        submitted,
        inProgress,
        resolved,
        rejected,
        resolutionRate,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error.message);

    res.status(500).json({
      message: "Unable to load dashboard statistics",
    });
  }
};

// ==========================================
// GET ANALYTICS DATA FOR CHARTS
// ==========================================
exports.getAnalytics = async (req, res) => {
  try {
    // Last 6 months, including the current month
    const now = new Date();
    const startDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1)
    );

    const [monthlyResults, categoryResults, statusResults] =
      await Promise.all([
        // Monthly complaint totals
        Complaint.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: now },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              total: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),

        // Complaints by category
        Complaint.aggregate([
          {
            $group: {
              _id: {
                $ifNull: ["$category", "Uncategorized"],
              },
              total: { $sum: 1 },
            },
          },
          { $sort: { total: -1 } },
        ]),

        // Complaints by status
        Complaint.aggregate([
          {
            $group: {
              _id: "$status",
              total: { $sum: 1 },
            },
          },
        ]),
      ]);

    // Include months with zero complaints
    const monthlyMap = new Map(
      monthlyResults.map((item) => [
        `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
        item.total,
      ])
    );

    const monthly = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)
      );

      const year = date.getUTCFullYear();
      const month = date.getUTCMonth() + 1;
      const key = `${year}-${String(month).padStart(2, "0")}`;

      monthly.push({
        month: date.toLocaleString("en-US", {
          month: "short",
          timeZone: "UTC",
        }),
        year,
        total: monthlyMap.get(key) || 0,
      });
    }

    const categories = categoryResults.map((item) => ({
      category: item._id || "Uncategorized",
      total: item.total,
    }));

    const statusCounts = {
      Submitted: 0,
      "In Progress": 0,
      Resolved: 0,
      Rejected: 0,
    };

    statusResults.forEach((item) => {
      if (Object.prototype.hasOwnProperty.call(statusCounts, item._id)) {
        statusCounts[item._id] = item.total;
      }
    });

    res.status(200).json({
      analytics: {
        monthly,
        categories,
        statusCounts,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error.message);

    res.status(500).json({
      message: "Unable to load analytics data",
    });
  }
};

// ==========================================
// GET ALL COMPLAINTS WITH SEARCH & PAGINATION
// ==========================================
exports.getAllComplaints = async (req, res) => {
  try {
    const {
      status,
      priority,
      category,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    // Escape special regex characters in search input
    if (search && search.trim()) {
      const escaped = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const regex = new RegExp(escaped, "i");

      filter.$or = [
        { complaintId: regex },
        { title: regex },
      ];
    }

    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number(limit) || 10)
    );

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize),

      Complaint.countDocuments(filter),
    ]);

    res.status(200).json({
      complaints,
      pagination: {
        total,
        page: currentPage,
        limit: pageSize,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Get complaints error:", error.message);

    res.status(500).json({
      message: "Unable to fetch complaints",
    });
  }
};

// ==========================================
// UPDATE COMPLAINT STATUS & RESOLUTION NOTE
// ==========================================

exports.updateComplaint = async (req, res) => {
  try {
    const { status, resolutionNote } = req.body;

    const allowedStatuses = [
      "Submitted",
      "In Progress",
      "Resolved",
      "Rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid complaint status",
      });
    }

    if (
      resolutionNote !== undefined &&
      (typeof resolutionNote !== "string" ||
        resolutionNote.length > 2000)
    ) {
      return res.status(400).json({
        message: "Resolution note must be a string under 2000 characters",
      });
    }

    const complaintId = req.params.complaintId;

    if (!complaintId) {
      return res.status(400).json({
        message: "Complaint ID is required",
      });
    }

    const complaint = await Complaint.findOne({
      complaintId: complaintId.trim().toUpperCase(),
    });

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    const previousStatus = complaint.status;
    const statusChanged = previousStatus !== status;

    // Update complaint status
    complaint.status = status;

    if (resolutionNote !== undefined) {
      complaint.resolutionNote = resolutionNote.trim();
    }

    // Maintain resolution timestamp
    complaint.resolvedAt =
      status === "Resolved"
        ? complaint.resolvedAt || new Date()
        : null;

    // Record history only when the status actually changes
    if (statusChanged) {
      complaint.statusHistory.push({
        status,
        changedBy: req.user?._id || null,
        note:
          resolutionNote?.trim() ||
          `Status changed from ${previousStatus} to ${status}`,
        changedAt: new Date(),
      });
    }

    await complaint.save();

    return res.status(200).json({
      message: "Complaint updated successfully",
      complaint,
    });
  } catch (error) {
    console.error("Update complaint error:", error.message);

    return res.status(500).json({
      message: "Unable to update complaint",
    });
  }
};

 // ==========================================
 // GET COMPLAINT STATUS HISTORY
 // ==========================================
exports.getComplaintHistory = async (req, res) => {
  try {
    const complaintId = req.params.complaintId;

    if (!complaintId) {
      return res.status(400).json({
        message: "Complaint ID is required",
      });
    }

    const complaint = await Complaint.findOne({
      complaintId: complaintId.trim().toUpperCase(),
    }).select("complaintId title status statusHistory createdAt updatedAt");

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    return res.status(200).json({
      complaint: {
        complaintId: complaint.complaintId,
        title: complaint.title,
        status: complaint.status,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
        statusHistory: complaint.statusHistory,
      },
    });
  } catch (error) {
    console.error("Complaint history error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch complaint history",
    });
  }
};
