
import React, { useEffect, useState } from "react";
import { FaPowerOff, FaSignOutAlt, FaHistory } from "react-icons/fa";
import "../css/CouponManagement.css";
const API_BASE = "http://192.168.2.22:5000/api/v1/admin/monitor/supplier";

const TIMELINE_STEPS = [
  { key: "PLACED", label: "Order Placed" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "PACKED", label: "Packed" },
  { key: "DELIVERED", label: "Delivered" }
];

export default function SupplierMonitor() {
  const ADMIN_TOKEN = localStorage.getItem("admin_token");

  const btnStyle = {
    width: 34,
    height: 34,
    borderRadius: 4,
    border: "1px solid #bbb",
    background: "#eee",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    padding: 0
  };
  useEffect(() => {
    if (!ADMIN_TOKEN) {
      window.location.href = "/admin/login";
    }
  }, []);

  const headers = {
    Authorization: `Bearer ${ADMIN_TOKEN}`,
  };

  const loadReceipt = async (receiptId) => {
    const res = await fetch(`${API_BASE}/receipt/${receiptId}`, { headers });
    const data = await res.json();

    setSelectedReceipt(data);
    setShowReceiptModal(true); // 👈 IMPORTANT
  };
  /* =======================
     LIST VIEW
  ======================= */
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);



  const callOrderAction = async (orderId, action, payload = {}) => {
    const res = await fetch(
      `${API_BASE}/order/${orderId}/${action}`,
      {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Success");

    await loadOrder(orderId);
    loadSection(selectedSupplier.supplier_id, "orders", setOrders);
  };


  const cancelOrder = (id) => {
    const reason = prompt("Reason?");
    if (!reason) return;
    callOrderAction(id, "cancel", { reason });
  };

  const forceCompleteOrder = (id) => {
    callOrderAction(id, "complete");
  };

  const updateOrderStatus = (id) => {
    const status = prompt("Enter status").toUpperCase();
    callOrderAction(id, "update-status", { status });
  };



  /* =======================
     TABS & DATA
  ======================= */
  const [activeTab, setActiveTab] = useState("summary");
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 PASTE HERE
  const loadIssues = async (supplierId) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE}/${supplierId}/order-issues`,
        { headers }
      );

      const data = await res.json();

      setIssues(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error("Issues load failed:", err);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     SPLIT VIEW STATE
  ======================= */
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  /* =======================
     LOAD SUPPLIERS
  ======================= */
  useEffect(() => {
    fetch(`${API_BASE}/list`, { headers })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.clear();
          window.location.href = "/admin/login";
          return [];
        }

        if (res.status === 403) {
          // No permission → show blank list silently
          return [];
        }

        const data = await res.json();
        return Array.isArray(data) ? data : [];
      })
      .then(setSuppliers)
      .catch(err => {
        console.error("Supplier monitor load failed:", err);
        setSuppliers([]);
      });
  }, []);



  const loadSection = async (supplierId, section, setter) => {
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/${supplierId}/${section}`, {
        headers,
      });

      console.log("STATUS:", res.status);

      const data = await res.json();   // 👈 IMPORTANT: data ikkadey declare avuthundi

      console.log("DATA:", data);

      if (section === "orders" && Array.isArray(data)) {
        console.log("First Order:", data[0]);
      }

      if (section === "summary") {
        setter(data);
      } else {
        setter(Array.isArray(data) ? data : []);
      }

    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!selectedSupplier) return;
    const id = selectedSupplier.supplier_id;

    setSelectedOrder(null);
    setSelectedInvoice(null);
    if (activeTab === "summary") loadSection(id, "summary", setSummary);
    if (activeTab === "orders") loadSection(id, "orders", setOrders);
    if (activeTab === "products") loadSection(id, "products", setProducts);
    if (activeTab === "invoices") loadSection(id, "invoices", setInvoices);
    if (activeTab === "receipts") loadSection(id, "receipts", setReceipts);
    if (activeTab === "activity") loadSection(id, "activity", setActivity);

    // ✅ NEW TAB
    if (activeTab === "order-issues") loadIssues(id);

  }, [activeTab, selectedSupplier]);

  /* =======================
     LOAD ORDER (RIGHT PANEL)
  ======================= */
  const loadOrder = async (orderId) => {
    const res = await fetch(`${API_BASE}/order/${orderId}`, { headers });
    const data = await res.json();
    setSelectedOrder(data);
  };

  /* =======================
   LOAD INVOICE (POPUP)
======================= */
  const loadInvoice = async (invoiceId) => {
    try {
      setSelectedInvoice(null);

      const res = await fetch(`${API_BASE}/invoice/${invoiceId}`, { headers });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to load invoice");
        return;
      }

      setSelectedInvoice(data);
      setShowInvoiceModal(true); // 🔥 IMPORTANT

    } catch (err) {
      console.error(err);
      alert("Unable to load invoice");
    }
  };

  /* ======================================================
     SUPPLIER LIST VIEW
====================================================== */
  if (!selectedSupplier) {
    return (
      <div className="coupon-card">
        <h2>Supplier Monitoring</h2>

        <table className="coupon-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Supplier Code</th>
              <th>Company</th>
              <th>Email</th>
              <th>User Status</th>
              <th>Approval</th>
              <th>Registered</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {Array.isArray(suppliers) && suppliers.map((s, index) => (
              <tr key={s.supplier_id}>
                <td>{index + 1}</td>
                <td>SUP-{s.supplier_id}</td>
                <td><b>{s.company_name_english}</b></td>
                <td>{s.username}</td>
                <td>
                  <span
                    className={`coupon-badge ${s.user_status === "active"
                      ? "coupon-badge-code"
                      : "coupon-badge-danger"
                      }`}
                  >
                    {s.user_status}
                  </span>
                </td>

                <td>
                  <span
                    className={`coupon-badge ${s.approval_status === "Approved"
                      ? "coupon-badge-success"
                      : "coupon-badge-dark"
                      }`}
                  >
                    {s.approval_status}
                  </span>
                </td>

                <td>
                  {s.registered_at
                    ? new Date(s.registered_at).toLocaleDateString()
                    : "-"}
                </td>

                <td style={{ textAlign: "center" }}>
                  <button
                    className="coupon-btn coupon-btn-sm coupon-btn-warning"
                    onClick={() => setSelectedSupplier(s)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}

            {suppliers.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", color: "#999" }}>
                  No suppliers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  /* ======================================================
    DETAILS VIEW
====================================================== */
  return (
    <div className="coupon-card">

      {/* HEADER */}
      <div className="coupon-header">

        {/* LEFT TITLE */}
        <div>
          <h2>{selectedSupplier.company_name_english}</h2>

          <p><b>Email:</b> {selectedSupplier.username}</p>
          <p><b>Status:</b> {selectedSupplier.user_status}</p>
        </div>

        {/* RIGHT BUTTONS */}
        <div className="coupon-actions">

          {/* POWER */}
          <button
            className="icon-btn icon-btn-blue"
            title="Suspend / Activate"
            onClick={async () => {
              try {
                const userId = selectedSupplier?.user_id;
                if (!userId) return alert("User ID missing");

                const isActive = selectedSupplier.user_status === "active";

                let reason = null;
                if (isActive) {
                  reason = prompt("Reason for suspension (optional):");
                  if (reason === null) return;
                }

                const confirmMsg = isActive
                  ? "Are you sure you want to suspend this supplier?"
                  : "Activate this supplier?";

                if (!window.confirm(confirmMsg)) return;

                const newStatus = isActive ? "suspended" : "active";

                const res = await fetch(
                  `http://192.168.2.22:5000/api/v1/admin/suppliers/users/${userId}/status`,
                  {
                    method: "PATCH",
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      status: newStatus,
                      reason
                    })
                  }
                );

                const data = await res.json();

                if (!res.ok) {
                  alert(data.error || "Update failed ❌");
                  return;
                }

                setSelectedSupplier(prev => ({
                  ...prev,
                  user_status: newStatus
                }));

                alert("Status Updated ✅");

              } catch (err) {
                console.error(err);
                alert("Error updating status ❌");
              }
            }}
          >
            <FaPowerOff size={18} />
          </button>

          {/* LOGOUT */}
          <button
            className="icon-btn icon-btn-orange"
            title="Force Logout"
            onClick={async () => {
              try {
                const userId = selectedSupplier?.user_id;
                if (!userId) return alert("User ID missing");

                const confirmLogout = window.confirm(
                  `Force logout ${selectedSupplier.username}?`
                );

                if (!confirmLogout) return;

                const res = await fetch(
                  `http://192.168.2.22:5000/api/v1/admin/suppliers/users/${userId}/force-logout`,
                  {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("admin_token")}`
                    }
                  }
                );

                const data = await res.json();

                if (!res.ok) {
                  alert(data.error || "Logout failed ❌");
                  return;
                }

                alert("Supplier logged out ✅");

              } catch (err) {
                console.error(err);
                alert("Logout error ❌");
              }
            }}
          >
            <FaSignOutAlt size={18} />
          </button>

          {/* BACK */}
          <button
            className="back-btn"
            onClick={() => {
              setSelectedSupplier(null);   // ✅ FIXED
              setSelectedOrder(null);
              setSelectedInvoice(null);
            }}
          >
            ← Back
          </button>

        </div>
      </div>

      {/* TABS */}
      <div className="coupon-filters">
        {["summary", "orders", "products", "invoices", "receipts", "activity", "order-issues"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? "active" : ""}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {loading && <div>Loading…</div>}

      {/* ================= SUPPLIER SUMMARY ================= */}
      {/* {activeTab === "summary" && summary && ( */}
      {activeTab === "summary" && summary?.supplier_id && (
        <>
          {/* ================= SUPPLIER DETAILS ================= */}
          <table className="coupon-table">
            <tbody>
              <tr>
                <td colSpan="2" style={{ fontWeight: "bold", background: "#f5f5f5", padding: 10 }}>
                  Supplier Registration
                </td>
              </tr>

              <tr><td>Supplier ID</td><td>{summary.supplier_id}</td></tr>
              <tr><td>Company Name</td><td>{summary.company_name_english || "-"}</td></tr>
              <tr><td>Address</td><td>{summary.address || "-"}</td></tr>
              <tr><td>City</td><td>{summary.city || "-"}</td></tr>
              <tr><td>Contact Person</td><td>{summary.contact_person_name || "-"}</td></tr>
              <tr><td>Contact Email</td><td>{summary.contact_person_email || "-"}</td></tr>
              <tr><td>Contact Mobile</td><td>{summary.contact_person_mobile || "-"}</td></tr>
              <tr><td>Company Email</td><td>{summary.company_email || "-"}</td></tr>

              <tr>
                <td>Created At</td>
                <td>
                  {summary.created_at
                    ? new Date(summary.created_at).toLocaleString()
                    : "-"}
                </td>
              </tr>

              <tr><td>Assigned Admin</td><td>{summary.assigned_admin_id || "-"}</td></tr>
              <tr><td>Reviewed By Admin</td><td>{summary.reviewed_by_admin_id || "-"}</td></tr>
              <tr><td>Approval Status</td><td>{summary.approval_status || "-"}</td></tr>
            </tbody>
          </table>

          {/* ================= BRANCHES WITH STORES ================= */}
          <h3 style={{ marginTop: 30 }}>Supplier Branches</h3>

          {summary.branches && summary.branches.length === 0 && (
            <div>No branches found</div>
          )}

          {summary.branches && summary.branches.map((b, index) => (
            <div key={b.branch_id} style={{ marginBottom: 30 }}>

              {/* ===== BRANCH DETAILS ===== */}
              <table className="coupon-table">
                <tbody>
                  <tr>
                    <td colSpan="2" style={{ fontWeight: "bold", background: "#f5f5f5", padding: 10 }}>
                      Branch #{index + 1}
                    </td>
                  </tr>

                  <tr><td>Branch ID</td><td>{b.branch_id}</td></tr>
                  <tr><td>Supplier ID</td><td>{b.supplier_id}</td></tr>
                  <tr><td>Branch Name</td><td>{b.branch_name_english || "-"}</td></tr>
                  <tr><td>Manager</td><td>{b.branch_manager_name || "-"}</td></tr>
                  <tr><td>Contact</td><td>{b.contact_number || "-"}</td></tr>
                  <tr><td>Email</td><td>{b.email || "-"}</td></tr>
                  <tr><td>Street</td><td>{b.street || "-"}</td></tr>
                  <tr><td>Zone</td><td>{b.zone || "-"}</td></tr>
                  <tr><td>City</td><td>{b.city || "-"}</td></tr>
                  <tr><td>Country</td><td>{b.country || "-"}</td></tr>
                  <tr><td>License</td><td>{b.branch_license || "-"}</td></tr>
                </tbody>
              </table>

              {/* ===== STORES UNDER THIS BRANCH ===== */}
              <h4 style={{ marginTop: 15 }}>Stores Under This Branch</h4>

              {b.stores && b.stores.length === 0 && (
                <div>No stores found under this branch</div>
              )}

              {b.stores && b.stores.map((s, sIndex) => (
                <table key={s.store_id} className="table" style={{ marginBottom: 20 }}>
                  <tbody>
                    <tr>
                      <td colSpan="2" style={{ fontWeight: "bold", background: "#eaeaea", padding: 8 }}>
                        Store #{sIndex + 1}
                      </td>
                    </tr>

                    <tr><td>Store ID</td><td>{s.store_id}</td></tr>
                    <tr><td>Supplier ID</td><td>{s.supplier_id}</td></tr>
                    <tr><td>Store Name</td><td>{s.store_name_english || "-"}</td></tr>
                    <tr><td>Contact Person</td><td>{s.contact_person_name || "-"}</td></tr>
                    <tr><td>Mobile</td><td>{s.contact_person_mobile || "-"}</td></tr>
                    <tr><td>Email</td><td>{s.email || "-"}</td></tr>
                    <tr><td>Street</td><td>{s.street || "-"}</td></tr>
                    <tr><td>Zone</td><td>{s.zone || "-"}</td></tr>
                    <tr><td>City</td><td>{s.city || "-"}</td></tr>
                    <tr><td>Country</td><td>{s.country || "-"}</td></tr>
                  </tbody>
                </table>
              ))}

            </div>
          ))}
        </>
      )}



      {/* ================= ORDERS ================= */}
      {activeTab === "orders" && (
        <div className="coupon-layout">

          {/* LEFT LIST */}
          <div className="coupon-card">
            <div className="coupon-table-wrap">
              <table className="coupon-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Order ID</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o, idx) => (
                    <tr key={o.order_id}>
                      <td>{idx + 1}</td>
                      <td>{o.order_id}</td>
                      <td>
                        <span className="coupon-badge coupon-badge-info">
                          {o.status}
                        </span>
                      </td>
                      <td>{o.total_amount}</td>
                      <td>
                        <button
                          className="coupon-btn coupon-btn-sm coupon-btn-primary"
                          onClick={async () => {
                            await loadOrder(o.order_id);
                            setShowOrderModal(true);
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ================= MODAL (YOUR SAME UI) ================= */}
      {showOrderModal && selectedOrder?.header && (
        <div className="modal-overlay">
          <div className="modal-box large-modal">

            {/* HEADER */}
            <div className="modal-head">
              <h3>Order Details</h3>
              <button onClick={() => setShowOrderModal(false)}>✕</button>
            </div>

            {/* BODY */}
            <div className="modal-body">

              {/* ORDER SUMMARY */}
              <h3 className="coupon-section-title">Order Summary</h3>

              <div>Order ID: {selectedOrder.header.order_id}</div>
              <div>Status: {selectedOrder.header.status}</div>
              <div>Payment: {selectedOrder.header.payment_status}</div>
              <div>Total: {selectedOrder.header.total_amount}</div>
              <div>Remarks: {selectedOrder.header.remarks || "-"}</div>

              {/* RESTAURANT DETAILS */}
              <h4 className="coupon-section-title">Restaurant Details</h4>

              <div>Name: {selectedOrder.header.restaurant_name || "-"}</div>
              <div>Store: {selectedOrder.header.store_name_english || "-"}</div>
              <div>Contact: {selectedOrder.header.contact_person_name || "-"}</div>
              <div>Mobile: {selectedOrder.header.contact_person_mobile || "-"}</div>
              <div>Email: {selectedOrder.header.email || "-"}</div>

              <div>
                Address: {[
                  selectedOrder.header.shop_no,
                  selectedOrder.header.building,
                  selectedOrder.header.street,
                  selectedOrder.header.city
                ].filter(Boolean).join(", ") || "-"}
              </div>

              {/* PRODUCTS */}
              <h4 className="coupon-section-title">Products</h4>

              <div className="coupon-table-wrap">
                <table className="coupon-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Discount</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder?.items?.map((i, idx) => (
                      <tr key={idx}>
                        <td>{i.product_name_english}</td>
                        <td>{i.quantity}</td>
                        <td>{i.price_per_unit}</td>
                        <td>{i.discount}</td>
                        <td>{i.total_amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* TIMELINE */}
              <h4 className="coupon-section-title">Order Timeline</h4>
              <ul>
                {selectedOrder?.timeline?.map((t, idx) => (
                  <li key={idx}>
                    {t.status} — {t.changed_by_role} —{" "}
                    {new Date(t.changed_at).toLocaleString()}
                  </li>
                ))}
              </ul>

              {/* ORDER CONTROL CENTER */}
              <div className="coupon-card" style={{ marginTop: 20 }}>

                <h3 className="coupon-section-title">Order Control Center</h3>

                <div className="coupon-actions">

                  <button
                    onClick={() => cancelOrder(selectedOrder.header.order_id)}
                    className="coupon-btn coupon-btn-sm coupon-badge-danger"
                  >
                    Cancel Order
                  </button>

                  <button
                    onClick={() => forceCompleteOrder(selectedOrder.header.order_id)}
                    className="coupon-btn coupon-btn-sm coupon-btn-warning"
                  >
                    Force Complete
                  </button>

                  <button
                    onClick={() => updateOrderStatus(selectedOrder.header.order_id)}
                    className="coupon-btn coupon-btn-sm coupon-btn-warning"
                  >
                    Update Status
                  </button>

                </div>


                {/* ORDER INFO */}
                <div className="coupon-card" style={{ marginTop: 15 }}>

                  <div>
                    <b>Order ID:</b> {selectedOrder.header.order_id}
                  </div>

                  <div>
                    <b>Status:</b> {selectedOrder.header.status}
                  </div>

                  <div>
                    <b>Payment Status:</b> {selectedOrder.header.payment_status}
                  </div>

                </div>

              </div>

            </div>
          </div>
        </div>
      )}



      {/* ================= PRODUCTS ================= */}
      {activeTab === "products" && (
        <table className="coupon-table">
          <thead>
            <tr>
              <th>Product_ID</th>
              <th>Product_Name_English</th>
              <th>Price_per_Unit</th>
              <th>Stock_Availability</th>
              <th>Expiry_Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.product_id}>
                <td>{p.product_id}</td>
                <td>{p.product_name_english}</td>
                <td>{p.price_per_unit}</td>
                <td>{p.stock_availability}</td>
                <td>{p.expiry_date}</td>
                <td>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      background: p.flag === "Active" ? "#e6f4ea" : "#fdecea",
                      color: p.flag === "Active" ? "#2e7d32" : "#c62828"
                    }}
                  >
                    {p.flag}
                  </span>
                </td>

                <td>
                  <button
                    onClick={async () => {
                      try {
                        const confirmMsg =
                          p.flag === "Active"
                            ? "Deactivate this product?"
                            : "Activate this product?";

                        if (!window.confirm(confirmMsg)) return;

                        const res = await fetch(
                          `${API_BASE}/product/${p.product_id}/toggle`,
                          {
                            method: "POST",
                            headers
                          }
                        );

                        const data = await res.json();

                        if (!res.ok) {
                          alert(data.error || "Failed ❌");
                          return;
                        }

                        // ✅ Optimistic UI (faster than reload)
                        setProducts(prev =>
                          prev.map(prod =>
                            prod.product_id === p.product_id
                              ? {
                                ...prod,
                                flag: prod.flag === "Active" ? "Deactive" : "Active"
                              }
                              : prod
                          )
                        );

                      } catch (err) {
                        console.error(err);
                        alert("Error ❌");
                      }
                    }}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      cursor: "pointer",
                      background: "#b87f7f"
                    }}
                  >
                    {p.flag === "Active" ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ================= INVOICES ================= */}
      {activeTab === "invoices" && (
        <div className="coupon-card full-width-card">

          <div className="coupon-table-wrap">

            {/* LEFT LIST */}
            <div style={{ flex: 1 }}>
              <table className="coupon-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Invoice Number</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {invoices.map((i, idx) => (
                    <tr key={i.invoice_id}>
                      <td>{idx + 1}</td>
                      <td>{i.invoice_number || i.invoice_id}</td>
                      <td>{i.grand_total}</td>
                      <td>
                        <button
                          className="coupon-btn coupon-btn-sm coupon-btn-primary"
                          onClick={() => loadInvoice(i.invoice_id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>



          </div>
        </div>
      )}


      {/* ================= INVOICES ================= */}
      {showInvoiceModal && selectedInvoice?.header && (
        <div className="modal-overlay">
          <div className="modal-box invoice-full">

            {/* HEADER */}
            <div className="modal-head">
              <h3>Invoice Summary</h3>
              <button onClick={() => setShowInvoiceModal(false)}>✕</button>
            </div>

            {/* BODY */}
            <div className="modal-body">

              {/* SUMMARY */}
              <h3>Invoice Summary</h3>
              <div>Invoice No: {selectedInvoice.header.invoice_number}</div>
              <div>Status: {selectedInvoice.header.invoice_status}</div>
              <div>Payment: {selectedInvoice.header.payment_status}</div>
              <div>Subtotal: {selectedInvoice.header.subtotal_amount}</div>
              <div>Tax: {selectedInvoice.header.tax_amount}</div>
              <div>Total: {selectedInvoice.header.grand_total}</div>

              {/* SUPPLIER */}
              <h4 style={{ marginTop: 16 }}>Supplier Details</h4>
              {selectedInvoice.supplier && (
                <>
                  <div>Company Name : {selectedInvoice.supplier.supplier_name || "-"}</div>
                  <div>Store Name : {selectedInvoice.supplier.store_name_english || "-"}</div>
                  <div>Supplier Name : {selectedInvoice.supplier.contact_person_name || "-"}</div>
                  <div>Mobile : {selectedInvoice.supplier.contact_person_mobile || "-"}</div>
                  <div>Email : {selectedInvoice.supplier.contact_person_email || "-"}</div>
                  <div>
                    Address : {[
                      selectedInvoice.supplier.shop_no,
                      selectedInvoice.supplier.building,
                      selectedInvoice.supplier.street,
                      selectedInvoice.supplier.city
                    ].filter(Boolean).join(", ") || "-"}
                  </div>
                </>
              )}

              {/* RESTAURANT */}
              <h4 style={{ marginTop: 16 }}>Restaurant Details</h4>
              {selectedInvoice.restaurant && (
                <>
                  <div>Restaurant Name : {selectedInvoice.restaurant.restaurant_name || "-"}</div>
                  <div>Store Name : {selectedInvoice.restaurant.store_name || "-"}</div>
                  <div>Contact Name : {selectedInvoice.restaurant.contact_person_name || "-"}</div>
                  <div>Mobile : {selectedInvoice.restaurant.contact_person_mobile || "-"}</div>
                  <div>Email : {selectedInvoice.restaurant.contact_person_email || "-"}</div>
                  <div style={{ whiteSpace: "nowrap" }}>
                    Address: {[
                      selectedInvoice.restaurant.shop_no,
                      selectedInvoice.restaurant.building,
                      selectedInvoice.restaurant.street,
                      selectedInvoice.restaurant.city
                    ].filter(Boolean).join(", ") || "-"}
                  </div>
                </>
              )}

              {/* ITEMS */}
              <h4 style={{ marginTop: 16 }}>Invoice Items</h4>
              <table className="coupon-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Discount</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedInvoice?.items?.map((i, idx) => (
                    <tr key={idx}>
                      <td>{i.product_name_english}</td>
                      <td>{i.quantity}</td>
                      <td>{i.price_per_unit}</td>
                      <td>{i.discount}</td>
                      <td>{i.total_amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* PAYMENTS */}
              <h4 style={{ marginTop: 16 }}>Payment Details</h4>
              {(selectedInvoice.payments || []).length === 0 ? (
                <div>No payments recorded</div>
              ) : (
                selectedInvoice.payments.map((p, idx) => (
                  <div key={idx}>
                    {p.payment_method} — {p.paid_amount}
                  </div>
                ))
              )}

            </div>
          </div>
        </div>
      )}

      {/* ================= RECEIPTS TAB ================= */}
      {activeTab === "receipts" && (
        <div className="coupon-card">

          <h3 className="coupon-section-title">Receipts</h3>

          <div className="coupon-table-wrap">
            <table className="coupon-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Receipt ID</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {receipts.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", color: "#999" }}>
                      No receipts found
                    </td>
                  </tr>
                ) : (
                  receipts.map((r, idx) => (
                    <tr key={r.receipt_id}>
                      <td>{idx + 1}</td>
                      <td>{r.receipt_id}</td>
                      <td>{r.amount_received}</td>

                      <td>
                        <button
                          onClick={() => loadReceipt(r.receipt_id)}
                          className="coupon-btn coupon-btn-sm coupon-btn-primary"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}


      {/* ================= RECEIPT MODAL ================= */}
      {showReceiptModal && selectedReceipt?.header && (
        <div className="modal-overlay">
          <div className="modal-box large-modal">

            {/* HEADER */}
            <div className="modal-head">
              <h3>Receipt Summary</h3>
              <button onClick={() => setShowReceiptModal(false)}>✕</button>
            </div>

            {/* BODY */}
            <div className="modal-body">

              {/* SUMMARY */}
              <div>Receipt ID: {selectedReceipt.header.receipt_id}</div>
              <div>Date: {selectedReceipt.header.receipt_date}</div>
              <div>Amount Received: {selectedReceipt.header.amount_received}</div>
              <div>Payment Mode: {selectedReceipt.header.payment_mode}</div>
              <div>Reference: {selectedReceipt.header.reference_number}</div>
              <div>Status: {selectedReceipt.header.payment_status}</div>
              <div>Remarks: {selectedReceipt.header.remarks || "-"}</div>

              {/* SUPPLIER */}
              <h4 style={{ marginTop: 16 }}>Supplier Details</h4>
              {selectedReceipt?.supplier && (
                <>
                  <div>Company: {selectedReceipt.supplier.supplier_name || "-"}</div>
                  <div>Store: {selectedReceipt.supplier.store_name_english || "-"}</div>
                  <div>Supplier Name: {selectedReceipt.supplier.contact_person_name || "-"}</div>
                  <div>Mobile: {selectedReceipt.supplier.contact_person_mobile || "-"}</div>
                  <div>Email: {selectedReceipt.supplier.email || "-"}</div>
                  <div>
                    Address: {
                      [
                        selectedReceipt.supplier.shop_no,
                        selectedReceipt.supplier.building,
                        selectedReceipt.supplier.street,
                        selectedReceipt.supplier.city
                      ].filter(Boolean).join(", ") || "-"
                    }
                  </div>
                </>
              )}

              {/* RESTAURANT */}
              <h4 style={{ marginTop: 16 }}>Restaurant Details</h4>
              {selectedReceipt?.restaurant && (
                <>
                  <div>Restaurant: {selectedReceipt.restaurant.restaurant_name || "-"}</div>
                  <div>Store: {selectedReceipt.restaurant.store_name_english || "-"}</div>
                  <div>Contact: {selectedReceipt.restaurant.contact_person_name || "-"}</div>
                  <div>Mobile: {selectedReceipt.restaurant.contact_person_mobile || "-"}</div>
                  <div>Email: {selectedReceipt.restaurant.email || "-"}</div>
                  <div>
                    Address: {
                      [
                        selectedReceipt.restaurant.shop_no,
                        selectedReceipt.restaurant.building,
                        selectedReceipt.restaurant.street,
                        selectedReceipt.restaurant.city
                      ].filter(Boolean).join(", ") || "-"
                    }
                  </div>
                </>
              )}

              {/* ITEMS */}
              <h4 style={{ marginTop: 16 }}>Receipt Items</h4>

              <div className="coupon-table-wrap">
                <table className="coupon-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Discount</th>
                      <th>Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedReceipt.items?.length > 0 ? (
                      selectedReceipt.items.map((i, idx) => (
                        <tr key={idx}>
                          <td>{i.product_name_english}</td>
                          <td>{i.quantity}</td>
                          <td>{i.price_per_unit}</td>
                          <td>{i.discount}</td>
                          <td>{i.total_amount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", color: "#999" }}>
                          No items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
      )}
      {/* ================= ACTIVITY ================= */}
      {activeTab === "activity" && (
        <table className="coupon-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Entity</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {activity.map(a => (
              <tr key={a.audit_id}>
                <td>{a.action}</td>
                <td>{a.entity_type} / {a.entity_id}</td>
                <td>{a.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ================= ORDER ISSUES ================= */}
      {activeTab === "order-issues" && (
        <table className="coupon-table">
          <thead>
            <tr>
              <th>issue_report_id</th>
              <th>Order ID</th>
              <th>Restaurant ID</th>
              <th>Restaurant Name</th>
              <th>issue_type</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {issues.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "#999" }}>
                  No issues found
                </td>
              </tr>
            ) : (
              issues.map((i, idx) => (
                <tr key={i.issue_report_id}>
                  <td>{i.issue_report_id}</td>
                  <td>{i.order_id}</td>
                  <td>{i.restaurant_id}</td>
                  <td>{i.restaurant_name}</td>
                  <td>{i.issue_type}</td>
                  <td>{i.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

    </div>
  );
}