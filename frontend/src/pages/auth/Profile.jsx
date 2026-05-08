import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { Alert } from "../../components/UI";

const RoleBadge = ({ role }) => {
  const map = { admin: "badge-admin", officer: "badge-officer", user: "badge-user" };
  return <span className={`badge ${map[role] || "badge-user"}`}>{role}</span>;
};

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [activeTab, setActiveTab] = useState("details");

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await API.patch("/auth/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setPasswordMessage(res.data.message || "Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(error.response?.data?.message || "Unable to update password.");
    } finally {
      setPasswordLoading(false);
    }
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
              width: 80, height: 80, borderRadius: "50%",
              background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 36, fontWeight: 700, color: "#fff",
              fontFamily: "var(--font-display)",
              margin: "0 auto 16px"
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <h2 style={{ color: "#ffffff", textShadow: "0 1px 6px rgba(0,0,0,0.45)", fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: 2, marginBottom: 8 }}>
              {user?.name}
            </h2>
            <RoleBadge role={user?.role} />

            {user?.role === "officer" && user?.badgeNumber && (
              <div style={{
                marginTop: 16, padding: "10px 16px",
                background: "var(--bg-primary)",
                border: "1px solid var(--accent)",
                borderRadius: "var(--radius)",
                fontFamily: "var(--font-mono)",
                fontSize: 20, fontWeight: 700,
                color: "var(--accent)", letterSpacing: 3
              }}>
                {user.badgeNumber}
              </div>
            )}

            <div style={{ marginTop: 14, fontFamily: "var(--font-mono)", fontSize: 12, color: "#f8fafc", letterSpacing: 0.8 }}>
              Access Level: <span style={{ color: "#ffffff", fontWeight: 600 }}>{user?.role?.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-8">
          <div className="card">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div>
                <div className="chart-title" style={{ marginBottom: 4 }}>PROFILE SETTINGS</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Manage your account details and security options.</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { key: "details", label: "Details" },
                  { key: "security", label: "Security" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: "999px",
                      border: activeTab === tab.key ? "1px solid var(--accent)" : "1px solid var(--border)",
                      background: activeTab === tab.key ? "var(--bg-card)" : "transparent",
                      color: activeTab === tab.key ? "var(--accent)" : "var(--text-muted)",
                      cursor: "pointer",
                      fontWeight: 600,
                      transition: "all 0.18s ease",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "details" ? (
              <>
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
                  {user?.role === "officer" && (
                    <div className="detail-field">
                      <div className="detail-label">Badge Number</div>
                      <div className="detail-value mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>
                        {user?.badgeNumber || "—"}
                      </div>
                    </div>
                  )}
                  <div className="detail-field">
                    <div className="detail-label">User ID</div>
                    <div className="detail-value mono" style={{ fontSize: 11, wordBreak: "break-all" }}>
                      {user?._id}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", marginBottom: 14 }}>
                    {user?.role === "admin"   && "Full system access — create, edit, delete, assign crimes and officers"}
                    {user?.role === "officer" && "View crimes assigned to you — use badge number to log in"}
                    {user?.role === "user"    && "Read-only access to dashboard and analytics"}
                  </div>
                  <button className="btn btn-danger" onClick={handleLogout}>Sign Out</button>
                </div>
              </>
            ) : (
              <>
                {passwordMessage && <Alert type="success">{passwordMessage}</Alert>}
                {passwordError && <Alert type="error">{passwordError}</Alert>}

                {user?.role === "officer" ? (
                  <div style={{ padding: 18, background: "var(--bg-primary)", borderRadius: "var(--radius)", border: "1px solid var(--border-light)" }}>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                      Officer accounts use badge-based login. Password updates are managed by administrators.
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="form-group">
                      <label className="form-label">Current Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }} disabled={passwordLoading}>
                      {passwordLoading ? "Updating..." : "Update Password"}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
