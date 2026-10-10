
const express = require("express");

const {
  createComplaint,
  getMyComplaints,
  getMyComplaintById,
} = require("../controllers/complaintController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public tracking route — complaint ID se status check
router.get("/track/:complaintId", getMyComplaintById);

// Protected routes — login required
router.use(protect);

router.post("/", createComplaint);
router.get("/my", getMyComplaints);

module.exports = router;
