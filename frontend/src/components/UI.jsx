import React from "react";

export const Spinner = ({ text = "Loading..." }) => (
  <div className="loading-screen">
    <div className="spinner" />
    <div className="loading-text">{text}</div>
  </div>
);

export const Alert = ({ type = "error", children }) => (
  <div className={`alert alert-${type}`}>
    <span>{type === "error" ? "⚠" : type === "success" ? "✓" : "ℹ"}</span>
    {children}
  </div>
);

export const EmptyState = ({ icon = "📭", title = "No Data", subtitle = "" }) => (
  <div className="empty-state">
    <div className="empty-icon">{icon}</div>
    <div className="empty-title">{title}</div>
    {subtitle && <div className="empty-sub">{subtitle}</div>}
  </div>
);

export const StatusBadge = ({ status }) => {
  const map = {
    open: "badge-open",
    investigating: "badge-investigating",
    resolved: "badge-resolved",
  };
  return <span className={`badge ${map[status] || "badge-user"}`}>{status}</span>;
};

export const RoleBadge = ({ role }) => {
  const map = {
    admin: "badge-admin",
    officer: "badge-officer",
    user: "badge-user",
  };
  return <span className={`badge ${map[role] || "badge-user"}`}>{role}</span>;
};

export const ConfirmModal = ({ isOpen, onConfirm, onCancel, title = "Confirm", message = "Are you sure?" }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Confirm Delete</button>
        </div>
      </div>
    </div>
  );
};

export const Pagination = ({ currentPage, totalPages, total, limit, onPageChange }) => {
  const start = (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, total);

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="pagination-wrapper">
      <div className="pagination-info">
        Showing {start}–{end} of {total} records
      </div>
      <div className="pagination-controls">
        <button className="pagination-btn" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>‹</button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={i} style={{ color: "var(--text-muted)", padding: "0 4px", fontSize: 13 }}>…</span>
          ) : (
            <button
              key={p}
              className={`pagination-btn ${p === currentPage ? "active" : ""}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          )
        )}
        <button className="pagination-btn" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
      </div>
    </div>
  );
};

export const StatCard = ({ label, value, color = "red", meta = "", icon = "" }) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
    {meta && <div className="stat-meta">{icon} {meta}</div>}
  </div>
);
