import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "../../components/AdminDashboard/Sidebar";
import AdminHeader from "../../components/AdminDashboard/Header";


const AdminDashboardLayout = () => {
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [activeView, setActiveView] = useState("overview");

  // Initialize from localStorage so refresh still works
  const [sidebarPermissions, setSidebarPermissions] = useState(() => {
    const raw = localStorage.getItem("admin_permissions");
    if (!raw) return ["VIEW_DASHBOARD"];

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.permissions)
          ? parsed.permissions
          : ["VIEW_DASHBOARD"];
    } catch {
      return ["VIEW_DASHBOARD"];
    }
  });

  // 🔥 CRITICAL FIX — listen for instant updates from AdminDashboard
  useEffect(() => {
    const handlePermissionUpdate = (e) => {
      const perms = Array.isArray(e.detail)
        ? e.detail
        : ["VIEW_DASHBOARD"];

      setSidebarPermissions(perms);
      localStorage.setItem("admin_permissions", JSON.stringify(perms));
    };

    window.addEventListener("admin:permissions", handlePermissionUpdate);

    return () => {
      window.removeEventListener("admin:permissions", handlePermissionUpdate);
    };
  }, []);

  return (
    <>
      <div className="dashboard_wrapper">
        <AdminSidebar
          permissions={sidebarPermissions}
          activeView={activeView}
          onNavigate={setActiveView}
        />

        <div className="dashboard_body">
          <AdminHeader onProfileClick={() => setProfileDrawerOpen(true)} />

          <div className="dashboard_content">
            <Outlet context={{ activeView, setActiveView }} />
          </div>
        </div>
      </div>

      {profileDrawerOpen && (
        <div
          className="drawer-overlay"
          onClick={() => setProfileDrawerOpen(false)}
        >
          <div
            className="drawer-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="drawer-close-btn"
              onClick={() => setProfileDrawerOpen(false)}
            >
              ×
            </button>

            <ProfileSetup adminEdit={true} />
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboardLayout;
