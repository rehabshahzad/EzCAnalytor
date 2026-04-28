import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import API from "../../services/api";
import { Spinner } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";

const CrimeForm = ({ editMode = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [form, setForm] = useState({
    title: "", description: "", crimeType: "", city: "",
    area: "", incidentDate: "", status: "open", officer: ""
  });
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(editMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Only admins can load officer dropdown (to assign during create/edit)
    if (isAdmin) {
      API.get("/officers").then((r) => setOfficers(r.data.data || [])).catch(() => {});
    }
    if (editMode && id) {
      API.get(`/crimes/${id}`)
        .then((r) => {
          const c = r.data.data;
          setForm({
            title: c.title, description: c.description, crimeType: c.crimeType,
            city: c.city, area: c.area,
            incidentDate: c.incidentDate ? c.incidentDate.split("T")[0] : "",
            status: c.status, officer: c.officer?._id || ""
          });
        })
        .catch(() => setError("Failed to load crime report"))
        .finally(() => setLoading(false));
    }
  }, [editMode, id, isAdmin]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, officer: form.officer || null };
      if (editMode) await API.put(`/crimes/${id}`, payload);
      else await API.post("/crimes", payload);
      navigate("/crimes");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save crime report");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">{editMode ? "EDIT CRIME REPORT" : "NEW CRIME REPORT"}</div>
          <div className="section-subtitle">{editMode ? "Update incident details" : "File a new incident"}</div>
        </div>
        <Link to="/crimes" className="btn btn-secondary">← Back</Link>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠ {error}</div>}

      <div className="card" style={{ maxWidth: 760 }}>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input type="text" name="title" className="form-control"
                  placeholder="Brief descriptive title" value={form.title} onChange={handleChange} required />
              </div>
            </div>
            <div className="col-12">
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea name="description" className="form-control"
                  placeholder="Detailed account of what happened..." value={form.description}
                  onChange={handleChange} required style={{ minHeight: 120 }} />
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="form-group">
                <label className="form-label">Crime Type *</label>
                <input type="text" name="crimeType" className="form-control"
                  placeholder="e.g. Theft, Robbery, Fraud" value={form.crimeType} onChange={handleChange} required />
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" className="form-control" value={form.status} onChange={handleChange}>
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input type="text" name="city" className="form-control"
                  placeholder="e.g. Lahore, Karachi" value={form.city} onChange={handleChange} required />
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="form-group">
                <label className="form-label">Area *</label>
                <input type="text" name="area" className="form-control"
                  placeholder="e.g. Gulberg, DHA" value={form.area} onChange={handleChange} required />
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="form-group">
                <label className="form-label">Incident Date *</label>
                <input type="date" name="incidentDate" className="form-control"
                  value={form.incidentDate} onChange={handleChange} required />
              </div>
            </div>

            {/* Officer dropdown — only admin sees this */}
            {isAdmin && (
              <div className="col-12 col-md-6">
                <div className="form-group">
                  <label className="form-label">Assign Officer (Optional)</label>
                  <select name="officer" className="form-control" value={form.officer} onChange={handleChange}>
                    <option value="">-- Leave Unassigned --</option>
                    {officers.map((o) => (
                      <option key={o._id} value={o._id}>{o.name} (#{o.badgeNumber}) — {o.department}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="col-12">
              <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : editMode ? "✓ Update Report" : "✓ Submit Report"}
                </button>
                <Link to="/crimes" className="btn btn-secondary">Cancel</Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrimeForm;
