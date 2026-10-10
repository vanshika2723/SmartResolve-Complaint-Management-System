import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
LayoutDashboard,
FileText,
PlusCircle,
Search,
CheckCircle2,
Clock3,
AlertCircle,
LogOut,
Menu,
X,
ArrowUpRight,
RefreshCw,
UserRound,
ShieldCheck,
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

function getStatusClass(status) {
return (status || "Submitted")
.toLowerCase()
.replace(/\s+/g, "-");
}

export default function Dashboard() {
const { user, logout } = useAuth();
const navigate = useNavigate();

const [complaints, setComplaints] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
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
      "Unable to load complaints. Please try again."
  );
} finally {
  setLoading(false);
}


};

useEffect(() => {
fetchComplaints();
}, []);

const stats = [
{
title: "Total Complaints",
value: complaints.length,
icon: FileText,
color: "blue",
description: "All your complaints",
},
{
title: "Submitted",
value: complaints.filter(
(item) => item.status === "Submitted"
).length,
icon: AlertCircle,
color: "orange",
description: "Awaiting action",
},
{
title: "In Progress",
value: complaints.filter(
(item) => item.status === "In Progress"
).length,
icon: Clock3,
color: "purple",
description: "Currently being handled",
},
{
title: "Resolved",
value: complaints.filter(
(item) => item.status === "Resolved"
).length,
icon: CheckCircle2,
color: "green",
description: "Successfully resolved",
},
];

const recentComplaints = [...complaints]
.sort(
(a, b) =>
new Date(b.createdAt) - new Date(a.createdAt)
)
.slice(0, 5);

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
        className="sidebar-link active"
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
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <div className="topbar-heading">
        <span className="topbar-eyebrow">WORKSPACE / OVERVIEW</span>
        <h2>Dashboard</h2>
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
      <section className="welcome-banner">
        <div className="welcome-copy">
          <span className="welcome-tag">YOUR SUPPORT CENTER</span>

          <h1>
            Welcome back, {user?.name?.split(" ")[0] || "there"}!
          </h1>

          <p>
            Keep track of your complaints and stay updated on
            their progress, all in one place.
          </p>

          <Link to="/submit-complaint" className="primary-button">
            <PlusCircle size={18} />
            Submit a Complaint
            <ArrowUpRight size={17} />
          </Link>
        </div>

        <div className="welcome-art" aria-hidden="true">
          <div className="welcome-art-circle">
            <ShieldCheck size={76} strokeWidth={1.5} />
          </div>
          <span className="art-dot dot-one" />
          <span className="art-dot dot-two" />
          <span className="art-dot dot-three" />
        </div>
      </section>

      <section className="section-heading">
        <div>
          <h2>Complaint Overview</h2>
          <p>Here is the latest summary of your complaints.</p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={fetchComplaints}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "refresh-spinning" : ""}
          />
          Refresh
        </button>
      </section>

      {error && (
        <div className="dashboard-error">
          <AlertCircle size={19} />
          <span>{error}</span>
          <button type="button" onClick={fetchComplaints}>
            Try again
          </button>
        </div>
      )}

      <section className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article className="stat-card" key={stat.title}>
              <div className={`stat-icon ${stat.color}`}>
                <Icon size={22} />
              </div>

              <div className="stat-details">
                <p>{stat.title}</p>
                <h3>
                  {loading ? (
                    <span className="stat-loading">...</span>
                  ) : (
                    stat.value
                  )}
                </h3>
                <span>{stat.description}</span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="complaints-panel">
        <div className="panel-heading">
          <div>
            <h2>Recent Complaints</h2>
            <p>Check the latest updates on your submissions.</p>
          </div>

          <Link to="/complaints" className="text-link">
            View all <ArrowUpRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="dashboard-empty">
            <RefreshCw
              size={25}
              className="refresh-spinning"
            />
            <p>Loading your complaints...</p>
          </div>
        ) : recentComplaints.length === 0 ? (
          <div className="dashboard-empty">
            <div className="empty-icon">
              <FileText size={28} />
            </div>

            <h3>No complaints yet</h3>

            <p>
              You have not submitted a complaint. Create your
              first complaint to get started.
            </p>

            <Link
              to="/submit-complaint"
              className="primary-button"
            >
              <PlusCircle size={17} />
              Submit Your First Complaint
            </Link>
          </div>
        ) : (
          <div className="complaints-table-wrap">
            <table className="complaints-table">
              <thead>
                <tr>
                  <th>COMPLAINT</th>
                  <th>CATEGORY</th>
                  <th>PRIORITY</th>
                  <th>STATUS</th>
                  <th>SUBMITTED</th>
                </tr>
              </thead>

              <tbody>
                {recentComplaints.map((complaint) => (
                  <tr key={complaint._id}>
                    <td>
                      <div className="complaint-cell">
                        <strong>
                          {complaint.title}
                        </strong>
                        <span>
                          {complaint.complaintId}
                        </span>
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
                        className={`status-label ${getStatusClass(
                          complaint.status
                        )}`}
                      >
                        <span className="status-dot" />
                        {complaint.status}
                      </span>
                    </td>

                    <td className="date-cell">
                      {formatDate(complaint.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
