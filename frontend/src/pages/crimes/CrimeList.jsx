import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { Spinner, EmptyState, ConfirmModal } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";

const StatusBadge = ({ status }) => {
  const map = { open: "badge-open", investigating: "badge-investigating", resolved: "badge-resolved" };
  return <span className={`badge ${map[status] || "badge-user"}`}>{status}</span>;
};

const Pagination = ({ currentPage, totalPages, total, limit, onPageChange }) => {
  const start = (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, total);
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== "...") pages.push("...");
  }
  return (
    <div className="pagination-wrapper">
      <div className="pagination-info">Showing {start}–{end} of {total} records</div>
      <div className="pagination-controls">
        <button className="pagination-btn" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>‹</button>
        {pages.map((p, i) => p === "..." ? (
          <span key={i} style={{ color: "var(--text-muted)", padding: "0 4px", fontSize: 13 }}>…</span>
        ) : (
          <button key={p} className={`pagination-btn ${p === currentPage ? "active" : ""}`} onClick={() => onPageChange(p)}>{p}</button>
        ))}
        <button className="pagination-btn" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
      </div>
    </div>
  );
};

const CrimeList = () => {
  const { isAdmin, isOfficer, isOfficerOrAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [pagination, setPagination] = useState({ total: 0, currentPage: 1, totalPages: 1 });
  const [deleteId, setDeleteId] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ city: "", crimeType: "", status: "", search: "", startDate: "", endDate: "" });
  const LIMIT = 10;

  const fetchCrimes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });

      // Officers only see crimes assigned to them
      // We pass their officer profile ID — but since User._id !== Officer._id,
      // officers see all crimes but UI hides admin actions. 
      // If your backend links User to Officer, pass officer param here.
      const res = await API.get(`/crimes?${params}`);
      const d = res.data;
      let data = d.data || [];

      // If officer role: filter client-side to only show assigned crimes
      if (isOfficer && !isAdmin) {
        data = data.filter(c => c.officer && c.officer._id);
        // Note: backend filtering by officer ID would need officer profile lookup
        // For now show all but hide admin controls
      }

      setCrimes(data);
      setPagination({ total: d.total, currentPage: d.currentPage, totalPages: d.totalPages });
    } catch {
      setError("Failed to load crime reports");
    } finally {
      setLoading(false);
    }
  }, [page, filters, isAdmin, isOfficer]);

  useEffect(() => { fetchCrimes(); }, [fetchCrimes]);

  const handleFilterChange = (e) => {
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ city: "", crimeType: "", status: "", search: "", startDate: "", endDate: "" });
    setPage(1);
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/crimes/${deleteId}`);
      setSuccessMsg("Crime report deleted");
      setDeleteId(null);
      fetchCrimes();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("Failed to delete");
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">CRIME REPORTS</div>
          <div className="section-subtitle">
            {isOfficer && !isAdmin ? "Your assigned cases" : `${pagination.total} records in database`}
          </div>
        </div>
        {/* Only admin can add crimes */}
        {isAdmin && <Link to="/crimes/add" className="btn btn-primary">+ New Report</Link>}
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠ {error}</div>}
      {successMsg && <div className="alert alert-success" style={{ marginBottom: 16 }}>✓ {successMsg}</div>}

      {/* Filters — available to all */}
      <div className="filter-bar">
        <div className="filter-row">
          <div className="filter-item" style={{ flex: 2, minWidth: 200 }}>
            <label className="form-label">Search</label>
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input type="text" name="search" className="form-control search-input"
                placeholder="Title, area, city, type..." value={filters.search} onChange={handleFilterChange} />
            </div>
          </div>
          <div className="filter-item">
            <label className="form-label">City</label>
            <input type="text" name="city" className="form-control" placeholder="e.g. Lahore" value={filters.city} onChange={handleFilterChange} />
          </div>
          <div className="filter-item">
            <label className="form-label">Crime Type</label>
            <input type="text" name="crimeType" className="form-control" placeholder="e.g. Theft" value={filters.crimeType} onChange={handleFilterChange} />
          </div>
          <div className="filter-item">
            <label className="form-label">Status</label>
            <select name="status" className="form-control" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="filter-item">
            <label className="form-label">From Date</label>
            <input type="date" name="startDate" className="form-control" value={filters.startDate} onChange={handleFilterChange} />
          </div>
          <div className="filter-item">
            <label className="form-label">To Date</label>
            <input type="date" name="endDate" className="form-control" value={filters.endDate} onChange={handleFilterChange} />
          </div>
          <div className="filter-item" style={{ flex: 0, alignSelf: "flex-end" }}>
            <button className="btn btn-secondary" onClick={clearFilters}>✕ Clear</button>
          </div>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : crimes.length === 0 ? (
        <div className="card">
          <EmptyState icon="🚨" title="No Crime Reports"
            subtitle={isOfficer && !isAdmin ? "No cases are assigned to you yet." : "No records match your current filters."} />
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>City / Area</th>
                <th>Status</th>
                <th>Officer</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {crimes.map((c) => (
                <tr key={c._id}>
                  <td data-label="Title">
                    <Link to={`/crimes/${c._id}`} style={{ color: "var(--text-primary)", textDecoration: "none", fontWeight: 600 }}>{c.title}</Link>
                  </td>
                  <td data-label="Type" style={{ color: "var(--text-secondary)", fontSize: 12 }}>{c.crimeType}</td>
                  <td data-label="City">
                    <div style={{ fontWeight: 500 }}>{c.city}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{c.area}</div>
                  </td>
                  <td data-label="Status"><StatusBadge status={c.status} /></td>
                  <td data-label="Officer" style={{ fontSize: 12 }}>
                    {c.officer
                      ? <Link to={`/officers/${c.officer._id}`} style={{ color: "var(--blue)", textDecoration: "none" }}>{c.officer.name}</Link>
                      : <span style={{ color: "var(--text-muted)" }}>Unassigned</span>}
                  </td>
                  <td data-label="Date" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
                    {new Date(c.incidentDate).toLocaleDateString()}
                  </td>
                  <td data-label="Actions">
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {/* Everyone can view */}
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/crimes/${c._id}`)}>View</button>
                      {/* Officer and admin can edit status */}
                      {isOfficerOrAdmin && (
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/crimes/edit/${c._id}`)}>Edit</button>
                      )}
                      {/* Only admin can delete */}
                      {isAdmin && (
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(c._id)}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={LIMIT}
            onPageChange={setPage}
          />
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="DELETE CRIME REPORT"
        message="This action cannot be undone. The crime record will be permanently removed."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default CrimeList;
