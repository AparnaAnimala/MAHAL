import React, { useEffect, useMemo, useState } from "react";
import "../css/AdminUserManagement.css";
import {
    FiUser,
    FiPower,
    FiLogOut,
    FiTrash2,

    FiRotateCcw
} from "react-icons/fi";
import {
    FaSpinner,
    FaSearch,
    FaUserShield,
    FaTimes,
    FaPlus
} from "react-icons/fa";

const API_BASE = "http://192.168.2.9:5000/api/v1/admin/manage";

const ROLE_COLORS = {
    SUPER_ADMIN: "#d32f2f",
    ADMIN: "#1976d2",
    FINANCE_ADMIN: "#388e3c",
    OPS_ADMIN: "#f57c00",
    SUPPORT_ADMIN: "#9c27b0",
};

export default function AdminUserManagement() {
    const token = localStorage.getItem("admin_token");
    const ADMIN_ROLE = localStorage.getItem("admin_role");
    const MY_EMAIL = localStorage.getItem("admin_email");

    const [admins, setAdmins] = useState([]);
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);

    const [loading, setLoading] = useState(false);
    const [busyId, setBusyId] = useState(null);

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showProfile, setShowProfile] = useState(false);
    const [profileAdmin, setProfileAdmin] = useState(null);

    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newAdmin, setNewAdmin] = useState({
        name: "",
        email: "",
        role: "",
    });

    const [showAudit, setShowAudit] = useState(false);
    const [auditLogs, setAuditLogs] = useState([]);
    const [auditAdmin, setAuditAdmin] = useState(null);
    const [auditLoading, setAuditLoading] = useState(false);

    const [showRolePerm, setShowRolePerm] = useState(false);
    const [editingRole, setEditingRole] = useState("");
    const [rolePermissions, setRolePermissions] = useState([]);
    const [savingPerm, setSavingPerm] = useState(false);

    /* ---------------- HELPERS ---------------- */

    const authHeaders = {
        Authorization: `Bearer ${token}`,
    };

    const jsonHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };

    const handle401 = (res) => {
        if (res.status === 401) {
            localStorage.clear();
            window.location.href = "/admin/login";
            return true;
        }
        return false;
    };

    const safeMsg = async (res, fallback) => {
        try {
            const data = await res.json();
            return data.error || data.message || fallback;
        } catch {
            return fallback;
        }
    };

    const closeAll = () => {
        setShowProfile(false);
        setShowCreate(false);
        setShowAudit(false);
        setShowRolePerm(false);

        setProfileAdmin(null);
        setAuditAdmin(null);
        setAuditLogs([]);
        setRolePermissions([]);
    };

    /* ---------------- LOADERS ---------------- */

    const loadAdmins = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/admins`, {
                headers: authHeaders,
            });

            if (handle401(res)) return;

            const data = await res.json();
            setAdmins(data || []);
        } catch (err) {
            console.error(err);
            alert("Failed to load admins.");
        } finally {
            setLoading(false);
        }
    };

    const loadRoles = async () => {
        try {
            const res = await fetch(`${API_BASE}/roles`, {
                headers: authHeaders,
            });

            const data = await res.json();
            setRoles(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const loadPermissions = async () => {
        try {
            const res = await fetch(
                "http://192.168.2.9:5000/api/admin/auth/me",
                { headers: authHeaders }
            );

            if (!res.ok) return;

            const data = await res.json();
            setPermissions(data.permissions || []);
        } catch (err) {
            console.error(err);
        }
    };

    const loadRolePermissions = async (roleName) => {
        try {
            const res = await fetch(
                `${API_BASE}/roles/${roleName}/permissions`,
                { headers: authHeaders }
            );

            const data = await res.json();
            setRolePermissions(data || []);
        } catch (err) {
            console.error(err);
            alert("Failed to load permissions.");
        }
    };

    const loadAuditLogs = async (adminId) => {
        setAuditLoading(true);

        try {
            const res = await fetch(
                `${API_BASE.replace("/manage", "")}/audit?admin_id=${adminId}`,
                { headers: authHeaders }
            );

            const data = await res.json();
            setAuditLogs(data || []);
        } catch (err) {
            console.error(err);
            alert("Failed to load audit logs.");
        } finally {
            setAuditLoading(false);
        }
    };

    useEffect(() => {
        loadAdmins();
        loadRoles();
        loadPermissions();
    }, []);

    /* ---------------- FILTER ---------------- */

    const filteredAdmins = useMemo(() => {
        return admins.filter((a) => {
            const q = search.toLowerCase();

            const matchSearch =
                a.name?.toLowerCase().includes(q) ||
                a.email?.toLowerCase().includes(q);

            const matchRole =
                roleFilter === "ALL" ||
                a.role_name === roleFilter;

            const matchStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && a.is_active) ||
                (statusFilter === "INACTIVE" && !a.is_active);

            return matchSearch && matchRole && matchStatus;
        });
    }, [admins, search, roleFilter, statusFilter]);

    /* ---------------- ACTIONS ---------------- */

    const toggleStatus = async (admin) => {
        if (admin.email === MY_EMAIL) {
            alert("You cannot disable your own account.");
            return;
        }

        setBusyId(admin.admin_id);

        try {
            const res = await fetch(
                `${API_BASE}/admins/${admin.admin_id}/status`,
                {
                    method: "PATCH",
                    headers: jsonHeaders,
                    body: JSON.stringify({
                        is_active: !admin.is_active,
                    }),
                }
            );

            if (!res.ok) {
                alert(await safeMsg(res, "Action denied."));
                return;
            }

            loadAdmins();
        } catch {
            alert("Failed to update status.");
        } finally {
            setBusyId(null);
        }
    };

    const forceLogout = async (admin) => {
        if (!window.confirm(`Force logout ${admin.email}?`))
            return;

        setBusyId(admin.admin_id);

        try {
            const res = await fetch(
                `${API_BASE}/admins/${admin.admin_id}/force-logout`,
                {
                    method: "POST",
                    headers: authHeaders,
                }
            );

            if (!res.ok) {
                alert(await safeMsg(res, "Failed."));
                return;
            }

            alert("Admin logged out.");
        } catch {
            alert("Failed.");
        } finally {
            setBusyId(null);
        }
    };

    const deleteAdmin = async (admin) => {
        if (admin.email === MY_EMAIL) {
            alert("You cannot delete yourself.");
            return;
        }

        const txt = prompt(
            `Type DELETE to remove ${admin.email}`
        );

        if (txt !== "DELETE") return;

        setBusyId(admin.admin_id);

        try {
            const res = await fetch(
                `${API_BASE}/admins/${admin.admin_id}`,
                {
                    method: "DELETE",
                    headers: authHeaders,
                }
            );

            if (!res.ok) {
                alert(await safeMsg(res, "Delete failed."));
                return;
            }

            loadAdmins();
        } catch {
            alert("Delete failed.");
        } finally {
            setBusyId(null);
        }
    };

    const createAdmin = async () => {
        if (
            !newAdmin.name ||
            !newAdmin.email ||
            !newAdmin.role
        ) {
            alert("All fields are required.");
            return;
        }

        setCreating(true);

        try {
            const res = await fetch(`${API_BASE}/admins`, {
                method: "POST",
                headers: jsonHeaders,
                body: JSON.stringify(newAdmin),
            });

            if (!res.ok) {
                alert(await safeMsg(res, "Create failed."));
                return;
            }

            setShowCreate(false);
            setNewAdmin({
                name: "",
                email: "",
                role: "",
            });

            loadAdmins();
        } catch {
            alert("Create failed.");
        } finally {
            setCreating(false);
        }
    };

    const savePermissions = async () => {
        setSavingPerm(true);

        try {
            const selected = rolePermissions
                .filter((p) => p.enabled)
                .map((p) => p.permission_code);

            const res = await fetch(
                `${API_BASE}/roles/${editingRole}/permissions`,
                {
                    method: "PATCH",
                    headers: jsonHeaders,
                    body: JSON.stringify({
                        permissions: selected,
                    }),
                }
            );

            if (!res.ok) {
                alert(await safeMsg(res, "Save failed."));
                return;
            }

            alert("Permissions updated.");
            setShowRolePerm(false);
        } catch {
            alert("Save failed.");
        } finally {
            setSavingPerm(false);
        }
    };

    const isBusy = (id) => busyId === id;

    /* ---------------- UI ---------------- */

    return (
        <div className="admin-container">
            <div className="admin-card">

                {/* HEADER */}
                <div className="admin-header">
                    <div>
                        <h2>Admin Users</h2>
                        <p>
                            Manage roles, permissions &
                            security access
                        </p>
                    </div>

                    {ADMIN_ROLE === "SUPER_ADMIN" && (
                        <button
                            className="coupon-btn-primary"
                            onClick={() =>
                                setShowCreate(true)
                            }
                        >
                            <FaPlus /> Add Admin
                        </button>
                    )}
                </div>

                {/* FILTERS */}
                <div className="admin-filters">

                    <div className="search-box">
                        <FaSearch />

                        <input
                            placeholder="Search name or email..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    <select
                        className="admin-select"
                        value={roleFilter}
                        onChange={(e) =>
                            setRoleFilter(
                                e.target.value
                            )
                        }
                    >
                        <option value="ALL">
                            All Roles
                        </option>

                        {[...new Set(
                            admins.map(
                                (a) =>
                                    a.role_name
                            )
                        )].map((r) => (
                            <option
                                key={r}
                                value={r}
                            >
                                {r}
                            </option>
                        ))}
                    </select>

                    <select
                        className="admin-select"
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                    >
                        <option value="ALL">
                            All Status
                        </option>

                        <option value="ACTIVE">
                            Active
                        </option>

                        <option value="INACTIVE">
                            Inactive
                        </option>
                    </select>

                </div>

                {/* TABLE */}
                {loading ? (
                    <div className="loading">
                        Loading admins...
                    </div>
                ) : (


                    <table className="admin-table">

                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Last Login</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredAdmins.map(
                                (a) => (

                                    <tr
                                        key={
                                            a.admin_id
                                        }
                                    >

                                        {/* NAME */}
                                        <td>
                                            <div className="admin-name">

                                                <div className="avatar">
                                                    {a.name?.charAt(
                                                        0
                                                    )}
                                                </div>

                                                <span>
                                                    {a.name}
                                                </span>

                                            </div>
                                        </td>

                                        {/* EMAIL */}
                                        <td>
                                            {a.email}
                                        </td>

                                        {/* ROLE */}
                                        <td>

                                            <span
                                                className="role-badges"
                                                style={{
                                                    background:
                                                        ROLE_COLORS[
                                                        a
                                                            .role_name
                                                        ] ||
                                                        "#444"
                                                }}
                                            >
                                                <FaUserShield size={10} />
                                                {
                                                    a.role_name
                                                }
                                            </span>

                                            {ADMIN_ROLE ===
                                                "SUPER_ADMIN" &&
                                                a.role_name !==
                                                "SUPER_ADMIN" && (
                                                    <button
                                                        className="gear-btn"
                                                        onClick={() => {
                                                            setEditingRole(
                                                                a.role_name
                                                            );

                                                            loadRolePermissions(
                                                                a.role_name
                                                            );

                                                            setShowRolePerm(
                                                                true
                                                            );
                                                        }}
                                                    >
                                                        ⚙️
                                                    </button>
                                                )}

                                        </td>

                                        {/* STATUS */}
                                        <td>

                                            <span>
                                                {a.is_active ? "Active" : "Disabled"}
                                            </span>

                                        </td>

                                        {/* LOGIN */}
                                        <td>
                                            {a.last_login_at ||
                                                "—"}
                                        </td>

                                        {/* ACTIONS */}
                                        <td>

                                            <div className="action-group">

                                                {/* PROFILE */}
                                                <button
                                                    className="soft-btn soft-green"
                                                    title="Profile"
                                                    onClick={() => {
                                                        setProfileAdmin(a);
                                                        setShowProfile(true);
                                                    }}
                                                >
                                                    <FiUser />
                                                </button>

                                                {/* TOGGLE */}
                                                {ADMIN_ROLE ===
                                                    "SUPER_ADMIN" && (
                                                        <button
                                                            className="soft-btn soft-orange"
                                                            title="Enable / Disable"
                                                            onClick={() =>
                                                                toggleStatus(a)
                                                            }
                                                            disabled={isBusy(
                                                                a.admin_id
                                                            )}
                                                        >
                                                            {isBusy(
                                                                a.admin_id
                                                            ) ? (
                                                                <FaSpinner className="spin-icon" />
                                                            ) : (
                                                                <FiPower />
                                                            )}
                                                        </button>
                                                    )}

                                                {/* LOGOUT */}
                                                {ADMIN_ROLE ===
                                                    "SUPER_ADMIN" && (
                                                        <button
                                                            className="soft-btn soft-red"
                                                            title="Force Logout"
                                                            onClick={() =>
                                                                forceLogout(a)
                                                            }
                                                        >
                                                            <FiLogOut />
                                                        </button>
                                                    )}

                                                {/* DELETE */}
                                                {permissions.includes(
                                                    "MANAGE_ADMIN_USERS"
                                                ) &&
                                                    a.role_name !==
                                                    "SUPER_ADMIN" && (
                                                        <button
                                                            className="soft-btn soft-red"
                                                            title="Delete"
                                                            onClick={() =>
                                                                deleteAdmin(a)
                                                            }
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    )}

                                                {/* AUDIT */}
                                                <button
                                                    className="soft-btn soft-orange"
                                                    title="Audit Logs"
                                                    onClick={() => {
                                                        setAuditAdmin(a);
                                                        setShowAudit(true);
                                                        loadAuditLogs(
                                                            a.admin_id
                                                        );
                                                    }}
                                                >
                                                    <FiRotateCcw />
                                                </button>

                                            </div>
                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>


                )}

            </div>

            {/* PROFILE MODAL */}
            {showProfile &&
                profileAdmin && (
                    <div className="modal-overlay">

                        <div className="modal-box">

                            <div className="modal-head">
                                <h3>
                                    Admin Profile
                                </h3>

                                <button
                                    onClick={() =>
                                        setShowProfile(
                                            false
                                        )
                                    }
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="modal-body">

                                <div className="profile-grid">

                                    <div className="profile-label">
                                        Name
                                    </div>
                                    <div className="profile-value">
                                        {
                                            profileAdmin.name
                                        }
                                    </div>

                                    <div className="profile-label">
                                        Email
                                    </div>
                                    <div className="profile-value">
                                        {
                                            profileAdmin.email
                                        }
                                    </div>

                                    <div className="profile-label">
                                        Role
                                    </div>
                                    <div className="profile-value">
                                        {
                                            profileAdmin.role_name
                                        }
                                    </div>

                                    <div className="profile-label">
                                        Status
                                    </div>
                                    <div className="profile-value">
                                        {profileAdmin.is_active
                                            ? "ACTIVE"
                                            : "DISABLED"}
                                    </div>

                                    <div className="profile-label">
                                        Created At
                                    </div>
                                    <div className="profile-value">
                                        {profileAdmin.created_at ||
                                            "—"}
                                    </div>

                                    <div className="profile-label">
                                        Created By
                                    </div>
                                    <div className="profile-value">
                                        {profileAdmin.created_by ||
                                            "SYSTEM"}
                                    </div>

                                    <div className="profile-label">
                                        Last Login
                                    </div>
                                    <div className="profile-value">
                                        {profileAdmin.last_login_at ||
                                            "—"}
                                    </div>

                                    <div className="profile-label">
                                        IP Address
                                    </div>
                                    <div className="profile-value">
                                        {profileAdmin.last_login_ip ||
                                            "—"}
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>
                )}

            {/* CREATE MODAL */}
            {showCreate && (
                <div className="modal-overlay">

                    <div className="modal-box">

                        <div className="modal-head">

                            <h3>
                                Create New Admin
                            </h3>

                            <button
                                onClick={() =>
                                    setShowCreate(
                                        false
                                    )
                                }
                            >
                                <FaTimes />
                            </button>

                        </div>

                        <div className="modal-body">

                            <input
                                placeholder="Full Name"
                                value={newAdmin.name}
                                onChange={(e) =>
                                    setNewAdmin({
                                        ...newAdmin,
                                        name:
                                            e.target.value
                                    })
                                }
                            />

                            <input
                                placeholder="Email Address"
                                value={newAdmin.email}
                                onChange={(e) =>
                                    setNewAdmin({
                                        ...newAdmin,
                                        email:
                                            e.target.value
                                    })
                                }
                            />

                            <select
                                value={
                                    newAdmin.role
                                }
                                onChange={(e) =>
                                    setNewAdmin({
                                        ...newAdmin,
                                        role:
                                            e.target.value
                                    })
                                }
                            >
                                <option value="">
                                    Select Role
                                </option>

                                {roles.map(
                                    (r) => (
                                        <option
                                            key={
                                                r.role_name
                                            }
                                            value={
                                                r.role_name
                                            }
                                        >
                                            {
                                                r.role_name
                                            }
                                        </option>
                                    )
                                )}

                            </select>

                            <button
                                className="save-btn"
                                onClick={
                                    createAdmin
                                }
                                disabled={
                                    creating
                                }
                            >
                                {creating
                                    ? "Creating..."
                                    : "Create Admin"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {/* ROLE PERMISSION */}
            {showRolePerm && (
                <div className="modal-overlay">

                    <div className="modal-box large-modal">

                        <div className="modal-head">

                            <h3>
                                Permissions -{" "}
                                {
                                    editingRole
                                }
                            </h3>

                            <button
                                onClick={() =>
                                    setShowRolePerm(
                                        false
                                    )
                                }
                            >
                                <FaTimes />
                            </button>

                        </div>

                        <div className="modal-body">

                            <div className="permission-grid">

                                {rolePermissions.map(
                                    (
                                        p,
                                        i
                                    ) => (
                                        <label
                                            key={i}
                                            className="perm-row"
                                        >

                                            <span>
                                                {
                                                    p.permission_code
                                                }
                                            </span>

                                            <input
                                                type="checkbox"
                                                checked={
                                                    p.enabled
                                                }
                                                onChange={(
                                                    e
                                                ) => {
                                                    const arr =
                                                        [
                                                            ...rolePermissions
                                                        ];

                                                    arr[
                                                        i
                                                    ].enabled =
                                                        e
                                                            .target
                                                            .checked;

                                                    setRolePermissions(
                                                        arr
                                                    );
                                                }}
                                            />

                                        </label>
                                    )
                                )}

                            </div>

                            <button
                                className="save-btn"
                                onClick={
                                    savePermissions
                                }
                                disabled={
                                    savingPerm
                                }
                            >
                                {savingPerm
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {/* AUDIT LOGS */}
            {showAudit && (
                <div className="modal-overlay">

                    <div className="modal-box large-modal">

                        <div className="modal-head">

                            <h3>
                                Audit Logs -{" "}
                                {
                                    auditAdmin?.email
                                }
                            </h3>

                            <button
                                onClick={() =>
                                    setShowAudit(
                                        false
                                    )
                                }
                            >
                                <FaTimes />
                            </button>

                        </div>

                        <div className="modal-body">

                            {auditLoading ? (
                                <p>
                                    Loading logs...
                                </p>
                            ) : auditLogs.length ===
                                0 ? (
                                <p>
                                    No logs found.
                                </p>
                            ) : (
                                <table className="mini-table">

                                    <thead>
                                        <tr>
                                            <th>
                                                Action
                                            </th>
                                            <th>
                                                User
                                            </th>
                                            <th>IP</th>
                                            <th>
                                                Time
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {auditLogs.map(
                                            (
                                                log
                                            ) => (
                                                <tr
                                                    key={
                                                        log.audit_id
                                                    }
                                                >
                                                    <td>
                                                        {
                                                            log.action
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            log.performed_by
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            log.ip_address
                                                        }
                                                    </td>

                                                    <td>
                                                        {new Date(
                                                            log.created_at
                                                        ).toLocaleString()}
                                                    </td>
                                                </tr>
                                            )
                                        )}

                                    </tbody>

                                </table>
                            )}

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}