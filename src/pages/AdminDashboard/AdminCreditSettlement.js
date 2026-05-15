
// import React, { useEffect, useState } from "react";
// import "../css/AdminCreditSettlement.css";

// const API = "http://192.168.2.16:5000/api";

// export default function AdminCreditSettlement() {

//   const token = localStorage.getItem("admin_token");

//   const [restaurants, setRestaurants] = useState([]);
//   const [selectedRestaurant, setSelectedRestaurant] = useState(null);

//   const [orders, setOrders] = useState([]);
//   const [selectedOrders, setSelectedOrders] = useState([]);

//   const [amountReceived, setAmountReceived] = useState("");

//   const [viewOrder, setViewOrder] = useState(null);
//   const [history, setHistory] = useState([]);
//   const [showHistory, setShowHistory] = useState(false);
//   const [referenceNo, setReferenceNo] = useState("");
//   const [paymentMode, setPaymentMode] = useState("BANK");
//   const [remarks, setRemarks] = useState("");
//   const [receiptFile, setReceiptFile] = useState(null);

//   const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
//   const [minDue, setMinDue] = useState("");
//   const [searchOrder, setSearchOrder] = useState("");



//   useEffect(() => {
//     loadRestaurants();
//   }, []);

//   const loadHistory = async (restaurantId) => {

//     const res = await fetch(
//       `${API}/admin/credit/settlement-history/${restaurantId}`,
//       { headers: { Authorization: `Bearer ${token}` } }
//     );

//     const data = await res.json();

//     setHistory(Array.isArray(data) ? data : []);
//   };

//   const loadRestaurants = async () => {
//     const res = await fetch(`${API}/admin/credit/restaurants`, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//     const data = await res.json();
//     setRestaurants(data || []);
//   };

//   const loadOrders = async (restaurantId) => {
//     const res = await fetch(
//       `${API}/admin/credit/credit-orders/${restaurantId}`,
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//     const data = await res.json();
//     setOrders(data || []);
//     setSelectedOrders([]);
//   };

//   const handleRestaurantChange = (id) => {
//     const rest = restaurants.find(r => r.restaurant_id == id);
//     setSelectedRestaurant(rest);
//     if (id) loadOrders(id);
//   };

//   const toggleOrder = (id) => {
//     if (selectedOrders.includes(id)) {
//       setSelectedOrders(selectedOrders.filter(o => o !== id));
//     } else {
//       setSelectedOrders([...selectedOrders, id]);
//     }
//   };

//   /* ✅ FIXED — USE DUE AMOUNT IF EXISTS */
//   const totalSelected = orders
//     .filter(o => selectedOrders.includes(o.order_id))
//     .reduce((sum, o) => sum + Number(o.due_amount || o.total_amount), 0);

//   // ONLY changed parts shown

//   // ================= DOWNLOAD RECEIPT =================
//   const downloadReceipt = async (id) => {

//     const res = await fetch(
//       `${API}/admin/credit/settlement-pdf/${id}`,
//       {
//         headers: { Authorization: `Bearer ${token}` }
//       }
//     );

//     const blob = await res.blob();

//     const url = window.URL.createObjectURL(blob);

//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `Settlement_${id}.pdf`;
//     a.click();

//     window.URL.revokeObjectURL(url);
//   };


//   // ================= SETTLE PAYMENT =================
//   const settlePayment = async () => {

//     if (!selectedRestaurant) return alert("Select restaurant");
//     if (selectedOrders.length === 0) return alert("Select orders");

//     const formData = new FormData();

//     formData.append("token", token); // ✅ important (middleware safety)
//     formData.append("restaurant_id", selectedRestaurant.restaurant_id);
//     formData.append("order_ids", JSON.stringify(selectedOrders));
//     formData.append("amount", amountReceived);
//     formData.append("reference_no", referenceNo);
//     formData.append("payment_mode", paymentMode);
//     formData.append("remarks", remarks);

//     if (receiptFile) {
//       formData.append("receipt", receiptFile);
//     }

//     const res = await fetch(`${API}/admin/credit/settle-orders`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`   // ✅ keep header also
//       },
//       body: formData
//     });

//     const data = await res.json();

//     if (data.success) {
//       alert("Settlement completed");

//       loadOrders(selectedRestaurant.restaurant_id);

//       setAmountReceived("");
//       setReferenceNo("");
//       setReceiptFile(null);
//       setRemarks("");

//     } else {
//       alert(data.error || "Settlement failed");
//     }
//   };
//   const viewProof = async (id) => {

//     const res = await fetch(
//       `${API}/admin/credit/settlement-receipt/${id}`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       }
//     );

//     if (!res.ok) {
//       alert("Unable to load proof");
//       return;
//     }

//     const blob = await res.blob();
//     const url = window.URL.createObjectURL(blob);

//     window.open(url, "_blank");
//   };


//   const filteredOrders = orders.filter(o => {

//     // 🔎 Search by order id
//     if (
//       searchOrder &&
//       !String(o.order_id).includes(searchOrder)
//     ) return false;

//     // Status filter
//     if (
//       orderStatusFilter === "UNPAID" &&
//       o.payment_status !== "UNPAID"
//     ) return false;

//     if (
//       orderStatusFilter === "PARTIAL" &&
//       o.payment_status !== "PARTIAL"
//     ) return false;

//     if (orderStatusFilter === "OVERDUE") {
//       if (!o.credit_due_date) return false;

//       const dueDate = new Date(o.credit_due_date);

//       if (dueDate >= new Date()) return false;
//     }

//     // Min due
//     if (
//       minDue &&
//       Number(o.due_amount || 0) < Number(minDue)
//     ) return false;

//     return true;
//   });
//   return (
//     <div className="dashboard_page credit-settlement-page">

//       <h2>Credit Settlement</h2>

//       {/* ================= TOP FILTER ================= */}
//       <div className="top-filter-card">

//         <div className="top-row">

//           {/* Restaurant */}
//           <div className="top-field restaurant-field">
//             <label>Select Restaurant</label>
//             <select
//               className="input"
//               value={selectedRestaurant?.restaurant_id || ""}
//               onChange={(e) => handleRestaurantChange(e.target.value)}
//             >
//               <option value="">-- Select --</option>
//               {restaurants.map(r => (
//                 <option key={r.restaurant_id} value={r.restaurant_id}>
//                   {r.restaurant_name_english}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Search */}
//           <div className="top-field search-field">
//             <label style={{ opacity: 0 }}>Search</label> {/* keeps alignment */}
//             <input
//               className="input"
//               placeholder="Search Order ID..."
//               value={searchOrder}
//               onChange={(e) => setSearchOrder(e.target.value)}
//             />
//           </div>

//           {/* Button */}
//           <div className="top-field button-field">
//             <label style={{ opacity: 0 }}>Action</label> {/* keeps alignment */}
//             <button
//               className="btn btn-reset-glow w-100"
//               onClick={() => {
//                 setOrderStatusFilter("ALL");
//                 setMinDue("");
//                 setSearchOrder("");
//               }}
//             >
//               Reset Filters
//             </button>
//           </div>

//         </div>

//       </div>

//       {selectedRestaurant && (


//         <>
//           {/* ================= FILTER CARD ================= */}
//           <div className="card p-2 mb-2">

//             <div className="row">

//               {/* Search Order */}
//               <div className="col-md-3">
//                 <label>Search Order ID</label>
//                 <input
//                   className="form-control"
//                   placeholder="Order ID..."
//                   value={searchOrder}
//                   onChange={(e) => setSearchOrder(e.target.value)}
//                 />
//               </div>

//               {/* Status */}
//               <div className="col-md-3">
//                 <label>Status</label>
//                 <select
//                   className="form-control"
//                   value={orderStatusFilter}
//                   onChange={(e) => setOrderStatusFilter(e.target.value)}
//                 >
//                   <option value="ALL">All</option>
//                   <option value="UNPAID">Unpaid</option>
//                   <option value="PARTIAL">Partial</option>
//                   <option value="OVERDUE">Overdue</option>
//                 </select>
//               </div>

//               {/* Min Due */}
//               <div className="col-md-3">
//                 <label>Min Due Amount</label>
//                 <input
//                   className="form-control"
//                   placeholder="QAR"
//                   value={minDue}
//                   onChange={(e) => setMinDue(e.target.value)}
//                 />
//               </div>

//               {/* Reset */}
//               <div className="col-md-3 d-flex align-items-end">
//                 <button
//                   className="btn btn-reset-glow w-100"
//                   onClick={() => {
//                     setOrderStatusFilter("ALL");
//                     setMinDue("");
//                     setSearchOrder("");
//                   }}
//                 >
//                   Reset Filters
//                 </button>
//               </div>

//             </div>

//           </div>



//           <div className="row">
//             {/* ORDERS TABLE */}
//             <div className="col-md-8">

//               <div className="card p-3">

//                 <h5 className="mb-3">Unpaid Credit Orders</h5>

//                 <div className="credit-table-wrapper">
//                   <table className="table custom-table credit-table">
//                     <tbody>
//                       {filteredOrders.map(o => {

//                         const isSelected = selectedOrders.includes(o.order_id);

//                         return (
//                           <tr
//                             key={o.order_id}
//                             className={`order-row ${isSelected ? "selected" : ""}`}
//                           >

//                             {/* CHECKBOX */}
//                             <td className="col-check">
//                               <input
//                                 type="checkbox"
//                                 checked={isSelected}
//                                 onChange={() => toggleOrder(o.order_id)}
//                               />
//                             </td>

//                             {/* LEFT INFO */}
//                             <td className="col-left">
//                               <div className="order-id">{o.order_id}</div>
//                               <div className="supplier">{o.supplier_name}</div>
//                               <div className="due">Due: QAR {o.due_amount}</div>
//                             </td>

//                             {/* MIDDLE (AMOUNT) */}
//                             <td className="col-middle">
//                               <div><b>Total:</b> QAR {o.total_amount}</div>
//                               <div className="paid">Paid: QAR {o.paid_amount || 0}</div>
//                             </td>

//                             {/* STATUS + DATE */}
//                             <td className="col-status">

//                               <span
//                                 className={
//                                   o.payment_status === "PAID"
//                                     ? "pill pill-green"
//                                     : o.payment_status === "PARTIAL"
//                                       ? "pill pill-orange"
//                                       : "pill pill-red"
//                                 }
//                               >
//                                 {o.payment_status}
//                               </span>

//                               <div className="date">
//                                 {o.credit_due_date}
//                               </div>

//                             </td>

//                             {/* BUTTON */}
//                             <td className="col-action">
//                               <button
//                                 className="view_btn "
//                                 onClick={() => setViewOrder(o)}
//                               >
//                                 View
//                               </button>
//                             </td>

//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>

//               </div>

//             </div>


//             {/* SUMMARY */}
//             <div className="col-md-4">

//               <div className="card summary-card p-3">

//                 <h5 className="mb-3">Settlement Summary</h5>

//                 {/* ✅ COMBINED GREEN BOX */}
//                 <div className="summary-top-box">
//                   <div className="summary-row">
//                     <span>Orders Selected:</span>
//                     <span className="badge-circle">
//                       {selectedOrders.length}
//                     </span>
//                   </div>

//                   <div className="summary-amount">
//                     QAR {totalSelected.toFixed(2)}
//                   </div>
//                 </div>

//                 {/* ✅ PAYMENT DETAILS BOX */}
//                 <div className="payment-card">

//                   <div className="payment-title">Payment Details</div>

//                   <label>Amount Received</label>
//                   <input
//                     className="form-control"
//                     value={amountReceived}
//                     onChange={(e) => setAmountReceived(e.target.value)}
//                     placeholder="Optional"
//                   />

//                   <label>Reference Number</label>
//                   <input
//                     className="form-control"
//                     value={referenceNo}
//                     onChange={(e) => setReferenceNo(e.target.value)}
//                     placeholder="Transaction / Cheque No"
//                   />

//                   <label>Payment Mode</label>
//                   <select
//                     className="form-control"
//                     value={paymentMode}
//                     onChange={(e) => setPaymentMode(e.target.value)}
//                   >
//                     <option>BANK</option>
//                     <option>CASH</option>
//                     <option>UPI</option>
//                     <option>CHEQUE</option>
//                   </select>

//                   <label>Upload Proof</label>
//                   <input
//                     type="file"
//                     className="form-control"
//                     onChange={(e) => setReceiptFile(e.target.files[0])}
//                   />

//                   <button
//                     className="btn btn-success w-100 mt-3"
//                     onClick={settlePayment}
//                     disabled={selectedOrders.length === 0}
//                   >
//                     ✔ Confirm Settlement
//                   </button>

//                   <button
//                     className="btn history-btn w-100 mt-2"
//                     onClick={() => {
//                       loadHistory(selectedRestaurant.restaurant_id);
//                       setShowHistory(true);
//                     }}
//                   >
//                     ⏱ View Settlement History
//                   </button>

//                 </div>

//               </div>

//             </div>
//           </div>

//         </>

//       )}


//       {viewOrder && (

//         <div className="modal_show">

//           <div className="modal_box" style={{ width: 700 }}>

//             <h4 className="modal_title">
//               Order Details — {viewOrder?.order_id}
//             </h4>

//             <hr />

//             {/* ================= TOP SECTION ================= */}
//             <div className="row">

//               {/* Restaurant */}
//               <div className="col-md-6">
//                 <div className="info_card">

//                   <h6 className="section_heading">Restaurant</h6>

//                   <div className="info_row">
//                     <span>Name</span>
//                     <span>{viewOrder?.restaurant_name || "-"}</span>
//                   </div>

//                   <div className="info_row">
//                     <span>Contact</span>
//                     <span>{viewOrder?.restaurant_contact || "-"}</span>
//                   </div>

//                   <div className="info_row">
//                     <span>Phone</span>
//                     <span>{viewOrder?.restaurant_mobile || "-"}</span>
//                   </div>

//                   <div className="info_row">
//                     <span>City</span>
//                     <span>{viewOrder?.restaurant_city || "-"}</span>
//                   </div>

//                   <div className="info_row">
//                     <span>Address</span>
//                     <span>{viewOrder?.restaurant_address || "-"}</span>
//                   </div>

//                 </div>
//               </div>

//               {/* Supplier */}
//               <div className="col-md-6">
//                 <div className="info_card">

//                   <h6 className="section_heading">Supplier</h6>

//                   <div className="info_row">
//                     <span>Name</span>
//                     <span>{viewOrder?.supplier_name}</span>
//                   </div>

//                   <div className="info_row">
//                     <span>Contact</span>
//                     <span>{viewOrder?.contact_person_name}</span>
//                   </div>

//                   <div className="info_row">
//                     <span>Phone</span>
//                     <span>{viewOrder?.contact_person_mobile}</span>
//                   </div>

//                   <div className="info_row">
//                     <span>Due Date</span>
//                     <span>{viewOrder?.credit_due_date}</span>
//                   </div>

//                 </div>
//               </div>

//             </div>

//             {/* ================= CREDIT SUMMARY ================= */}
//             <div className="credit_summary_section">

//               <h6 className="section_heading">Credit Summary</h6>

//               <div className="credit_grid">

//                 <div className="credit_box">
//                   <small>Limit</small>
//                   <div>QAR {viewOrder?.credit_limit || 0}</div>
//                 </div>

//                 <div className="credit_box text-danger">
//                   <small>Used</small>
//                   <div>QAR {viewOrder?.credit_used || 0}</div>
//                 </div>

//                 <div className="credit_box text-success">
//                   <small>Available</small>
//                   <div>
//                     QAR {
//                       (
//                         (Number(viewOrder?.credit_limit) || 0) -
//                         (Number(viewOrder?.credit_used) || 0)
//                       ).toFixed(2)
//                     }
//                   </div>
//                 </div>

//                 <div className="credit_box">
//                   <small>Credit Days</small>
//                   <div>{viewOrder?.credit_days || 0}</div>
//                 </div>

//               </div>

//             </div>

//             {/* ================= ITEMS ================= */}
//             <div className="items_section">

//               <h6 className="section_heading">Items</h6>

//               <table className="table table-bordered table-striped table-sm">
//                 <thead className="table-light">
//                   <tr>
//                     <th>Product</th>
//                     <th>Qty</th>
//                     <th>Price</th>
//                     <th>Total</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {Array.isArray(viewOrder?.items) &&
//                     viewOrder.items.map((it, i) => (
//                       <tr key={i}>
//                         <td>{it.product_name}</td>
//                         <td>{it.qty}</td>
//                         <td>{it.price}</td>
//                         <td>{it.total}</td>
//                       </tr>
//                     ))}
//                 </tbody>
//               </table>

//             </div>

//             <div className="modal_footer">
//               <button
//                 className="btn btn-secondary"
//                 onClick={() => setViewOrder(null)}
//               >
//                 Close
//               </button>
//             </div>

//           </div>

//         </div>

//       )}


//       {/* ================= HISTORY MODAL ================= */}
//       {showHistory && (

//         <div className="modal_show">

//           <div className="modal_box" style={{ width: 800 }}>

//             <h4>Settlement History</h4>

//             <table className="table">

//               <thead>
//                 <tr>
//                   <th>Date</th>
//                   <th>Orders</th>
//                   <th>Amount</th>
//                   <th>Mode</th>
//                 </tr>
//               </thead>

//               <tbody>

//                 {history.map(h => (

//                   <tr key={h.settlement_id}>

//                     <td>{new Date(h.created_at).toLocaleDateString()}</td>

//                     <td>
//                       {Array.isArray(h.order_ids)
//                         ? h.order_ids.join(", ")
//                         : ""}
//                     </td>

//                     <td>QAR {h.amount}</td>

//                     <td>{h.payment_mode}</td>

//                     <td>
//                       <button
//                         className="btn btn-sm btn-primary"
//                         onClick={() => downloadReceipt(h.settlement_id)}
//                       >
//                         Download
//                       </button>
//                       <button
//                         className="btn btn-sm btn-info"
//                         onClick={() => viewProof(h.settlement_id)}
//                       >
//                         Proof
//                       </button>
//                     </td>

//                   </tr>

//                 ))}

//               </tbody>

//             </table>

//             <button
//               className="btn btn-secondary"
//               onClick={() => setShowHistory(false)}
//             >
//               Close
//             </button>

//           </div>

//         </div>

//       )}

//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import "../css/CouponManagement.css";
import {
  FiCreditCard,
  FiShoppingBag,
  FiRotateCcw,
  FiClock,
  FiCheckCircle,
  FiEye,
  FiUpload,
  FiLock,
  FiFileText,
  FiSearch,
  FiCalendar,
  FiX
} from "react-icons/fi";
const API = "http://192.168.2.9:5000/api";

export default function AdminCreditSettlement() {

  const token = localStorage.getItem("admin_token");

  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);

  const [amountReceived, setAmountReceived] = useState("");

  const [viewOrder, setViewOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [referenceNo, setReferenceNo] = useState("");
  const [paymentMode, setPaymentMode] = useState("BANK");
  const [remarks, setRemarks] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);

  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [minDue, setMinDue] = useState("");
  const [searchOrder, setSearchOrder] = useState("");
  const [activeTab, setActiveTab] = useState("UNPAID");
  const [paidOrders, setPaidOrders] = useState([]);
  // UNPAID filters
  const [unpaidSearch, setUnpaidSearch] = useState("");
  const [unpaidStatus, setUnpaidStatus] = useState("ALL");
  const [unpaidMinDue, setUnpaidMinDue] = useState("");

  // PAID filters
  const [paidSearch, setPaidSearch] = useState("");
  const [paidDateFilter, setPaidDateFilter] = useState("");
  const loadPaidOrders = async (restaurantId) => {
    const res = await fetch(
      `${API}/admin/credit/paid-credit-orders/${restaurantId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await res.json();
    setPaidOrders(Array.isArray(data) ? data : []);
  };



  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadHistory = async (restaurantId) => {

    const res = await fetch(
      `${API}/admin/credit/settlement-history/${restaurantId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await res.json();

    setHistory(Array.isArray(data) ? data : []);
  };

  const loadRestaurants = async () => {
    const res = await fetch(`${API}/admin/credit/restaurants`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setRestaurants(data || []);
  };

  const loadOrders = async (restaurantId) => {
    const res = await fetch(
      `${API}/admin/credit/credit-orders/${restaurantId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    setOrders(data || []);
    setSelectedOrders([]);
  };

  const handleRestaurantChange = (id) => {
    const rest = restaurants.find(r => r.restaurant_id == id);
    setSelectedRestaurant(rest);
    if (id) {
      loadOrders(id);
      loadPaidOrders(id); // 🔥 ADD THIS
    }
  };

  const toggleOrder = (id) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter(o => o !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  /* ✅ FIXED — USE DUE AMOUNT IF EXISTS */
  const totalSelected = orders
    .filter(o => selectedOrders.includes(o.order_id))
    .reduce((sum, o) => sum + Number(o.due_amount || o.total_amount), 0);

  // ONLY changed parts shown

  // ================= DOWNLOAD RECEIPT =================
  const downloadReceipt = async (id) => {

    const res = await fetch(
      `${API}/admin/credit/settlement-pdf/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Settlement_${id}.pdf`;
    a.click();

    window.URL.revokeObjectURL(url);
  };


  // ================= SETTLE PAYMENT =================
  const settlePayment = async () => {

    if (!selectedRestaurant) return alert("Select restaurant");
    if (selectedOrders.length === 0) return alert("Select orders");

    const formData = new FormData();

    formData.append("token", token); // ✅ important (middleware safety)
    formData.append("restaurant_id", selectedRestaurant.restaurant_id);
    formData.append("order_ids", JSON.stringify(selectedOrders));
    formData.append("amount", amountReceived);
    formData.append("reference_no", referenceNo);
    formData.append("payment_mode", paymentMode);
    formData.append("remarks", remarks);

    if (receiptFile) {
      formData.append("receipt", receiptFile);
    }

    const res = await fetch(`${API}/admin/credit/settle-orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`   // ✅ keep header also
      },
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      alert("Settlement completed");

      loadOrders(selectedRestaurant.restaurant_id);

      setAmountReceived("");
      setReferenceNo("");
      setReceiptFile(null);
      setRemarks("");

    } else {
      alert(data.error || "Settlement failed");
    }
  };
  const viewProof = async (id) => {

    const res = await fetch(
      `${API}/admin/credit/settlement-receipt/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!res.ok) {
      alert("Unable to load proof");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    window.open(url, "_blank");
  };


  const filteredOrders = orders.filter(o => {

    // 🔎 Search by order id
    if (
      searchOrder &&
      !String(o.order_id).includes(searchOrder)
    ) return false;

    // Status filter
    if (
      orderStatusFilter === "UNPAID" &&
      o.payment_status !== "UNPAID"
    ) return false;

    if (
      orderStatusFilter === "PARTIAL" &&
      o.payment_status !== "PARTIAL"
    ) return false;

    if (orderStatusFilter === "OVERDUE") {
      if (!o.credit_due_date) return false;

      const dueDate = new Date(o.credit_due_date);

      if (dueDate >= new Date()) return false;
    }

    // Min due
    if (
      minDue &&
      Number(o.due_amount || 0) < Number(minDue)
    ) return false;

    return true;
  });
  const filteredPaidOrders = paidOrders.filter(o => {

    if (paidSearch && !String(o.order_id).includes(paidSearch))
      return false;

    if (paidDateFilter) {
      const orderDate = new Date(o.order_date).toISOString().slice(0, 10);
      if (orderDate !== paidDateFilter) return false;
    }

    return true;
  });
  // const filteredPaidOrders = paidOrders.filter(o => {

  //   // 🔎 Search
  //   if (
  //     searchOrder &&
  //     !String(o.order_id).includes(searchOrder)
  //   ) return false;

  //   // Status filter (for paid → always PAID)
  //   if (
  //     orderStatusFilter === "UNPAID" ||
  //     orderStatusFilter === "PARTIAL"
  //   ) return false;

  //   if (orderStatusFilter === "OVERDUE") {
  //     if (!o.credit_due_date) return false;

  //     const dueDate = new Date(o.credit_due_date);

  //     if (dueDate >= new Date()) return false;
  //   }

  //   // Min Due (paid orders → due = 0)
  //   if (
  //     minDue &&
  //     Number(0) < Number(minDue)
  //   ) return false;

  //   return true;
  // });

  const filteredUnpaidOrders = orders.filter(o => {

    if (unpaidSearch && !String(o.order_id).includes(unpaidSearch))
      return false;

    if (unpaidStatus === "UNPAID" && o.payment_status !== "UNPAID")
      return false;

    if (unpaidStatus === "PARTIAL" && o.payment_status !== "PARTIAL")
      return false;

    if (unpaidStatus === "OVERDUE") {
      if (!o.credit_due_date) return false;
      if (new Date(o.credit_due_date) >= new Date()) return false;
    }

    if (
      unpaidMinDue &&
      Number(o.due_amount || 0) < Number(unpaidMinDue)
    ) return false;

    return true;
  });
  return (
    <div className="supplier-payment-page">

      {/* HEADER */}
      <div className="sp-header">
        <span className="sp-line"></span>

        <h2>
          Credit Settlement
        </h2>

        <span className="sp-line"></span>
      </div>

      {/* SELECT RESTAURANT */}
      <div className="sp-card sp-top-card">

        <label className="sp-label">
          <FiShoppingBag className="sp-title-icon" />
          Select restaurant
        </label>

        <div className="sp-select-wrap">
          <select
            className="sp-input"
            onChange={(e) =>
              handleRestaurantChange(
                e.target.value
              )
            }
          >
            <option value="">
              -- Select --
            </option>

            {restaurants.map(r => (
              <option
                key={r.restaurant_id}
                value={r.restaurant_id}
              >
                {r.restaurant_name_english}
              </option>
            ))}
          </select>
        </div>

      </div>

      {selectedRestaurant && (
        <>
          <div className="sp-grid">

            {/* LEFT */}
            <div className="sp-left">

              {/* FILTER CARD */}
              <div className="sp-card mb-3">

                <div className="row g-3">

                  {activeTab ===
                    "UNPAID" && (
                      <>
                        <div className="col-md-4">
                          <label className="sp-label">
                            <FiSearch className="me-2" />
                            Search Order
                          </label>

                          <input
                            className="sp-input"
                            value={
                              unpaidSearch
                            }
                            onChange={(
                              e
                            ) =>
                              setUnpaidSearch(
                                e.target
                                  .value
                              )
                            }
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="sp-label">
                            Status
                          </label>

                          <select
                            className="sp-input"
                            value={
                              unpaidStatus
                            }
                            onChange={(
                              e
                            ) =>
                              setUnpaidStatus(
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
                            <option value="OVERDUE">
                              Overdue
                            </option>
                          </select>
                        </div>

                        <div className="col-md-4">
                          <label className="sp-label">
                            Min Due
                          </label>

                          <input
                            className="sp-input"
                            value={
                              unpaidMinDue
                            }
                            onChange={(
                              e
                            ) =>
                              setUnpaidMinDue(
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
                              setUnpaidSearch(
                                ""
                              );
                              setUnpaidStatus(
                                "ALL"
                              );
                              setUnpaidMinDue(
                                ""
                              );
                            }}
                          >
                            <FiRotateCcw className="me-2" />
                            Reset Filters
                          </button>
                        </div>
                      </>
                    )}

                  {activeTab ===
                    "PAID" && (
                      <>
                        <div className="col-md-6">
                          <label className="sp-label">
                            <FiSearch className="me-2" />
                            Search Order
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

                        <div className="col-md-6">
                          <label className="sp-label">
                            <FiCalendar className="me-2" />
                            Filter by Date
                          </label>

                          <input
                            type="date"
                            className="sp-input"
                            value={
                              paidDateFilter
                            }
                            onChange={(
                              e
                            ) =>
                              setPaidDateFilter(
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
                              setPaidSearch(
                                ""
                              );
                              setPaidDateFilter(
                                ""
                              );
                            }}
                          >
                            <FiRotateCcw className="me-2" />
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
                    "UNPAID"
                    ? "active-orange"
                    : ""
                    }`}
                  onClick={() =>
                    setActiveTab(
                      "UNPAID"
                    )
                  }
                >
                  <FiClock className="me-2" />
                  Unpaid Orders
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
                  <FiCheckCircle className="me-2" />
                  Paid Orders
                </button>

              </div>

              {/* TABLE */}
              <div className="sp-card">

                <h5 className="sp-card-title">
                  {activeTab ===
                    "UNPAID"
                    ? "Unpaid Credit Orders"
                    : "Paid Credit Orders"}
                </h5>

                <div className="sp-table-wrap">

                  <table className="sp-table">

                    <thead>
                      <tr>

                        {activeTab ===
                          "UNPAID" && (
                            <th></th>
                          )}

                        <th>Order</th>
                        <th>Supplier</th>
                        <th>Amount</th>
                        <th>Due</th>

                        {activeTab ===
                          "UNPAID" && (
                            <th>
                              Action
                            </th>
                          )}

                      </tr>
                    </thead>

                    <tbody>

                      {(activeTab ===
                        "UNPAID"
                        ? filteredUnpaidOrders
                        : filteredPaidOrders
                      ).map(o => {
                        const isSelected =
                          selectedOrders.includes(
                            o.order_id
                          );

                        return (
                          <tr
                            key={
                              o.order_id
                            }
                            className={
                              isSelected
                                ? "table-success"
                                : ""
                            }
                          >

                            {activeTab ===
                              "UNPAID" && (
                                <td>
                                  <input
                                    type="checkbox"
                                    checked={selectedOrders.includes(
                                      o.order_id
                                    )}
                                    onChange={() =>
                                      toggleOrder(
                                        o.order_id
                                      )
                                    }
                                  />
                                </td>
                              )}

                            <td>
                              {o.order_id}
                            </td>

                            <td>
                              {
                                o.supplier_name
                              }
                            </td>

                            <td>
                              <div>
                                <b>Total:</b>{" "}
                                QAR{" "}
                                {
                                  o.total_amount
                                }
                              </div>

                              {o.paid_amount !==
                                undefined && (
                                  <div className="text-success">
                                    Paid:
                                    QAR{" "}
                                    {o.paid_amount ||
                                      0}
                                  </div>
                                )}

                              {activeTab ===
                                "UNPAID" &&
                                o.due_amount !==
                                undefined && (
                                  <div className="text-danger">
                                    Due:
                                    QAR{" "}
                                    {o.due_amount ||
                                      0}
                                  </div>
                                )}
                            </td>

                            <td>

                              {o.payment_status && (
                                <span
                                  className={
                                    o.payment_status ===
                                      "PAID"
                                      ? "sp-badge green"
                                      : o.payment_status ===
                                        "PARTIAL"
                                        ? "sp-badge orange"
                                        : "sp-badge red"
                                  }
                                >
                                  {
                                    o.payment_status
                                  }
                                </span>
                              )}

                              <div className="mt-2">
                                {
                                  o.credit_due_date
                                }
                              </div>

                            </td>

                            {activeTab ===
                              "UNPAID" && (
                                <td>
                                  <button
                                    className="sp-view-btn"
                                    onClick={() =>
                                      setViewOrder(
                                        o
                                      )
                                    }
                                  >
                                    <FiEye className="me-1" />
                                    View
                                  </button>
                                </td>
                              )}

                          </tr>
                        );
                      })}

                    </tbody>

                  </table>

                </div>

              </div>

            </div>

            {/* RIGHT */}
            <div className="sp-right">

              <div className="sp-card sticky-top">

                <h5 className="sp-card-title with-icon">
                  <FiCreditCard className="orange" />
                  Settlement Summary
                </h5>
                <div className="credit_summary_box">
                  <span>Orders Selected :</span>
                  <strong>
                    {selectedOrders.length}
                  </strong>
                </div>

                <div className="credit_summary_box">
                  <span>Total Amount :</span>
                  <strong className="text-success">
                    QAR {totalSelected.toFixed(2)}
                  </strong>
                </div>

                <label className="sp-label mt-3">
                  Amount Received
                </label>

                <input
                  className="sp-input"
                  value={amountReceived}
                  onChange={(e) =>
                    setAmountReceived(
                      e.target.value
                    )
                  }
                  placeholder="Optional"
                />

                <label className="sp-label mt-3">
                  Reference Number
                </label>

                <input
                  className="sp-input"
                  value={referenceNo}
                  onChange={(e) =>
                    setReferenceNo(
                      e.target.value
                    )
                  }
                  placeholder="Transaction / Cheque No"
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
                  <option>BANK</option>
                  <option>CASH</option>
                  <option>UPI</option>
                  <option>CHEQUE</option>
                </select>

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
                  <FiUpload className="me-2 orange" />
                  Upload Proof
                </label>

                <input
                  type="file"
                  className="sp-input"
                  onChange={(e) =>
                    setReceiptFile(
                      e.target.files[0]
                    )
                  }
                />

                <button
                  className="sp-pay-btn"
                  onClick={settlePayment}
                  disabled={
                    selectedOrders.length === 0
                  }
                >
                  <FiLock className="me-2" />
                  Confirm Settlement
                </button>

                <button
                  className="sp-history-btn"
                  onClick={() => {
                    loadHistory(
                      selectedRestaurant.restaurant_id
                    );
                    setShowHistory(true);
                  }}
                >
                  <FiFileText className="me-2" />
                  View Settlement History
                </button>

              </div>
            </div>

          </div>
        </>
      )}

      {/* ORDER DETAILS MODAL */}
      {viewOrder && (
        <div className="modal_show">
          <div
            className="modal_box"
            style={{ width: 780 }}
          >

            <h4 className="modal_title">
              Order Details — {viewOrder.order_id}
            </h4>

            <hr />

            <div className="row g-3">

              <div className="col-md-6">
                <div className="sp-card">
                  <h5 className="sp-card-title">
                    Restaurant
                  </h5>

                  <p>
                    {viewOrder.restaurant_name}
                  </p>
                  <p>
                    {
                      viewOrder.restaurant_contact
                    }
                  </p>
                  <p>
                    {
                      viewOrder.restaurant_mobile
                    }
                  </p>
                  <p>
                    {
                      viewOrder.restaurant_city
                    }
                  </p>
                </div>
              </div>

              <div className="col-md-6">
                <div className="sp-card">
                  <h5 className="sp-card-title">
                    Supplier
                  </h5>

                  <p>
                    {viewOrder.supplier_name}
                  </p>
                  <p>
                    {
                      viewOrder.contact_person_name
                    }
                  </p>
                  <p>
                    {
                      viewOrder.contact_person_mobile
                    }
                  </p>
                  <p>
                    {
                      viewOrder.credit_due_date
                    }
                  </p>
                </div>
              </div>

            </div>

            <div className="sp-card mt-3">

              <h5 className="sp-card-title">
                Items
              </h5>

              <table className="sp-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {Array.isArray(
                    viewOrder.items
                  ) &&
                    viewOrder.items.map(
                      (it, i) => (
                        <tr key={i}>
                          <td>
                            {
                              it.product_name
                            }
                          </td>
                          <td>{it.qty}</td>
                          <td>{it.price}</td>
                          <td>{it.total}</td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>

            </div>

            <div className="mt-3 text-end">
              <button
                className="sp-history-btn"
                onClick={() =>
                  setViewOrder(null)
                }
              >
                <FiX className="me-2" />
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* HISTORY MODAL */}
      {showHistory && (
        <div className="modal_show">
          <div
            className="modal_box"
            style={{ width: 860 }}
          >

            <h4 className="modal_title">
              Settlement History
            </h4>

            <table className="sp-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Orders</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {history.map(h => (
                  <tr
                    key={
                      h.settlement_id
                    }
                  >
                    <td>
                      {new Date(
                        h.created_at
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      {Array.isArray(
                        h.order_ids
                      )
                        ? h.order_ids.join(", ")
                        : ""}
                    </td>

                    <td>
                      QAR {h.amount}
                    </td>

                    <td>
                      {h.payment_mode}
                    </td>

                    <td className="d-flex gap-2">
                      <button
                        className="sp-view-btn"
                        onClick={() =>
                          downloadReceipt(
                            h.settlement_id
                          )
                        }
                      >
                        Download
                      </button>

                      <button
                        className="sp-view-btn"
                        onClick={() =>
                          viewProof(
                            h.settlement_id
                          )
                        }
                      >
                        Proof
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-3 text-end">
              <button
                className="sp-history-btn"
                onClick={() =>
                  setShowHistory(false)
                }
              >
                <FiX className="me-2" />
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}