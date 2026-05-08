import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { Spinner, EmptyState, ConfirmModal } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";

// Avatar with solid accent background so initial always pops
const OfficerAvatar = ({ name }) => (
  <div style={{
    width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
    background: "var(--accent)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700,
    color: "#ffffff",
    boxShadow: "0 2px 8px rgba(230,57,70,0.35)"
  }}>
    {name?.[0]?.toUpperCase() || "O"}
  </div>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const OfficerList = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch]     = useState("");

  const fetchOfficers = async () => {
    try {
      const res = await API.get("/officers");
      setOfficers(res.data.data || []);
    } catch {
      setError("Failed to load officers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOfficers(); }, []);

  const handleDelete = async () => {
    try {
      await API.delete(`/officers/${deleteId}`);
      setSuccess("Officer removed successfully");
      setDeleteId(null);
      fetchOfficers();
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to delete officer");
      setDeleteId(null);
    }
  };

  const filtered = officers.filter((o) =>
    !search ||
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.badgeNumber?.toLowerCase().includes(search.toLowerCase()) ||
    o.department.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">OFFICERS</div>
          <div className="section-subtitle">{officers.length} personnel on record</div>
        </div>
        {isAdmin && <Link to="/officers/add" className="btn btn-primary">Add Officer</Link>}
      </div>

      {error   && <div className="alert alert-error"   style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>{success}</div>}

      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <div className="filter-row">
          <div className="filter-item" style={{ flex: 1 }}>
            <label className="form-label">Search</label>
            <div className="search-input-wrapper">
              <span className="search-icon"><SearchIcon /></span>
              <input type="text" className="form-control search-input"
                placeholder="Name, badge number, department..."
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          {search && (
            <div className="filter-item" style={{ flex: 0, alignSelf: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setSearch("")}>Clear</button>
            </div>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState title="No Officers Found" subtitle="No officers match your search." />
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map((o) => (
            <div className="col-12 col-md-6 col-lg-4" key={o._id}>
              <div
                className="card"
                style={{ height: "100%", cursor: "pointer" }}
                onClick={() => navigate(`/officers/${o._id}`)}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--blue)"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
              >
                {/* Top row: avatar + name/badge + case count */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <OfficerAvatar name={o.name} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Name — always bright white */}
                    <div style={{
                      fontWeight: 700,
                      fontSize: 15,
                      marginBottom: 4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: "#f1f5f9",           // explicit — never inherits card bg
                    }}>
                      {o.name}
                    </div>
                    {/* Badge number — muted mono */}
                    <div style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "#94a3b8",            // explicit slate-400
                      letterSpacing: "0.5px",
                    }}>
                      {o.badgeNumber}
                    </div>
                  </div>

                  {/* Case count */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 30,
                      fontWeight: 800,
                      lineHeight: 1,
                      color: o.assignedCases > 0 ? "var(--accent)" : "#475569",
                    }}>
                      {o.assignedCases}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      color: "#64748b",
                      letterSpacing: "1px",
                      marginTop: 2,
                    }}>
                      CASES
                    </div>
                  </div>
                </div>

                {/* Department */}
                <div style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#cbd5e1",               // slate-300 — clearly readable
                  padding: "10px 0",
                  borderTop: "1px solid var(--border)",
                  borderBottom: isAdmin ? "1px solid var(--border)" : "none",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  {o.department}
                </div>

                {/* Admin actions */}
                {isAdmin && (
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }} onClick={(e) => e.stopPropagation()}>
                    <Link
                      to={`/officers/edit/${o._id}`}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, justifyContent: "center" }}
                    >
                      Edit
                    </Link>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ flex: 1, justifyContent: "center" }}
                      onClick={() => setDeleteId(o._id)}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="REMOVE OFFICER"
        message="Permanently remove this officer? Their assigned cases will become unassigned."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default OfficerList;
