import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout-wrapper">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Topbar onToggleSidebar={() => setSidebarOpen((p) => !p)} />
        <div className="page-container fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
