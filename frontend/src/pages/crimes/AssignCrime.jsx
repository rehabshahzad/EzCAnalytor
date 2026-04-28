import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { Spinner } from "../../components/UI";

const AssignCrime = () => {
  const [crimes, setCrimes] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [form, setForm] = useState({ crimeId: "", officerId: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    Promise.all([
      API.get("/crimes?limit=100"),
      API.get("/officers"),
    ]).then(([cr, or]) => {
      setCrimes(cr.data.data || []);
      setOfficers(or.data.data || []);
    }).catch(() => {
      setMessage({ type: "error", text: "Failed to load data" });
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await API.post("/crimes/assign", { crimeId: form.crimeId, officerId: form.officerId });
      setMessage({ type: "success", text: `Crime successfully assigned to ${res.data.data?.officer?.name}!` });
      setForm({ crimeId: "", officerId: "" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Assignment failed" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  const selectedCrime = crimes.find((c) => c._id === form.crimeId);
  const selectedOfficer = officers.find((o) => o._id === form.officerId);

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">ASSIGN CRIME</div>
          <div className="section-subtitle">Link an incident to an investigating officer (uses DB transaction)</div>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`} style={{ marginBottom: 20 }}>
          {message.type === "success" ? "✓" : "⚠"} {message.text}
        </div>
      )}

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="card">
            <div className="chart-title" style={{ marginBottom: 20 }}>ASSIGNMENT FORM</div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Crime Incident</label>
                <select className="form-control" value={form.crimeId} onChange={(e) => setForm((f) => ({ ...f, crimeId: e.target.value }))} required>
                  <option value="">-- Choose an incident --</option>
                  {crimes.map((c) => (
                    <option key={c._id} value={c._id}>
                      [{c.status.toUpperCase()}] {c.title} — {c.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select Officer</label>
                <select className="form-control" value={form.officerId} onChange={(e) => setForm((f) => ({ ...f, officerId: e.target.value }))} required>
                  <option value="">-- Choose an officer --</option>
                  {officers.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.name} (#{o.badgeNumber}) · {o.assignedCases} active cases
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving || !form.crimeId || !form.officerId} style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
                {saving ? "Assigning..." : "🔗 Assign Crime to Officer"}
              </button>
            </form>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card">
            <div className="chart-title" style={{ marginBottom: 20 }}>SELECTION PREVIEW</div>
            {!selectedCrime && !selectedOfficer ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>🔗</div>
                Select a crime and officer to preview the assignment
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {selectedCrime && (
                  <div style={{ padding: 16, background: "var(--bg-primary)", borderRadius: "var(--radius)", border: "1px solid var(--accent)" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", marginBottom: 6, letterSpacing: 1 }}>CRIME</div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{selectedCrime.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      {selectedCrime.crimeType} · {selectedCrime.city}, {selectedCrime.area}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <span className={`badge badge-${selectedCrime.status === "open" ? "open" : selectedCrime.status === "investigating" ? "investigating" : "resolved"}`}>
                        {selectedCrime.status}
                      </span>
                    </div>
                  </div>
                )}

                {selectedCrime && selectedOfficer && (
                  <div style={{ textAlign: "center", fontSize: 20, color: "var(--text-muted)" }}>↓</div>
                )}

                {selectedOfficer && (
                  <div style={{ padding: 16, background: "var(--bg-primary)", borderRadius: "var(--radius)", border: "1px solid var(--blue)" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--blue)", marginBottom: 6, letterSpacing: 1 }}>OFFICER</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ fontSize: 28 }}>👮</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{selectedOfficer.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          #{selectedOfficer.badgeNumber} · {selectedOfficer.department}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--amber)", marginTop: 4 }}>
                          Currently handling {selectedOfficer.assignedCases} case(s)
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignCrime;
