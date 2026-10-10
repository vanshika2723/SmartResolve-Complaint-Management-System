
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  ClipboardList,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  LoaderCircle,
  ShieldCheck,
  History,
  UserRound,
} from "lucide-react";
import api from "../services/api";

const statusConfig = {
  Submitted: {
    className: "status-submitted",
    icon: ClipboardList,
    message: "Your complaint has been submitted and is awaiting review.",
  },
  "In Progress": {
    className: "status-progress",
    icon: Clock3,
    message: "Your complaint is being reviewed by our support team.",
  },
  Resolved: {
    className: "status-resolved",
    icon: CheckCircle2,
    message: "Your complaint has been resolved.",
  },
  Rejected: {
    className: "status-rejected",
    icon: XCircle,
    message:
      "Your complaint has been rejected. Check the resolution note for details.",
  },
};

const formatDate = (date, includeTime = false) => {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime
      ? { hour: "2-digit", minute: "2-digit" }
      : {}),
  });
};

export default function TrackComplaint() {
  const [searchParams] = useSearchParams();

  const [complaintId, setComplaintId] = useState(
    searchParams.get("complaintId") || ""
  );
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const searchComplaint = async (id = complaintId) => {
    const cleanId = id.trim();

    if (!cleanId) {
      setError("Please enter your Complaint ID.");
      setComplaint(null);
      setSearched(false);
      return;
    }

    setLoading(true);
    setError("");
    setComplaint(null);
    setSearched(true);

    try {
      const response = await api.get(
        `/complaints/track/${encodeURIComponent(cleanId)}`
      );

      const data = response.data.complaint || response.data;
      setComplaint(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to find this complaint. Please check the ID and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = searchParams.get("complaintId");

    if (id) {
      setComplaintId(id);
      searchComplaint(id);
    }
    // Run on initial page load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    searchComplaint();
  };

  const currentStatus = complaint
    ? statusConfig[complaint.status] || statusConfig.Submitted
    : null;

  const StatusIcon = currentStatus?.icon;

  const timeline = complaint
    ? [...(complaint.statusHistory || [])].sort(
        (a, b) =>
          new Date(b.changedAt || 0).getTime() -
          new Date(a.changedAt || 0).getTime()
      )
    : [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/dashboard" className="brand">
          <span className="brand-icon">
            <ShieldCheck size={23} />
          </span>
          <span>
            <strong>SmartResolve</strong>
            <small>Complaint Portal</small>
          </span>
        </Link>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-link">
            <ClipboardList size={19} />
            Dashboard
          </Link>

          <Link to="/complaints" className="nav-link">
            <ClipboardList size={19} />
            My Complaints
          </Link>

          <Link to="/submit-complaint" className="nav-link">
            <AlertCircle size={19} />
            Submit Complaint
          </Link>

          <Link to="/track-complaint" className="nav-link active">
            <Search size={19} />
            Track Complaint
          </Link>
        </nav>

        <div className="sidebar-help">
          <div className="help-icon">
            <ShieldCheck size={20} />
          </div>
          <strong>Need assistance?</strong>
          <p>
            Track your complaint and check its latest status here.
          </p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="breadcrumb">
              Workspace / Track Complaint
            </span>
            <h2>Track Complaint</h2>
          </div>

          <Link to="/submit-complaint" className="primary-button">
            <AlertCircle size={17} />
            New Complaint
          </Link>
        </header>

        <section className="track-hero">
          <div className="track-hero-content">
            <span className="eyebrow">COMPLAINT TRACKING</span>
            <h1>Know where things stand.</h1>
            <p>
              Enter your Complaint ID to see the latest status and
              details of your submitted complaint.
            </p>

            <form
              className="track-search-form"
              onSubmit={handleSubmit}
            >
              <div className="track-input-wrap">
                <Search size={20} />
                <input
                  type="text"
                  value={complaintId}
                  onChange={(event) =>
                    setComplaintId(event.target.value)
                  }
                  placeholder="Enter ID, e.g. SR-A1B2C3D4"
                  aria-label="Complaint ID"
                />
              </div>

              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      className="spin-icon"
                      size={18}
                    />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Track Status
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="track-hero-art">
            <div className="track-art-circle">
              <ClipboardList size={66} strokeWidth={1.5} />
            </div>
            <div className="track-art-badge">
              <CheckCircle2 size={18} />
              Status updates
            </div>
          </div>
        </section>

        {error && (
          <div className="track-error" role="alert">
            <AlertCircle size={20} />
            <div>
              <strong>We couldn't complete your search</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="track-loading">
            <LoaderCircle
              className="spin-icon"
              size={30}
            />
            <p>Looking up your complaint...</p>
          </div>
        )}

        {!loading && complaint && (
          <section className="track-result">
            <div className="track-result-header">
              <div>
                <span className="eyebrow">
                  COMPLAINT DETAILS
                </span>
                <h2>{complaint.title}</h2>
                <p className="track-complaint-id">
                  Complaint ID:{" "}
                  <strong>{complaint.complaintId}</strong>
                </p>
              </div>

              <span
                className={`track-status ${currentStatus.className}`}
              >
                <StatusIcon size={17} />
                {complaint.status}
              </span>
            </div>

            <div className="track-status-message">
              <StatusIcon size={22} />
              <p>{currentStatus.message}</p>
            </div>

            <div className="track-detail-grid">
              <div className="track-detail-item">
                <span>Category</span>
                <strong>
                  {complaint.category || "Not specified"}
                </strong>
              </div>

              <div className="track-detail-item">
                <span>Priority</span>
                <strong
                  className={`priority-${(
                    complaint.priority || "Medium"
                  ).toLowerCase()}`}
                >
                  {complaint.priority || "Medium"}
                </strong>
              </div>

              <div className="track-detail-item">
                <span>Submitted On</span>
                <strong>
                  {formatDate(complaint.createdAt)}
                </strong>
              </div>

              <div className="track-detail-item">
                <span>Last Updated</span>
                <strong>
                  {formatDate(complaint.updatedAt)}
                </strong>
              </div>
            </div>

            <div className="track-description">
              <h3>Complaint Description</h3>
              <p>{complaint.description}</p>
            </div>

            {/* Complaint Status Timeline */}
            <section className="track-timeline">
              <div className="track-timeline-heading">
                <div className="track-timeline-icon">
                  <History size={21} />
                </div>

                <div>
                  <h3>Status Timeline</h3>
                  <p>
                    Track the progress of your complaint
                  </p>
                </div>
              </div>

              {timeline.length > 0 ? (
                <div className="timeline-list">
                  {timeline.map((item, index) => {
                    const itemStatus =
                      statusConfig[item.status] ||
                      statusConfig.Submitted;

                    const ItemIcon = itemStatus.icon;

                    return (
                      <div
                        className="timeline-item"
                        key={`${item.status}-${item.changedAt}-${index}`}
                      >
                        <div
                          className={`timeline-marker ${itemStatus.className}`}
                        >
                          <ItemIcon size={17} />
                        </div>

                        <div className="timeline-content">
                          <div className="timeline-title-row">
                            <strong>{item.status}</strong>
                            <span>
                              {formatDate(
                                item.changedAt,
                                true
                              )}
                            </span>
                          </div>

                          {item.note && (
                            <p>{item.note}</p>
                          )}

                          {item.changedBy && (
                            <small>
                              <UserRound size={14} />
                              Status updated by support team
                            </small>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="timeline-empty">
                  <Clock3 size={20} />
                  <p>
                    Status history is not available for this
                    complaint yet. Please check again after
                    its next status update.
                  </p>
                </div>
              )}
            </section>

            {complaint.resolutionNote && (
              <div className="track-resolution-note">
                <CheckCircle2 size={20} />
                <div>
                  <strong>Admin Resolution Note</strong>
                  <p>{complaint.resolutionNote}</p>
                </div>
              </div>
            )}

            {complaint.resolvedAt && (
              <p className="track-resolved-date">
                Resolved on{" "}
                {formatDate(complaint.resolvedAt)}
              </p>
            )}

            <div className="track-result-actions">
              <Link
                to="/complaints"
                className="secondary-button"
              >
                <ArrowLeft size={17} />
                My Complaints
              </Link>

              <Link
                to="/submit-complaint"
                className="primary-button"
              >
                Submit Another Complaint
              </Link>
            </div>
          </section>
        )}

        {!loading && !complaint && !error && (
          <section className="track-empty">
            <div className="track-empty-icon">
              <Search size={28} />
            </div>

            <h3>Ready to track your complaint?</h3>
            <p>
              Your Complaint ID is available on the submission
              confirmation screen and in your My Complaints page.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
