import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const RoleBadge = ({ role }) => {
  const map = { admin: "badge-admin", officer: "badge-officer", user: "badge-user" };
  return <span className={`badge ${map[role] || "badge-user"}`}>{role}</span>;
};

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">MY PROFILE</div>
          <div className="section-subtitle">Account information</div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-4">
          <div className="card" style={{ textAlign: "center", padding: "32px 24px" }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%", background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 36, fontWeight: 700, color: "#fff", margin: "0 auto 16px"
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, letterSpacing: 2, marginBottom: 8 }}>
              {user?.name}
            </h2>
            <RoleBadge role={user?.role} />

            {/* Show badge number prominently for officers */}
            {user?.role === "officer" && user?.badgeNumber && (
              <div style={{
                marginTop: 16,
                padding: "10px 16px",
                background: "var(--bg-primary)",
                border: "1px solid var(--accent)",
                borderRadius: "var(--radius)",
                fontFamily: "var(--font-mono)",
                fontSize: 18,
                fontWeight: 700,
                color: "var(--accent)",
                letterSpacing: 3
              }}>
                {user.badgeNumber}
              </div>
            )}

            <div style={{ marginTop: 16, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
              Access Level: {user?.role?.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="col-12 col-md-8">
          <div className="card">
            <div className="chart-title" style={{ marginBottom: 20 }}>ACCOUNT DETAILS</div>
            <div className="detail-grid">
              <div className="detail-field">
                <div className="detail-label">Full Name</div>
                <div className="detail-value">{user?.name}</div>
              </div>
              <div className="detail-field">
                <div className="detail-label">Email Address</div>
                <div className="detail-value mono">{user?.email}</div>
              </div>
              <div className="detail-field">
                <div className="detail-label">System Role</div>
                <div className="detail-value"><RoleBadge role={user?.role} /></div>
              </div>

              {/* Badge number row — officers only */}
              {user?.role === "officer" && (
                <div className="detail-field">
                  <div className="detail-label">Badge Number</div>
                  <div className="detail-value mono" style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>
                    {user?.badgeNumber || "—"}
                  </div>
                </div>
              )}

              <div className="detail-field">
                <div className="detail-label">User ID</div>
                <div className="detail-value mono" style={{ fontSize: 11, wordBreak: "break-all" }}>{user?._id}</div>
              </div>
            </div>

            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", marginBottom: 12 }}>
                {user?.role === "admin"   && "✓ Full system access — create, edit, delete, assign"}
                {user?.role === "officer" && "✓ View crimes assigned to you · Use badge number to log in"}
                {user?.role === "user"    && "✓ Read-only access to dashboard and analytics"}
              </div>
              <button className="btn btn-danger" onClick={handleLogout}>⏻ Sign Out</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
