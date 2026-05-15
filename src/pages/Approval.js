import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import "../css/approval.css";
import { useNavigate } from "react-router-dom";

// API Configuration
const API_ROOT = "http://192.168.2.9:5000/api";
const ADMIN_BASE = `${API_ROOT}/v1`;
const ADMIN_TOKEN = "MAHAL-ADMIN-2025"; // Development only

export default function AdminReview() {
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

    // const authHeaders = { Authorization: `Bearer ${ADMIN_TOKEN}` };

    const authHeaders = useMemo(() => ({
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    }), []);

    const navigate = useNavigate();
    
    // ---------------------------------------------------------
    // Initial Fetch
    // ---------------------------------------------------------

    const fetchPending = useCallback(async () => {
        setLoading(true);
        setMessage("");
        setError("");

        try {
            const res = await axios.get(
                `${ADMIN_BASE}/admin/suppliers/pending`,
                { headers: authHeaders }
            );

            setItems(res.data?.items || []);
        } catch (err) {
            setError("Failed to fetch pending suppliers.");
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        fetchPending();
    }, [fetchPending]);

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

            setItems(res.data?.items || []);
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
        return `${ADMIN_BASE}/admin/supplier/${selected.supplier_id}/file/${fieldKey}?token=${ADMIN_TOKEN}`;
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
    // Approval Flow
    // ---------------------------------------------------------
    async function handleApprove() {
        if (!selected?.supplier_id) return;

if (!window.confirm("Approve supplier?")) {
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
    const Field = ({ label, value }) => (
        <div className="detail-item">
            <div className="d-label">{label}</div>
            <div className="d-sep">:</div>
            <div className="d-value">{value || "-"}</div>
        </div>
    );
    return (
        <div className="approve-container container form-container">

            {/* Heading */}
            <h2 style={{ color: "var(--primary)" }}>Admin • Supplier Review</h2>

            {/* Logic for showing either the Table or the Details */}
            {!selected ? (
                <>
                    {/* --- NEW WRAPPER TO FIX LAYOUT --- */}
                    <div className="search-section-wrapper">
                        <div className="search-bar">

                            <select
                                value={selectedId}
                                onChange={(e) => {
                                    const id = e.target.value;
                                    setSelectedId(id);
                                    id ? viewDetails(id) : setSelected(null);
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
                            <button className="btn-primary" onClick={handleSearch}>
                                Search
                            </button>
                            <button className="btn-secondary1" onClick={fetchPending}>
                                Reset
                            </button>
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
                                            <td>
                                                <button
                                                    className="btn btn-call"
                                                    onClick={() => {
                                                        window.location.href = `tel:${s.contact_person_mobile}`;
                                                    }}
                                                    >
                                                    📞 Call
                                                </button>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-warning"
                                                    onClick={async () => {
                                                        await fetch("http://192.168.2.9:5000/api/v1/admin/suppliers/send-excel-template", {
                                                        method: "POST",
                                                        headers: {
                                                            Authorization: `Bearer ${ADMIN_TOKEN}`,
                                                            "Content-Type": "application/json",
                                                        },
                                                        body: JSON.stringify({
                                                            role: "supplier",
                                                            id: s.supplier_id
                                                        }),
                                                        });

                                                        alert("📧 Excel template sent successfully");
                                                    }}
                                                    >
                                                    📄 Send Excel Template
                                                </button>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-review"
                                                    onClick={() => viewDetails(s.supplier_id)}
                                                >
                                                    Review
                                                </button>
                                                
                                                <button
                                                    className="btn-view-profile"
                                                    onClick={() =>
                                                        navigate(`/admin/profile/supplier/${s.supplier_id}`)
                                                    }
                                                    style={{ marginLeft: 8 }}
                                                    >
                                                    Profile
                                                </button>

                                                {/* <button
                                                    className="btn btn-warning"
                                                    onClick={async () => {
                                                        try {
                                                        const res = await fetch(
                                                            "http://192.168.2.9:5000/api/v1/admin/send-remaining-profile-mail",
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

                    <div className="form-card">

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
                        <h3>Supplier Registration Details</h3>
                        <div className="details-grid">
                            <Field label="Full Name" value={selected.fullName} />
                            <Field label="Company Name" value={selected.companyName} />
                            <Field label="Email" value={selected.email} />
                            <Field label="Phone Number" value={selected.phoneNumber} />
                            <Field label="Country" value={selected.country} />
                            <Field label="City" value={selected.city} />
                        </div>

                        <h3 style={{ marginTop: 20 }}>Documents</h3>
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

                        <div className="action-center">
                            <button onClick={handleApprove} className="btn-approve">Approve</button>
                            <button onClick={() => setShowReject(true)} className="btn-reject">Reject</button>
                            <button onClick={() => setShowResubmit(true)} className="btn-warning">Request Resubmission</button>
                        </div>

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
                </>
            )}

            {showImage && (
                <div className="img-modal" onClick={() => setShowImage(false)}>
                    <img src={imageSrc} alt="Preview" className="img-modal-content" />
                </div>
            )}
        </div>
    );
}