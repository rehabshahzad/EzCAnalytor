import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../../services/api";
import { Spinner, ConfirmModal } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";

const StatusBadge = ({ status }) => {
  const map = { open: "badge-open", investigating: "badge-investigating", resolved: "badge-resolved" };
  return <span className={`badge ${map[status] || "badge-user"}`}>{status}</span>;
};

const CrimeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isOfficerOrAdmin } = useAuth();
  const [crime, setCrime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    API.get(`/crimes/${id}`)
      .then((res) => setCrime(res.data.data))
      .catch(() => setError("Crime report not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    try {
      await API.delete(`/crimes/${id}`);
      navigate("/crimes");
    } catch {
      setError("Failed to delete crime report");
    }
  };

  if (loading) return <Spinner />;
  if (error) return (
    <div>
      <div className="alert alert-error">⚠ {error}</div>
      <Link to="/crimes" className="btn btn-secondary">← Back to Crimes</Link>
    </div>
  );
  if (!crime) return null;

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">INCIDENT DETAIL</div>
          <div className="section-subtitle" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>ID: {crime._id}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link to="/crimes" className="btn btn-secondary">← Back</Link>
          {/* Officers and admins can edit */}
          {isOfficerOrAdmin && (
            <Link to={`/crimes/edit/${crime._id}`} className="btn btn-secondary">✏ Edit</Link>
          )}
          {/* Only admin can delete */}
          {isAdmin && (
            <button className="btn btn-danger" onClick={() => setShowDelete(true)}>🗑 Delete</button>
          )}
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 2, marginBottom: 10 }}>{crime.title}</h2>
                <StatusBadge status={crime.status} />
              </div>
            </div>

            <div className="detail-label">Description</div>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.8, marginBottom: 28, marginTop: 6, padding: "16px", background: "var(--bg-primary)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
              {crime.description}
            </p>

            <div className="detail-grid">
              <div className="detail-field"><div className="detail-label">Crime Type</div><div className="detail-value">{crime.crimeType}</div></div>
              <div className="detail-field"><div className="detail-label">City</div><div className="detail-value">{crime.city}</div></div>
              <div className="detail-field"><div className="detail-label">Area</div><div className="detail-value">{crime.area}</div></div>
              <div className="detail-field"><div className="detail-label">Status</div><div className="detail-value"><StatusBadge status={crime.status} /></div></div>
              <div className="detail-field">
                <div className="detail-label">Incident Date</div>
                <div className="detail-value mono">{new Date(crime.incidentDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
              </div>
              <div className="detail-field"><div className="detail-label">Report Filed</div><div className="detail-value mono">{new Date(crime.createdAt).toLocaleString()}</div></div>
              <div className="detail-field"><div className="detail-label">Last Updated</div><div className="detail-value mono">{new Date(crime.updatedAt).toLocaleString()}</div></div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card">
            <div className="chart-title" style={{ marginBottom: 16 }}>ASSIGNED OFFICER</div>
            {crime.officer ? (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, padding: "16px", background: "var(--bg-primary)", borderRadius: "var(--radius)", border: "1px solid var(--blue)" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--blue-dim)", border: "2px solid var(--blue)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>👮</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{crime.officer.name}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>BADGE #{crime.officer.badgeNumber}</div>
                  </div>
                </div>
                <div className="detail-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <div className="detail-field"><div className="detail-label">Department</div><div className="detail-value" style={{ fontSize: 13 }}>{crime.officer.department}</div></div>
                  <div className="detail-field">
                    <div className="detail-label">Total Cases</div>
                    <div className="detail-value" style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--accent)" }}>{crime.officer.assignedCases}</div>
                  </div>
                </div>
                {/* Only admin can view officer profiles / reassign */}
                {isAdmin && (
                  <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                    <Link to={`/officers/${crime.officer._id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: "center" }}>
                      View Officer →
                    </Link>
                    <Link to="/assign-crime" className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: "center" }}>
                      Reassign
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>👮</div>
                <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>No officer assigned yet</div>
                {/* Only admin can assign */}
                {isAdmin && <Link to="/assign-crime" className="btn btn-primary btn-sm">🔗 Assign Officer</Link>}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDelete}
        title="DELETE CRIME REPORT"
        message={`Permanently delete "${crime.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
};

export default CrimeDetail;
