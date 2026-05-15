
import React, { useEffect, useState } from "react";
import "../css/CouponManagement.css";
import {
  FiShoppingBag,
  FiCreditCard,
  FiRotateCcw,
  FiShoppingCart,
  FiCheckCircle,
  FiEye,
  FiPaperclip,
  FiLock,
  FiFileText,
  FiX
} from "react-icons/fi";

const API = "http://192.168.2.9:5000/api/admin/supplier-payments";

export default function AdminSupplierPayments() {

  const token = localStorage.getItem("admin_token");

  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);

  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("BANK");
  const [reference, setReference] = useState("");
  const [remarks, setRemarks] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [payments, setPayments] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [showRestaurantView, setShowRestaurantView] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [searchOrder, setSearchOrder] = useState("");
  const [restaurantFilter, setRestaurantFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [minDue, setMinDue] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [paidOrders, setPaidOrders] = useState([]);
  const [showPaid, setShowPaid] = useState(false);
  const [activeTab, setActiveTab] = useState("PENDING");
  // PENDING filters
  const [pendingSearch, setPendingSearch] = useState("");
  const [pendingRestaurant, setPendingRestaurant] = useState(null);
  const [pendingPaymentStatus, setPendingPaymentStatus] = useState("ALL");
  const [pendingOrderStatus, setPendingOrderStatus] = useState("ALL");
  const [pendingMinDue, setPendingMinDue] = useState("");

  // PAID filters
  const [paidSearch, setPaidSearch] = useState("");
  const [paidRestaurant, setPaidRestaurant] = useState(null);
  const [paidPaymentStatus, setPaidPaymentStatus] = useState("ALL");

  const loadPaidOrders = async (supplierId) => {
    const res = await fetch(`${API}/paid-orders/${supplierId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    setPaidOrders(Array.isArray(data) ? data : []);
  };
  const uniqueRestaurants = [
    ...new Map(
      orders.map(o => [Number(o.restaurant_id), o])
    ).values()
  ];

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {

    const res = await fetch(`${API}/suppliers`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    setSuppliers(Array.isArray(data) ? data : []);
  };

  const loadPayments = async (supplierId) => {

    const res = await fetch(`${API}/history/${supplierId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    setPayments(Array.isArray(data) ? data : []);
  };


  const loadOrders = async (supplierId) => {

    const res = await fetch(`${API}/orders/${supplierId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    setOrders(Array.isArray(data) ? data : []);
    setSelectedOrders([]);
  };


  const toggleOrder = (o) => {

    if (o.status !== "DELIVERED") {
      alert("Only DELIVERED orders can be paid");
      return;
    }

    if (selectedOrders.includes(o.order_id)) {
      setSelectedOrders(selectedOrders.filter(id => id !== o.order_id));
    } else {
      setSelectedOrders([...selectedOrders, o.order_id]);
    }
  };


  const totalSelected = orders
    .filter(o => selectedOrders.includes(o.order_id))
    .reduce((sum, o) => sum + Number(o.supplier_due_amount), 0);


  const paySupplier = async () => {

    if (!selectedSupplier) return alert("Select supplier");

    const form = new FormData();

    form.append("supplier_id", selectedSupplier.supplier_id);
    form.append("order_ids", JSON.stringify(selectedOrders));
    form.append("amount", amount || totalSelected);
    form.append("payment_mode", paymentMode);
    form.append("reference_no", reference);
    form.append("remarks", remarks);

    if (receipt) form.append("receipt", receipt);

    try {

      const res = await fetch(`${API}/pay`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: form
      });

      const data = await res.json();

      if (data.success) {

        alert("Payment Successful");

        // ✅ FULL AUTO REFRESH
        await loadSuppliers();
        await loadOrders(selectedSupplier.supplier_id);
        await loadPaidOrders(selectedSupplier.supplier_id);

        setSelectedOrders([]);
        setAmount("");
        setReference("");
        setRemarks("");
        setReceipt(null);

      } else {

        alert(data.error || "Error");

      }

    } catch (err) {

      alert("Network Error");

    }
  };

  const downloadReceipt = async (paymentId) => {

    const res = await fetch(`${API}/receipt/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      alert("Download failed");
      return;
    }

    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt_${paymentId}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const downloadPaymentPDF = async (paymentId) => {

    const res = await fetch(
      `${API}/payment-pdf/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!res.ok) {
      alert("PDF generation failed");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Supplier_Payment_${paymentId}.pdf`;
    a.click();

    window.URL.revokeObjectURL(url);
  };

  const loadRestaurants = async (supplierId) => {

    const res = await fetch(`${API}/restaurants/${supplierId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    setRestaurants(Array.isArray(data) ? data : []);
  };

  const getRestaurantId = (o) =>
    o.restaurant_id ||
    o.restaurantId ||
    o.rest_id ||
    o.restaurant?.restaurant_id;

  const filteredOrders = orders.filter(o => {

    if (searchOrder && !String(o.order_id).includes(searchOrder))
      return false;

    const restId = getRestaurantId(o);

    if (
      restaurantFilter !== null &&
      String(restId) !== String(restaurantFilter)
    )
      return false;

    if (
      paymentStatusFilter !== "ALL" &&
      o.supplier_payment_status !== paymentStatusFilter
    )
      return false;

    if (
      orderStatusFilter !== "ALL" &&
      o.status !== orderStatusFilter
    )
      return false;

    if (
      minDue &&
      Number(o.supplier_due_amount) < Number(minDue)
    )
      return false;

    return true;
  });

  const filteredPaidOrders = paidOrders.filter(o => {

    if (paidSearch && !String(o.order_id).includes(paidSearch))
      return false;

    const restId = getRestaurantId(o);

    if (
      paidRestaurant !== null &&
      String(restId) !== String(paidRestaurant)
    )
      return false;

    if (
      paidPaymentStatus !== "ALL" &&
      o.supplier_payment_status !== paidPaymentStatus
    )
      return false;

    return true;
  });

  const filteredPendingOrders = orders.filter(o => {

    if (pendingSearch && !String(o.order_id).includes(pendingSearch))
      return false;

    const restId = getRestaurantId(o);

    if (
      pendingRestaurant !== null &&
      String(restId) !== String(pendingRestaurant)
    )
      return false;

    if (
      pendingPaymentStatus !== "ALL" &&
      o.supplier_payment_status !== pendingPaymentStatus
    )
      return false;

    if (
      pendingOrderStatus !== "ALL" &&
      o.status !== pendingOrderStatus
    )
      return false;

    if (
      pendingMinDue &&
      Number(o.supplier_due_amount) < Number(pendingMinDue)
    )
      return false;

    return true;
  });

  return (
    <div className="supplier-payment-page">

      {/* HEADER */}
      <div className="sp-header">
        <span className="sp-line"></span>
        <h2>
          Supplier Credit Payments
        </h2>
        <span className="sp-line"></span>
      </div>

      {/* SUPPLIER SELECT */}
      <div className="sp-card sp-top-card">

        <label className="sp-label">
          <FiShoppingBag className="sp-title-icon" />
          Select Supplier
        </label>


        <select
          className="sp-input"
          onChange={(e) => {
            const sup = suppliers.find(
              s =>
                s.supplier_id ==
                e.target.value
            );

            setSelectedSupplier(sup);

            if (sup) {
              loadOrders(
                sup.supplier_id
              );
              loadPayments(
                sup.supplier_id
              );
              loadRestaurants(
                sup.supplier_id
              );
              loadPaidOrders(
                sup.supplier_id
              );
            }
          }}
        >
          <option value="">
            -- Select Supplier --
          </option>

          {suppliers.map(s => (
            <option
              key={s.supplier_id}
              value={s.supplier_id}
            >
              {s.supplier_name} — Due
              QAR {s.total_due}
            </option>
          ))}
        </select>

      </div>

      {selectedSupplier && (

        <div className="sp-grid">

          {/* LEFT SECTION */}
          <div className="sp-left">

            {/* FILTER CARD */}
            <div className="sp-card mb-3">

              <div className="row g-3">

                {activeTab ===
                  "PENDING" && (
                    <>
                      <div className="col-md-3">
                        <label className="sp-label">
                          Search
                        </label>

                        <input
                          className="sp-input"
                          value={
                            pendingSearch
                          }
                          onChange={(
                            e
                          ) =>
                            setPendingSearch(
                              e.target
                                .value
                            )
                          }
                        />
                      </div>

                      <div className="col-md-3">
                        <label className="sp-label">
                          Restaurant
                        </label>

                        <select
                          className="sp-input"
                          value={
                            pendingRestaurant ??
                            ""
                          }
                          onChange={(
                            e
                          ) =>
                            setPendingRestaurant(
                              e.target
                                .value
                                ? Number(
                                  e
                                    .target
                                    .value
                                )
                                : null
                            )
                          }
                        >
                          <option value="">
                            All
                          </option>

                          {restaurants.map(
                            r => (
                              <option
                                key={
                                  r.restaurant_id
                                }
                                value={
                                  r.restaurant_id
                                }
                              >
                                {
                                  r.restaurant_name_english
                                }
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div className="col-md-2">
                        <label className="sp-label">
                          Payment
                        </label>

                        <select
                          className="sp-input"
                          value={
                            pendingPaymentStatus
                          }
                          onChange={(
                            e
                          ) =>
                            setPendingPaymentStatus(
                              e.target
                                .value
                            )
                          }
                        >
                          <option value="ALL">
                            All
                          </option>
                          <option value="UNPAID">
                            Unpaid
                          </option>
                          <option value="PARTIAL">
                            Partial
                          </option>
                        </select>
                      </div>

                      <div className="col-md-2">
                        <label className="sp-label">
                          Order
                        </label>

                        <select
                          className="sp-input"
                          value={
                            pendingOrderStatus
                          }
                          onChange={(
                            e
                          ) =>
                            setPendingOrderStatus(
                              e.target
                                .value
                            )
                          }
                        >
                          <option value="ALL">
                            All
                          </option>
                          <option value="PLACED">
                            Placed
                          </option>
                          <option value="OUT_FOR_DELIVERY">
                            Out
                          </option>
                          <option value="DELIVERED">
                            Delivered
                          </option>
                        </select>
                      </div>

                      <div className="col-md-2">
                        <label className="sp-label">
                          Min Due
                        </label>

                        <input
                          className="sp-input"
                          value={
                            pendingMinDue
                          }
                          onChange={(
                            e
                          ) =>
                            setPendingMinDue(
                              e.target
                                .value
                            )
                          }
                        />
                      </div>

                      <div className="col-md-12">
                        <button
                          className="sp-reset-btn"
                          onClick={() => {
                            setPendingSearch(
                              ""
                            );
                            setPendingRestaurant(
                              null
                            );
                            setPendingPaymentStatus(
                              "ALL"
                            );
                            setPendingOrderStatus(
                              "ALL"
                            );
                            setPendingMinDue(
                              ""
                            );
                          }}
                        >
                          <>
                            <FiRotateCcw className="me-2" />
                            Reset Filters
                          </>
                        </button>
                      </div>
                    </>
                  )}

                {activeTab ===
                  "PAID" && (
                    <>
                      <div className="col-md-4">
                        <label className="sp-label">
                          Search
                        </label>

                        <input
                          className="sp-input"
                          value={
                            paidSearch
                          }
                          onChange={(
                            e
                          ) =>
                            setPaidSearch(
                              e.target
                                .value
                            )
                          }
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="sp-label">
                          Restaurant
                        </label>

                        <select
                          className="sp-input"
                          value={
                            paidRestaurant ??
                            ""
                          }
                          onChange={(
                            e
                          ) =>
                            setPaidRestaurant(
                              e.target
                                .value
                                ? Number(
                                  e
                                    .target
                                    .value
                                )
                                : null
                            )
                          }
                        >
                          <option value="">
                            All
                          </option>

                          {restaurants.map(
                            r => (
                              <option
                                key={
                                  r.restaurant_id
                                }
                                value={
                                  r.restaurant_id
                                }
                              >
                                {
                                  r.restaurant_name_english
                                }
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="sp-label">
                          Status
                        </label>

                        <select
                          className="sp-input"
                          value={
                            paidPaymentStatus
                          }
                          onChange={(
                            e
                          ) =>
                            setPaidPaymentStatus(
                              e.target
                                .value
                            )
                          }
                        >
                          <option value="ALL">
                            All
                          </option>
                          <option value="PAID">
                            Paid
                          </option>
                        </select>
                      </div>

                      <div className="col-md-12">
                        <button
                          className="sp-reset-btn"
                          onClick={() => {
                            setPaidSearch(
                              ""
                            );
                            setPaidRestaurant(
                              null
                            );
                            setPaidPaymentStatus(
                              "ALL"
                            );
                          }}
                        >
                          Reset Filters
                        </button>
                      </div>
                    </>
                  )}

              </div>

            </div>

            {/* TABS */}
            <div className="sp-tabs">

              <button
                className={`sp-tab ${activeTab ===
                  "PENDING"
                  ? "active-orange"
                  : ""
                  }`}
                onClick={() =>
                  setActiveTab(
                    "PENDING"
                  )
                }
              >
                <>
                  <FiShoppingCart className="me-2" />
                  Pending Orders
                </>
              </button>

              <button
                className={`sp-tab ${activeTab ===
                  "PAID"
                  ? "active-green"
                  : ""
                  }`}
                onClick={() =>
                  setActiveTab(
                    "PAID"
                  )
                }
              >
                <>
                  <FiCheckCircle className="me-2" />
                  Paid Orders
                </>
              </button>

            </div>

            {/* TABLE */}
            <div className="sp-card">

              <h5 className="sp-card-title">
                {activeTab ===
                  "PENDING"
                  ? "Pending Credit Orders"
                  : "Paid Credit Orders"}
              </h5>



              <table className="sp-table">

                <thead>
                  <tr>
                    {activeTab ===
                      "PENDING" && (
                        <th></th>
                      )}

                    <th>Order</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Due</th>
                    <th>Status</th>

                    {activeTab ===
                      "PENDING" && (
                        <th>
                          Order Status
                        </th>
                      )}

                    {activeTab ===
                      "PENDING" && (
                        <th>
                          Action
                        </th>
                      )}
                  </tr>
                </thead>

                <tbody>

                  {(activeTab ===
                    "PENDING"
                    ? filteredPendingOrders
                    : filteredPaidOrders
                  ).map(o => (
                    <tr
                      key={
                        o.order_id
                      }
                    >
                      {activeTab ===
                        "PENDING" && (
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedOrders.includes(
                                o.order_id
                              )}
                              onChange={() =>
                                toggleOrder(
                                  o
                                )
                              }
                            />
                          </td>
                        )}

                      <td>{o.order_id}</td>

                      <td>
                        QAR{" "}
                        {o.total_amount}
                      </td>

                      <td>
                        QAR{" "}
                        {
                          o.supplier_paid_amount
                        }
                      </td>

                      <td className="text-danger fw-bold">
                        QAR{" "}
                        {
                          o.supplier_due_amount
                        }
                      </td>

                      <td>
                        <span
                          className={
                            o.supplier_payment_status ===
                              "PAID"
                              ? "sp-badge green"
                              : "sp-badge orange"
                          }
                        >
                          {
                            o.supplier_payment_status
                          }
                        </span>
                      </td>

                      {activeTab ===
                        "PENDING" && (
                          <td>
                            <span
                              className={
                                o.status ===
                                  "DELIVERED"
                                  ? "sp-badge green"
                                  : o.status ===
                                    "OUT_FOR_DELIVERY"
                                    ? "sp-badge orange"
                                    : "sp-badge red"
                              }
                            >
                              {o.status}
                            </span>
                          </td>
                        )}

                      {activeTab ===
                        "PENDING" && (
                          <td>
                            <button
                              className="sp-view-btn"
                              onClick={() =>
                                setViewOrder(
                                  o
                                )
                              }
                            >
                              <>
                                <FiEye className="me-1" />
                                View
                              </>
                            </button>
                          </td>
                        )}
                    </tr>
                  ))}

                  {(activeTab ===
                    "PENDING"
                    ? filteredPendingOrders
                    : filteredPaidOrders
                  ).length ===
                    0 && (
                      <tr>
                        <td
                          colSpan="8"
                          className="text-center py-4"
                        >
                          No{" "}
                          {activeTab ===
                            "PENDING"
                            ? "pending"
                            : "paid"}{" "}
                          orders
                        </td>
                      </tr>
                    )}

                </tbody>

              </table>



            </div>

          </div>

          {/* RIGHT PANEL */}
          <div className="sp-right">

            <div className="sp-card sticky-top">

              <h5 className="sp-card-title with-icon">
                <FiCreditCard className="orange" />
                Payment Summary
              </h5>

              <p className="mb-3">
                Total Due:{" "}
                <b>
                  QAR{" "}
                  {totalSelected.toFixed(
                    2
                  )}
                </b>
              </p>

              <label className="sp-label">
                Amount Paying
              </label>

              <input
                className="sp-input"
                value={amount}
                onChange={(e) =>
                  setAmount(
                    e.target.value
                  )
                }
                placeholder="Leave empty for full"
              />

              <label className="sp-label mt-3">
                Payment Mode
              </label>

              <select
                className="sp-input"
                value={paymentMode}
                onChange={(e) =>
                  setPaymentMode(
                    e.target.value
                  )
                }
              >
                <option value="BANK">
                  Bank Transfer
                </option>
                <option value="CASH">
                  Cash
                </option>
                <option value="UPI">
                  UPI
                </option>
              </select>

              <label className="sp-label mt-3">
                Reference No
              </label>

              <input
                className="sp-input"
                value={reference}
                onChange={(e) =>
                  setReference(
                    e.target.value
                  )
                }
              />

              <label className="sp-label mt-3">
                Remarks
              </label>

              <textarea
                className="sp-textarea"
                value={remarks}
                onChange={(e) =>
                  setRemarks(
                    e.target.value
                  )
                }
              />

              <label className="sp-label mt-3">
                <>
                  <FiPaperclip className="me-2 orange" />
                  Upload Receipt
                </>
              </label>

              <input
                type="file"
                className="sp-input"
                onChange={(e) =>
                  setReceipt(
                    e.target.files[0]
                  )
                }
              />

              <button
                className="sp-pay-btn"
                onClick={paySupplier}
                disabled={
                  selectedOrders.length ===
                  0
                }
              >
                <>
                  <FiLock className="me-2" />
                  Pay Supplier
                </>
              </button>

              <button
                className="sp-history-btn"
                onClick={() =>
                  setShowHistory(
                    true
                  )
                }
              >
                <>
                  <FiFileText className="me-2" />
                  View Payment History
                </>
              </button>

            </div>

          </div>

        </div>
      )}
      {/* PLACE THIS BELOW {selectedSupplier && (...main layout...)} AND BEFORE FINAL </div> */}

      {/* ================= PAYMENT HISTORY MODAL ================= */}
      {showHistory && (
        <div className="modal_show">
          <div
            className="modal_box"
            style={{ width: 900 }}
          >

            <div className="modal-head">
              <h3>
                Payment History —{" "}
                {
                  selectedSupplier?.supplier_name
                }
              </h3>

              <button
                onClick={() =>
                  setShowHistory(
                    false
                  )
                }
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body">

              <table className="sp-table">

                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Mode</th>
                    <th>Reference</th>
                    <th>Order IDs</th>
                    <th>Receipt</th>
                  </tr>
                </thead>

                <tbody>

                  {payments.length ===
                    0 && (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-4"
                        >
                          No payments found
                        </td>
                      </tr>
                    )}

                  {payments.map(
                    p => (
                      <tr
                        key={
                          p.payment_id
                        }
                      >
                        <td>
                          {new Date(
                            p.created_at
                          ).toLocaleDateString()}
                        </td>

                        <td>
                          QAR{" "}
                          {
                            p.amount
                          }
                        </td>

                        <td>
                          {
                            p.payment_mode
                          }
                        </td>

                        <td>
                          {
                            p.reference_no
                          }
                        </td>

                        <td>
                          {Array.isArray(
                            p.order_ids
                          )
                            ? p.order_ids.join(
                              ", "
                            )
                            : ""}
                        </td>

                        <td>
                          <button
                            className="sp-view-btn"
                            onClick={() =>
                              downloadPaymentPDF(
                                p.payment_id
                              )
                            }
                          >
                            PDF
                          </button>
                        </td>
                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>
        </div>
      )}

      {/* ================= ORDER DETAILS MODAL ================= */}
      {viewOrder && (
        <div className="modal_show">
          <div
            className="modal_box"
            style={{ width: 980 }}
          >

            <div className="modal-head">
              <h3>
                Order Details —{" "}
                {
                  viewOrder.order_id
                }
              </h3>

              <button
                onClick={() =>
                  setViewOrder(
                    null
                  )
                }
              >
                ✕
              </button>
            </div>

            <div className="modal-body">

              {/* TOP INFO */}
              <div className="row g-4">

                {/* SUPPLIER */}
                <div className="col-md-6">

                  <div className="sp-card">

                    <h5 className="sp-card-title">
                      Supplier
                    </h5>

                    <div className="profile-grid">
                      <div className="profile-label">
                        Company
                      </div>
                      <div className="profile-value">
                        {
                          viewOrder.supplier_name
                        }
                      </div>

                      <div className="profile-label">
                        Contact
                      </div>
                      <div className="profile-value">
                        {
                          viewOrder.supplier_contact
                        }
                      </div>

                      <div className="profile-label">
                        Phone
                      </div>
                      <div className="profile-value">
                        {
                          viewOrder.supplier_mobile
                        }
                      </div>

                      <div className="profile-label">
                        Email
                      </div>
                      <div className="profile-value">
                        {
                          viewOrder.supplier_email
                        }
                      </div>

                      <div className="profile-label">
                        City
                      </div>
                      <div className="profile-value">
                        {
                          viewOrder.supplier_city
                        }
                      </div>

                      <div className="profile-label">
                        Bank
                      </div>
                      <div className="profile-value">
                        {
                          viewOrder.bank_name
                        }
                      </div>
                    </div>

                  </div>

                </div>

                {/* RESTAURANT */}
                <div className="col-md-6">

                  <div className="sp-card">

                    <h5 className="sp-card-title">
                      Restaurant
                    </h5>

                    <div className="profile-grid">
                      <div className="profile-label">
                        Name
                      </div>
                      <div className="profile-value">
                        {
                          viewOrder.restaurant_name_english
                        }
                      </div>

                      <div className="profile-label">
                        Contact
                      </div>
                      <div className="profile-value">
                        {
                          viewOrder.contact_person_name
                        }
                      </div>

                      <div className="profile-label">
                        Phone
                      </div>
                      <div className="profile-value">
                        {
                          viewOrder.contact_person_mobile
                        }
                      </div>

                      <div className="profile-label">
                        City
                      </div>
                      <div className="profile-value">
                        {
                          viewOrder.city
                        }
                      </div>

                      <div className="profile-label">
                        Address
                      </div>
                      <div className="profile-value">
                        {
                          viewOrder.address
                        }
                      </div>
                    </div>

                  </div>

                </div>

              </div>

              {/* ORDER INFO */}
              <div className="sp-card mt-4">

                <h5 className="sp-card-title">
                  Payment Status
                </h5>

                <div className="row g-3">

                  <div className="col-md-4">
                    <div className="mini-table">
                      <b>
                        Restaurant Paid
                      </b>
                      <div className="text-success mt-2">
                        QAR{" "}
                        {
                          viewOrder.restaurant_paid_amount
                        }
                      </div>
                      <small className="text-danger">
                        Pending:
                        QAR{" "}
                        {
                          viewOrder.restaurant_due_amount
                        }
                      </small>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="mini-table">
                      <b>
                        Supplier Paid
                      </b>
                      <div className="text-success mt-2">
                        QAR{" "}
                        {
                          viewOrder.supplier_paid_amount
                        }
                      </div>
                      <small className="text-danger">
                        Pending:
                        QAR{" "}
                        {
                          viewOrder.supplier_due_amount
                        }
                      </small>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="mini-table">
                      <b>
                        Admin Net
                      </b>
                      <div className="mt-2 fw-bold">
                        QAR{" "}
                        {(
                          viewOrder.restaurant_paid_amount -
                          viewOrder.supplier_paid_amount
                        ).toFixed(
                          2
                        )}
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* ITEMS */}
              <div className="sp-card mt-4">

                <h5 className="sp-card-title">
                  Order Items
                </h5>

                <table className="sp-table">

                  <thead>
                    <tr>
                      <th>
                        Product
                      </th>
                      <th>
                        Qty
                      </th>
                      <th>
                        Price
                      </th>
                      <th>
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {viewOrder.items?.map(
                      (
                        it,
                        i
                      ) => (
                        <tr
                          key={i}
                        >
                          <td>
                            {
                              it.product_name
                            }
                          </td>
                          <td>
                            {it.qty}
                          </td>
                          <td>
                            {it.price}
                          </td>
                          <td>
                            {it.total}
                          </td>
                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}