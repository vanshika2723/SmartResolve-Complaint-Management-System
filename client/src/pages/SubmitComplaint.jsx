import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
LayoutDashboard,
FileText,
PlusCircle,
Search,
LogOut,
Menu,
X,
ShieldCheck,
UserRound,
Send,
AlertCircle,
CheckCircle2,
ClipboardList,
ArrowLeft,
Info,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const initialForm = {
title: "",
description: "",
category: "Technical",
priority: "Medium",
};

export default function SubmitComplaint() {
const { user, logout } = useAuth();
const navigate = useNavigate();

const [formData, setFormData] = useState(initialForm);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState(null);
const [menuOpen, setMenuOpen] = useState(false);

const handleChange = (event) => {
const { name, value } = event.target;


setFormData((previous) => ({
  ...previous,
  [name]: value,
}));

setError("");
setSuccess(null);


};

const handleSubmit = async (event) => {
event.preventDefault();
setError("");
setSuccess(null);


const title = formData.title.trim();
const description = formData.description.trim();

if (title.length < 5) {
  setError("Please enter a title with at least 5 characters.");
  return;
}

if (description.length < 10) {
  setError(
    "Please describe your complaint in at least 10 characters."
  );
  return;
}

if (title.length > 120) {
  setError("The title cannot exceed 120 characters.");
  return;
}

if (description.length > 3000) {
  setError("The description cannot exceed 3000 characters.");
  return;
}

try {
  setLoading(true);

  const response = await api.post("/complaints", {
    ...formData,
    title,
    description,
  });

  const createdComplaint =
    response.data.complaint || response.data;

  setSuccess({
    complaintId: createdComplaint.complaintId,
    message:
      response.data.message ||
      "Your complaint has been submitted successfully.",
  });

  setFormData(initialForm);
} catch (err) {
  setError(
    err.response?.data?.message ||
      "Unable to submit your complaint. Please try again."
  );
} finally {
  setLoading(false);
}


};

const handleLogout = () => {
logout();
navigate("/login");
};

return ( <div className="app-shell track-page">
<aside className={`app-sidebar ${menuOpen ? "sidebar-open" : ""}`}> <Link to="/dashboard" className="app-brand"> <span className="app-brand-icon"> <ShieldCheck size={24} /> </span>


      <span>
        <strong>SmartResolve</strong>
        <small>Complaint Portal</small>
      </span>
    </Link>

    <div className="sidebar-label">WORKSPACE</div>

    <nav className="sidebar-nav">
      <Link
        to="/dashboard"
        className="sidebar-link"
        onClick={() => setMenuOpen(false)}
      >
        <LayoutDashboard size={19} />
        <span>Dashboard</span>
      </Link>

      <Link
        to="/complaints"
        className="sidebar-link"
        onClick={() => setMenuOpen(false)}
      >
        <FileText size={19} />
        <span>My Complaints</span>
      </Link>

      <Link
        to="/submit-complaint"
        className="sidebar-link active"
        onClick={() => setMenuOpen(false)}
      >
        <PlusCircle size={19} />
        <span>Submit Complaint</span>
      </Link>

      <Link
        to="/track-complaint"
        className="sidebar-link"
        onClick={() => setMenuOpen(false)}
      >
        <Search size={19} />
        <span>Track Complaint</span>
      </Link>
    </nav>

    <div className="sidebar-bottom">
      <div className="sidebar-user">
        <div className="user-avatar">
          {(user?.name || "U").charAt(0).toUpperCase()}
        </div>

        <div className="sidebar-user-info">
          <strong>{user?.name || "User"}</strong>
          <span>Standard User</span>
        </div>
      </div>

      <button
        type="button"
        className="sidebar-logout"
        onClick={handleLogout}
      >
        <LogOut size={18} />
        <span>Sign Out</span>
      </button>
    </div>
  </aside>

  {menuOpen && (
    <button
      type="button"
      className="sidebar-overlay"
      aria-label="Close navigation"
      onClick={() => setMenuOpen(false)}
    />
  )}

  <main className="app-main">
    <header className="app-topbar">
      <button
        type="button"
        className="mobile-menu-button"
        aria-label="Toggle navigation"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <div className="topbar-heading">
        <span className="topbar-eyebrow">
          WORKSPACE / NEW COMPLAINT
        </span>
        <h2>Submit Complaint</h2>
      </div>

      <div className="topbar-profile">
        <div className="topbar-profile-icon">
          <UserRound size={19} />
        </div>
        <div>
          <strong>{user?.name || "User"}</strong>
          <span>My Account</span>
        </div>
      </div>
    </header>

    <div className="dashboard-content submit-page-content">
      <div className="submit-page-intro">
        <Link to="/dashboard" className="back-to-dashboard">
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div className="submit-intro-heading">
          <div className="submit-intro-icon">
            <ClipboardList size={28} />
          </div>

          <div>
            <h1>Tell us what happened</h1>
            <p>
              Share the details below so our team can review
              and resolve your complaint.
            </p>
          </div>
        </div>
      </div>

      {success ? (
        <section className="complaint-success-card">
          <div className="success-check-icon">
            <CheckCircle2 size={39} />
          </div>

          <span className="success-eyebrow">
            SUBMISSION COMPLETE
          </span>

          <h2>Complaint submitted successfully!</h2>

          <p>
            Thank you for letting us know. Your complaint has
            been recorded and is awaiting review.
          </p>

          {success.complaintId && (
            <div className="generated-complaint-id">
              <span>Your Complaint ID</span>
              <strong>{success.complaintId}</strong>
            </div>
          )}

          <div className="success-actions">
            <Link
              to={`/track-complaint?complaintId=${encodeURIComponent(
                success.complaintId || ""
              )}`}
              className="submit-primary-button"
            >
              Track Complaint
              <Search size={17} />
            </Link>

            <button
              type="button"
              className="submit-secondary-button"
              onClick={() => {
                setSuccess(null);
                setFormData(initialForm);
              }}
            >
              Submit Another
            </button>
          </div>
        </section>
      ) : (
        <div className="submit-layout">
          <section className="submit-form-card">
            <div className="submit-card-heading">
              <div>
                <h2>Complaint Details</h2>
                <p>
                  Fields marked with <span>*</span> are required.
                </p>
              </div>

              <span className="form-step-label">NEW REQUEST</span>
            </div>

            {error && (
              <div className="submit-error-message" role="alert">
                <AlertCircle size={19} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="submit-field">
                <label htmlFor="title">
                  Complaint Title <span>*</span>
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g. Unable to access my account"
                  value={formData.title}
                  onChange={handleChange}
                  minLength={5}
                  maxLength={120}
                  required
                />

                <div className="field-helper">
                  <span>Write a short, clear title.</span>
                  <span>{formData.title.length}/120</span>
                </div>
              </div>

              <div className="submit-field">
                <label htmlFor="description">
                  Detailed Description <span>*</span>
                </label>

                <textarea
                  id="description"
                  name="description"
                  placeholder="Explain the issue, when it started, and what you have tried so far..."
                  value={formData.description}
                  onChange={handleChange}
                  minLength={10}
                  maxLength={3000}
                  rows={6}
                  required
                />

                <div className="field-helper">
                  <span>Include details that can help us investigate.</span>
                  <span>{formData.description.length}/3000</span>
                </div>
              </div>

              <div className="submit-form-grid">
                <div className="submit-field">
                  <label htmlFor="category">
                    Complaint Category <span>*</span>
                  </label>

                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="Technical">Technical Issue</option>
                    <option value="Billing">Billing & Payments</option>
                    <option value="Service">Service Related</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="submit-field">
                  <label htmlFor="priority">
                    Priority Level <span>*</span>
                  </label>

                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    required
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="submit-info-note">
                <Info size={18} />
                <p>
                  Please provide accurate information. You can
                  use your complaint ID to check progress later.
                </p>
              </div>

              <div className="submit-form-actions">
                <Link
                  to="/complaints"
                  className="submit-secondary-button"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="submit-primary-button"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Complaint"}
                  {!loading && <Send size={17} />}
                </button>
              </div>
            </form>
          </section>

          <aside className="submit-guidance-card">
            <div className="guidance-icon">
              <ShieldCheck size={25} />
            </div>

            <h3>What happens next?</h3>

            <p>
              After submission, your complaint enters our
              resolution workflow.
            </p>

            <div className="guidance-steps">
              <div className="guidance-step">
                <span className="guidance-step-number">01</span>
                <div>
                  <strong>Complaint Received</strong>
                  <p>Your request is saved with a unique ID.</p>
                </div>
              </div>

              <div className="guidance-step">
                <span className="guidance-step-number">02</span>
                <div>
                  <strong>Under Review</strong>
                  <p>The team reviews your complaint details.</p>
                </div>
              </div>

              <div className="guidance-step">
                <span className="guidance-step-number">03</span>
                <div>
                  <strong>Resolution Update</strong>
                  <p>Track the status as it changes.</p>
                </div>
              </div>
            </div>

            <div className="guidance-help">
              <Search size={19} />
              <div>
                <strong>Already submitted?</strong>
                <p>Check your complaint status anytime.</p>
                <Link to="/track-complaint">
                  Track a complaint →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      )}

      <footer className="dashboard-footer">
        <span>© {new Date().getFullYear()} SmartResolve</span>
        <span>Making complaint resolution simpler.</span>
      </footer>
    </div>
  </main>
</div>


);
}
