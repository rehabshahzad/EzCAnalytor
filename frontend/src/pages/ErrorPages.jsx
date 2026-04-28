import React from "react";
import { Link } from "react-router-dom";

export const Unauthorized = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "75vh", flexDirection: "column", gap: 16, textAlign: "center", padding: "40px 20px" }}>
    <div style={{ fontSize: 72, marginBottom: 8 }}>🔒</div>
    <div style={{ fontFamily: "var(--font-display)", fontSize: 52, letterSpacing: 4, color: "var(--accent)" }}>UNAUTHORIZED</div>
    <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 13, maxWidth: 360 }}>
      You don't have permission to access this resource. Admin privileges are required.
    </div>
    <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: 12 }}>← Return to Dashboard</Link>
  </div>
);

export const NotFound = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "75vh", flexDirection: "column", gap: 16, textAlign: "center", padding: "40px 20px" }}>
    <div style={{ fontFamily: "var(--font-display)", fontSize: 130, color: "var(--border-light)", lineHeight: 1, marginBottom: -10 }}>404</div>
    <div style={{ fontFamily: "var(--font-display)", fontSize: 30, letterSpacing: 4 }}>PAGE NOT FOUND</div>
    <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
      The requested resource does not exist.
    </div>
    <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: 12 }}>← Return to Dashboard</Link>
  </div>
);
