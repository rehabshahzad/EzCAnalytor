import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { Spinner, ConfirmModal } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";

const StatusBadge = ({ status }) => {
  const map = { open: "badge-open", investigating: "badge-investigating", resolved: "badge-resolved" };
  return <span className={`badge ${map[status] || "badge-user"}`}>{status}</span>;
};

const AssignIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

const OfficerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [officer, setOfficer]     = useState(null);
  const [cases, setCases]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [oRes, cRes] = await Promise.all([
          API.get(`/officers/${id}`),
          API.get(`/crimes?officer=${id}&limit=20`),
        ]);
        setOfficer(oRes.data.data);
        setCases(cRes.data.data || []);
      } catch {
        setError("Failed to load officer profile");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    try {
      await API.delete(`/officers/${id}`);
      navigate("/officers");
    } catch {
      setError("Failed to delete officer");
    }
  };

  if (loading) return <Spinner />;
  if (error || !officer) return (
    <div>
      <div className="alert alert-error">{error || "Officer not found"}</div>
      <Link to="/officers" className="btn btn-secondary">Back</Link>
    </div>
  );

  const openCases         = cases.filter((c) => c.status === "open").length;
  const investigatingCases = cases.filter((c) => c.status === "investigating").length;
  const resolvedCases     = cases.filter((c) => c.status === "resolved").length;

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">OFFICER PROFILE</div>
          <div className="section-subtitle" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
            {officer.badgeNumber}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link to="/officers" className="btn btn-secondary">Back</Link>
          {isAdmin && (
            <>
              <Link to={`/officers/edit/${officer._id}`} className="btn btn-secondary">Edit</Link>
              <button className="btn btn-danger" onClick={() => setShowDelete(true)}>Remove</button>
            </>
          )}
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-4">
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ textAlign: "center", padding: "16px 0 24px" }}>
              {/* Monogram avatar */}
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "var(--bg-primary)", border: "2px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700,
                color: "var(--text-secondary)", margin: "0 auto 16px"
              }}>
                {officer.name?.[0]?.toUpperCase()}
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: 2, marginBottom: 4 }}>
                {officer.name}
              </h2>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
                {officer.department}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, borderTop: "1px solid var(--border)", paddingTop: 20 }}>
              <div className="detail-field">
                <div className="detail-label">Badge</div>
                <div className="detail-value mono">{officer.badgeNumber}</div>
              </div>
              <div className="detail-field">
                <div className="detail-label">Active Cases</div>
                <div className="detail-value" style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--accent)" }}>
                  {officer.assignedCases}
                </div>
              </div>
              <div className="detail-field">
                <div className="detail-label">Login Email</div>
                <div className="detail-value mono" style={{ fontSize: 11, wordBreak: "break-all" }}>
                  {officer.email || "—"}
                </div>
              </div>
              <div className="detail-field">
                <div className="detail-label">Registered</div>
                <div className="detail-value mono" style={{ fontSize: 11 }}>
                  {new Date(officer.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {isAdmin && (
              <Link to="/assign-crime"
                className="btn btn-primary btn-sm"
                style={{ marginTop: 16, width: "100%", justifyContent: "center", gap: 6 }}>
                <AssignIcon /> Assign a Crime
              </Link>
            )}
          </div>

          {/* Mini stat cards */}
          <div className="row g-2">
            <div className="col-4">
              <div className="stat-card red" style={{ padding: 16 }}>
                <div className="stat-label" style={{ fontSize: 9 }}>Open</div>
                <div className="stat-value" style={{ fontSize: 26 }}>{openCases}</div>
              </div>
            </div>
            <div className="col-4">
              <div className="stat-card amber" style={{ padding: 16 }}>
                <div className="stat-label" style={{ fontSize: 9 }}>Active</div>
                <div className="stat-value" style={{ fontSize: 26 }}>{investigatingCases}</div>
              </div>
            </div>
            <div className="col-4">
              <div className="stat-card green" style={{ padding: 16 }}>
                <div className="stat-label" style={{ fontSize: 9 }}>Solved</div>
                <div className="stat-value" style={{ fontSize: 26 }}>{resolvedCases}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="card">
            <div className="chart-title" style={{ marginBottom: 16 }}>
              ASSIGNED CASES ({cases.length})
            </div>
            {cases.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                No cases currently assigned to this officer
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr><th>Title</th><th>Type</th><th>City</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {cases.map((c) => (
                      <tr key={c._id}>
                        <td>
                          <Link to={`/crimes/${c._id}`}
                            style={{ color: "var(--text-primary)", textDecoration: "none", fontWeight: 600 }}>
                            {c.title}
                          </Link>
                        </td>
                        <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>{c.crimeType}</td>
                        <td style={{ color: "var(--text-secondary)" }}>{c.city}</td>
                        <td><StatusBadge status={c.status} /></td>
                        <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
                          {new Date(c.incidentDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDelete}
        title="REMOVE OFFICER"
        message={`Permanently remove "${officer.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
};

export default OfficerDetail;
