import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
RefreshCw,
AlertCircle,
Eye,
CalendarDays,
Filter,
Inbox,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function formatDate(date) {
if (!date) return "—";

return new Date(date).toLocaleDateString("en-IN", {
day: "2-digit",
month: "short",
year: "numeric",
});
}

function statusClass(status) {
return (status || "Submitted").toLowerCase().replace(/\s+/g, "-");
}

export default function Complaints() {
const { user, logout } = useAuth();

const [complaints, setComplaints] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("All");
const [priorityFilter, setPriorityFilter] = useState("All");
const [menuOpen, setMenuOpen] = useState(false);

const fetchComplaints = async () => {
try {
setLoading(true);
setError("");


  const response = await api.get("/complaints/my");
  setComplaints(response.data.complaints || []);
} catch (err) {
  setError(
    err.response?.data?.message ||
      "Unable to load your complaints. Please try again."
  );
} finally {
  setLoading(false);
}


};

useEffect(() => {
fetchComplaints();
}, []);

const filteredComplaints = complaints.filter((complaint) => {
const query = search.trim().toLowerCase();


const matchesSearch =
  !query ||
  (complaint.title || "").toLowerCase().includes(query) ||
  (complaint.complaintId || "").toLowerCase().includes(query) ||
  (complaint.category || "").toLowerCase().includes(query);

const matchesStatus =
  statusFilter === "All" || complaint.status === statusFilter;

const matchesPriority =
  priorityFilter === "All" ||
  complaint.priority === priorityFilter;

return matchesSearch && matchesStatus && matchesPriority;


});

const handleLogout = () => {
logout();
window.location.href = "/login";
};

return ( <div className="app-shell track-page">
<aside className={`app-sidebar ${menuOpen ? "sidebar-open" : ""}`}> <Link to="/dashboard" className="app-brand"> <span className="app-brand-icon"> <ShieldCheck size={24} /> </span> <span> <strong>SmartResolve</strong> <small>Complaint Portal</small> </span> </Link>


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
        className="sidebar-link active"
        onClick={() => setMenuOpen(false)}
      >
        <FileText size={19} />
        <span>My Complaints</span>
      </Link>

      <Link
        to="/submit-complaint"
        className="sidebar-link"
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
        <span className="topbar-eyebrow">WORKSPACE / COMPLAINTS</span>
        <h2>My Complaints</h2>
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

    <div className="dashboard-content">
      <section className="complaints-page-banner">
        <div>
          <span className="welcome-tag">COMPLAINT CENTER</span>
          <h1>All your complaints, in one place.</h1>
          <p>
            Review submissions, check their current status and
            find a complaint whenever you need it.
          </p>
        </div>

        <Link to="/submit-complaint" className="complaint-create-button">
          <PlusCircle size={18} />
          New Complaint
        </Link>
      </section>

      <section className="complaints-summary-row">
        <div className="complaints-summary-card">
          <span>Total Complaints</span>
          <strong>{loading ? "..." : complaints.length}</strong>
        </div>

        <div className="complaints-summary-card">
          <span>In Progress</span>
          <strong>
            {loading
              ? "..."
              : complaints.filter((c) => c.status === "In Progress").length}
          </strong>
        </div>

        <div className="complaints-summary-card">
          <span>Resolved</span>
          <strong>
            {loading
              ? "..."
              : complaints.filter((c) => c.status === "Resolved").length}
          </strong>
        </div>
      </section>

      <section className="complaints-panel complaints-list-panel">
        <div className="panel-heading">
          <div>
            <h2>Complaint History</h2>
            <p>Search and filter your submitted complaints.</p>
          </div>

          <button
            type="button"
            className="refresh-button"
            onClick={fetchComplaints}
            disabled={loading}
          >
            <RefreshCw
              size={15}
              className={loading ? "refresh-spinning" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="complaint-filters">
          <div className="complaint-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search by title, ID or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="complaint-filter-select">
            <Filter size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="All">All statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="complaint-filter-select">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="Filter by priority"
            >
              <option value="All">All priorities</option>
              <option value="Low">Low priority</option>
              <option value="Medium">Medium priority</option>
              <option value="High">High priority</option>
              <option value="Urgent">Urgent priority</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="dashboard-error complaints-error">
            <AlertCircle size={19} />
            <span>{error}</span>
            <button type="button" onClick={fetchComplaints}>
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="dashboard-empty">
            <RefreshCw size={25} className="refresh-spinning" />
            <p>Loading your complaints...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="dashboard-empty">
            <div className="empty-icon">
              {complaints.length === 0 ? (
                <Inbox size={28} />
              ) : (
                <Search size={28} />
              )}
            </div>

            <h3>
              {complaints.length === 0
                ? "No complaints submitted yet"
                : "No matching complaints"}
            </h3>

            <p>
              {complaints.length === 0
                ? "Your submitted complaints will appear here. Create your first complaint to get started."
                : "Try changing your search or filters to find a complaint."}
            </p>

            {complaints.length === 0 && (
              <Link
                to="/submit-complaint"
                className="primary-button"
              >
                <PlusCircle size={17} />
                Submit a Complaint
              </Link>
            )}
          </div>
        ) : (
          <div className="complaints-table-wrap">
            <table className="complaints-table full-complaints-table">
              <thead>
                <tr>
                  <th>COMPLAINT DETAILS</th>
                  <th>CATEGORY</th>
                  <th>PRIORITY</th>
                  <th>STATUS</th>
                  <th>SUBMITTED ON</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint._id}>
                    <td>
                      <div className="complaint-cell">
                        <strong>{complaint.title}</strong>
                        <span>{complaint.complaintId}</span>
                      </div>
                    </td>

                    <td>
                      <span className="category-label">
                        {complaint.category}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`priority-label ${(complaint.priority || "Medium").toLowerCase()}`}
                      >
                        {complaint.priority || "Medium"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`status-label ${statusClass(complaint.status)}`}
                      >
                        <span className="status-dot" />
                        {complaint.status}
                      </span>
                    </td>

                    <td>
                      <span className="complaint-date">
                        <CalendarDays size={14} />
                        {formatDate(complaint.createdAt)}
                      </span>
                    </td>

                    <td>
                      <Link
                        to={`/track-complaint?complaintId=${encodeURIComponent(
                          complaint.complaintId || ""
                        )}`}
                        className="complaint-view-button"
                        title="Track this complaint"
                      >
                        <Eye size={16} />
                        Track
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="complaints-list-footer">
              Showing <strong>{filteredComplaints.length}</strong> of{" "}
              <strong>{complaints.length}</strong> complaints
            </div>
          </div>
        )}
      </section>

      <footer className="dashboard-footer">
        <span>© {new Date().getFullYear()} SmartResolve</span>
        <span>Making complaint resolution simpler.</span>
      </footer>
    </div>
  </main>
</div>


);
}
