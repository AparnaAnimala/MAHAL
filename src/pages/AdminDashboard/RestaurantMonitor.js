// import React, { useEffect, useState } from "react";

// const API_BASE = "http://192.168.2.22:5000/api/v1/admin/monitor/restaurant";

// export default function RestaurantMonitor() {
//   const ADMIN_TOKEN = localStorage.getItem("admin_token");

//   const headers = {
//     Authorization: `Bearer ${ADMIN_TOKEN}`,
//   };

//   /* =======================
//      LIST VIEW
//   ======================= */
//   const [restaurants, setRestaurants] = useState([]);
//   const [selectedRestaurant, setSelectedRestaurant] = useState(null);

//   /* =======================
//      TABS & DATA
//   ======================= */
//   const [activeTab, setActiveTab] = useState("summary");
//   const [summary, setSummary] = useState(null);
//   const [orders, setOrders] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [invoices, setInvoices] = useState([]);
//   const [receipts, setReceipts] = useState([]);
//   const [activity, setActivity] = useState([]);
//   const [issues,setIssues] = useState([])
//   const [loading, setLoading] = useState(false);

//   /* =======================
//      SPLIT VIEW STATE
//   ======================= */
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [selectedInvoice, setSelectedInvoice] = useState(null);
// const [selectedReceipt, setSelectedReceipt] = useState(null);

//   /* =======================
//      LOAD RESTAURANTS
//   ======================= */
// useEffect(() => {
//   fetch(`${API_BASE}/list`, { headers })
//     .then(async (res) => {
//       if (res.status === 401) {
//         localStorage.clear();
//         window.location.href = "/admin/login";
//         return [];
//       }

//       if (res.status === 403) {
//         // No permission → show blank list silently
//         return [];
//       }

//       const data = await res.json();
//       return Array.isArray(data) ? data : [];
//     })
//     .then(setRestaurants)
//     .catch(err => {
//       console.error("Restaurant monitor load failed:", err);
//       setRestaurants([]);
//     });
// }, []);

//   /* =======================
//      LOAD SECTIONS
//   ======================= */
// const loadSection = async (restaurantId, section, setter) => {
//   setLoading(true);
//   try {
//     const res = await fetch(`${API_BASE}/${restaurantId}/${section}`, { headers });

//     if (res.status === 401) {
//       localStorage.clear();
//       window.location.href = "/admin/login";
//       return;
//     }

//     if (res.status === 403) {
//       setter(section === "summary" ? null : []);
//       return;
//     }

//     const data = await res.json();

//     // ✅ IMPORTANT FIX
//     if (section === "summary") {
//       if (data && !data.error) {
//         setter(data);
//       } else {
//         setter(null);
//       }
//     } else {
//       setter(Array.isArray(data) ? data : []);
//     }

//   } catch (err) {
//     console.error("Section load failed:", err);
//     setter(section === "summary" ? null : []);
//   } finally {
//     setLoading(false);
//   }
// };



//   useEffect(() => {
//     if (!selectedRestaurant) return;
//     setActiveTab("summary");
//     loadSection(selectedRestaurant.restaurant_id, "summary", setSummary);
//   }, [selectedRestaurant]);

//   useEffect(() => {
//     if (!selectedRestaurant) return;
//     const id = selectedRestaurant.restaurant_id;

//     setSelectedOrder(null);
//     setSelectedInvoice(null);

//     if (activeTab === "orders") loadSection(id, "orders", setOrders);
//     if (activeTab === "products") loadSection(id, "products", setProducts);
//     if (activeTab === "invoices") loadSection(id, "invoices", setInvoices);
//     if (activeTab === "order-issues") loadIssues(id);
//     if (activeTab === "receipts") loadSection(id,"receipts",setReceipts);
//     if (activeTab === "activity") loadSection(id, "activity", setActivity);

//   }, [activeTab]);

//   /* =======================
//      LOAD ORDER
//   ======================= */
//   const loadOrder = async (orderId) => {
//     const res = await fetch(`${API_BASE}/order/${orderId}`, { headers });
//     const data = await res.json();
//     setSelectedOrder(data);
//   };

//   /* =======================
//      LOAD INVOICE
//   ======================= */
//   const loadInvoice = async (invoiceId) => {
//     try {
//       setSelectedInvoice(null);

//       const res = await fetch(`${API_BASE}/invoice/${invoiceId}`, { headers });

//       if (!res.ok) {
//         const err = await res.json();
//         alert(err.error || "Failed to load invoice");
//         return;
//       }

//       const data = await res.json();

//       if (!data || !data.header) {
//         alert("Invoice data malformed");
//         return;
//       }

//       setSelectedInvoice(data);
//     } catch (err) {
//       console.error("Invoice load error:", err);
//       alert("Unable to load invoice");
//     }
//   };


// const loadReceipt = async (receiptId) => {
//   const res = await fetch(`${API_BASE}/receipt/${receiptId}`, { headers });
//   const data = await res.json();
//   setSelectedReceipt(data);
// };

// const loadIssues = async (restaurantId) => {

// const res = await fetch(
// `${API_BASE}/${restaurantId}/order-issues`,
// { headers }
// )

// const data = await res.json()

// setIssues(data)

// }
//   /* ======================================================
//      LIST VIEW
//   ====================================================== */
//   if (!selectedRestaurant) {
//     return (
//       <div style={{ background: "#fff", borderRadius: 8, padding: 20 }}>
//         <h2>Restaurant Monitoring</h2>

//         <table className="table">
//           <thead>
//             <tr>
//               <th>#</th>
//               <th>Restaurant</th>
//               <th>Email</th>
//               <th>Status</th>
//               <th>Approval</th>
//               <th>Registered</th>
//               <th>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {Array.isArray(restaurants) && restaurants.map((r, index) => (
//               <tr key={r.restaurant_id}>
//                 <td>{index + 1}</td>
//                 <td><b>{r.restaurant_name_english}</b></td>
//                 <td>{r.username}</td>
//                 <td>{r.user_status}</td>
//                 <td>{r.approval_status}</td>
//                 <td>{new Date(r.registered_at).toLocaleDateString()}</td>
//                 <td>
//                   <button
//                     onClick={() => setSelectedRestaurant(r)}
//                     style={{
//                       padding: "6px 12px",
//                       background: "#ff9800",
//                       border: "none",
//                       color: "#fff",
//                       borderRadius: 4,
//                       cursor: "pointer",
//                     }}
//                   >
//                     View
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     );
//   }

//   /* ======================================================
//      DETAILS VIEW
//   ====================================================== */
//   return (
//     <div style={{ background: "#fff", borderRadius: 8, padding: 20 }}>

//       {/* HEADER */}
//       <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
//         <h2>{selectedRestaurant.restaurant_name_english}</h2>
//         <button
//           onClick={() => {
//             setSelectedRestaurant(null);
//             setSelectedOrder(null);
//             setSelectedInvoice(null);
//           }}
//         >
//           ← Back
//         </button>
//       </div>

//       {/* TABS */}
//       <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
//         {["summary","orders","products","invoices","receipts","activity","order-issues"].map(tab => (
//           <button
//             key={tab}
//             onClick={() => setActiveTab(tab)}
//             style={{
//               background: activeTab === tab ? "#ff9800" : "#eee",
//               color: activeTab === tab ? "#fff" : "#333",
//               padding: "8px 14px",
//               border: "none",
//               borderRadius: 6
//             }}
//           >
//             {tab.toUpperCase()}
//           </button>
//         ))}
//       </div>

//       {loading && <div>Loading…</div>}

// {/* ================= RESTAURANT SUMMARY ================= */}
// {activeTab === "summary" && summary && (
//   <>
//     {/* ================= RESTAURANT DETAILS ================= */}
//     <table className="table">
//       <tbody>
//         <tr>
//           <td colSpan="2" style={{ fontWeight: "bold", background: "#f5f5f5", padding: 10 }}>
//             Restaurant Registration
//           </td>
//         </tr>

//         <tr><td>Restaurant ID</td><td>{summary.restaurant_id}</td></tr>
//         <tr><td>Restaurant Name</td><td>{summary.restaurant_name_english || "-"}</td></tr>
//         <tr><td>Contact Person</td><td>{summary.contact_person_name || "-"}</td></tr>
//         <tr><td>Mobile</td><td>{summary.contact_person_mobile || "-"}</td></tr>
//         <tr><td>Email</td><td>{summary.contact_person_email || "-"}</td></tr>
//         <tr><td>Address</td><td>{summary.address || "-"}</td></tr>
//         <tr><td>City</td><td>{summary.city || "-"}</td></tr>
//         <tr><td>Country</td><td>{summary.country || "-"}</td></tr>

//         {/* ✅ ADDED BELOW COUNTRY */}
//         <tr><td>Reviewed By Admin</td><td>{summary.reviewed_by_admin_id || "-"}</td></tr>
//         <tr><td>Assigned Admin</td><td>{summary.assigned_admin_id || "-"}</td></tr>

//       </tbody>
//     </table>

//     {/* ================= BRANCHES ================= */}
//     <h3 style={{ marginTop: 30 }}>Restaurant Branches</h3>

//     {summary.branches && summary.branches.length === 0 && (
//       <div>No branches found</div>
//     )}

//     {summary.branches && summary.branches.map((b, index) => (
//       <div key={b.branch_id} style={{ marginBottom: 30 }}>

//         <table className="table">
//           <tbody>
//             <tr>
//               <td colSpan="2" style={{ fontWeight: "bold", background: "#f5f5f5", padding: 10 }}>
//                 Branch #{index + 1}
//               </td>
//             </tr>

//             <tr><td>Branch ID</td><td>{b.branch_id}</td></tr>
//             <tr><td>Restaurant ID</td><td>{b.restaurant_id}</td></tr>
//             <tr><td>Branch Name</td><td>{b.branch_name_english || "-"}</td></tr>
//             <tr><td>Manager</td><td>{b.branch_manager_name || "-"}</td></tr>
//             <tr><td>Contact</td><td>{b.contact_number || "-"}</td></tr>
//             <tr><td>Email</td><td>{b.email || "-"}</td></tr>
//             <tr><td>City</td><td>{b.city || "-"}</td></tr>
//             <tr><td>Country</td><td>{b.country || "-"}</td></tr>
//           </tbody>
//         </table>

//         <h4 style={{ marginTop: 15 }}>Stores Under This Branch</h4>

//         {b.stores && b.stores.length === 0 && (
//           <div>No stores found under this branch</div>
//         )}

//         {b.stores && b.stores.map((s, sIndex) => (
//           <table key={s.store_id} className="table" style={{ marginBottom: 20 }}>
//             <tbody>
//               <tr>
//                 <td colSpan="2" style={{ fontWeight: "bold", background: "#eaeaea", padding: 8 }}>
//                   Store #{sIndex + 1}
//                 </td>
//               </tr>

//               <tr><td>Store ID</td><td>{s.store_id}</td></tr>
//               <tr><td>Restaurant ID</td><td>{s.restaurant_id}</td></tr>
//               <tr><td>Store Name</td><td>{s.store_name_english || "-"}</td></tr>
//               <tr><td>Contact Person</td><td>{s.contact_person_name || "-"}</td></tr>
//               <tr><td>Mobile</td><td>{s.contact_person_mobile || "-"}</td></tr>
//               <tr><td>Email</td><td>{s.email || "-"}</td></tr>
//               <tr><td>City</td><td>{s.city || "-"}</td></tr>
//               <tr><td>Country</td><td>{s.country || "-"}</td></tr>
//             </tbody>
//           </table>
//         ))}

//       </div>
//     ))}
//   </>
// )}








//      {/* ================= ORDERS ================= */}
// {activeTab === "orders" && (
//   <div style={{ display: "flex", gap: 20 }}>
//     <div style={{ flex: 1 }}>
//       <table className="table">
//         <thead>
//           <tr>
//             <th>#</th>
//             <th>Order ID</th>
//             <th>Status</th>
//             <th>Total</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {orders.map((o, idx) => (
//             <tr key={o.order_id}>
//               <td>{idx + 1}</td>
//               <td>{o.order_id}</td>
//               <td>{o.status}</td>
//               <td>{o.total_amount}</td>
//               <td>
//                 <button onClick={() => loadOrder(o.order_id)}>View</button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>

//     <div style={{ flex: 1 }}>
//       {!selectedOrder && <div>Select an order</div>}

//       {selectedOrder?.header && (
//         <>
//           <h3>Order Summary</h3>
//           <div>Order ID: {selectedOrder.header.order_id}</div>
//           <div>Status: {selectedOrder.header.status}</div>
//           <div>Payment: {selectedOrder.header.payment_status}</div>
//           <div>Total: {selectedOrder.header.total_amount}</div>
//           <div>Expected Delivery: {selectedOrder.header.expected_delivery_date || "-"}</div>
//           <div>Remarks: {selectedOrder.header.remarks || "-"}</div>

//           <h4 style={{ marginTop: 16 }}>Supplier Details</h4>
//           <div>Company: {selectedOrder.header.supplier_company || "-"}</div>
//           <div>Store: {selectedOrder.header.supplier_store_name || "-"}</div>
//           <div>Contact: {selectedOrder.header.supplier_contact_person || "-"}</div>
//           <div>Mobile: {selectedOrder.header.supplier_contact_mobile || "-"}</div>
//           <div>Email: {selectedOrder.header.supplier_email || "-"}</div>
//          <div>
//             Address: {" "}
//             {selectedOrder.header.supplier_street || ""}{" "}
//             {selectedOrder.header.supplier_zone || ""}{" "}
//             {selectedOrder.header.supplier_building || ""}{" "}
//             {selectedOrder.header.supplier_shop_no || "-"}
//           </div>

//           <h4 style={{ marginTop: 16 }}>Restaurant Details</h4>
//           <div>Name: {selectedOrder.header.restaurant_name_english}</div>
//           <div>Store: {selectedOrder.header.store_name_english || "-"}</div>
//           <div>Contact: {selectedOrder.header.contact_person_name || "-"}</div>
//           <div>Mobile: {selectedOrder.header.contact_person_mobile || "-"}</div>
//           <div>Email: {selectedOrder.header.email || "-"}</div>
//           <div>


//             Address: {" "}
//             {selectedOrder.header.street || ""}{" "}
//             {selectedOrder.header.zone || ""}{" "}
//             {selectedOrder.header.building || ""}{" "}
//             {selectedOrder.header.shop_no || "-"}
//           </div>

//           <h4 style={{ marginTop: 16 }}>Products</h4>
//           <table className="table">
//             <thead>
//               <tr>
//                 <th>Product</th>
//                 <th>Qty</th>
//                 <th>Price</th>
//                 <th>Discount</th>
//                 <th>Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               {selectedOrder.items.map((i, idx) => (
//                 <tr key={idx}>
//                   <td>{i.product_name_english}</td>
//                   <td>{i.quantity}</td>
//                   <td>{i.price_per_unit}</td>
//                   <td>{i.discount}</td>
//                   <td>{i.total_amount}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           <h4 style={{ marginTop: 16 }}>Timeline</h4>
//           <ul>
//             {selectedOrder.timeline.map((t, idx) => (
//               <li key={idx}>
//                 {t.status} — {t.changed_by_role} —{" "}
//                 {new Date(t.changed_at).toLocaleString()}
//               </li>
//             ))}
//           </ul>
//         </>
//       )}
//     </div>
//   </div>
// )}

//       {/* ================= PRODUCTS ================= */}
//       {activeTab === "products" && (
//         <table className="table">
//           <thead>
//             <tr>
//               <th>Product</th>
//               <th>Status</th>
//               <th>Price</th>
//               <th>Stock</th>
//             </tr>
//           </thead>
//           <tbody>
//             {products.map(p => (
//               <tr key={p.product_id}>
//                 <td>{p.product_name_english}</td>
//                 <td>{p.product_status}</td>
//                 <td>{p.price_per_unit}</td>
//                 <td>{p.stock_availability}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}

//       {/* ================= INVOICES ================= */}
//       {activeTab === "invoices" && (
//         <div style={{ display: "flex", gap: 20 }}>
//           <div style={{ flex: 1 }}>
//             <table className="table">
//               <thead>
//                 <tr>
//                   <th>#</th>
//                   <th>Invoice</th>
//                   <th>Total</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {invoices.map((i, idx) => (
//                   <tr key={i.invoice_id}>
//                     <td>{idx + 1}</td>
//                     <td>{i.invoice_number || i.invoice_id}</td>
//                     <td>{i.grand_total}</td>
//                     <td>
//                       <button onClick={() => loadInvoice(i.invoice_id)}>View</button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div style={{ flex: 1 }}>
//             {!selectedInvoice && <div>Select invoice</div>}

//             {selectedInvoice && selectedInvoice.header && (
//               <>
//                 <h3>Invoice Summary</h3>
//                 <div>Invoice No: {selectedInvoice.header.invoice_number}</div>
//                 <div>Status: {selectedInvoice.header.invoice_status}</div>
//                 <div>Payment: {selectedInvoice.header.payment_status}</div>
//                 <div>Subtotal: {selectedInvoice.header.subtotal_amount}</div>
//                 <div>Discount: {selectedInvoice.header.discount_amount}</div>
//                 <div>Tax: {selectedInvoice.header.tax_amount}</div>
//                 <div>Total: {selectedInvoice.header.grand_total}</div>

//                 <h4 style={{ marginTop: 16 }}>Supplier Details</h4>
//                 <div>Supplier ID: {selectedInvoice.header.supplier_id}</div>
//                 <div>Address: {selectedInvoice.header.supplier_address || "-"}</div>

//                 {selectedInvoice.supplier && (
//                   <>
//                     <div>Store: {selectedInvoice.supplier.store_name_english}</div>
//                     <div>Contact: {selectedInvoice.supplier.contact_person_name}</div>
//                     <div>Mobile: {selectedInvoice.supplier.contact_person_mobile}</div>
//                     <div>Email: {selectedInvoice.supplier.email}</div>
//                   </>
//                 )}

//                 <h4 style={{ marginTop: 16 }}>Restaurant Details</h4>
//                 <div>Restaurant ID: {selectedInvoice.header.restaurant_id}</div>
//                 <div>Address: {selectedInvoice.header.restaurant_address || "-"}</div>

//                 {selectedInvoice.restaurant && (
//                   <>
//                     <div>Name: {selectedInvoice.restaurant.restaurant_name}</div>
//                     <div>Contact: {selectedInvoice.restaurant.contact_person_name}</div>
//                     <div>Mobile: {selectedInvoice.restaurant.contact_person_mobile}</div>
//                     <div>Email: {selectedInvoice.restaurant.email}</div>
//                   </>
//                 )}

//                 <h4 style={{ marginTop: 16 }}>Items</h4>
//                 <table className="table">
//                   <thead>
//                     <tr>
//                       <th>Product</th>
//                       <th>Qty</th>
//                       <th>Price</th>
//                       <th>Discount</th>
//                       <th>Total</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {selectedInvoice.items.map((i, idx) => (
//                       <tr key={idx}>
//                         <td>{i.product_name_english}</td>
//                         <td>{i.quantity}</td>
//                         <td>{i.price_per_unit}</td>
//                         <td>{i.discount}</td>
//                         <td>{i.total_amount}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>

//                 <h4 style={{ marginTop: 16 }}>Payments</h4>
//                 {(selectedInvoice.payments || []).length === 0
//                   ? <div>No payments recorded</div>
//                   : selectedInvoice.payments.map((p, idx) => (
//                       <div key={idx}>{p.payment_method} — {p.paid_amount}</div>
//                     ))
//                 }
//               </>
//             )}
//           </div>
//         </div>
//       )}

// {/* ================= RECEIPTS ================= */}
// {activeTab === "receipts" && (
//   <div style={{ display: "flex", gap: 20 }}>

//     <div style={{ flex: 1 }}>
//       <table className="table">
//         <thead>
//           <tr>
//             <th>#</th>
//             <th>Receipt ID</th>
//             <th>Invoice</th>
//             <th>Amount</th>
//             <th>Action</th>
//           </tr>
//         </thead>

//         <tbody>
//           {receipts.map((r, idx) => (
//             <tr key={r.receipt_id}>
//               <td>{idx + 1}</td>
//               <td>{r.receipt_id}</td>
//               <td>{r.invoice_no}</td>
//               <td>{r.amount_received}</td>

//               <td>
//                 <button onClick={() => loadReceipt(r.receipt_id)}>
//                   View
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>


//     <div style={{ flex: 1 }}>

//       {!selectedReceipt && (
//         <div style={{ color: "#999" }}>
//           Select a receipt to view details
//         </div>
//       )}

//       {selectedReceipt?.header && (
//         <>
//           <h3>Receipt Summary</h3>

//           <div>Receipt ID: {selectedReceipt.header.receipt_id}</div>
//           <div>Date: {selectedReceipt.header.receipt_date}</div>
//           <div>Amount Received: {selectedReceipt.header.amount_received}</div>
//           <div>Payment Mode: {selectedReceipt.header.payment_mode}</div>
//           <div>Reference: {selectedReceipt.header.reference_number}</div>
//           <div>Status: {selectedReceipt.header.payment_status}</div>
//           <div>Remarks: {selectedReceipt.header.remarks || "-"}</div>

//           <h4 style={{ marginTop: 16 }}>Supplier Details</h4>
//           {selectedReceipt?.supplier && (
//             <>
//               <div>Company : {selectedReceipt.supplier.supplier_name}</div>
//               <div>Store : {selectedReceipt.supplier.store_name_english}</div>
//               <div>Contact : {selectedReceipt.supplier.contact_person_name}</div>
//               <div>Mobile : {selectedReceipt.supplier.contact_person_mobile}</div>
//               <div>Email : {selectedReceipt.supplier.email || "-"}</div>
//           <div>Address : {[selectedReceipt.supplier.shop_no, selectedReceipt.supplier.building, selectedReceipt.supplier.street, selectedReceipt.supplier.city].filter(Boolean).join(", ") || "-"}</div>
//             </>
//           )}

//           <h4 style={{ marginTop: 16 }}>Restaurant Details</h4>
//           {selectedReceipt?.restaurant && (
//             <>
//               <div>Restaurant : {selectedReceipt.restaurant.restaurant_name}</div>
//               <div>Store : {selectedReceipt.restaurant.store_name_english}</div>
//               <div>Contact : {selectedReceipt.restaurant.contact_person_name}</div>
//               <div>Mobile : {selectedReceipt.restaurant.contact_person_mobile}</div>
//               <div>Email : {selectedReceipt.supplier.email || "-"}</div>
//           <div>Address : {[selectedReceipt.supplier.shop_no, selectedReceipt.supplier.building, selectedReceipt.supplier.street, selectedReceipt.supplier.city].filter(Boolean).join(", ") || "-"}</div>
//             </>
//           )}
//         </>
//       )}
// <h4 style={{ marginTop: 16 }}>Receipt Items</h4>

// <table className="table">
// <thead>
// <tr>
// <th>Product</th>
// <th>Qty</th>
// <th>Price</th>
// <th>Discount</th>
// <th>Total</th>
// </tr>
// </thead>

// <tbody>
// {selectedReceipt?.items && selectedReceipt.items.length > 0 ? (
// selectedReceipt.items.map((i, idx) => (
// <tr key={idx}>
// <td>{i.product_name_english}</td>
// <td>{i.quantity}</td>
// <td>{i.price_per_unit}</td>
// <td>{i.discount}</td>
// <td>{i.total_amount}</td>
// </tr>
// ))
// ) : (
// <tr>
// <td colSpan="5" style={{ textAlign: "center" }}>
// No items found
// </td>
// </tr>
// )}
// </tbody>
// </table>




//     </div>

//   </div>
// )}

//       {/* ================= ACTIVITY ================= */}
// {activeTab === "activity" && (
//   <table className="table">
//     <thead>
//       <tr>
//         <th>Action</th>
//         <th>Entity</th>
//         <th>Time</th>
//       </tr>
//     </thead>

//     <tbody>
//       {activity.length === 0 ? (
//         <tr>
//           <td colSpan="3" style={{ textAlign: "center", color: "#999" }}>
//             No activity found
//           </td>
//         </tr>
//       ) : (
//         activity.map(a => (
//           <tr key={a.audit_id}>
//             <td>{a.action}</td>
//             <td>{a.entity_type} / {a.entity_id}</td>
//             <td>{a.created_at}</td>
//           </tr>
//         ))
//       )}
//     </tbody>
//   </table>
// )}

// {/* ================= ORDER ISSUES ================= */}
// {activeTab === "order-issues" && (

//   <table className="table">

//     <thead>
//       <tr>
//         <th>#</th>
//         <th>Issue_Report_Id</th>
//         <th>Order_Id</th>
//         <th>Restaurant ID</th>
//         <th>Restaurant_Name</th>
//         <th>Supplier_Name</th>
//         <th>Issue_Type</th>
//         <th>Status</th>
//       </tr>
//     </thead>

//     <tbody>

//       {issues.length === 0 ? (

//         <tr>
//           <td colSpan="8" style={{ textAlign: "center", color: "#999" }}>
//             No issues found
//           </td>
//         </tr>

//       ) : (

//         issues.map((i, idx) => (
//           <tr key={i.issue_report_id}>

//             <td>{idx + 1}</td>
//             <td>{i.issue_report_id}</td>
//             <td>{i.order_id}</td>
//             <td>{i.restaurant_id}</td>
//             <td>{i.restaurant_name}</td>
//             <td>{i.supplier_name}</td>
//             <td>{i.issue_type}</td>
//             <td>{i.status}</td>

//           </tr>
//         ))

//       )}

//     </tbody>

//   </table>

// )}

// </div>
// );
// }



import React, { useEffect, useState } from "react";
import { FaPowerOff, FaSignOutAlt, FaHistory } from "react-icons/fa";
import "../css/CouponManagement.css";
const API_BASE = "http://192.168.2.22:5000/api/v1/admin/monitor/restaurant";
export default function RestaurantMonitor() {

  const ADMIN_TOKEN = localStorage.getItem("admin_token");

  useEffect(() => {
    if (!ADMIN_TOKEN) {
      window.location.href = "/admin/login";
    }
  }, []);

  const headers = {
    Authorization: `Bearer ${ADMIN_TOKEN}`,
  };

  const btnStyle = {
    width: 32,
    height: 32,
    border: "1px solid #ccc",
    borderRadius: 4,
    background: "#f5f5f5",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };


  /* =======================
     LIST VIEW
  ======================= */
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);


  // ================= USER ACTIONS =================

  // TOGGLE STATUS
  const toggleUserStatus = async () => {
    try {
      const userId = selectedRestaurant?.user_id;
      if (!userId) return alert("User ID missing");

      const isActive = selectedRestaurant.user_status === "active";

      let reason = null;
      if (isActive) {
        reason = prompt("Reason for suspension (optional):");
        if (reason === null) return;
      }

      if (!window.confirm(
        isActive
          ? "Suspend this restaurant?"
          : "Activate this restaurant?"
      )) return;

      const newStatus = isActive ? "suspended" : "active";

      const res = await fetch(
        `http://192.168.2.22:5000/api/v1/admin/restaurants/users/${userId}/status`,
        {
          method: "PATCH",
          headers: {
            ...headers,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status: newStatus, reason })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed ❌");
        return;
      }

      setSelectedRestaurant(prev => ({
        ...prev,
        user_status: newStatus
      }));

      alert("Status Updated ✅");

    } catch (err) {
      console.error(err);
      alert("Error ❌");
    }
  };


  // LOGOUT
  const forceUserLogout = async () => {
    try {
      const userId = selectedRestaurant?.user_id;
      if (!userId) return alert("User ID missing");

      if (!window.confirm(`Force logout ${selectedRestaurant.username}?`)) return;

      const res = await fetch(
        `http://192.168.2.22:5000/api/v1/admin/restaurants/users/${userId}/force-logout`,
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

      alert("Logged out ✅");

    } catch (err) {
      console.error(err);
      alert("Logout error ❌");
    }
  };


  // AUDIT LOGS
  const [showLogs, setShowLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  const loadAuditLogs = async () => {
    try {
      const restaurantId = selectedRestaurant?.restaurant_id;
      if (!restaurantId) return;

      const res = await fetch(
        `http://192.168.2.22:5000/api/v1/admin/platform-audit?actor_type=RESTAURANT&linked_id=${restaurantId}`,
        { headers }
      );

      const data = await res.json();

      if (!res.ok) {
        alert("Failed ❌");
        return;
      }

      setAuditLogs(data);
      setShowLogs(true);

    } catch (err) {
      console.error(err);
      alert("Error ❌");
    }
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
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(false);

  /* =======================
     SPLIT VIEW STATE
  ======================= */
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  /* =======================
     LOAD RESTAURANTS
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
      .then(setRestaurants)
      .catch(err => {
        console.error("Restaurant monitor load failed:", err);
        setRestaurants([]);
      });
  }, []);

  /* =======================
     LOAD SECTIONS
  ======================= */
  const loadSection = async (restaurantId, section, setter) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${restaurantId}/${section}`, { headers });

      if (res.status === 401) {
        localStorage.clear();
        window.location.href = "/admin/login";
        return;
      }

      if (res.status === 403) {
        setter(section === "summary" ? null : []);
        return;
      }

      const data = await res.json();

      // ✅ IMPORTANT FIX
      if (section === "summary") {
        if (data && !data.error) {
          setter(data);
        } else {
          setter(null);
        }
      } else {
        setter(Array.isArray(data) ? data : []);
      }

    } catch (err) {
      console.error("Section load failed:", err);
      setter(section === "summary" ? null : []);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    if (!selectedRestaurant) return;
    setActiveTab("summary");
    loadSection(selectedRestaurant.restaurant_id, "summary", setSummary);
  }, [selectedRestaurant]);

  useEffect(() => {
    if (!selectedRestaurant) return;
    const id = selectedRestaurant.restaurant_id;

    setSelectedOrder(null);
    setSelectedInvoice(null);

    if (activeTab === "orders") loadSection(id, "orders", setOrders);
    if (activeTab === "products") loadSection(id, "products", setProducts);
    if (activeTab === "invoices") loadSection(id, "invoices", setInvoices);
    if (activeTab === "order-issues") loadIssues(id);
    if (activeTab === "receipts") loadSection(id, "receipts", setReceipts);
    if (activeTab === "activity") loadSection(id, "activity", setActivity);

  }, [activeTab]);

  /* =======================
     LOAD ORDER
  ======================= */
  const loadOrder = async (orderId) => {
    const res = await fetch(`${API_BASE}/order/${orderId}`, { headers });
    const data = await res.json();
    setSelectedOrder(data);
  };


  // ================= ORDER ACTION FUNCTIONS =================

  const callOrderAction = async (orderId, action, payload = {}) => {
    try {
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
        alert(data.error || "Action failed");
        return;
      }

      alert("Action successful");

      await loadOrder(orderId);

      // SAFE CHECK (no crash)
      if (selectedRestaurant?.restaurant_id) {
        loadSection(selectedRestaurant.restaurant_id, "orders", setOrders);
      }

    } catch (err) {
      console.error(err);
      alert("Action failed");
    }
  };


  // CANCEL ORDER
  const cancelOrder = (orderId) => {
    const reason = prompt("Enter cancel reason:");
    if (!reason) return;
    callOrderAction(orderId, "cancel", { reason });
  };


  // FORCE COMPLETE
  const forceCompleteOrder = (orderId) => {
    const reason = prompt("Enter completion reason:");
    if (!reason) return;
    callOrderAction(orderId, "complete", { reason });
  };


  // UPDATE STATUS
  const updateOrderStatus = (orderId) => {
    const status = prompt("Enter status (PLACED, ACCEPTED, PACKED, DELIVERED):");
    if (!status) return;

    const reason = prompt("Enter reason:");
    callOrderAction(orderId, "update-status", { status, reason });
  };




  /* =======================
   LOAD INVOICE
======================= */
  const loadInvoice = async (invoiceId) => {
    try {
      setSelectedInvoice(null);

      const res = await fetch(`${API_BASE}/invoice/${invoiceId}`, { headers });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to load invoice");
        return;
      }

      const data = await res.json();

      if (!data || !data.header) {
        alert("Invoice data malformed");
        return;
      }

      setSelectedInvoice(data);

      // 🔥 THIS LINE ADDED (IMPORTANT)
      setShowInvoiceModal(true);

    } catch (err) {
      console.error("Invoice load error:", err);
      alert("Unable to load invoice");
    }
  };


  const loadReceipt = async (receiptId) => {
    const res = await fetch(`${API_BASE}/receipt/${receiptId}`, { headers });
    const data = await res.json();

    setSelectedReceipt(data);
    setShowReceiptModal(true); // 👈 add this
  };

  const loadIssues = async (restaurantId) => {

    const res = await fetch(
      `${API_BASE}/${restaurantId}/order-issues`,
      { headers }
    )

    const data = await res.json()

    setIssues(data)

  }
  /* ======================================================
   LIST VIEW
====================================================== */
  if (!selectedRestaurant) {
    return (
      <div className="coupon-card">
        <h2 className="coupon-section-title">Restaurant Monitoring</h2>

        <div className="coupon-table-wrap">
          <table className="coupon-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Restaurant</th>
                <th>Email</th>
                <th>Status</th>
                <th>Approval</th>
                <th>Registered</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {Array.isArray(restaurants) && restaurants.map((r, index) => (
                <tr key={r.restaurant_id}>
                  <td>{index + 1}</td>

                  <td><b>{r.restaurant_name_english}</b></td>

                  <td>{r.username}</td>

                  <td>
                    <span
                      className={`coupon-badge ${r.user_status === "active"
                        ? "coupon-badge-code"
                        : "coupon-badge-danger"
                        }`}
                    >
                      {r.user_status}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`coupon-badge ${r.approval_status === "Approved"
                        ? "coupon-badge-success"
                        : "coupon-badge-dark"
                        }`}
                    >
                      {r.approval_status}
                    </span>
                  </td>

                  <td>
                    {new Date(r.registered_at).toLocaleDateString()}
                  </td>

                  <td>
                    <button
                      onClick={() => setSelectedRestaurant(r)}
                      className="coupon-btn coupon-btn-sm coupon-btn-primary"
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
    );
  }

  /* ======================================================
   DETAILS VIEW
====================================================== */
  return (
    <div className="coupon-card">

      {/* HEADER */}
      <div className="coupon-header">
        <h2>{selectedRestaurant?.restaurant_name_english}</h2>

        <div className="coupon-actions">

          <button
            className="icon-btn icon-btn-blue"
            onClick={toggleUserStatus}
            title="Toggle Status"
          >
            <FaPowerOff size={18} />
          </button>

          <button
            className="icon-btn icon-btn-orange"
            onClick={forceUserLogout}
            title="Force Logout"
          >
            <FaSignOutAlt size={18} />
          </button>

          <button
            className="back-btn"
            onClick={() => {
              setSelectedRestaurant(null);
              setSelectedOrder(null);
              setSelectedInvoice(null);
            }}
          >
            ← Back
          </button>

        </div>
      </div>

      {/* BASIC INFO */}
      <div className="coupon-info">
        <p><b>Email:</b> {selectedRestaurant?.username}</p>
        <p><b>Status:</b> {selectedRestaurant?.user_status}</p>
      </div>

      {/* ================= TABS ================= */}
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

      {/* ================= RESTAURANT SUMMARY ================= */}
      {activeTab === "summary" && summary && (
        <>
          {/* ================= RESTAURANT DETAILS ================= */}
          <div className="coupon-table-wrap">
            <table className="coupon-table">
              <tbody>

                <tr>
                  <td colSpan="2" className="coupon-section-title">
                    Restaurant Registration
                  </td>
                </tr>

                <tr><td>Restaurant ID</td><td>{summary.restaurant_id}</td></tr>
                <tr><td>Restaurant Name</td><td>{summary.restaurant_name_english || "-"}</td></tr>
                <tr><td>Contact Person</td><td>{summary.contact_person_name || "-"}</td></tr>
                <tr><td>Mobile</td><td>{summary.contact_person_mobile || "-"}</td></tr>
                <tr><td>Email</td><td>{summary.contact_person_email || "-"}</td></tr>
                <tr><td>Address</td><td>{summary.address || "-"}</td></tr>
                <tr><td>City</td><td>{summary.city || "-"}</td></tr>
                <tr><td>Country</td><td>{summary.country || "-"}</td></tr>

                {/* ✅ ADDED BELOW COUNTRY */}
                <tr><td>Reviewed By Admin</td><td>{summary.reviewed_by_admin_id || "-"}</td></tr>
                <tr><td>Assigned Admin</td><td>{summary.assigned_admin_id || "-"}</td></tr>

              </tbody>
            </table>
          </div>

          {/* ================= BRANCHES ================= */}
          <h3 style={{ marginTop: 30 }}>Restaurant Branches</h3>

          {summary.branches && summary.branches.length === 0 && (
            <div>No branches found</div>
          )}

          {summary.branches && summary.branches.map((b, index) => (
            <div key={b.branch_id} className="coupon-card">

              <div className="coupon-table-wrap">
                <table className="coupon-table">
                  <tbody>

                    <tr>
                      <td colSpan="2" className="coupon-section-title">
                        Branch #{index + 1}
                      </td>
                    </tr>

                    <tr><td>Branch ID</td><td>{b.branch_id}</td></tr>
                    <tr><td>Restaurant ID</td><td>{b.restaurant_id}</td></tr>
                    <tr><td>Branch Name</td><td>{b.branch_name_english || "-"}</td></tr>
                    <tr><td>Manager</td><td>{b.branch_manager_name || "-"}</td></tr>
                    <tr><td>Contact</td><td>{b.contact_number || "-"}</td></tr>
                    <tr><td>Email</td><td>{b.email || "-"}</td></tr>
                    <tr><td>City</td><td>{b.city || "-"}</td></tr>
                    <tr><td>Country</td><td>{b.country || "-"}</td></tr>

                  </tbody>
                </table>
              </div>

              <h4 className="coupon-section-title">Stores Under This Branch</h4>

              {b.stores && b.stores.length === 0 && (
                <div>No stores found under this branch</div>
              )}

              {b.stores && b.stores.map((s, sIndex) => (
                <div key={s.store_id} className="coupon-table-wrap">

                  <table className="coupon-table">
                    <tbody>

                      <tr>
                        <td colSpan="2" className="coupon-section-title">
                          Store #{sIndex + 1}
                        </td>
                      </tr>

                      <tr><td>Store ID</td><td>{s.store_id}</td></tr>
                      <tr><td>Restaurant ID</td><td>{s.restaurant_id}</td></tr>
                      <tr><td>Store Name</td><td>{s.store_name_english || "-"}</td></tr>
                      <tr><td>Contact Person</td><td>{s.contact_person_name || "-"}</td></tr>
                      <tr><td>Mobile</td><td>{s.contact_person_mobile || "-"}</td></tr>
                      <tr><td>Email</td><td>{s.email || "-"}</td></tr>
                      <tr><td>City</td><td>{s.city || "-"}</td></tr>
                      <tr><td>Country</td><td>{s.country || "-"}</td></tr>

                    </tbody>
                  </table>

                </div>
              ))}

            </div>
          ))}
        </>
      )}

      {/* ================= ORDERS ================= */}
      {activeTab === "orders" && (
        <div className="coupon-layout">

          {/* LEFT SIDE */}
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
                  {(orders || []).map((o, idx) => (
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
                          onClick={async () => {
                            await loadOrder(o.order_id);
                            setShowOrderModal(true);
                          }}
                          className="coupon-btn coupon-btn-sm coupon-btn-primary"
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

      {/* ================= MODAL ================= */}
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

              {/* ================= ORDER SUMMARY ================= */}
              <h3>Order Summary</h3>
              <div>Order ID: {selectedOrder.header.order_id}</div>
              <div>Status: {selectedOrder.header.status}</div>
              <div>Payment: {selectedOrder.header.payment_status}</div>
              <div>Total: {selectedOrder.header.total_amount}</div>
              <div>Expected Delivery: {selectedOrder.header.expected_delivery_date || "-"}</div>
              <div>Remarks: {selectedOrder.header.remarks || "-"}</div>

              {/* ================= SUPPLIER DETAILS ================= */}
              <h4 style={{ marginTop: 16 }}>Supplier Details</h4>
              <div>Company: {selectedOrder.header.supplier_company || "-"}</div>
              <div>Store: {selectedOrder.header.supplier_store_name || "-"}</div>
              <div>Contact: {selectedOrder.header.supplier_contact_person || "-"}</div>
              <div>Mobile: {selectedOrder.header.supplier_contact_mobile || "-"}</div>
              <div>Email: {selectedOrder.header.supplier_email || "-"}</div>
              <div>
                Address:{" "}
                {selectedOrder.header.supplier_shop_no || ""}{" "}
                {selectedOrder.header.supplier_building || ""}{" "}
                {selectedOrder.header.supplier_street || ""}{" "}
                {selectedOrder.header.supplier_zone || ""}{" "}
                {selectedOrder.header.supplier_city || ""}{" "}
                {selectedOrder.header.supplier_country || ""}
              </div>

              {/* ================= RESTAURANT DETAILS ================= */}
              <h4 style={{ marginTop: 16 }}>Restaurant Details</h4>
              <div>Name: {selectedOrder.header.restaurant_name_english}</div>
              <div>Store: {selectedOrder.header.store_name_english || "-"}</div>
              <div>Contact: {selectedOrder.header.contact_person_name || "-"}</div>
              <div>Mobile: {selectedOrder.header.contact_person_mobile || "-"}</div>
              <div>Email: {selectedOrder.header.email || "-"}</div>
              <div>
                Address:{" "}
                {selectedOrder.header.shop_no || ""}{" "}
                {selectedOrder.header.building || ""}{" "}
                {selectedOrder.header.street || ""}{" "}
                {selectedOrder.header.zone || ""}{" "}
                {selectedOrder.header.city || ""}{" "}
                {selectedOrder.header.country || ""}
              </div>

              {/* ================= PRODUCTS ================= */}
              <h4 style={{ marginTop: 16 }}>Products</h4>

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
                    {(selectedOrder?.items || []).map((i, idx) => (
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

              {/* ================= TIMELINE ================= */}
              <h4 style={{ marginTop: 16 }}>Timeline</h4>
              <ul>
                {(selectedOrder?.timeline || []).map((t, idx) => (
                  <li key={idx}>
                    {t.status} — {t.changed_by_role} —{" "}
                    {new Date(t.changed_at).toLocaleString()}
                  </li>
                ))}
              </ul>

              {/* ================= ORDER CONTROL CENTER ================= */}
              <div className="coupon-card">
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
                <div style={{
                  marginTop: 15,
                  padding: 10,
                  background: "#fff",
                  border: "1px solid #eee",
                  borderRadius: 6
                }}>
                  <div><b>Order ID:</b> {selectedOrder.header.order_id}</div>
                  <div><b>Status:</b> {selectedOrder.header.status}</div>
                  <div><b>Payment Status:</b> {selectedOrder.header.payment_status}</div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* ================= PRODUCTS ================= */}
      {activeTab === "products" && (
        <div className="coupon-card">

          <h3 className="coupon-section-title">Products</h3>

          <div className="coupon-table-wrap">
            <table className="coupon-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>

              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", color: "#999" }}>
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.product_id}>
                      <td>{p.product_name_english}</td>

                      <td>
                        <span
                          className={`coupon-badge ${p.product_status === "active"
                            ? "coupon-badge-success"
                            : "coupon-badge-danger"
                            }`}
                        >
                          {p.product_status}
                        </span>
                      </td>

                      <td>{p.price_per_unit}</td>

                      <td>
                        <span className="coupon-badge coupon-badge-info">
                          {p.stock_availability}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}
      {/* ================= INVOICES ================= */}
      {activeTab === "invoices" && (
        <div className="coupon-card">

          <h3 className="coupon-section-title">Invoices</h3>

          <div className="coupon-table-wrap">
            <table className="coupon-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Invoice</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", color: "#999" }}>
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  invoices.map((i, idx) => (
                    <tr key={i.invoice_id}>
                      <td>{idx + 1}</td>
                      <td>{i.invoice_number || i.invoice_id}</td>
                      <td>{i.grand_total}</td>
                      <td>
                        <button
                          onClick={() => loadInvoice(i.invoice_id)}
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


      {/* ================= INVOICE MODAL ================= */}
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

              <div>Invoice No: {selectedInvoice.header.invoice_number}</div>
              <div>Status: {selectedInvoice.header.invoice_status}</div>
              <div>Payment: {selectedInvoice.header.payment_status}</div>
              <div>Subtotal: {selectedInvoice.header.subtotal_amount}</div>
              <div>Discount: {selectedInvoice.header.discount_amount}</div>
              <div>Tax: {selectedInvoice.header.tax_amount}</div>
              <div>Total: {selectedInvoice.header.grand_total}</div>

              <h4 style={{ marginTop: 16 }}>Supplier Details</h4>
              <div>Supplier ID: {selectedInvoice.header.supplier_id}</div>
              <div>Address: {selectedInvoice.header.supplier_address || "-"}</div>

              {selectedInvoice.supplier && (
                <>
                  <div>Store: {selectedInvoice.supplier.store_name_english}</div>
                  <div>Contact: {selectedInvoice.supplier.contact_person_name}</div>
                  <div>Mobile: {selectedInvoice.supplier.contact_person_mobile}</div>
                  <div>Email: {selectedInvoice.supplier.email}</div>
                </>
              )}

              <h4 style={{ marginTop: 16 }}>Restaurant Details</h4>
              <div>Restaurant ID: {selectedInvoice.header.restaurant_id}</div>
              <div>Address: {selectedInvoice.header.restaurant_address || "-"}</div>

              {selectedInvoice.restaurant && (
                <>
                  <div>Name: {selectedInvoice.restaurant.restaurant_name}</div>
                  <div>Contact: {selectedInvoice.restaurant.contact_person_name}</div>
                  <div>Mobile: {selectedInvoice.restaurant.contact_person_mobile}</div>
                  <div>Email: {selectedInvoice.restaurant.email}</div>
                </>
              )}

              {/* ITEMS */}
              <h4 style={{ marginTop: 16 }}>Items</h4>

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
                    {(selectedInvoice.items || []).length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", color: "#999" }}>
                          No items found
                        </td>
                      </tr>
                    ) : (
                      selectedInvoice.items.map((i, idx) => (
                        <tr key={idx}>
                          <td>{i.product_name_english}</td>
                          <td>{i.quantity}</td>
                          <td>{i.price_per_unit}</td>
                          <td>{i.discount}</td>
                          <td>{i.total_amount}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAYMENTS */}
              <h4 style={{ marginTop: 16 }}>Payments</h4>

              {(selectedInvoice.payments || []).length === 0 ? (
                <div style={{ color: "#999" }}>No payments recorded</div>
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
      {/* ================= RECEIPT MODAL ================= */}
      {activeTab === "receipts" && (

        <div className="coupon-card">

          <h3 className="coupon-section-title">Receipts</h3>

          <div className="coupon-table-wrap">
            <table className="coupon-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Receipt ID</th>
                  <th>Invoice</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {receipts.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", color: "#999" }}>
                      No receipts found
                    </td>
                  </tr>
                ) : (
                  receipts.map((r, idx) => (
                    <tr key={r.receipt_id}>
                      <td>{idx + 1}</td>
                      <td>{r.receipt_id}</td>
                      <td>{r.invoice_no}</td>
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


      {/* ================= RECEIPTS ================= */}
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
                  <div>Company: {selectedReceipt.supplier.supplier_name}</div>
                  <div>Store: {selectedReceipt.supplier.store_name_english}</div>
                  <div>Contact: {selectedReceipt.supplier.contact_person_name}</div>
                  <div>Mobile: {selectedReceipt.supplier.contact_person_mobile}</div>
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
                  <div>Restaurant: {selectedReceipt.restaurant.restaurant_name}</div>
                  <div>Store: {selectedReceipt.restaurant.store_name_english}</div>
                  <div>Contact: {selectedReceipt.restaurant.contact_person_name}</div>
                  <div>Mobile: {selectedReceipt.restaurant.contact_person_mobile}</div>
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
                    {(selectedReceipt?.items || []).length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", color: "#999" }}>
                          No items found
                        </td>
                      </tr>
                    ) : (
                      selectedReceipt.items.map((i, idx) => (
                        <tr key={idx}>
                          <td>{i.product_name_english}</td>
                          <td>{i.quantity}</td>
                          <td>{i.price_per_unit}</td>
                          <td>{i.discount}</td>
                          <td>{i.total_amount}</td>
                        </tr>
                      ))
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
        <div className="coupon-card">

          <h3 className="coupon-section-title">Activity Logs</h3>

          <div className="coupon-table-wrap">
            <table className="coupon-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Time</th>
                </tr>
              </thead>

              <tbody>
                {activity.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center", color: "#999" }}>
                      No activity found
                    </td>
                  </tr>
                ) : (
                  activity.map(a => (
                    <tr key={a.audit_id}>

                      <td>
                        <span className="coupon-badge coupon-badge-info">
                          {a.action}
                        </span>
                      </td>

                      <td>
                        {a.entity_type} / {a.entity_id}
                      </td>

                      <td>
                        {new Date(a.created_at).toLocaleString()}
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ================= ORDER ISSUES ================= */}
      {activeTab === "order-issues" && (

        <div className="coupon-card">

          <h3 className="coupon-section-title">Order Issues</h3>

          <div className="coupon-table-wrap">
            <table className="coupon-table">

              <thead>
                <tr>
                  <th>#</th>
                  <th>Issue_Report_Id</th>
                  <th>Order_Id</th>
                  <th>Restaurant Id</th>
                  <th>Restaurant_Name</th>
                  <th>Supplier_Name</th>
                  <th>Issue_Type</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {issues.length === 0 ? (

                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", color: "#999" }}>
                      No issues found
                    </td>
                  </tr>

                ) : (

                  issues.map((i, idx) => (
                    <tr key={i.issue_report_id}>

                      <td>{idx + 1}</td>

                      <td>{i.issue_report_id}</td>

                      <td>{i.order_id}</td>

                      <td>{i.restaurant_id}</td>

                      <td>{i.restaurant_name}</td>

                      <td>{i.supplier_name}</td>

                      {/* ISSUE TYPE BADGE */}
                      <td>
                        <span className="coupon-badge coupon-badge-dark">
                          {i.issue_type}
                        </span>
                      </td>

                      {/* STATUS BADGE */}
                      <td>
                        <span className={`coupon-badge ${i.status === "RESOLVED"
                          ? "coupon-badge-success"
                          : i.status === "PENDING"
                            ? "coupon-badge-code"
                            : "coupon-badge-danger"
                          }`}>
                          {i.status}
                        </span>
                      </td>

                    </tr>
                  ))

                )}

              </tbody>

            </table>
          </div>

        </div>
      )}
    </div>
  );
}