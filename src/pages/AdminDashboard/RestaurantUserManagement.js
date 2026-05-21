import React, { useEffect, useMemo, useState } from "react";
import {
  FaPowerOff,
  FaSignOutAlt,
  FaHistory,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

const API_BASE = "http://192.168.2.22:5000/api/v1/admin";

export default function RestaurantUserManagement() {
  const token = localStorage.getItem("admin_token");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showLogs, setShowLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeRestaurant, setActiveRestaurant] = useState(null);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // ======================================================
  // LOAD RESTAURANT USERS
  // ======================================================
  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/restaurants/users`, {
        headers: authHeaders,
      });

      if (res.status === 401) {
        localStorage.clear();
        window.location.href = "/admin/login";
        return;
      }

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Restaurant fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ======================================================
  // FILTER
  // ======================================================
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        (u.restaurant_name_english || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && u.status === "active") ||
        (statusFilter === "SUSPENDED" && u.status === "suspended");

      return matchSearch && matchStatus;
    });
  }, [users, search, statusFilter]);

  // ======================================================
  // ACTIONS
  // ======================================================
  const toggleStatus = async (user) => {
    const newStatus = user.status === "active" ? "suspended" : "active";
    const reason =
      newStatus === "suspended"
        ? prompt("Reason for suspension (optional):")
        : null;

    await fetch(`${API_BASE}/restaurants/users/${user.user_id}/status`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({
        status: newStatus,
        reason,
      }),
    });

    loadUsers();
  };

  const forceLogout = async (user) => {
    if (!window.confirm(`Force logout ${user.username}?`)) return;

    await fetch(
      `${API_BASE}/restaurants/users/${user.user_id}/force-logout`,
      {
        method: "POST",
        headers: authHeaders,
      }
    );

    alert("Restaurant user logged out from all sessions");
  };

  const loadAuditLogs = async (restaurantId, restaurantName) => {
    setActiveRestaurant(restaurantName);
    setShowLogs(true);

    try {
      const res = await fetch(
        `${API_BASE}/platform-audit?actor_type=RESTAURANT&linked_id=${restaurantId}`,
        { headers: authHeaders }
      );

      const data = await res.json();
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Audit fetch failed:", err);
      setAuditLogs([]);
    }
  };

  // ======================================================
  // UI
  // ======================================================
  return (
    <div style={{ background: "#fff", padding: 24, borderRadius: 8 }}>
      {/* HEADER */}
      <div style={{ marginBottom: 16 }}>
        <h3>Restaurant User Management</h3>
        <p style={{ color: "#777", fontSize: 13 }}>
          Suspend, activate, force logout and audit restaurant users
        </p>
      </div>

      {/* FILTER BAR */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <FaSearch />
          <input
            placeholder="Search email or restaurant"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* TABLE */}
      {loading ? (
        <div style={{ padding: 20 }}>Loading restaurant users…</div>
      ) : (
        <table width="100%">
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
              <th>Email</th>
              <th>Restaurant</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr
                key={u.user_id}
                style={{ borderBottom: "1px solid #f1f1f1" }}
              >
                <td>{u.username}</td>
                <td>{u.restaurant_name_english || "—"}</td>
                <td
                  style={{
                    fontWeight: 600,
                    color:
                      u.status === "active" ? "#2e7d32" : "#c62828",
                  }}
                >
                  {u.status.toUpperCase()}
                </td>
                <td>
                  {u.created_at
                    ? new Date(u.created_at).toLocaleString()
                    : "—"}
                </td>
                <td style={{ display: "flex", gap: 8 }}>
                  <button
                    title="Suspend / Activate"
                    onClick={() => toggleStatus(u)}
                  >
                    <FaPowerOff />
                  </button>

                  <button
                    title="Force Logout"
                    onClick={() => forceLogout(u)}
                  >
                    <FaSignOutAlt />
                  </button>

                  <button
                    title="View Audit Logs"
                    onClick={() =>
                      loadAuditLogs(
                        u.restaurant_id,
                        u.restaurant_name_english
                      )
                    }
                  >
                    <FaHistory />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* AUDIT LOG MODAL */}
      {showLogs && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              width: 700,
              maxHeight: "80vh",
              overflowY: "auto",
              padding: 20,
              borderRadius: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <h4>Audit Logs — {activeRestaurant}</h4>
              <button
                onClick={() => {
                  setShowLogs(false);
                  setAuditLogs([]);
                  setActiveRestaurant(null);
                }}
              >
                <FaTimes />
              </button>
            </div>

            {auditLogs.length === 0 ? (
              <p style={{ color: "#777" }}>No audit logs found</p>
            ) : (
              <table width="100%">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>IP</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.audit_id}>
                      <td>{log.action}</td>
                      <td>
                        {log.entity_type} {log.entity_id || ""}
                      </td>
                      <td>{log.ip_address}</td>
                      <td>
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
