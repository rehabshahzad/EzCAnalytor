import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { Spinner } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";

const StatusBadge = ({ status }) => {
  const map = { open: "badge-open", investigating: "badge-investigating", resolved: "badge-resolved" };
  return <span className={`badge ${map[status] || "badge-user"}`}>{status}</span>;
};

// ── SVG Icons ────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18, color = "currentColor" }) => {
  const p = { width: size, height: size, fill: "none", stroke: color, strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    total:  <svg {...p} viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>,
    open:   <svg {...p} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    invest: <svg {...p} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
    solved: <svg {...p} viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    officer:<svg {...p} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    city:   <svg {...p} viewBox="0 0 24 24"><line x1="3" y1="22" x2="21" y2="22"/><rect x="2" y="6" width="8" height="16"/><rect x="14" y="10" width="8" height="12"/><path d="M6 6V4l6-2 6 4v4"/></svg>,
    type:   <svg {...p} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    trends: <svg {...p} viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    assign: <svg {...p} viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
    add:    <svg {...p} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  };
  return icons[name] || null;
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, meta, iconName, accentColor }) => (
  <div className="stat-card" style={{ position: "relative", overflow: "hidden" }}>
    <div style={{
      position: "absolute", top: 14, right: 14,
      width: 34, height: 34, borderRadius: 8,
      background: `${accentColor}18`,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <Icon name={iconName} size={17} color={accentColor} />
    </div>
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-meta" style={{ color: "var(--text-muted)", fontSize: 11 }}>{meta}</div>
  </div>
);

// ── Action card ───────────────────────────────────────────────────────────────
const ActionCard = ({ to, iconName, title, subtitle, accent }) => (
  <Link to={to} style={{ textDecoration: "none" }}>
    <div className="card" style={{
      cursor: "pointer", display: "flex", alignItems: "center", gap: 16, padding: "18px 20px",
      border: accent ? "1px solid var(--accent)" : "1px solid var(--border)"
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 8, flexShrink: 0,
        background: accent ? "var(--accent-dim)" : "var(--bg-primary)",
        border: `1px solid ${accent ? "var(--accent)" : "var(--border)"}`,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <Icon name={iconName} size={18} color={accent ? "var(--accent)" : "var(--text-secondary)"} />
      </div>
      <div>
        <div className="chart-title" style={{ marginBottom: 2 }}>{title}</div>
        <div className="chart-subtitle">{subtitle}</div>
      </div>
    </div>
  </Link>
);

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [crimes, setCrimes]     = useState([]);
  const [total, setTotal]       = useState(0);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [statusCounts, setStatusCounts] = useState({ open: 0, investigating: 0, resolved: 0 });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [crimeRes, openRes, invRes, resRes] = await Promise.all([
          API.get("/crimes?limit=5"),
          API.get("/crimes?status=open&limit=1"),
          API.get("/crimes?status=investigating&limit=1"),
          API.get("/crimes?status=resolved&limit=1"),
        ]);
        setCrimes(crimeRes.data.data || []);
        setTotal(crimeRes.data.total || 0);
        setStatusCounts({
          open:          openRes.data.total || 0,
          investigating: invRes.data.total  || 0,
          resolved:      resRes.data.total  || 0,
        });
        if (isAdmin) {
          const officerRes = await API.get("/officers");
          setOfficers(officerRes.data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [isAdmin]);

  if (loading) return <Spinner text="Loading dashboard..." />;

  const roleColors = { admin: "var(--accent)", officer: "var(--blue)", user: "var(--text-muted)" };

  return (
    <div>

      {/* Header */}
      <div className="section-header">
        <div>
          <div className="section-title">COMMAND OVERVIEW</div>
          <div className="section-subtitle" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            Welcome back, {user?.name}
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1,
              background: "var(--bg-primary)", color: roleColors[user?.role],
              border: `1px solid ${roleColors[user?.role]}40`,
              padding: "2px 8px", borderRadius: 3
            }}>
              {user?.role?.toUpperCase()}
            </span>
          </div>
        </div>
        {isAdmin && (
          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/crimes/add" className="btn btn-primary" style={{ gap: 6 }}>
              <Icon name="add" size={13} color="#fff" /> Add Crime
            </Link>
            <Link to="/officers/add" className="btn btn-secondary" style={{ gap: 6 }}>
              <Icon name="officer" size={13} /> Add Officer
            </Link>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <StatCard label="Total Crimes" value={total} meta="All records"
            iconName="total" accentColor="var(--accent)" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard label="Open Cases" value={statusCounts.open} meta="Requires action"
            iconName="open" accentColor="#E05252" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard label="Investigating" value={statusCounts.investigating} meta="In progress"
            iconName="invest" accentColor="#D4A017" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard label="Resolved" value={statusCounts.resolved} meta="Cases closed"
            iconName="solved" accentColor="#3A9E5F" />
        </div>
      </div>

      <div className="row g-3 mb-3">

        {/* Recent incidents */}
        <div className={`col-12 ${isAdmin ? "col-lg-8" : ""}`}>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div className="chart-title">RECENT INCIDENTS</div>
                <div className="chart-subtitle">Latest 5 crime reports</div>
              </div>
              <Link to="/crimes" className="btn btn-secondary btn-sm">View All</Link>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Title</th><th>Type</th><th>City</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {crimes.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", color: "var(--text-muted)", padding: 32 }}>
                        No crime reports on record
                      </td>
                    </tr>
                  ) : crimes.map((c) => (
                    <tr key={c._id}>
                      <td data-label="Title">
                        <Link to={`/crimes/${c._id}`}
                          style={{ color: "var(--text-primary)", textDecoration: "none", fontWeight: 600 }}>
                          {c.title}
                        </Link>
                      </td>
                      <td data-label="Type"   style={{ color: "var(--text-secondary)", fontSize: 12 }}>{c.crimeType}</td>
                      <td data-label="City"   style={{ color: "var(--text-secondary)" }}>{c.city}</td>
                      <td data-label="Status"><StatusBadge status={c.status} /></td>
                      <td data-label="Date"   style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
                        {new Date(c.incidentDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Officer roster — admin only */}
        {isAdmin && (
          <div className="col-12 col-lg-4">
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div className="chart-title">OFFICER ROSTER</div>
                  <div className="chart-subtitle">{officers.length} personnel</div>
                </div>
                <Link to="/officers/add" className="btn btn-primary btn-sm">Add</Link>
              </div>

              {officers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: 13 }}>
                  No officers registered
                </div>
              ) : officers.slice(0, 5).map((o) => (
                <div key={o._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  {/* Monogram avatar */}
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                    background: "var(--bg-primary)", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700,
                    color: "var(--text-secondary)"
                  }}>
                    {o.name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {o.name}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
                      {o.badgeNumber}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--accent)" }}>
                      {o.assignedCases}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: 1 }}>CASES</div>
                  </div>
                </div>
              ))}

              <Link to="/officers" className="btn btn-secondary btn-sm"
                style={{ marginTop: 14, width: "100%", justifyContent: "center" }}>
                View All Officers
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Quick action cards */}
      <div className="row g-3">
        <div className="col-12 col-md-4">
          <ActionCard to="/stats/city"   iconName="city"   title="CITY STATISTICS" subtitle="Geographic distribution" />
        </div>
        <div className="col-12 col-md-4">
          <ActionCard to="/stats/type"   iconName="type"   title="TYPE BREAKDOWN"  subtitle="Crime category analysis" />
        </div>
        <div className="col-12 col-md-4">
          {isAdmin
            ? <ActionCard to="/assign-crime" iconName="assign" title="ASSIGN CASE"  subtitle="Link incident to officer" accent />
            : <ActionCard to="/stats/trends" iconName="trends" title="TRENDS"       subtitle="Monthly incident timeline" />
          }
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
