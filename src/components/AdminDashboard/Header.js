
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


const AdminHeader = ({ onProfileClick }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const username =
    localStorage.getItem("admin_email")?.split("@")[0] || "Admin";

  // ✅ FIX 1: DEFINE ROLE SAFELY
  const ADMIN_ROLE = localStorage.getItem("admin_role");

  const handleSearch = () => {
    if (!query.trim()) return;
    navigate(`/admin/search?q=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_role");
    localStorage.removeItem("admin_permissions");
    navigate("/admin/login");
  };

  // ✅ FIX 2: CREATE USER NAVIGATION
  const handleCreateUser = () => {
    navigate("/admin/dashboard/create-user");
  };

  return (
    <div className="dashboard_header">
      <div className="header_top">

        {/* LEFT */}
        <div className="header_left">
          <h4 className="welcome_text">
            Welcome, <span>{username}!</span>
          </h4>

          <div className="search_wrapper">
            <input
              className="search_bar"
              placeholder="Search products, orders, invoices..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="search_btn" onClick={handleSearch}>
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="header_right">

          <div className="header_right">

            {/* CREATE USER BUTTON — SUPER_ADMIN ONLY */}
            {ADMIN_ROLE === "SUPER_ADMIN" && (
              <button
                className="register_btn"
                style={{ marginRight: "15px" }}
                onClick={handleCreateUser}
              >
                + Create User
              </button>
            )}

            {/* LOGOUT */}
            <div
              className="icon_box logout_icon"
              title="Logout"
              onClick={handleLogout}
              style={{ cursor: "pointer" }}
            >
              <i className="fas fa-sign-out-alt"></i>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminHeader;


