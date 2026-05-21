import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import "../css/approval-modern.css";
import { useNavigate } from "react-router-dom";
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaStore,
    FaGlobe,
    FaMapMarkerAlt,
    FaFileAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaRedoAlt,
    FaBuilding   // ✅ ADD THIS
} from "react-icons/fa";

// API Configuration
const API_ROOT = "http://192.168.2.22:5000/api";
const ADMIN_BASE = `${API_ROOT}/v1`;

export default function AdminReview() {
    const ADMIN_TOKEN = localStorage.getItem("admin_token");
    const ADMIN_ROLE = localStorage.getItem("admin_role"); // may be null

    const ADMIN_PERMS = JSON.parse(
        localStorage.getItem("admin_permissions") || "[]"
    );

    // SUPER ADMIN if they have ALL critical powers
    const isSuperAdmin =
        ADMIN_PERMS.includes("MANAGE_ADMIN_USERS") &&
        ADMIN_PERMS.includes("APPROVE_SUPPLIERS");

    const isOpsAdmin = ADMIN_ROLE === "OPS_ADMIN";




    /* =====================================================
       ✅ ALL HOOKS FIRST — NO RETURNS ABOVE THIS LINE
    ===================================================== */

    // Table + details state
    const [items, setItems] = useState([]);
    const [selected, setSelected] = useState(null);

    // UI state
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Image preview
    const [showImage, setShowImage] = useState(false);
    const [imageSrc, setImageSrc] = useState("");

    // Search controls
    const [filterBy, setFilterBy] = useState("");
    const [filterValue, setFilterValue] = useState("");
    const [selectedId, setSelectedId] = useState("");

    // Reject/Resubmit modals
    const [showReject, setShowReject] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    const [showResubmit, setShowResubmit] = useState(false);
    const [resubmitReason, setResubmitReason] = useState("");

    const [showAllotModal, setShowAllotModal] = useState(false);
    const [opsAdmins, setOpsAdmins] = useState([]);
    const [selectedSupplierForAllot, setSelectedSupplierForAllot] = useState(null);
    const [assignLoading, setAssignLoading] = useState(false);

    const authHeaders = useMemo(
        () => ({ Authorization: `Bearer ${ADMIN_TOKEN}` }),
        [ADMIN_TOKEN]
    );
    const navigate = useNavigate();
    // ─────────────────────────────────────────────
    // ✅ ALL HOOKS FIRST — NO RETURNS ABOVE HERE
    // ─────────────────────────────────────────────

    // Redirect effect (still a hook)
    useEffect(() => {
        if (!ADMIN_TOKEN) {
            window.location.href = "/admin/login";
        }
    }, [ADMIN_TOKEN]);

    // ---------- FETCH PENDING (HOOK-SAFE) ----------
    const fetchPending = useCallback(async () => {
        setLoading(true);
        setMessage("");
        setError("");

        try {
            const res = await axios.get(
                `${ADMIN_BASE}/admin/suppliers/pending`,
                { headers: authHeaders }
            );

            const suppliers = res.data?.items || [];

            if (isSuperAdmin) {
                const filtered = suppliers.filter(
                    s =>
                        ["Pending", "Assigned", "Profile Completed", "Under Review"].includes(s.approval_status)
                );

                setItems(filtered);
                return;
            }

            const myAdminId = localStorage.getItem("admin_id");
            const mine = suppliers.filter(
                s => String(s.assigned_admin_id) === String(myAdminId)
            );

            const filtered = mine.filter(
                s => ["Assigned", "Profile Completed"].includes(s.approval_status)
            );

            setItems(filtered);

            setMessage(
                filtered.length === 0
                    ? "No suppliers assigned to you yet."
                    : ""
            );
        } catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem("admin_token");
                localStorage.removeItem("admin_role");
                localStorage.removeItem("admin_permissions");
                window.location.href = "/admin/login";
                return;
            }

            setError("Failed to fetch pending suppliers.");
        } finally {
            setLoading(false);
        }
    }, [authHeaders, isSuperAdmin]);

    // Run on mount
    useEffect(() => {
        fetchPending();
    }, [fetchPending]);

    // ---------- LOAD OPS ADMINS (HOOK-SAFE) ----------
    async function loadOpsAdmins() {
        try {
            setAssignLoading(true);

            const res = await axios.get(
                `${ADMIN_BASE}/admin/admins/ops`,
                { headers: authHeaders }
            );

            setOpsAdmins(res.data?.admins || []);
        } catch (err) {
            alert("Failed to load OPS admins");
        } finally {
            setAssignLoading(false);
        }
    }

    useEffect(() => {
        if (isSuperAdmin) {
            loadOpsAdmins();
        }
    }, [isSuperAdmin]);

    // ─────────────────────────────────────────────
    // ✅ ONLY NOW you are allowed to guard/return
    // ─────────────────────────────────────────────
    if (!ADMIN_TOKEN) {
        return <div>Redirecting to admin login...</div>;
    }

    const canApproveSupplier = isSuperAdmin;

    // ---------- AUTO ALLOCATE (UNCHANGED LOGIC) ----------
    async function handleAutoAllocate() {
        if (!window.confirm("Auto-allocate all pending suppliers?")) return;

        setLoading(true);

        try {
            await axios.patch(
                `${ADMIN_BASE}/admin/suppliers/auto-assign`,
                {},
                { headers: authHeaders }
            );

            alert("Auto-allocation completed. Refreshing assignments.");
            await fetchPending();
        } catch (err) {
            alert(err?.response?.data?.error || "Auto-allocation failed.");
        } finally {
            setLoading(false);
        }
    }

    // ---------------------------------------------------------
    // Search Logic
    // ---------------------------------------------------------
    async function handleSearch() {
        setLoading(true);
        setSelected(null);
        setError("");
        setMessage("");

        try {
            if (!filterBy || !filterValue.trim()) {
                return fetchPending();
            }

            const params = { by: filterBy, value: filterValue.trim() };
            // Assuming a '/suppliers/search' endpoint exists on the backend
            const res = await axios.get(`${ADMIN_BASE}/admin/suppliers/search`, {
                headers: authHeaders,
                params,
            });

            const results = res.data?.items || [];

            if (!isSuperAdmin) {
                const myAdminId = localStorage.getItem("admin_id");

                const mine = results.filter(
                    s => String(s.assigned_admin_id) === String(myAdminId)
                );

                setItems(mine);
            } else {
                setItems(results);
            }

        } catch (err) {
            setError(err?.response?.data?.error || "Search failed.");
            setItems([]);
        } finally {
            setLoading(false);
        }
    }



    // ---------------------------------------------------------
    // View Supplier Details
    // ---------------------------------------------------------
    async function viewDetails(id) {
        if (!id) return;

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await axios.get(`${ADMIN_BASE}/admin/supplier/${id}`, {
                headers: authHeaders,
            });

            setSelected(res.data?.data);
            setSelectedId(id);

            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch {
            setError("Failed to load supplier details.");
        } finally {
            setLoading(false);
        }
    }

    // ---------------------------------------------------------
    // File URL Builder
    // ---------------------------------------------------------
    function fileUrl(fieldKey) {
        if (!selected?.supplier_id) return null;
        const token = localStorage.getItem("admin_token");
        return `${ADMIN_BASE}/admin/supplier/${selected.supplier_id}/file/${fieldKey}?token=${token}`;
    }


    function renderFilePreview(fieldName, filename) {
        if (!filename || !selected?.supplier_id) {
            return <div style={{ color: "#999", padding: "10px" }}>No file uploaded</div>;
        }

        const url = fileUrl(fieldName);
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
        const isPdf = /\.pdf$/i.test(filename);

        return (
            <div className="file-container">
                {isImage ? (
                    /* Image Preview (Now includes WebP) */
                    <img
                        src={url}
                        alt={filename}
                        className="doc-img"
                        style={{ cursor: "pointer", maxWidth: "100%", borderRadius: "8px" }}
                        onClick={() => {
                            setImageSrc(url);
                            setShowImage(true);
                        }}
                        onError={(e) => {
                            e.target.src = "https://placehold.co/200x200?text=Error+Loading+Image";
                        }}
                    />
                ) : isPdf ? (
                    /* PDF Preview */
                    <div className="pdf-preview-wrapper">
                        <iframe
                            title={filename}
                            src={`${url}#toolbar=0`} // #toolbar=0 hides the chrome UI inside the small box
                            className="doc-pdf"
                            width="100%"
                            height="200px"
                        />
                        <a href={url} target="_blank" rel="noreferrer" className="view-full-link">
                            View Full PDF
                        </a>
                    </div>
                ) : (
                    /* Fallback for other files */
                    <a href={url} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: '12px' }}>
                        Download {filename.split('.').pop().toUpperCase()}
                    </a>
                )}
                <div className="filename-label">{filename}</div>
            </div>
        );
    }

    // ---------------------------------------------------------
    // Metadata for Patch requests
    // ---------------------------------------------------------
    function supplierMetadataPayload() {
        if (!selected) return {};

        return {
            supplier_id: selected.supplier_id,
            contact_person_email: selected.email || "",
            contact_person_mobile: selected.phoneNumber || "",
        };
    }

    // ---------------------------------------------------------
    // OPS ADMIN → MARK PROFILE AS COMPLETED
    // ---------------------------------------------------------
    async function handleProfileCompleted() {

        if (!selected?.supplier_id) return;

        if (!window.confirm("Mark profile as completed?")) {
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {

            await axios.patch(
                `${ADMIN_BASE}/admin/supplier/${selected.supplier_id}/complete-profile`,
                {},
                { headers: authHeaders }
            );

            setMessage("✅ Profile marked as completed.");

            setSelected(null);
            setSelectedId("");

            fetchPending();

        } catch (err) {

            setError(
                err?.response?.data?.error ||
                "Failed to mark profile completed"
            );

        } finally {
            setLoading(false);
        }

    }

    // ---------------------------------------------------------
    // OPS ADMIN → SEND TO SUPER ADMIN FOR FINAL REVIEW
    // ---------------------------------------------------------
    async function handleSendToReview() {
        if (!selected?.supplier_id) return;

        if (!window.confirm("Send supplier to Super Admin for final verification?")) {
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {

            await axios.patch(
                `${ADMIN_BASE}/admin/supplier/${selected.supplier_id}/send-to-review`,
                {},
                { headers: authHeaders }
            );

            setMessage("✅ Sent to Super Admin for final verification.");

            setSelected(null);
            setSelectedId("");

            fetchPending();

        } catch (err) {

            setError(
                err?.response?.data?.error ||
                "Failed to send to Super Admin"
            );

        } finally {
            setLoading(false);
        }
    }

    // ---------------------------------------------------------
    // Approval Flow
    // ---------------------------------------------------------
    async function handleApprove() {

        if (!isSuperAdmin) {
            setError("Only Super Admin can approve");
            return;
        }

        if (!selected?.supplier_id) {
            setError("No supplier selected");
            return;
        }


        setLoading(true);
        setError("");
        setMessage("");

        try {
            const payload = {
                action: "approve",
                ...supplierMetadataPayload(),
            };

            await axios.patch(
                `${ADMIN_BASE}/admin/supplier/${selected.supplier_id}/review`,
                payload,
                { headers: authHeaders }
            );

            setMessage("✅ Supplier approved.");
            setSelected(null);
            setSelectedId("");

            fetchPending();
        } catch (err) {
            setError(err?.response?.data?.error || "Approve failed.");
        } finally {
            setLoading(false);
        }
    }

    // ---------------------------------------------------------
    // Reject Flow
    // ---------------------------------------------------------
    async function handleRejectSubmit() {
        if (!rejectReason.trim()) return setError("Rejection reason required.");

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const payload = {
                action: "reject",
                reason: rejectReason,
                ...supplierMetadataPayload(),
            };

            await axios.patch(
                `${ADMIN_BASE}/admin/supplier/${selected.supplier_id}/review`,
                payload,
                { headers: authHeaders }
            );

            setMessage("❌ Supplier rejected.");
            setShowReject(false);
            setSelected(null);
            setSelectedId("");

            fetchPending();
        } catch (err) {
            setError(err?.response?.data?.error || "Reject failed.");
        } finally {
            setLoading(false);
        }
    }

    // ---------------------------------------------------------
    // Resubmit Flow
    // ---------------------------------------------------------
    async function handleResubmitSubmit() {
        if (!resubmitReason.trim()) {
            return setError("Resubmission reason required.");
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const payload = {
                action: "resubmit",
                reason: resubmitReason,
                ...supplierMetadataPayload(),
            };

            await axios.patch(
                `${ADMIN_BASE}/admin/supplier/${selected.supplier_id}/review`,
                payload,
                { headers: authHeaders }
            );

            setMessage("⚠️ Resubmission requested.");
            setShowResubmit(false);
            setSelected(null);
            setSelectedId("");

            fetchPending();
        } catch (err) {
            setError(err?.response?.data?.error || "Resubmit failed.");
        } finally {
            setLoading(false);
        }
    }

    // ---------------------------------------------------------
    // Field Component (Label : Value)
    // ---------------------------------------------------------
    const Field = ({ icon, label, value }) => (
        <div className="detail-item">

            {/* ICON */}
            <div className="d-icon">{icon}</div>

            {/* LABEL */}
            <div className="d-label">{label}</div>

            {/* COLON */}
            <div className="d-sep">:</div>

            {/* VALUE */}
            <div className="d-value">{value || "-"}</div>

        </div>
    );
    return (
        <div className="approve-container container form-container">

            {/* Logic for showing either the Table or the Details */}
            {!selected ? (
                <>
                    {/* --- NEW WRAPPER TO FIX LAYOUT --- */}
                    <div className="search-section-wrapper">
                        <div className="search-bar">

                            <select
                                value={selectedId || ""}
                                onChange={(e) => {
                                    const id = e.target.value || "";
                                    setSelectedId(id);

                                    if (!id) {
                                        setSelected(null);
                                        return;
                                    }
                                    viewDetails(id);
                                }}
                            >

                                <option value="">-- Select Supplier --</option>
                                {items.map((s) => (
                                    <option key={s.supplier_id} value={s.supplier_id}>
                                        {s.supplier_id} • {s.company_name_en}
                                    </option>
                                ))}
                            </select>

                            <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
                                <option value="">Filter Type</option>
                                <option value="id">ID</option>
                                <option value="name">Company Name</option>
                                <option value="status">Status</option>
                            </select>

                            <input
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                                placeholder="Search value..."
                            />
                        </div>

                        <div className="approval_btn">
                            <button className="btn btn-primary" onClick={handleSearch}>
                                Search
                            </button>

                            <button className="btn btn-secondary1" onClick={fetchPending}>
                                Reset
                            </button>

                            {isSuperAdmin && (
                                <button
                                    className="btn btn-warning"
                                    onClick={handleAutoAllocate}
                                >
                                    ⚡ Auto Allocate
                                </button>
                            )}

                        </div>

                    </div>

                    {message && <p className="success">{message}</p>}
                    {error && <p className="error">{error}</p>}
                    {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}

                    <div className="Approvaltable">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Company</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Call</th>
                                    <th>Assigned To</th>
                                    <th>Email Send</th>

                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length > 0 ? (
                                    items.map((s) => (
                                        <tr key={s.supplier_id}>
                                            <td>{s.supplier_id}</td>
                                            <td>{s.company_name_en}</td>
                                            <td>{s.contact_person_name}</td>
                                            <td>{s.contact_person_email}</td>
                                            <td>{s.approval_status}</td>

                                            {/* CALL COLUMN */}
                                            <td>
                                                <button
                                                    className="btn btn-call"
                                                    onClick={async () => {
                                                        const raw = s.contact_person_mobile;

                                                        if (!raw) {
                                                            alert("No mobile number available for this supplier.");
                                                            return;
                                                        }

                                                        const cleaned = String(raw)
                                                            .replace(/\s+/g, "")
                                                            .replace(/[^0-9+]/g, "");

                                                        if (!cleaned || cleaned.length < 8) {
                                                            alert("Invalid mobile number format.");
                                                            return;
                                                        }

                                                        try {
                                                            const a = document.createElement("a");
                                                            a.href = `tel:${cleaned}`;
                                                            a.style.display = "none";
                                                            document.body.appendChild(a);
                                                            a.click();
                                                            document.body.removeChild(a);
                                                        } catch (e) {
                                                            console.warn("tel: navigation failed", e);
                                                        }

                                                        setTimeout(async () => {
                                                            try {
                                                                await navigator.clipboard.writeText(cleaned);
                                                                alert(`📞 Number copied: ${cleaned}`);
                                                            } catch {
                                                                alert(`📞 Call this number manually: ${cleaned}`);
                                                            }
                                                        }, 500);
                                                    }}
                                                >
                                                    📞 Call
                                                </button>
                                            </td>

                                            {/* ASSIGNED TO COLUMN (SUPER ADMIN VISIBILITY) */}
                                            <td>
                                                {s.assigned_admin_name
                                                    ? <strong>{s.assigned_admin_name}</strong>
                                                    : "— Not Assigned —"}
                                            </td>

                                            {/* EMAIL SEND COLUMN */}
                                            <td>
                                                {true && (
                                                    <button
                                                        className="btn btn-warning"
                                                        onClick={async () => {
                                                            try {
                                                                const res = await fetch(
                                                                    "http://192.168.2.22:5000/api/v1/admin/suppliers/send-excel-template",
                                                                    {
                                                                        method: "POST",
                                                                        headers: {
                                                                            Authorization: `Bearer ${ADMIN_TOKEN}`,
                                                                            "Content-Type": "application/json",
                                                                        },
                                                                        body: JSON.stringify({
                                                                            role: "supplier",
                                                                            id: s.supplier_id,
                                                                        }),
                                                                    }
                                                                );

                                                                const data = await res.json();

                                                                if (res.status === 401) {
                                                                    localStorage.removeItem("admin_token");
                                                                    window.location.href = "/admin/login";
                                                                    return;
                                                                }

                                                                if (res.status === 403) {
                                                                    alert("❌ You are not authorized.");
                                                                    return;
                                                                }

                                                                if (!res.ok) {
                                                                    alert(data?.error || "Failed to send Excel template.");
                                                                    return;
                                                                }

                                                                alert("📧 Excel template sent successfully.");
                                                            } catch (err) {
                                                                console.error(err);
                                                                alert("Server error while sending Excel template.");
                                                            }
                                                        }}
                                                    >
                                                        📄 Send Excel Template
                                                    </button>
                                                )}
                                            </td>

                                            {/* ACTION COLUMN */}
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className="btn-review12"
                                                        onClick={() => viewDetails(s.supplier_id)}
                                                    >
                                                        Review
                                                    </button>
                                                    {isSuperAdmin && (
                                                        <button
                                                            className="btn-warning12"
                                                            onClick={async () => {
                                                                setSelectedSupplierForAllot(s.supplier_id);
                                                                setShowAllotModal(true);
                                                                loadOpsAdmins();
                                                            }}
                                                        >
                                                            Allot
                                                        </button>
                                                    )}


                                                    <button
                                                        className="btn-view-profile"
                                                        onClick={() =>
                                                            navigate(`/admin/profile/supplier/${s.supplier_id}`)
                                                        }
                                                    >
                                                        Profile
                                                    </button>

                                                    {/* <button
                                                    className="btn btn-warning"
                                                    onClick={async () => {
                                                        try {
                                                        const res = await fetch(
                                                            "http://192.168.2.22:5000/api/v1/admin/send-remaining-profile-mail",
                                                            {
                                                            method: "POST",
                                                            headers: {
                                                                Authorization: `Bearer ${ADMIN_TOKEN}`,
                                                                "Content-Type": "application/json",
                                                            },
                                                            body: JSON.stringify({
                                                                role: "supplier",
                                                                id: s.supplier_id,   // ✅ CORRECT
                                                            }),
                                                            }
                                                        );

                                                        const data = await res.json();

                                                        if (!res.ok) {
                                                            alert(data.message || "Failed to send mail");
                                                            return;
                                                        }

                                                        alert("📧 Remaining profile details email sent successfully");
                                                        } catch (err) {
                                                        console.error(err);
                                                        alert("Server error while sending email");
                                                        }
                                                    }}
                                                    >
                                                    📧 Request Remaining Details
                                                </button> */}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: "center" }}>No suppliers found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <>
                    <div className="back-button-container">
                        <span
                            className="back-btn"
                            onClick={() => {
                                setSelected(null);
                                setSelectedId("");
                            }}
                        >
                            ← Back to Supplier List
                        </span>
                    </div>

                    <div className="review-container">

                        <h2 className="page-title">Supplier Registration Review</h2>

                        <div className="review-content">

                            <div className="info-grid">

                                {/* APPLICANT DETAILS */}
                                <div className="info-card">
                                    <h3>Applicant Details</h3>


                                    <h3>Supplier Registration Details</h3>
                                    <div className="details-grid">
                                        <Field icon={<FaUser />} label="Full Name" value={selected.fullName} />
                                        <Field icon={<FaEnvelope />} label="Email" value={selected.email} />
                                        <Field icon={<FaPhone />} label="Phone Number" value={selected.phoneNumber} />
                                    </div>
                                </div>

                                {/* SUPPLIER DETAILS */}
                                <div className="info-card">
                                    <h3>Supplier Details</h3>

                                    <div className="details-grid">
                                        <Field icon={<FaBuilding />} label="Company Name" value={selected.companyName} />
                                        <Field icon={<FaGlobe />} label="Country" value={selected.country} />
                                        <Field icon={<FaMapMarkerAlt />} label="City" value={selected.city} />
                                    </div>
                                </div>
                            </div>
                            <div className="documents-section">

                                <h3 className="doc-heading">Documents</h3>

                                <div className="documents-grid">

                                    <div className="doc-box">
                                        <div className="doc-title">Trade License</div>
                                        {renderFilePreview("tradeLicense", selected.tradeLicense)}
                                    </div>

                                    <div className="doc-box">
                                        <div className="doc-title">VAT Certificate</div>
                                        {renderFilePreview("vatCertificate", selected.vatCertificate)}
                                    </div>

                                    <div className="doc-box">
                                        <div className="doc-title">CR Copy</div>
                                        {renderFilePreview("crCopy", selected.crCopy)}
                                    </div>

                                    <div className="doc-box">
                                        <div className="doc-title">Computer Card Copy</div>
                                        {renderFilePreview("computerCardCopy", selected.computerCardCopy)}
                                    </div>

                                </div>

                            </div>

                            {/* SUPER ADMIN BUTTONS */}
                            {isSuperAdmin &&
                                ["Under Review"].includes(selected?.approval_status) && (
                                    <div className="action-buttons">

                                        <button
                                            className="btn btn-approve"
                                            onClick={() => submitReview("approve")}
                                        >
                                            <FaCheckCircle className="btn-icon btn-md" /> Approve
                                        </button>

                                        <button
                                            className="btn btn-reject"
                                            onClick={() => setShowReject(true)}
                                        >
                                            <FaTimesCircle className="btn-icon btn-md" /> Reject
                                        </button>

                                        <button
                                            className="btn btn-warning"
                                            onClick={() => setShowResubmit(true)}
                                        >
                                            <FaRedoAlt className="btn-icon btn-md" /> Request Resubmission
                                        </button>

                                    </div>
                                )}

                            {/* OPS ADMIN SEND TO SUPER ADMIN */}
                            {/* OPS ADMIN ACTIONS */}
                            {isOpsAdmin && (
                                <div className="action-center">

                                    {/* PROFILE COMPLETED BUTTON */}
                                    {selected?.approval_status === "Assigned" && isOpsAdmin && (
                                        <button
                                            onClick={handleProfileCompleted}
                                            className="btn-warning"
                                        >
                                            Mark Profile Completed
                                        </button>
                                    )}

                                    {/* SEND TO SUPER ADMIN BUTTON */}
                                    {selected?.approval_status === "Profile Completed" && isOpsAdmin && (
                                        <button
                                            onClick={handleSendToReview}
                                            className="btn-primary"
                                        >
                                            Send to Super Admin for Final Verification
                                        </button>
                                    )}

                                </div>
                            )}




                            {showReject && (
                                <div className="reject-box">
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Reason for rejection..."
                                    />
                                    <button onClick={handleRejectSubmit} className="btn-reject">Confirm Reject</button>
                                    <button className="btn-secondary" onClick={() => setShowReject(false)}>Cancel</button>
                                </div>
                            )}

                            {showResubmit && (
                                <div className="reject-box">
                                    <textarea
                                        value={resubmitReason}
                                        onChange={(e) => setResubmitReason(e.target.value)}
                                        placeholder="Enter reason for resubmission..."
                                    />
                                    <button onClick={handleResubmitSubmit} className="btn-warning1">Confirm Resubmission</button>
                                    <button className="btn-secondary" onClick={() => setShowResubmit(false)}>Cancel</button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {showAllotModal && (
                <div className="img-modal">
                    <div className="form-card">
                        <h3>Allot to OPS Admin</h3>

                        {opsAdmins.length === 0 && <p>Loading admins...</p>}

                        <table >
                            <thead>
                                <tr>
                                    <th>Admin</th>
                                    <th>Pending</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {opsAdmins.map((a) => (
                                    <tr key={a.admin_id}>
                                        <td>{a.name}</td>
                                        <td>{a.pending}</td>
                                        <td>
                                            <button
                                                className="btn-primary"
                                                disabled={assignLoading}
                                                onClick={async () => {
                                                    setAssignLoading(true);
                                                    try {
                                                        await axios.patch(
                                                            `${ADMIN_BASE}/admin/supplier/${selectedSupplierForAllot}/assign`,
                                                            { admin_id: a.admin_id },
                                                            { headers: authHeaders }
                                                        );

                                                        alert(`Assigned to ${a.name}`);
                                                        setShowAllotModal(false);
                                                        fetchPending();
                                                    } catch (err) {
                                                        alert(err?.response?.data?.error || "Assignment failed");
                                                    } finally {
                                                        setAssignLoading(false);
                                                    }
                                                }}
                                            >
                                                Assign
                                            </button>

                                            {/* NEW: DEASSIGN BUTTON */}
                                            <button
                                                className="btn-reject"
                                                disabled={assignLoading}
                                                onClick={async () => {
                                                    setAssignLoading(true);
                                                    try {
                                                        await axios.patch(
                                                            `${ADMIN_BASE}/admin/supplier/${selectedSupplierForAllot}/assign`,
                                                            { admin_id: null },
                                                            { headers: authHeaders }
                                                        );

                                                        alert("Admin de-assigned");
                                                        setShowAllotModal(false);
                                                        fetchPending();
                                                    } catch (err) {
                                                        alert(err?.response?.data?.error || "De-assign failed");
                                                    } finally {
                                                        setAssignLoading(false);
                                                    }
                                                }}
                                            >
                                                Deassign
                                            </button>
                                        </td>
                                    </tr>

                                ))}
                            </tbody>
                        </table>

                        <button
                            className="btn-secondary"
                            onClick={() => setShowAllotModal(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}


            {showImage && (
                <div className="img-modal" onClick={() => setShowImage(false)}>
                    <img src={imageSrc} alt="Preview" className="img-modal-content" />
                </div>
            )}
        </div>
    );
}