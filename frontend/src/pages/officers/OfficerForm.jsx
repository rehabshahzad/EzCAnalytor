import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import API from "../../services/api";
import { Spinner } from "../../components/UI";

const OfficerForm = ({ editMode = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", department: "" });
  const [loading, setLoading] = useState(editMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null); // holds the newly created officer record

  useEffect(() => {
    if (editMode && id) {
      API.get(`/officers/${id}`)
        .then((r) => {
          const o = r.data.data;
          setForm({ name: o.name, department: o.department });
        })
        .catch(() => setError("Failed to load officer data"))
        .finally(() => setLoading(false));
    }
  }, [editMode, id]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editMode) {
        await API.put(`/officers/${id}`, form);
        navigate("/officers");
      } else {
        const res = await API.post("/officers", form);
        // Show the auto-generated credentials before navigating away
        setCreated(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save officer");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  // After creation — show credentials screen
  if (created) {
    return (
      <div>
        <div className="section-header">
          <div>
            <div className="section-title">OFFICER REGISTERED</div>
            <div className="section-subtitle">Credentials have been generated — share these with the officer</div>
          </div>
        </div>

        <div className="card" style={{ maxWidth: 560 }}>
          <div style={{
            padding: "20px",
            background: "var(--bg-primary)",
            border: "1px solid var(--accent)",
            borderRadius: "var(--radius)",
            marginBottom: 24
          }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", letterSpacing: 2, marginBottom: 16 }}>
              GENERATED CREDENTIALS
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>OFFICER NAME</div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{created.name}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>LOGIN EMAIL</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text-primary)" }}>{created.email}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>BADGE NUMBER</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: "var(--accent)", letterSpacing: 3 }}>
                  {created.badgeNumber}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>DEPARTMENT</div>
                <div style={{ fontSize: 14 }}>{created.department}</div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20, fontFamily: "var(--font-mono)" }}>
            The officer logs in using their email and badge number — no password required.
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" onClick={() => setCreated(null)}>
              Add Another Officer
            </button>
            <Link to="/officers" className="btn btn-secondary">View All Officers</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">{editMode ? "EDIT OFFICER" : "ADD OFFICER"}</div>
          <div className="section-subtitle">
            {editMode ? "Update personnel record" : "Badge number and email will be auto-generated"}
          </div>
        </div>
        <Link to="/officers" className="btn btn-secondary">← Back</Link>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠ {error}</div>}

      <div className="card" style={{ maxWidth: 560 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Officer's full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <input
              type="text"
              name="department"
              className="form-control"
              placeholder="e.g. Homicide, Narcotics, Cyber Crime"
              value={form.department}
              onChange={handleChange}
              required
            />
          </div>

          {!editMode && (
            <div style={{
              padding: "10px 14px",
              background: "var(--bg-primary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              marginBottom: 16,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--text-muted)"
            }}>
              A unique badge number and login email will be automatically generated on registration.
            </div>
          )}

          <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : editMode ? "Update Officer" : "Register Officer"}
            </button>
            <Link to="/officers" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfficerForm;
