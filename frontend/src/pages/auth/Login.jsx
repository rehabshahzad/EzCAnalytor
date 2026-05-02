import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Alert } from "../../components/UI";

const TABS = [
  { key: "admin",   label: "Administrator", icon: "⬡" },
  { key: "officer", label: "Officer",        icon: "◈" },
  { key: "user",    label: "User",           icon: "◎" },
];

const Login = () => {
  const [tab, setTab]         = useState("user");
  const [email, setEmail]     = useState("");
  const [password, setPassword]       = useState("");
  const [badgeNumber, setBadgeNumber] = useState("");
  const [error, setError]     = useState("");
  const { login, loading }    = useAuth();
  const navigate              = useNavigate();

  const handleTabChange = (key) => {
    setTab(key);
    setError("");
    setEmail(""); setPassword(""); setBadgeNumber("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await login(email, tab === "officer" ? null : password, tab === "officer" ? badgeNumber : null, tab);
    if (result.success) navigate("/dashboard");
    else setError(result.message);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-bg-grid" />
      <div className="auth-bg-glow" />
      <div className="auth-card">

        {/* Brand */}
        <div className="auth-logo">
          <div className="auth-logo-icon">⬡</div>
          <div>
<<<<<<< HEAD
            <div className="auth-title">Nigehban</div>
=======
            <div className="auth-title">EZC</div>
>>>>>>> 6f5fd618279b49db3dbafc62e00ea301f8cc1163
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: 2 }}>
              CRIME ANALYTICS PLATFORM
            </div>
          </div>
        </div>

        <div className="auth-headline">SECURE ACCESS</div>
        <div className="auth-sub">Select your access level to continue</div>

        {/* Role tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "var(--bg-primary)", padding: 4, borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => handleTabChange(t.key)}
              style={{
                flex: 1,
                padding: "9px 4px",
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                letterSpacing: 1,
                border: "none",
                borderRadius: "calc(var(--radius) - 2px)",
                cursor: "pointer",
                transition: "all 0.15s",
                background: tab === t.key ? "var(--bg-card)" : "transparent",
                color: tab === t.key ? "var(--accent)" : "var(--text-muted)",
                boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
                fontWeight: tab === t.key ? 600 : 400,
              }}
            >
              {t.icon}&nbsp;&nbsp;{t.label.toUpperCase()}
            </button>
          ))}
        </div>

        {error && <Alert type="error">{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder={
                tab === "admin"   ? "admin@dept.gov" :
                tab === "officer" ? "firstname.lastname.1046@police.gov.pk" :
                "user@example.com"
              }
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {tab === "officer" ? (
            <div className="form-group">
              <label className="form-label">Badge Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="PK-XXXX"
                value={badgeNumber}
                onChange={(e) => setBadgeNumber(e.target.value.toUpperCase())}
                required
              />
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, fontFamily: "var(--font-mono)" }}>
                Your credentials were issued by your administrator
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: 4 }}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* Only users can self-register */}
        {tab === "user" && (
          <>
            <div className="auth-divider">or</div>
            <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
              Don't have an account?{" "}
              <Link to="/register" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
                Register here
              </Link>
            </p>
          </>
        )}

        {tab === "officer" && (
          <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 16, fontFamily: "var(--font-mono)" }}>
            Officer accounts are created by administrators only
          </p>
        )}

        {tab === "admin" && (
          <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 16, fontFamily: "var(--font-mono)" }}>
            Admin access is restricted
          </p>
        )}

      </div>
    </div>
  );
};

export default Login;
