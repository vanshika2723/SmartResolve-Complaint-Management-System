const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

const {
  getDashboardStats,
  getAnalytics,
  getAllComplaints,
  updateComplaint,
  getComplaintHistory,
} = require("../controllers/adminController");


const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, admin);

// Dashboard statistics
router.get("/stats", getDashboardStats);

// Analytics charts data
router.get("/analytics", getAnalytics);

// Complaint management
router.get("/complaints", getAllComplaints);
router.patch("/complaints/:complaintId", updateComplaint);
router.get(
  "/complaints/:complaintId/history",
  getComplaintHistory
);

module.exports = router;
