import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import "../css/approval-modern.css";
import { useNavigate } from "react-router-dom";



import {
  FaSearch,
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
  FaArrowLeft,
  FaList
} from "react-icons/fa";

// API Configuration
const API_ROOT = "http://192.168.2.9:5000/api";
const ADMIN_BASE = `${API_ROOT}/v1`;
export default function AdminRestaurantReview() {
  const ADMIN_TOKEN = localStorage.getItem("admin_token");
  const ADMIN_ROLE = (localStorage.getItem("admin_role") || "").toUpperCase();

  const isSuperAdmin = ADMIN_ROLE === "SUPER_ADMIN";
  const isSupportAdmin = ADMIN_ROLE === "SUPPORT_ADMIN";
  /* ===================================================== */
  /* ✅ ALL HOOKS FIRST — NO RETURNS ABOVE THIS LINE       */
  /* ===================================================== */

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
  const [showAllotModal, setShowAllotModal] = useState(false);
  const [supportAdmins, setSupportAdmins] = useState([]);
  const [selectedRestaurantForAllot, setSelectedRestaurantForAllot] =
    useState(null);
  const [assignLoading, setAssignLoading] = useState(false);

  const navigate = useNavigate();

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${ADMIN_TOKEN}` }),
    [ADMIN_TOKEN],
  );

  // Redirect effect (still a hook)
  useEffect(() => {
    if (!ADMIN_TOKEN) {
      window.location.href = "/admin/login";
    }
  }, [ADMIN_TOKEN]);

  // ---------- FETCH PENDING (hook-safe) ----------
  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.get(`${ADMIN_BASE}/admin/restaurants/pending`, {
        headers: authHeaders,
      });
      const restaurants = res.data?.items || [];

      if (!restaurants.length) {
        setMessage("No restaurants found.");
      } else {
        setMessage("");
      }

      if (isSuperAdmin) {
        const filtered = restaurants.filter((r) =>
          ["Pending", "Assigned", "Profile Completed", "Under Review"].includes(
            r.approval_status,
          ),
        );
        setItems(filtered);
      } else {
        const myAdminId = localStorage.getItem("admin_id");

        const mine = restaurants.filter(
          (r) => String(r.assigned_admin_id) === String(myAdminId),
        );

        const filtered = mine.filter((r) =>
          ["Assigned", "Profile Completed"].includes(r.approval_status),
        );

        setItems(filtered);
      }
    } catch (err) {
      console.error("FETCH ERROR:", err);
      setError(
        err?.response?.data?.error || "Failed to fetch pending restaurants.",
      );
    } finally {
      setLoading(false);
    }
  }, [authHeaders, isSuperAdmin]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  async function handleAutoAllocate() {
    if (!window.confirm("Auto allocate restaurants to support admins?")) return;

    setLoading(true);

    try {
      await axios.patch(
        `${ADMIN_BASE}/admin/restaurants/auto-assign`,
        {},
        { headers: authHeaders },
      );

      alert("Auto allocation completed");
      fetchPending();
    } catch (err) {
      alert(err?.response?.data?.error || "Auto allocation failed");
    } finally {
      setLoading(false);
    }
  }

  async function loadSupportAdmins() {
    if (!ADMIN_TOKEN) return;

    try {
      setAssignLoading(true);

      const res = await axios.get(`${ADMIN_BASE}/admin/admins/support`, {
        headers: authHeaders,
      });

      setSupportAdmins(res.data?.admins || []);
    } catch (err) {
      alert("Failed to load Support admins");
    } finally {
      setAssignLoading(false);
    }
  }

  useEffect(() => {
    if (!isSuperAdmin) return;
    if (!ADMIN_TOKEN) return;

    loadSupportAdmins();
  }, [isSuperAdmin, ADMIN_TOKEN]);

  /* ===================================================== */
  /* ✅ NOW you are allowed to guard/return                */
  /* ===================================================== */

  if (!ADMIN_TOKEN) {
    return <div>Redirecting to admin login...</div>;
  }

  const canApproveRestaurant = isSuperAdmin;
  const canSupportActions = isSupportAdmin; // backend enforces permission

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

      const res = await axios.get(`${ADMIN_BASE}/admin/restaurants/search`, {
        headers: authHeaders,
        params: { by: filterBy, value: filterValue.trim() },
      });

      const restaurants = res.data?.items || [];

      setItems(restaurants);
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
      const res = await axios.get(`${ADMIN_BASE}/admin/restaurant/${id}`, {
        headers: authHeaders,
      });

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
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="view-full-link"
            >
              View Full PDF
            </a>
          </div>
        ) : (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
          >
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
        { headers: authHeaders },
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

  const Field = ({ icon, label, value }) => (
    <div className="detail-item">
      <div className="d-icon">{icon}</div>
      <div className="d-label">{label}</div>
      <div className="d-sep">:</div>
      <div className="d-value">{value || "-"}</div>
    </div>
  );

  return (
    <div className="approve-container container form-container">
      {!selected ? (
        <>
          <div className="filter-card">
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

                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                >
                  <option value="">Filter Type</option>
                  <option value="id">ID</option>
                  <option value="name">Restaurant Name</option>
                  <option value="status">Status</option>
                </select>

                <div className="search-input-box">
                  <FaSearch className="search-icon" />
                  <input
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    placeholder="Search value..."
                  />
                </div>
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
            {loading && <p style={{ textAlign: "center" }}>Loading...</p>}

            <div className="table-card">
              <div className="table-card">

                {/* HEADER */}
                <div className="table-header">
                  <div className="table-title">

                    {/* ICON BOX */}
                    <div className="table-icon">
                      <FaList className="icon-style" />
                    </div>

                    {/* TEXT */}
                    <div className="table-heading-text">
                      <h3>Restaurant Table</h3>
                    </div>

                  </div>
                </div>

              </div>
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
                      <th>Assigned To</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.length ? (
                      items.map((r) => (
                        <tr key={r.restaurant_id}>

                          {/* ID */}
                          <td>
                            <div className="id-badge">{r.restaurant_id}</div>
                          </td>

                          {/* RESTAURANT */}
                          {/* RESTAURANT */}
                          <td>
                            <div className="restaurant-cell">
                              <div className="restaurant-icon">
                                <FaStore />
                              </div>
                              <span className="restaurant-name">
                                {r.restaurant_name_en}
                              </span>
                            </div>
                          </td>

                          {/* NAME */}
                          <td>{r.contact_person_name}</td>

                          {/* EMAIL */}
                          <td className="email-cell">
                            {r.contact_person_email}
                          </td>

                          {/* STATUS */}
                          <td>
                            <span className="status-badge">
                              ● {r.approval_status}
                            </span>
                          </td>

                          {/* CALL */}
                          <td>
                            <button
                              className="btn-call"
                              onClick={async () => {
                                const raw = r.contact_person_mobile;

                                if (!raw) {
                                  alert("No mobile number available.");
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
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                } catch { }

                                setTimeout(async () => {
                                  try {
                                    await navigator.clipboard.writeText(cleaned);
                                    alert(`📞 Number copied: ${cleaned}`);
                                  } catch {
                                    alert(`📞 Call manually: ${cleaned}`);
                                  }
                                }, 500);
                              }}
                            >
                              📞 Call
                            </button>
                          </td>

                          {/* EMAIL SEND */}
                          <td>
                            <button
                              className="btn-email"
                              onClick={async () => {
                                try {
                                  const res = await fetch(
                                    "http://192.168.2.9:5000/api/v1/admin/restaurants/send-excel-template",
                                    {
                                      method: "POST",
                                      headers: {
                                        Authorization: `Bearer ${ADMIN_TOKEN}`,
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        id: r.restaurant_id,
                                      }),
                                    },
                                  );

                                  const data = await res.json();

                                  if (!res.ok) {
                                    alert(data?.error || "Failed");
                                    return;
                                  }

                                  alert("📧 Excel template sent successfully.");
                                } catch {
                                  alert("Server error while sending Excel template.");
                                }
                              }}
                            >
                              📄 Send Excel Template
                            </button>
                          </td>

                          {/* ASSIGNED */}
                          <td>
                            <strong>{r.assigned_admin_name || "— Not Assigned —"}</strong>
                          </td>

                          {/* ACTION */}
                          <td>
                            <div className="table-actions">

                              <button
                                className="btn-review12"
                                disabled={isSupportAdmin && !r.assigned_admin_id}
                                onClick={() => viewDetails(r.restaurant_id)}
                              >
                                👁 Review
                              </button>

                              {isSuperAdmin && (
                                <button
                                  className="btn-warning12"
                                  onClick={() => {
                                    setSelectedRestaurantForAllot(r.restaurant_id);
                                    setShowAllotModal(true);
                                    loadSupportAdmins();
                                  }}
                                >
                                  🔄 Allot
                                </button>
                              )}

                              <button
                                className="btn-view-profile"
                                onClick={() =>
                                  navigate(`/admin/profile/restaurant/${r.restaurant_id}`)
                                }
                              >
                                👤 Profile
                              </button>

                            </div>
                          </td>

                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" style={{ textAlign: "center" }}>
                          No restaurants found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="back-button-container">
            <button
              className="back-btn"
              onClick={() => {
                setSelected(null);
                setSelectedId("");
              }}
            >
              <FaArrowLeft /> Back to Restaurant List
            </button>
          </div>

          <div className="review-container">
            <h2 className="page-title">Restaurant Registration Review</h2>

            <div className="review-content">
              <div className="info-grid">
                <div className="info-card">
                  <h3>Applicant Details</h3>

                  <div className="details-grid">
                    <Field
                      icon={<FaUser />}
                      label="Name"
                      value={selected.fullName}
                    />
                    <Field
                      icon={<FaEnvelope />}
                      label="Email"
                      value={selected.email}
                    />
                    <Field
                      icon={<FaPhone />}
                      label="Phone"
                      value={selected.phoneNumber}
                    />
                  </div>
                </div>

                <div className="info-card">
                  <h3>Restaurant Details</h3>

                  <div className="details-grid">
                    <Field
                      icon={<FaStore />}
                      label="Restaurant Name"
                      value={selected.restaurantName}
                    />
                    <Field
                      icon={<FaGlobe />}
                      label="Country"
                      value={selected.country}
                    />
                    <Field
                      icon={<FaMapMarkerAlt />}
                      label="City"
                      value={selected.city}
                    />
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
                    {renderFilePreview(
                      "vatCertificate",
                      selected.vatCertificate,
                    )}
                  </div>
                  <div className="doc-box">
                    <div className="doc-title">Food Safety Certificate</div>
                    {renderFilePreview(
                      "foodSafetyCertificate",
                      selected.foodSafetyCertificate,
                    )}
                  </div>
                </div>

                <div className="action-buttons">
                  {isSuperAdmin &&
                    selected?.approval_status?.toUpperCase() ===
                    "UNDER REVIEW" && (
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
                          <FaRedoAlt className="btn-icon btn-md" /> Request
                          Resubmission
                        </button>
                      </div>
                    )}

                  {isSupportAdmin && (
                    <div className="action-center">
                      {/* STEP 1 → ASSIGNED */}
                      {selected?.approval_status === "Assigned" && (
                        <button
                          className="btn-warning"
                          onClick={async () => {
                            try {
                              await axios.patch(
                                `${ADMIN_BASE}/admin/restaurant/${selected.restaurant_id}/complete-profile`,
                                {},
                                { headers: authHeaders },
                              );

                              alert("✅ Profile marked as completed");
                              setSelected(null);
                              setSelectedId("");
                              fetchPending();
                            } catch (err) {
                              alert(err?.response?.data?.error || "Failed");
                            }
                          }}
                        >
                          Mark Profile Completed
                        </button>
                      )}

                      {/* STEP 2 → PROFILE COMPLETED */}
                      {selected?.approval_status === "Profile Completed" && (
                        <button
                          className="btn-primary"
                          onClick={async () => {
                            try {
                              await axios.patch(
                                `${ADMIN_BASE}/admin/restaurant/${selected.restaurant_id}/send-to-review`,
                                {},
                                { headers: authHeaders },
                              );

                              alert("✅ Sent to Super Admin for review");
                              setSelected(null);
                              setSelectedId("");
                              fetchPending();
                            } catch (err) {
                              alert(err?.response?.data?.error || "Failed");
                            }
                          }}
                        >
                          Send to Super Admin for Final Verification
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {showReject && (
                  <div className="reject-box">
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <div className="action-row">
                      <button
                        className="btn btn-reject"
                        onClick={() => submitReview("reject", rejectReason)}
                      >
                        Confirm Reject
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setShowReject(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {showResubmit && (
                  <div className="reject-box">
                    <textarea
                      value={resubmitReason}
                      onChange={(e) => setResubmitReason(e.target.value)}
                    />
                    <div className="action-row">
                      <button
                        className="btn btn-warning"
                        onClick={() => submitReview("resubmit", resubmitReason)}
                      >
                        Confirm Resubmission
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setShowResubmit(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {showImage && (
        <div className="img-modal" onClick={() => setShowImage(false)}>
          <img src={imageSrc} alt="Preview" className="img-modal-content" />
        </div>
      )}
      {showAllotModal && (
        <div className="img-modal">
          <div className="form-card allot-modal">
            <h3>Allot to Support Admin</h3>

            {supportAdmins.length === 0 && <p>Loading admins...</p>}

            <table className="allot-table">
              <thead>
                <tr>
                  <th>Admin</th>
                  <th>Pending</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {supportAdmins.map((a) => (
                  <tr key={a.admin_id}>
                    <td>{a.name}</td>
                    <td>{a.pending}</td>

                    <td>
                      <div className="allot-actions">
                        <button
                          className="btn-primary"
                          disabled={assignLoading}
                          onClick={async () => {
                            setAssignLoading(true);

                            try {
                              await axios.patch(
                                `${ADMIN_BASE}/admin/restaurant/${selectedRestaurantForAllot}/assign`,
                                { admin_id: a.admin_id },
                                { headers: authHeaders },
                              );

                              alert(`Assigned to ${a.name}`);

                              setShowAllotModal(false);
                              setSelectedRestaurantForAllot(null);

                              fetchPending();
                            } catch (err) {
                              alert(
                                err?.response?.data?.error ||
                                "Assignment failed",
                              );
                            } finally {
                              setAssignLoading(false);
                            }
                          }}
                        >
                          Assign
                        </button>

                        <button
                          className="btn-reject"
                          disabled={assignLoading}
                          onClick={async () => {
                            setAssignLoading(true);

                            try {
                              await axios.patch(
                                `${ADMIN_BASE}/admin/restaurant/${selectedRestaurantForAllot}/assign`,
                                { admin_id: null },
                                { headers: authHeaders },
                              );

                              alert("Admin deassigned");

                              setShowAllotModal(false);
                              setSelectedRestaurantForAllot(null);

                              fetchPending();
                            } catch (err) {
                              alert(
                                err?.response?.data?.error || "Deassign failed",
                              );
                            } finally {
                              setAssignLoading(false);
                            }
                          }}
                        >
                          Deassign
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              className="btn-secondary modal-cancel"
              onClick={() => setShowAllotModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}