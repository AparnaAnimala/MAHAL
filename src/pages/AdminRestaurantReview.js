import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import "./css/approval.css";
import { useNavigate } from "react-router-dom";

// API Configuration
const API_ROOT = "http://192.168.2.22:5000/api";
const ADMIN_BASE = `${API_ROOT}/v1`;
const ADMIN_TOKEN = "MAHAL-ADMIN-2025"; // Dev only

export default function AdminRestaurantReview() {
    // Table + details
    const [items, setItems] = useState([]);
    const [selected, setSelected] = useState(null);

    // UI state
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Image preview
    const [showImage, setShowImage] = useState(false);
    const [imageSrc, setImageSrc] = useState("");

    // Search
    const [filterBy, setFilterBy] = useState("");
    const [filterValue, setFilterValue] = useState("");
    const [selectedId, setSelectedId] = useState("");

    // Reject / Resubmit
    const [showReject, setShowReject] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [showResubmit, setShowResubmit] = useState(false);
    const [resubmitReason, setResubmitReason] = useState("");
    const navigate = useNavigate();

    const authHeaders = useMemo(() => ({
        Authorization: `Bearer ${ADMIN_TOKEN}`
    }), []);
    // const authHeaders = { Authorization: `Bearer ${ADMIN_TOKEN}` };

    // useEffect(() => {
    //     fetchPending();
    // }, []);

    // async function fetchPending() {
    //     setLoading(true);
    //     setError("");
    //     setMessage("");

    //     try {
    //         const res = await axios.get(
    //             `${ADMIN_BASE}/admin/restaurants/pending`,
    //             { headers: authHeaders }
    //         );
    //         setItems(res.data?.items || []);
    //     } catch {
    //         setError("Failed to fetch pending restaurants.");
    //     } finally {
    //         setLoading(false);
    //     }
    // }
    const fetchPending = useCallback(async () => {
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await axios.get(
                `${ADMIN_BASE}/admin/restaurants/pending`,
                { headers: authHeaders }
            );
            setItems(res.data?.items || []);
        } catch {
            setError("Failed to fetch pending restaurants.");
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        fetchPending();
    }, [fetchPending]);

    // ---------------------------------------------------------
    // Search
    // ---------------------------------------------------------
    async function handleSearch() {
        setLoading(true);
        setSelected(null);
        setError("");
        setMessage("");

        try {
            if (!filterBy || !filterValue.trim()) {
                await fetchPending();
                return;
            }

            const res = await axios.get(
                `${ADMIN_BASE}/admin/restaurants/search`,
                {
                    headers: authHeaders,
                    params: { by: filterBy, value: filterValue.trim() },
                }
            );

            setItems(res.data?.items || []);
        } catch (err) {
            setError(err?.response?.data?.error || "Search failed.");
            setItems([]);
        } finally {
            setLoading(false);
        }
    }

    // ---------------------------------------------------------
    // View Details
    // ---------------------------------------------------------
    async function viewDetails(id) {
        if (!id) return;

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await axios.get(
                `${ADMIN_BASE}/admin/restaurant/${id}`,
                { headers: authHeaders }
            );

            setSelected(res.data?.data);
            setSelectedId(id);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch {
            setError("Failed to load restaurant details.");
        } finally {
            setLoading(false);
        }
    }

    // ---------------------------------------------------------
    // File URL
    // ---------------------------------------------------------
    function fileUrl(fieldKey) {
        if (!selected?.restaurant_id) return null;
        return `${ADMIN_BASE}/admin/restaurant/${selected.restaurant_id}/file/${fieldKey}?token=${ADMIN_TOKEN}`;
    }

    function renderFilePreview(fieldName, filename) {
        if (!filename || !selected?.restaurant_id) {
            return <div style={{ color: "#999", padding: 10 }}>No file uploaded</div>;
        }

        const url = fileUrl(fieldName);
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
        const isPdf = /\.pdf$/i.test(filename);

        return (
            <div className="file-container">
                {isImage ? (
                    <img
                        src={url}
                        alt={filename}
                        className="doc-img"
                        onClick={() => {
                            setImageSrc(url);
                            setShowImage(true);
                        }}
                        onError={(e) => {
                            e.target.src = "https://placehold.co/200x200?text=Error";
                        }}
                    />
                ) : isPdf ? (
                    <div className="pdf-preview-wrapper">
                        <iframe
                            title={filename}
                            src={`${url}#toolbar=0`}
                            className="doc-pdf"
                        />
                        <a href={url} target="_blank" rel="noreferrer" className="view-full-link">
                            View Full PDF
                        </a>
                    </div>
                ) : (
                    <a href={url} target="_blank" rel="noreferrer" className="btn-secondary">
                        Download
                    </a>
                )}
                <div className="filename-label">{filename}</div>
            </div>
        );
    }

    // ---------------------------------------------------------
    // Review Actions
    // ---------------------------------------------------------
    async function submitReview(action, reason = "") {
        setLoading(true);
        setError("");
        setMessage("");

        try {
            await axios.patch(
                `${ADMIN_BASE}/admin/restaurant/${selected.restaurant_id}/review`,
                { action, reason },
                { headers: authHeaders }
            );

            setMessage(`Restaurant ${action}ed successfully.`);
            setSelected(null);
            setSelectedId("");
            fetchPending();
        } catch (err) {
            setError(err?.response?.data?.error || "Action failed.");
        } finally {
            setLoading(false);
        }
    }

    const Field = ({ label, value }) => (
        <div className="detail-item">
            <div className="d-label">{label}</div>
            <div className="d-sep">:</div>
            <div className="d-value">{value || "-"}</div>
        </div>
    );

    return (
        <div className="approve-container container form-container">
            <h2 style={{ color: "var(--primary)" }}>Admin • Restaurant Review</h2>

            {!selected ? (
                <>
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
                                <option value="">-- Select Restaurant --</option>
                                {items.map((r) => (
                                    <option key={r.restaurant_id} value={r.restaurant_id}>
                                        {r.restaurant_id} • {r.restaurant_name_en}
                                    </option>
                                ))}
                            </select>

                            <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
                                <option value="">Filter Type</option>
                                <option value="id">ID</option>
                                <option value="name">Restaurant Name</option>
                                <option value="status">Status</option>
                            </select>

                            <input
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                                placeholder="Search value..."
                            />
                        </div>

                        <div className="approval_btn">
                            <button className="btn-primary" onClick={handleSearch}>Search</button>
                            <button className="btn-secondary1" onClick={fetchPending}>Reset</button>
                        </div>
                    </div>

                    {message && <p className="success">{message}</p>}
                    {error && <p className="error">{error}</p>}
                    {loading && <p style={{ textAlign: "center" }}>Loading...</p>}

                    <div className="Approvaltable">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Restaurant</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Call</th>
                                    <th>Email Send</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length ? (
                                    items.map((r) => (
                                        <tr key={r.restaurant_id}>
                                            <td>{r.restaurant_id}</td>
                                            <td>{r.restaurant_name_en}</td>
                                            <td>{r.contact_person_name}</td>
                                            <td>{r.contact_person_email}</td>
                                            <td>{r.approval_status}</td>
                                            <td>
                                                <button
                                                    className="btn btn-call"
                                                    onClick={() => {
                                                        window.location.href = `tel:${r.contact_person_mobile}`;
                                                    }}
                                                    >
                                                    📞 Call
                                                </button>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-warning"
                                                    onClick={async () => {
                                                    await fetch("http://192.168.2.22:5000/api/v1/admin/restaurants/send-excel-template", {
                                                        method: "POST",
                                                        headers: {
                                                        Authorization: `Bearer ${ADMIN_TOKEN}`,
                                                        "Content-Type": "application/json",
                                                        },
                                                        body: JSON.stringify({ id: r.restaurant_id }),
                                                    });
                                                    alert("📧 Excel template sent successfully");
                                                    }}
                                                >
                                                    📄 Send Excel Template
                                                </button>
                                            </td>
                                            <td>
                                                <button className="btn-review" onClick={() => viewDetails(r.restaurant_id)}>
                                                    Review
                                                </button>

                                                <button
                                                    className="btn-view-profile"
                                                    style={{ marginLeft: 8 }}
                                                    onClick={() =>
                                                        navigate(`/admin/profile/restaurant/${r.restaurant_id}`)
                                                    }
                                                    >
                                                    Profile
                                                </button>

                                                {/* <button
                                                    className="btn btn-warning"
                                                    style={{ marginLeft: 8 }}
                                                    onClick={async () => {
                                                        try {
                                                        const res = await fetch(
                                                            "http://192.168.2.22:5000/api/v1/admin/restaurants/send-remaining-profile-mail",
                                                            {
                                                            method: "POST",
                                                            headers: {
                                                                Authorization: `Bearer ${ADMIN_TOKEN}`,
                                                                "Content-Type": "application/json",
                                                            },
                                                            body: JSON.stringify({
                                                                id: r.restaurant_id,   // ✅ restaurant id only
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
                                        <td colSpan="6" style={{ textAlign: "center" }}>
                                            No restaurants found
                                        </td>
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
                            ← Back to Restaurant List
                        </span>
                    </div>

                    <div className="form-card">
                        <h3>Restaurant Registration Details</h3>

                        <div className="details-grid">
                            <Field label="Full Name" value={selected.fullName} />
                            <Field label="Restaurant Name" value={selected.restaurantName} />
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
                                <div className="doc-title">Food Safety Certificate</div>
                                {renderFilePreview("foodSafetyCertificate", selected.foodSafetyCertificate)}
                            </div>
                        </div>

                        <div className="action-center">
                            <button className="btn-approve" onClick={() => submitReview("approve")}>Approve</button>
                            <button className="btn-reject" onClick={() => setShowReject(true)}>Reject</button>
                            <button className="btn-warning" onClick={() => setShowResubmit(true)}>Request Resubmission</button>
                        </div>

                        {showReject && (
                            <div className="reject-box">
                                <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                                <button className="btn-reject" onClick={() => submitReview("reject", rejectReason)}>Confirm Reject</button>
                                <button className="btn-secondary" onClick={() => setShowReject(false)}>Cancel</button>
                            </div>
                        )}

                        {showResubmit && (
                            <div className="reject-box">
                                <textarea value={resubmitReason} onChange={(e) => setResubmitReason(e.target.value)} />
                                <button className="btn-warning1" onClick={() => submitReview("resubmit", resubmitReason)}>
                                    Confirm Resubmission
                                </button>
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