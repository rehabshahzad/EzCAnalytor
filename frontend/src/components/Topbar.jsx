import React from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const pageTitles = {
  "/dashboard":      ["DASHBOARD",     "Overview & Metrics"],
  "/crimes":         ["CRIME REPORTS", "All incidents"],
  "/crimes/add":     ["ADD CRIME",     "New incident report"],
  "/officers":       ["OFFICERS",      "Personnel directory"],
  "/officers/add":   ["ADD OFFICER",   "Register new officer"],
  "/assign-crime":   ["ASSIGN CRIME",  "Link incident to officer"],
  "/stats/city":     ["CITY STATS",    "Geographic distribution"],
  "/stats/type":     ["TYPE STATS",    "Crime type breakdown"],
  "/stats/trends":   ["CRIME TRENDS",  "Monthly timeline"],
  "/profile":        ["MY PROFILE",    "Account information"],
  "/unauthorized":   ["UNAUTHORIZED",  "Access denied"],
};

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1"  x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22"   x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1"  y1="12" x2="3"  y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78"  x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6"  x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const Topbar = ({ onToggleSidebar }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const path = location.pathname;
  const matchedKey = Object.keys(pageTitles).find((key) => path === key || path.startsWith(key + "/"));
  const [title, subtitle] = pageTitles[matchedKey] || ["ANALYTICS", "Crime Management System"];

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="hamburger" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <MenuIcon />
        </button>
        <div>
          <div className="page-title">{title}</div>
          <div className="page-subtitle">{subtitle}</div>
        </div>
      </div>

      <div className="topbar-right">
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>SYSTEM DATE</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-secondary)" }}>{dateStr}</div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 34, height: 34, borderRadius: "var(--radius)",
            background: "var(--bg-primary)", border: "1px solid var(--border)",
            color: "var(--text-secondary)", cursor: "pointer",
            transition: "var(--transition)", flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* Online indicator */}
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: "var(--green)",
          boxShadow: "0 0 8px var(--green)",
          flexShrink: 0
        }} />
      </div>
    </div>
  );
};

export default Topbar;
