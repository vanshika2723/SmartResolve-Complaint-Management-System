

import { useCallback, useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {

  ShieldCheck,

  LayoutDashboard,

  ClipboardList,

  Search,

  RefreshCw,

  LogOut,

  Menu,

  X,

  Users,

  Clock3,

  CheckCircle2,

  AlertCircle,

  ArrowUpRight,

  ChevronLeft,

  ChevronRight,

  Eye,

  XCircle,

    BarChart3,

  PieChart as PieChartIcon,

  TrendingUp,

  Activity,

} from "lucide-react";
import { Download } from "lucide-react";
import {

  ResponsiveContainer,

  BarChart,

  Bar,

  XAxis,

  YAxis,

  CartesianGrid,

  Tooltip,

  PieChart,

  Pie,

  Cell,

  Legend,

} from "recharts";

import api from "../services/api";

import { useAuth } from "../context/AuthContext";

const EMPTY_STATS = {

  total: 0,

  submitted: 0,

  inProgress: 0,

  resolved: 0,

  rejected: 0,

};

const EMPTY_ANALYTICS = {

  monthly: [],

  categories: [],

  statusCounts: {

    Submitted: 0,

    "In Progress": 0,

    Resolved: 0,

    Rejected: 0,

  },

};

const CHART_COLORS = ["#6478f8", "#f59e0b", "#10b981", "#ef4444"];

const STAT_CARDS = [

  {

    key: "total",

    label: "Total Complaints",

    icon: ClipboardList,

    color: "purple",

  },

  {

    key: "submitted",

    label: "Submitted",

    icon: AlertCircle,

    color: "blue",

  },

  {

    key: "inProgress",

    label: "In Progress",

    icon: Clock3,

    color: "orange",

  },

  {

    key: "resolved",

    label: "Resolved",

    icon: CheckCircle2,

    color: "green",

  },

  {

    key: "rejected",

    label: "Rejected",

    icon: XCircle,

    color: "red",

  },

];

const STATUSES = [

  "Submitted",

  "In Progress",

  "Resolved",

  "Rejected",

];

function formatDate(date) {

  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {

    day: "2-digit",

    month: "short",

    year: "numeric",

  });

}

function StatusBadge({ status }) {

  const className = (status || "Submitted")

    .toLowerCase()

    .replace(/\s+/g, "-");

  return (

    <span className={`admin-status status-${className}`}>

      <span className="status-dot" />

      {status || "Submitted"}

    </span>

  );

}

export default function AdminDashboard() {

  const navigate = useNavigate();

  const { user, logout } = useAuth();

const [analytics, setAnalytics] = useState(EMPTY_ANALYTICS);

const [analyticsLoading, setAnalyticsLoading] = useState(true);

const [analyticsError, setAnalyticsError] = useState("");

  const [stats, setStats] = useState(EMPTY_STATS);

  const [complaints, setComplaints] = useState([]);

  const [pagination, setPagination] = useState({

    total: 0,

    page: 1,

    limit: 10,

    pages: 0,

  });

  const [searchInput, setSearchInput] = useState("");

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [priority, setPriority] = useState("");

  const [category, setCategory] = useState("");

  const [page, setPage] = useState(1);

  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [editStatus, setEditStatus] = useState("Submitted");

  const [resolutionNote, setResolutionNote] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [notice, setNotice] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleUnauthorized = useCallback(() => {

    logout();

    navigate("/login", { replace: true });

  }, [logout, navigate]);

const exportComplaintsCSV = () => {
  const rows = complaints || [];

  if (rows.length === 0) {
    alert("Export karne ke liye koi complaints nahi hain.");
    return;
  }

  const headers = [
    "Complaint ID",
    "Title",
    "Category",
    "Priority",
    "Status",
    "Submitted By",
    "Created At",
  ];

  const escapeCSV = (value) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  };

  const csvRows = rows.map((complaint) => [
    complaint._id,
    complaint.title,
    complaint.category,
    complaint.priority,
    complaint.status,
    complaint.user?.name || complaint.user?.email || "",
    complaint.createdAt
      ? new Date(complaint.createdAt).toLocaleDateString("en-IN")
      : "",
  ]);

  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...csvRows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "SmartResolve-Complaints.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};

const exportComplaintsPDF = () => {
  if (!complaints || complaints.length === 0) {
    alert("No complaints available to export.");
    return;
  }

  const doc = new jsPDF("landscape");

  doc.setFontSize(20);
  doc.setTextColor(70, 85, 200);
  doc.text("SmartResolve", 14, 18);

  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text("Complaints Management Report", 14, 27);

  doc.setFontSize(9);
  doc.text(
    `Generated: ${new Date().toLocaleString()}`,
    14,
    34
  );

  doc.text(`Total complaints: ${complaints.length}`, 14, 40);

  autoTable(doc, {
    startY: 47,
    head: [[
      "Complaint ID",
      "Title",
      "Category",
      "Priority",
      "Status",
      "Submitted By",
      "Created At",
    ]],
    body: complaints.map((complaint) => [
      complaint.complaintId || complaint._id || "-",
      complaint.title || "-",
      complaint.category || "-",
      complaint.priority || "-",
      complaint.status || "-",
      complaint.submittedBy?.name ||
        complaint.user?.name ||
        complaint.submittedBy ||
        "-",
      complaint.createdAt
        ? new Date(complaint.createdAt).toLocaleDateString()
        : "-",
    ]),
    theme: "grid",
    headStyles: {
      fillColor: [70, 85, 200],
      textColor: 255,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      overflow: "linebreak",
    },
    margin: { left: 14, right: 14 },
  });

  doc.save("SmartResolve-Complaints-Report.pdf");
};

  const loadStats = useCallback(async () => {

    const response = await api.get("/admin/stats");

    setStats({ ...EMPTY_STATS, ...response.data.stats });

  }, []);

const loadAnalytics = useCallback(async () => {

  setAnalyticsLoading(true);

  setAnalyticsError("");

  try {

    const response = await api.get("/admin/analytics");

    setAnalytics({

      ...EMPTY_ANALYTICS,

      ...response.data.analytics,

      statusCounts: {

        ...EMPTY_ANALYTICS.statusCounts,

        ...(response.data.analytics?.statusCounts || {}),

      },

    });

  } catch (err) {

    setAnalyticsError(

      err.response?.data?.message ||

        "Unable to load analytics. Please try again."

    );

  } finally {

    setAnalyticsLoading(false);

  }

}, []);

  const loadComplaints = useCallback(async () => {

    const response = await api.get("/admin/complaints", {

      params: {

        search,

        status,

        priority,

        category,

        page,

        limit: 10,

      },

    });

    setComplaints(response.data.complaints || []);

    setPagination(

      response.data.pagination || {

        total: 0,

        page: 1,

        limit: 10,

        pages: 0,

      }

    );

  }, [search, status, priority, category, page]);

  const loadDashboard = useCallback(async () => {

    setLoading(true);

    setError("");

    try {

      await Promise.all([loadStats(), loadComplaints(), loadAnalytics()]);

    } catch (err) {

      const statusCode = err.response?.status;

      if (statusCode === 401 || statusCode === 403) {

        setError(

          statusCode === 403

            ? "This account does not have admin permission."

            : "Your session has expired. Please sign in again."

        );

      } else {

        setError(

          err.response?.data?.message ||

            "Unable to load dashboard. Check your server connection."

        );

      }

    } finally {

      setLoading(false);

    }

  }, [loadStats, loadComplaints, loadAnalytics]);

  useEffect(() => {

    if (!user) {

      navigate("/login", { replace: true });

      return;

    }

    if (user.role !== "admin") {

      navigate("/dashboard", { replace: true });

      return;

    }

    loadDashboard();

  }, [user, navigate, loadDashboard]);

  const handleSearch = (event) => {

    event.preventDefault();

    setPage(1);

    setSearch(searchInput.trim());

  };

  const openEditor = (complaint) => {

    setSelectedComplaint(complaint);

    setEditStatus(complaint.status || "Submitted");

    setResolutionNote(complaint.resolutionNote || "");

    setNotice("");

    setError("");

  };

  const closeEditor = () => {

    if (saving) return;

    setSelectedComplaint(null);

  };

  const saveComplaint = async (event) => {

    event.preventDefault();

    if (!selectedComplaint) return;

    if (resolutionNote.length > 2000) {

      setError("Resolution note must be under 2000 characters.");

      return;

    }

    setSaving(true);

    setError("");

    setNotice("");

    try {

      await api.patch(

        `/admin/complaints/${encodeURIComponent(

          selectedComplaint.complaintId

        )}`,

        {

          status: editStatus,

          resolutionNote,

        }

      );

      setSelectedComplaint(null);

      setNotice("Complaint updated successfully.");

     await Promise.all([

  loadStats(),

  loadComplaints(),

  loadAnalytics(),

]);

    } catch (err) {

      const statusCode = err.response?.status;

      if (statusCode === 401 || statusCode === 403) {

        setError(

          err.response?.data?.message ||

            "You are not authorized to update complaints."

        );

      } else {

        setError(

          err.response?.data?.message ||

            "Unable to update complaint. Please try again."

        );

      }

    } finally {

      setSaving(false);

    }

  };

  const handleLogout = () => {

    logout();

    navigate("/login", { replace: true });

  };

  const resetFilters = () => {

    setSearchInput("");

    setSearch("");

    setStatus("");

    setPriority("");

    setCategory("");

    setPage(1);

  };

  return (

    <div className="admin-app">

      {sidebarOpen && (

        <button

          className="admin-mobile-overlay"

          onClick={() => setSidebarOpen(false)}

          aria-label="Close sidebar"

        />

      )}

      <aside

        className={`admin-sidebar ${

          sidebarOpen ? "admin-sidebar-open" : ""

        }`}

      >

        <Link to="/admin" className="admin-brand">

          <span className="admin-brand-icon">

            <ShieldCheck size={25} />

          </span>

          <span>

            <strong>SmartResolve</strong>

            <small>ADMIN PORTAL</small>

          </span>

          <button

            type="button"

            className="admin-close-sidebar"

            onClick={(event) => {

              event.preventDefault();

              setSidebarOpen(false);

            }}

            aria-label="Close menu"

          >

            <X size={20} />

          </button>

        </Link>

        <div className="admin-nav-label">WORKSPACE</div>

        <nav className="admin-nav">

          <button type="button" className="admin-nav-item active">

            <LayoutDashboard size={19} />

            Dashboard

          </button>

          <a

            href="#complaints"

            className="admin-nav-item"

            onClick={() => setSidebarOpen(false)}

          >

            <ClipboardList size={19} />

            All Complaints

            <span className="admin-nav-count">{stats.total}</span>

          </a>

        </nav>

        <div className="admin-sidebar-bottom">

          <div className="admin-help-card">

            <span className="admin-help-icon">

              <ShieldCheck size={20} />

            </span>

            <strong>Admin workspace</strong>

            <p>Review, manage and resolve complaints in one place.</p>

          </div>

          <div className="admin-profile">

            <span className="admin-avatar">

              {(user?.name || "A").charAt(0).toUpperCase()}

            </span>

            <span className="admin-profile-info">

              <strong>{user?.name || "Administrator"}</strong>

              <small>{user?.email || "Admin account"}</small>

            </span>

            <button

              type="button"

              className="admin-logout-icon"

              onClick={handleLogout}

              title="Logout"

              aria-label="Logout"

            >

              <LogOut size={18} />

            </button>

          </div>

        </div>

      </aside>

      <main className="admin-main">

        <header className="admin-topbar">

          <div className="admin-topbar-left">

            <button

              type="button"

              className="admin-menu-toggle"

              onClick={() => setSidebarOpen(true)}

              aria-label="Open menu"

            >

              <Menu size={22} />

            </button>

            <div>

              <div className="admin-breadcrumb">

                Workspace <span>/</span> Dashboard

              </div>

              <h1>Admin Dashboard</h1>

            </div>

          </div>

       
<div className="admin-topbar-right">
  <span className="admin-live-indicator">
    <span />
    Management Portal
  </span>

  <button
    type="button"
    className="admin-export-btn"
    onClick={exportComplaintsCSV}
  >
    <Download size={17} />
    Export CSV
  </button>

<button
  type="button"
  className="admin-export-pdf-btn"
  onClick={exportComplaintsPDF}
>
  <Download size={17} />
  Export PDF
</button>

  <button
    type="button"
    className="admin-refresh-button"
    onClick={loadDashboard}
    disabled={loading}
  >
    <RefreshCw
      size={16}
      className={loading ? "admin-spinning" : ""}
    />
    <span>Refresh</span>
  </button>
</div>

        </header>

        <div className="admin-content">

          <section className="admin-welcome-banner">

            <div className="admin-welcome-content">

              <span className="admin-welcome-label">

                <ShieldCheck size={15} />

                ADMINISTRATOR OVERVIEW

              </span>

              <h2>

                Welcome back, {user?.name?.split(" ")[0] || "Admin"}!

              </h2>

              <p>

                Here's an overview of complaint activity and resolution

                progress across SmartResolve.

              </p>

            </div>

            <div className="admin-banner-art" aria-hidden="true">

              <div className="admin-art-circle admin-art-circle-one" />

              <div className="admin-art-circle admin-art-circle-two" />

              <div className="admin-art-icon">

                <ShieldCheck size={47} />

                <CheckCircle2 size={24} />

              </div>

            </div>

          </section>

          {error && (

            <div className="admin-alert admin-alert-error" role="alert">

              <AlertCircle size={19} />

              <span>{error}</span>

              <button

                type="button"

                onClick={() => setError("")}

                aria-label="Dismiss error"

              >

                <X size={17} />

              </button>

            </div>

          )}

          {notice && (

            <div className="admin-alert admin-alert-success" role="status">

              <CheckCircle2 size={19} />

              <span>{notice}</span>

              <button

                type="button"

                onClick={() => setNotice("")}

                aria-label="Dismiss notification"

              >

                <X size={17} />

              </button>

            </div>

          )}

          <section className="admin-stats-grid">

            {STAT_CARDS.map((card) => {

              const Icon = card.icon;

              return (

                <article className="admin-stat-card" key={card.key}>

                  <div className="admin-stat-top">

                    <span className={`admin-stat-icon ${card.color}`}>

                      <Icon size={21} />

                    </span>

                    <ArrowUpRight

                      size={17}

                      className="admin-stat-arrow"

                    />

                  </div>

                  <p>{card.label}</p>

                  <div className="admin-stat-value">

                    {loading ? "—" : stats[card.key] ?? 0}

                  </div>

                  <div className="admin-stat-foot">

                    <span className={`admin-stat-mini-dot ${card.color}`} />

                    Live database count

                  </div>

                </article>

              );

            })}

          </section>

          <section className="admin-analytics-section" id="analytics">
            <div className="admin-section-heading">
              <div>
                <span className="admin-section-eyebrow">DATA INSIGHTS</span>
                <h2>Complaint Analytics</h2>
                <p>Track complaint trends, status distribution and categories.</p>
              </div>
              <div className="admin-total-pill">
                <Activity size={16} />
                Live analytics
              </div>
            </div>

            {analyticsError && (
              <div className="admin-alert admin-alert-error" role="alert">
                <AlertCircle size={18} />
                <span>{analyticsError}</span>
                <button type="button" onClick={loadAnalytics} aria-label="Retry analytics">
                  <RefreshCw size={16} />
                </button>
              </div>
            )}

            {analyticsLoading ? (
              <div className="admin-chart-loading">
                <RefreshCw size={22} className="admin-spinning" />
                <span>Loading analytics...</span>
              </div>
            ) : (
              <div className="admin-analytics-grid">
                <article className="admin-chart-card admin-chart-wide">
                  <div className="admin-chart-heading">
                    <span className="admin-chart-icon"><TrendingUp size={19} /></span>
                    <div>
                      <h3>Monthly Complaints</h3>
                      <p>Complaints created over the last six months</p>
                    </div>
                  </div>
                  {analytics.monthly.length ? (
                    <div className="admin-chart-canvas">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.monthly} margin={{ top: 12, right: 12, left: -18, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9edf5" />
                          <XAxis dataKey="month" tick={{ fill: "#778198", fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fill: "#778198", fontSize: 12 }} axisLine={false} tickLine={false} />
                          <Tooltip cursor={{ fill: "#f3f5ff" }} contentStyle={{ borderRadius: 12, border: "1px solid #e7eaf3" }} />
                          <Bar dataKey="total" name="Complaints" fill="#6478f8" radius={[7, 7, 0, 0]} maxBarSize={48} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="admin-chart-empty">No monthly complaint data available yet.</div>
                  )}
                </article>

                <article className="admin-chart-card">
                  <div className="admin-chart-heading">
                    <span className="admin-chart-icon"><PieChartIcon size={19} /></span>
                    <div>
                      <h3>Status Distribution</h3>
                      <p>Current complaint statuses</p>
                    </div>
                  </div>
                  {Object.values(analytics.statusCounts).some((value) => Number(value) > 0) ? (
                    <div className="admin-chart-canvas admin-donut-canvas">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={STATUSES.map((name) => ({ name, value: Number(analytics.statusCounts[name] || 0) }))}
                            dataKey="value"
                            nameKey="name"
                            innerRadius="56%"
                            outerRadius="78%"
                            paddingAngle={3}
                          >
                            {STATUSES.map((name, index) => (
                              <Cell key={name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e7eaf3" }} />
                          <Legend verticalAlign="bottom" height={42} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="admin-chart-empty">No status data available yet.</div>
                  )}
                </article>

                <article className="admin-chart-card">
                  <div className="admin-chart-heading">
                    <span className="admin-chart-icon"><BarChart3 size={19} /></span>
                    <div>
                      <h3>Complaints by Category</h3>
                      <p>Breakdown across reported categories</p>
                    </div>
                  </div>
                  {analytics.categories.length ? (
                    <div className="admin-chart-canvas">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.categories} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e9edf5" />
                          <XAxis type="number" allowDecimals={false} tick={{ fill: "#778198", fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="category" width={95} tick={{ fill: "#778198", fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e7eaf3" }} />
                          <Bar dataKey="total" name="Complaints" fill="#10b981" radius={[0, 7, 7, 0]} maxBarSize={24} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="admin-chart-empty">No category data available yet.</div>
                  )}
                </article>
              </div>
            )}
          </section>

          <section className="admin-complaints-section" id="complaints">

            <div className="admin-section-heading">

              <div>

                <span className="admin-section-eyebrow">

                  COMPLAINT MANAGEMENT

                </span>

                <h2>All Complaints</h2>

                <p>Search, review and update complaint records.</p>

              </div>

              <div className="admin-total-pill">

                <Users size={16} />

                {pagination.total} records

              </div>

            </div>

            <form className="admin-filter-panel" onSubmit={handleSearch}>

              <div className="admin-search-field">

                <Search size={18} />

                <input

                  type="search"

                  placeholder="Search by complaint ID or title..."

                  value={searchInput}

                  onChange={(event) =>

                    setSearchInput(event.target.value)

                  }

                />

                <button type="submit">Search</button>

              </div>

              <div className="admin-filter-row">

                <select

                  aria-label="Filter by status"

                  value={status}

                  onChange={(event) => {

                    setStatus(event.target.value);

                    setPage(1);

                  }}

                >

                  <option value="">All statuses</option>

                  {STATUSES.map((item) => (

                    <option key={item} value={item}>

                      {item}

                    </option>

                  ))}

                </select>

                <select

                  aria-label="Filter by priority"

                  value={priority}

                  onChange={(event) => {

                    setPriority(event.target.value);

                    setPage(1);

                  }}

                >

                  <option value="">All priorities</option>

                  {["Low", "Medium", "High", "Urgent"].map((item) => (

                    <option key={item} value={item}>

                      {item} priority

                    </option>

                  ))}

                </select>

                <select

                  aria-label="Filter by category"

                  value={category}

                  onChange={(event) => {

                    setCategory(event.target.value);

                    setPage(1);

                  }}

                >

                  <option value="">All categories</option>

                  {[

                    "Technical",

                    "Billing",

                    "Service",

                    "Infrastructure",

                    "Other",

                  ].map((item) => (

                    <option key={item} value={item}>

                      {item}

                    </option>

                  ))}

                </select>

                <button

                  type="button"

                  className="admin-reset-button"

                  onClick={resetFilters}

                >

                  Reset filters

                </button>

              </div>

            </form>

            <div className="admin-table-wrap">

              <table className="admin-table">

                <thead>

                  <tr>

                    <th>Complaint</th>

                    <th>Submitted by</th>

                    <th>Category</th>

                    <th>Priority</th>

                    <th>Status</th>

                    <th>Date</th>

                    <th>Action</th>

                  </tr>

                </thead>

                <tbody>

                  {loading ? (

                    <tr>

                      <td colSpan="7">

                        <div className="admin-table-message">

                          <RefreshCw

                            size={21}

                            className="admin-spinning"

                          />

                          Loading complaints...

                        </div>

                      </td>

                    </tr>

                  ) : complaints.length === 0 ? (

                    <tr>

                      <td colSpan="7">

                        <div className="admin-table-message">

                          <ClipboardList size={27} />

                          <strong>No complaints found</strong>

                          <span>

                            Try changing your search or filters.

                          </span>

                        </div>

                      </td>

                    </tr>

                  ) : (

                    complaints.map((complaint) => (

                      <tr key={complaint._id || complaint.complaintId}>

                        <td>

                          <div className="admin-complaint-cell">

                            <strong>{complaint.title}</strong>

                            <span>

                              {complaint.complaintId}

                            </span>

                          </div>

                        </td>

                        <td>

                          <div className="admin-user-cell">

                            <span className="admin-user-avatar">

                              {(complaint.user?.name || "U")

                                .charAt(0)

                                .toUpperCase()}

                            </span>

                            <span>

                              <strong>

                                {complaint.user?.name || "Unknown user"}

                              </strong>

                              <small>

                                {complaint.user?.email || "No email"}

                              </small>

                            </span>

                          </div>

                        </td>

                        <td>

                          <span className="admin-category">

                            {complaint.category || "Other"}

                          </span>

                        </td>

                        <td>

                          <span

                            className={`admin-priority priority-${(

                              complaint.priority || "Medium"

                            ).toLowerCase()}`}

                          >

                            {complaint.priority || "Medium"}

                          </span>

                        </td>

                        <td>

                          <StatusBadge status={complaint.status} />

                        </td>

                        <td className="admin-date">

                          {formatDate(complaint.createdAt)}

                        </td>

                        <td>

                          <button

                            type="button"

                            className="admin-edit-button"

                            onClick={() => openEditor(complaint)}

                          >

                            <Eye size={15} />

                            Manage

                          </button>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

            <div className="admin-pagination">

              <span>

                Showing{" "}

                {pagination.total === 0

                  ? 0

                  : (pagination.page - 1) * pagination.limit + 1}

                {"–"}

                {Math.min(

                  pagination.page * pagination.limit,

                  pagination.total

                )}{" "}

                of {pagination.total}

              </span>

              <div className="admin-pagination-controls">

                <button

                  type="button"

                  disabled={page <= 1 || loading}

                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}

                  aria-label="Previous page"

                >

                  <ChevronLeft size={18} />

                </button>

                <span>

                  {pagination.page || page} / {pagination.pages || 1}

                </span>

                <button

                  type="button"

                  disabled={

                    loading ||

                    page >= pagination.pages ||

                    pagination.pages === 0

                  }

                  onClick={() =>

                    setPage((prev) =>

                      Math.min(pagination.pages, prev + 1)

                    )

                  }

                  aria-label="Next page"

                >

                  <ChevronRight size={18} />

                </button>

              </div>

            </div>

          </section>

          <footer className="admin-footer">

            <span>© {new Date().getFullYear()} SmartResolve</span>

            <span>

              <ShieldCheck size={15} />

              Complaint Management System

            </span>

          </footer>

        </div>

      </main>

      {selectedComplaint && (

        <div

          className="admin-modal-backdrop"

          onMouseDown={(event) => {

            if (event.target === event.currentTarget) closeEditor();

          }}

        >

          <section

            className="admin-modal"

            role="dialog"

            aria-modal="true"

            aria-labelledby="admin-modal-title"

          >

            <div className="admin-modal-header">

              <div>

                <span className="admin-section-eyebrow">

                  COMPLAINT DETAILS

                </span>

                <h2 id="admin-modal-title">Manage complaint</h2>

                <p>{selectedComplaint.complaintId}</p>

              </div>

              <button

                type="button"

                className="admin-modal-close"

                onClick={closeEditor}

                disabled={saving}

                aria-label="Close dialog"

              >

                <X size={20} />

              </button>

            </div>

            <div className="admin-modal-body">

              <div className="admin-detail-title">

                {selectedComplaint.title}

              </div>

              <div className="admin-detail-grid">

                <div>

                  <span>Submitted by</span>

                  <strong>

                    {selectedComplaint.user?.name || "Unknown user"}

                  </strong>

                </div>

                <div>

                  <span>Email</span>

                  <strong>

                    {selectedComplaint.user?.email || "No email"}

                  </strong>

                </div>

                <div>

                  <span>Category</span>

                  <strong>{selectedComplaint.category}</strong>

                </div>

                <div>

                  <span>Priority</span>

                  <strong>{selectedComplaint.priority}</strong>

                </div>

                <div>

                  <span>Date submitted</span>

                  <strong>{formatDate(selectedComplaint.createdAt)}</strong>

                </div>

              </div>

              <div className="admin-description-box">

                <span>Description</span>

                <p>{selectedComplaint.description}</p>

              </div>

              <form onSubmit={saveComplaint} className="admin-edit-form">

                <label htmlFor="complaint-status">Update status</label>

                <select

                  id="complaint-status"

                  value={editStatus}

                  onChange={(event) => setEditStatus(event.target.value)}

                  required

                >

                  {STATUSES.map((item) => (

                    <option key={item} value={item}>

                      {item}

                    </option>

                  ))}

                </select>

                <label htmlFor="resolution-note">

                  Resolution note

                </label>

                <textarea

                  id="resolution-note"

                  rows={4}

                  maxLength={2000}

                  placeholder="Add an update or explain the resolution..."

                  value={resolutionNote}

                  onChange={(event) =>

                    setResolutionNote(event.target.value)

                  }

                />

                <div className="admin-note-count">

                  {resolutionNote.length}/2000 characters

                </div>

                {error && (

                  <div className="admin-alert admin-alert-error" role="alert">

                    {error}

                  </div>

                )}

                <button

                  type="submit"

                  className="admin-save-button"

                  disabled={saving}

                >

                  {saving ? "Saving changes..." : "Save changes"}

                </button>

              </form>

            </div>

          </section>

        </div>

      )}

    </div>

  );

}

