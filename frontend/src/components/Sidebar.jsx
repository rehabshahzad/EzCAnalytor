import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Icon = ({ name, size = 15 }) => {
  const s = { width: size, height: size, display: "block", flexShrink: 0 };
  const icons = {
    dashboard:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
    crimes:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>,
    city:       <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><rect x="2" y="6" width="8" height="16"/><rect x="14" y="10" width="8" height="12"/><path d="M6 6V4l6-2 6 4v4"/></svg>,
    type:       <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    trends:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    officers:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    addOfficer: <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
    addCrime:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
    assign:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
    profile:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    logout:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    brand:      <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  };
  return icons[name] || null;
};

const NavItem = ({ to, iconName, label, onClick }) => (
  <NavLink to={to} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} onClick={onClick}>
    <span className="nav-icon"><Icon name={iconName} /></span>
    {label}
  </NavLink>
);

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin, isOfficerOrAdmin } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? "show" : ""}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>

        <div className="sidebar-brand">
          <NavLink to="/dashboard" className="brand-logo" onClick={onClose}>
            <div className="brand-icon"><Icon name="brand" size={18} /></div>
            <div>
              <div className="brand-name">NIGEHBAN</div>
              <div className="brand-sub">Crime Analytics Platform</div>
            </div>
          </NavLink>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main</div>
          <NavItem to="/dashboard" iconName="dashboard" label="Dashboard" onClick={onClose} />

          <div className="nav-section-label" style={{ marginTop: 8 }}>Analytics</div>
          <NavItem to="/stats/city"   iconName="city"   label="By City"  onClick={onClose} />
          <NavItem to="/stats/type"   iconName="type"   label="By Type"  onClick={onClose} />
          <NavItem to="/stats/trends" iconName="trends" label="Trends"   onClick={onClose} />

          {isOfficerOrAdmin && (
            <>
              <div className="nav-section-label" style={{ marginTop: 8 }}>Crimes</div>
              <NavItem to="/crimes" iconName="crimes" label="Crime Reports" onClick={onClose} />
            </>
          )}

          {isAdmin && (
            <>
              <div className="nav-section-label" style={{ marginTop: 8 }}>
                Admin
                <span style={{ marginLeft: 6, fontSize: 9, background: "var(--accent)", color: "#fff", padding: "1px 5px", borderRadius: 3 }}>ADMIN</span>
              </div>
              <NavItem to="/officers"     iconName="officers"   label="Officers"     onClick={onClose} />
              <NavItem to="/officers/add" iconName="addOfficer" label="Add Officer"  onClick={onClose} />
              <NavItem to="/crimes/add"   iconName="addCrime"   label="Add Crime"    onClick={onClose} />
              <NavItem to="/assign-crime" iconName="assign"     label="Assign Crime" onClick={onClose} />
            </>
          )}

          <div className="nav-section-label" style={{ marginTop: 8 }}>Account</div>
          <NavItem to="/profile" iconName="profile" label="Profile" onClick={onClose} />
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
            <button className="btn-logout" onClick={handleLogout} title="Sign out">
              <Icon name="logout" size={14} />
            </button>
          </div>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
