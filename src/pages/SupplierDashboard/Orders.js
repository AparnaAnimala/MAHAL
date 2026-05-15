// import React, { useState } from "react";
// import OrderDetailsModal from "./OrderDetailsModal";
// import ChatModal from "./ChatModal";   // 🔥 Chat popup

// const Orders = () => {
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [chatOrder, setChatOrder] = useState(null);

//   const [orders, setOrders] = useState([
//     {
//       id: "ORD-2025-025",
//       restaurant: "Royal Spice Restaurant",
//       date: "12/26/2025",
//       total: 190,
//       status: "PLACED",
//       payment: "UNPAID",
//       timeline: ["PLACED"],
//       products: [
//         { name: "Tomatoes", qty: 10, price: 5 },
//         { name: "Onions", qty: 8, price: 4 },
//       ],
//     },
//   ]);

//   const updateOrder = (updatedOrder) => {
//     setOrders((prev) =>
//       prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
//     );
//     setSelectedOrder(updatedOrder);
//   };

//   return (
//     <div className="orders_page">
//       <h3 className="page_title">Order History</h3>

//       <div className="table_wrapper">
//         <table className="orders_table">
//           <thead>
//             <tr>
//               <th>Order ID</th>
//               <th>Restaurant</th>
//               <th>Date</th>
//               <th>Total</th>
//               <th>Status</th>
//               <th>Payment</th>
//               <th>Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {orders.map((order) => (
//               <tr key={order.id}>
//                 <td>{order.id}</td>
//                 <td>{order.restaurant}</td>
//                 <td>{order.date}</td>
//                 <td>${order.total}</td>

//                 <td>
//                   <span className={`status ${order.status.toLowerCase()}`}>
//                     {order.status}
//                   </span>
//                 </td>

//                 <td>
//                   <span className={`payment ${order.payment.toLowerCase()}`}>
//                     {order.payment}
//                   </span>
//                 </td>

//                 <td>
//                   <button
//                     className="view_btn"
//                     onClick={() => setSelectedOrder(order)}
//                   >
//                     View
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* 🔥 Order Details Modal */}
//       {selectedOrder && (
//         <OrderDetailsModal
//           order={selectedOrder}
//           onClose={() => setSelectedOrder(null)}
//           onUpdate={updateOrder}
//         />
//       )}

//       {/* 🔥 Floating Chat Button */}
//       {selectedOrder && (
//         <div
//           className="floating_chat_btn"
//           onClick={() => setChatOrder(selectedOrder)}
//         >
//           <i className="fa fa-comments"></i>
//           <span>Chat</span>
//         </div>
//       )}

//       {/* 🔥 Chat Modal */}
//       {chatOrder && (
//         <ChatModal
//           order={chatOrder}
//           onClose={() => setChatOrder(null)}
//         />
//       )}
//     </div>
//   );
// };

// export default Orders;




// import React, { useEffect, useState } from "react";
// import OrderDetailsModal from "./OrderDetailsModal";
// import ChatModal from "./ChatModal";

// const API = "http://192.168.2.9:5000/api/v1/orders";

// const Orders = () => {
//   const token = localStorage.getItem("token");
//   const role = (localStorage.getItem("role") || "").toUpperCase();

//   const [orders, setOrders] = useState([]);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [chatOrder, setChatOrder] = useState(null);

//   /* ============================
//      LOAD ORDERS (BACKEND)
//   ============================ */
//   useEffect(() => {
//     if (!token || role !== "SUPPLIER") return;

//     fetch(`${API}/`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     })
//       .then((res) => {
//         if (!res.ok) throw new Error("Unauthorized");
//         return res.json();
//       })
//       .then((data) => {
//         // 🔥 MAP BACKEND → UI FORMAT (NO UI CHANGE)
//         const formatted = (data || []).map((o) => ({
//           id: o.order_id,
//           restaurant: o.restaurant_name,
//           date: o.order_date
//             ? new Date(o.order_date).toLocaleDateString()
//             : "-",
//           total: o.total_amount,
//           status: o.status,
//           payment: o.payment_status || "UNPAID",
//           timeline: o.timeline || [],
//           __raw: o, // keep backend order
//         }));

//         setOrders(formatted);
//       })
//       .catch((err) => {
//         console.error("Orders fetch failed:", err);
//         setOrders([]);
//       });
//   }, [token, role]);

//   /* ============================
//      LOAD SINGLE ORDER (DETAILS)
//   ============================ */
//   const loadOrderDetails = async (order) => {
//     try {
//       const res = await fetch(`${API}/${order.id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!res.ok) throw new Error("Failed to load order");

//       const data = await res.json();

//       setSelectedOrder({
//         ...order,
//         products: data.items || [],
//         timeline: data.timeline || [],
//         __full: data,
//       });
//     } catch (err) {
//       alert("Failed to load order details");
//     }
//   };

//   /* ============================
//      UPDATE ORDER STATE (MODAL)
//   ============================ */
//   const updateOrder = (updatedOrder) => {
//     setOrders((prev) =>
//       prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
//     );
//     setSelectedOrder(updatedOrder);
//   };

//   /* ============================
//      RENDER
//   ============================ */
//   return (
//     <div className="orders_page">
//       <h3 className="page_title">Order History</h3>

//       <div className="table_wrapper">
//         <table className="orders_table">
//           <thead>
//             <tr>
//               <th>Order ID</th>
//               <th>Restaurant</th>
//               <th>Date</th>
//               <th>Total</th>
//               <th>Status</th>
//               <th>Payment</th>
//               <th>Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {orders.length === 0 && (
//               <tr>
//                 <td colSpan="7" style={{ textAlign: "center" }}>
//                   No orders found
//                 </td>
//               </tr>
//             )}

//             {orders.map((order) => (
//               <tr key={order.id}>
//                 <td>{order.id}</td>
//                 <td>{order.restaurant}</td>
//                 <td>{order.date}</td>
//                 <td>${order.total}</td>

//                 <td>
//                   <span className={`status ${order.status.toLowerCase()}`}>
//                     {order.status}
//                   </span>
//                 </td>

//                 <td>
//                   <span className={`payment ${order.payment.toLowerCase()}`}>
//                     {order.payment}
//                   </span>
//                 </td>

//                 <td>
//                   <button
//                     className="view_btn"
//                     onClick={() => loadOrderDetails(order)}
//                   >
//                     View
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* 🔥 ORDER DETAILS MODAL */}
//       {selectedOrder && (
//         <OrderDetailsModal
//           order={selectedOrder}
//           onClose={() => setSelectedOrder(null)}
//           onUpdate={updateOrder}
//         />
//       )}

//       {/* 🔥 FLOATING CHAT BUTTON */}
//       {selectedOrder && (
//         <div
//           className="floating_chat_btn"
//           onClick={() => setChatOrder(selectedOrder)}
//         >
//           <i className="fa fa-comments"></i>
//           <span>Chat</span>
//         </div>
//       )}

//       {/* 🔥 CHAT MODAL */}
//       {chatOrder && (
//         <ChatModal
//           order={chatOrder}
//           onClose={() => setChatOrder(null)}
//         />
//       )}
//     </div>
//   );
// };

// export default Orders;





// import React, { useEffect, useState } from "react";
// import OrderDetailsModal from "./OrderDetailsModal";
// import ChatModal from "./ChatModal";
// import "../css/status.css";
// import { useSearchParams } from "react-router-dom";
// import AssignDeliveryModal from "./AssignDeliveryModal";
// import { useNavigate } from "react-router-dom";

// const API = "http://192.168.2.9:5000/api/v1/orders";
// const normalizeStatus = (status) => {
//   if (!status || typeof status !== "string") return "UNKNOWN";

//   const s = status.toUpperCase().trim();

//   if (s === "PLACED") return "PLACED";
//   if (s === "OUT FOR DELIVERY") return "OUT_FOR_DELIVERY";

//   return s.replace(/\s+/g, "_");
// };

// const Orders = () => {
//   const token = localStorage.getItem("token");
//   const navigate = useNavigate();
//   const role = (localStorage.getItem("role") || "").toUpperCase();
//   const supplierId = localStorage.getItem("linked_id");
//   const [searchParams] = useSearchParams();
//   const orderIdFromUrl = searchParams.get("orderId");


//   const [orders, setOrders] = useState([]);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [chatOrder, setChatOrder] = useState(null);
//   const [statusFilter, setStatusFilter] = useState("ALL");
//   const [paymentFilter, setPaymentFilter] = useState("ALL");
//   const [priceFilter, setPriceFilter] = useState("ALL");
//   const [deliveryOrder, setDeliveryOrder] = useState(null);
//   const [searchText, setSearchText] = useState("");
//   const [fromDate, setFromDate] = useState("");
// const [toDate, setToDate] = useState("");


//   /* ============================
//      LOAD ORDERS (LIST)
//   ============================ */
//   useEffect(() => {
//     if (!token || role !== "SUPPLIER") return;

//     fetch(`${API}/`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     })
//       .then((res) => {
//         if (!res.ok) throw new Error("Unauthorized");
//         return res.json();
//       })
//       .then((data) => {
//        const formatted = (data || []).map((o) => {
//         const normalizedStatus = normalizeStatus(o.status);



//         return {
//           id: o.order_id,
//           restaurant: o.restaurant_name,
//           date: o.order_date
//             ? new Date(o.order_date).toLocaleDateString()
//             : "-",
//           total: o.total_amount,
//           status: normalizedStatus, // ✅ FIX
//           payment: (o.payment_status || "UNPAID").toUpperCase(),
//           paymentMethod: (o.payment_method || "COD").toUpperCase(),
//           timeline: o.timeline || [],
//           __raw: o,
//         };
//       });


//         setOrders(formatted);
//       })
//       .catch((err) => {
//         console.error("Orders fetch failed:", err);
//         setOrders([]);
//       });
//   }, [token, role]);
//   useEffect(() => {
//   if (!orderIdFromUrl || orders.length === 0) return;

//   const match = orders.find(o => o.id === orderIdFromUrl);

//   if (match) {
//     loadOrderDetails(match); // 🔥 IMPORTANT: load full details
//   }
// }, [orderIdFromUrl, orders]);


//   /* ============================
//      LOAD SINGLE ORDER (FULL DETAILS)
//   ============================ */
//   const loadOrderDetails = async (order) => {
//     try {
//       const res = await fetch(`${API}/${order.id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!res.ok) throw new Error("Failed to load order");

//       const data = await res.json();

//       setSelectedOrder({
//         ...order,
//         header: data.header,          // ✅ FULL HEADER
//         items: data.items || [],      // ✅ FULL ITEMS
//         timeline: data.timeline || [],// ✅ FULL TIMELINE
//         has_pending_modification: data.has_pending_modification,
//         modification_status: data.modification_status, 
//         __full: data,
//       });
//     } catch (err) {
//       alert("Failed to load order details");
//     }
//   };

//   /* ============================
//      UPDATE ORDER STATE (MODAL)
//   ============================ */
//   // const updateOrder = (updatedOrder) => {
//   //   setOrders((prev) =>
//   //     prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
//   //   );
//   //   setSelectedOrder(updatedOrder);
//   // };


//   // const updateOrder = async (order) => {
//   //   await loadOrderDetails(order); // 🔥 ALWAYS REFRESH FROM BACKEND
//   // };


// //   const updateOrder = async (order) => {
// //   // 🔔 auto-mark notification read
// //   await fetch(`${API}/supplier/notifications/auto-read`, {
// //     method: "PUT",
// //     headers: {
// //       "Content-Type": "application/json",
// //       Authorization: `Bearer ${token}`,
// //     },
// //     body: JSON.stringify({
// //       reference_id: order.id,
// //       type: "NEW_ORDER",
// //     }),
// //   });

// //   window.dispatchEvent(new Event("refreshNotifications"));

// //   // 🔄 always reload order from backend
// //   await loadOrderDetails(order);
// // };


// const updateOrder = async (updatedOrder) => {

//   // 🔔 auto-mark notification read
//   await fetch(`${API}/supplier/notifications/auto-read`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({
//       reference_id: updatedOrder.id,
//       type: "NEW_ORDER",
//     }),
//   });

//   window.dispatchEvent(new Event("refreshNotifications"));

//   // ✅ Update orders list instantly
//   setOrders(prev =>
//     prev.map(o =>
//       o.id === updatedOrder.id
//         ? { ...o, status: updatedOrder.status || o.status }
//         : o
//     )
//   );

//   // ✅ Reload full details from backend (modal)
//   await loadOrderDetails(updatedOrder);
// };


// const refreshOrders = async () => {
//   const res = await fetch(`${API}/`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });

//   const data = await res.json();

//   const formatted = (data || []).map((o) => ({
//     id: o.order_id,
//     restaurant: o.restaurant_name,
//     date: o.order_date
//       ? new Date(o.order_date).toLocaleDateString()
//       : "-",
//     total: o.total_amount,
//     status: normalizeStatus(o.status),
//     payment: (o.payment_status || "UNPAID").toUpperCase(),
//     __raw: o,
//   }));

//   setOrders(formatted);
// };

//   const PRICE_RANGES = {
//     "0-100": [0, 100],
//     "100-500": [100, 500],
//     "500-1000": [500, 1000],
//     "1000-5000": [1000, 5000],
//     "5000+": [5000, Infinity],
//   };


//   const STATUS_PRIORITY = {
//   NEW: 1,
//   PENDING: 1,
//   ACCEPTED: 2,
//   PREPARING: 3,
//   OUT_FOR_DELIVERY: 4,
//   DELIVERED: 99,
//   CANCELLED: 100,
// };

// const filteredAndSortedOrders = orders
// .filter((o) => {
//   const search = searchText.toLowerCase();

//   const searchOk =
//     search === "" ||
//     o.id.toString().includes(search) ||
//     (o.restaurant || "").toLowerCase().includes(search);

//   const statusOk =
//     statusFilter === "ALL" || o.status === statusFilter;

//   const paymentOk =
//     paymentFilter === "ALL" || o.payment === paymentFilter;

//   const priceOk = (() => {
//     if (priceFilter === "ALL") return true;
//     const [min, max] = PRICE_RANGES[priceFilter];
//     return o.total >= min && o.total < max;
//   })();

//   // ✅ DATE FILTER LOGIC
//   const orderDate = new Date(o.__raw.order_date);

//   const fromOk = fromDate ? orderDate >= new Date(fromDate) : true;
//   const toOk = toDate
//     ? orderDate <= new Date(toDate + "T23:59:59")
//     : true;

//   const dateOk = fromOk && toOk;

//   return searchOk && statusOk && paymentOk && priceOk && dateOk;
// })
//   .sort((a, b) => {
//     // ✅ Only apply priority sort when showing ALL
//     if (statusFilter !== "ALL") {
//       return new Date(b.__raw.order_date) - new Date(a.__raw.order_date);
//     }

//     const pA = STATUS_PRIORITY[a.status] ?? 50;
//     const pB = STATUS_PRIORITY[b.status] ?? 50;

//     if (pA !== pB) return pA - pB;

//     return new Date(b.__raw.order_date) - new Date(a.__raw.order_date);
//   });

// useEffect(() => {
//   if (!orderIdFromUrl) return;

//   fetch(`${API}/supplier/notifications/auto-read`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({
//       reference_id: orderIdFromUrl,
//       type: "NEW_ORDER",
//     }),
//   }).then(() => {
//     window.dispatchEvent(new Event("refreshNotifications"));
//   });
// }, [orderIdFromUrl, token]);


//   /* ============================
//      RENDER
//   ============================ */
//   return (
//     <div className="orders_page">
//       <h3 className="page_title">Order History</h3>

//       <div className="filter_bar advanced">
//         <select
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//         >
//           <option value="ALL">All Status</option>
//           <option value="PLACED">Placed</option>
//           <option value="ACCEPTED">Accepted</option>
//           <option value="PACKED">Packed</option>
//           <option value="DELIVERED">Delivered</option>
//           <option value="REJECTED">Rejected</option>
//         </select>

//         <select
//           value={paymentFilter}
//           onChange={(e) => setPaymentFilter(e.target.value)}
//         >
//           <option value="ALL">All Payments</option>
//           <option value="PAID">Paid</option>
//           <option value="UNPAID">Unpaid</option>
//         </select>
//         <select
//           value={priceFilter}
//           onChange={(e) => setPriceFilter(e.target.value)}
//         >
//           <option value="ALL">All Amounts</option>
//           <option value="0-100">QAR  0 – QAR  100</option>
//           <option value="100-500">QAR  100 – QAR  500</option>
//           <option value="500-1000">QAR  500 – QAR  1,000</option>
//           <option value="1000-5000">QAR  1,000 – QAR  5,000</option>
//           <option value="5000+">QAR  5,000+</option>
//         </select>

//         <input
//           type="text"
//           placeholder="Search by Order ID or Restaurant..."
//           value={searchText}
//           onChange={(e) => setSearchText(e.target.value)}
//           className="search_input"
//         />

//         <input
//           type="date"
//           value={fromDate}
//           onChange={(e) => setFromDate(e.target.value)}
//           className="date_input"
//         />

//         <input
//           type="date"
//           value={toDate}
//           onChange={(e) => setToDate(e.target.value)}
//           className="date_input"
//         />
//       </div>


//       <div className="table_wrapper">
//         <table className="orders_table">
//           <thead>
//             <tr>
//               <th>Order ID</th>
//               <th>Restaurant</th>
//               <th>Date</th>
//               <th>Total</th>
//               <th>Status</th>
//               <th>Payment Type</th>
//               <th>Payment </th>
//               <th>Action</th>
//             </tr>
//           </thead>

// <tbody>
//   {orders.length === 0 && (
//     <tr>
//       <td colSpan="7" style={{ textAlign: "center" }}>
//         No orders found
//       </td>
//     </tr>
//   )}

//   {(filteredAndSortedOrders || []).map((order) => {
//     if (!order) return null;

//     return (
//       <tr key={order.id}>
//         <td>{order.id}</td>
//         <td>{order.restaurant}</td>
//         <td>{order.date}</td>
//         <td>QAR  {order.total}</td>

//         <td>
//           <span className={`status ${(order.status || "").toLowerCase()}`}>
//             {order.status}
//           </span>
//         </td>

//         <td>
//           <span className={`method ${(order.paymentMethod || "").toLowerCase()}`}>
//             {order.paymentMethod}
//           </span>
//         </td>

//         <td>
//           <span className={`payment ${(order.payment || "").toLowerCase()}`}>
//             {order.payment}
//           </span>
//         </td>

//         <td>
//           <button
//             className="view_btn"
//             onClick={() => loadOrderDetails(order)}
//           >
//             View
//           </button>

//           {/* Assign Delivery */}
//           {/* {order.status === "PACKED" && (
//             <button
//               className="btn btn-warning btn-sm"
//               onClick={() => setDeliveryOrder(order)}
//             >
//               🚚 Assign Delivery
//             </button>
//           )} */}

//           {/* Start Tracking
//           {order.status === "OUT_FOR_DELIVERY" && (
//             <button
//               className="btn btn-success btn-sm"
//               onClick={() => navigate(`/dashboard/track/${order.id}`)}
//             >
//               📍 View Delivery Status
//             </button>
//           )} */}
//         </td>
//       </tr>
//     );
//   })}
// </tbody>
//         </table>
//       </div>

//       {/* ORDER DETAILS MODAL */}
//       {selectedOrder && (
//         <OrderDetailsModal
//           order={selectedOrder}
//           onClose={() => setSelectedOrder(null)}
//           onUpdate={updateOrder}
//           onAssignDelivery={(order) => {
//             setSelectedOrder(null);     // close modal
//             setDeliveryOrder(order);    // open assign modal
//           }}
//         />
//       )}

//       {deliveryOrder && (
//         <AssignDeliveryModal
//           order={deliveryOrder}
//           onClose={() => setDeliveryOrder(null)}
//           onAssigned={() => {
//             setDeliveryOrder(null);
//             refreshOrders();   // ✅ clean refresh
//           }}
//         />
//       )}


//       {/* CHAT */}
//       {selectedOrder && (
//         <div
//           className="floating_chat_btn"
//           onClick={() => setChatOrder(selectedOrder)}
//         >
//           <i className="fa fa-comments"></i>
//           <span>Chat</span>
//         </div>
//       )}

//       {chatOrder && (
//         <ChatModal
//           order={chatOrder}
//           onClose={() => setChatOrder(null)}
//         />
//       )}
//     </div>
//   );
// };

// export default Orders;



import React, { useEffect, useState } from "react";
import OrderDetailsModal from "./OrderDetailsModal";
import ChatModal from "./ChatModal";
import "../css/status.css";
import { useSearchParams } from "react-router-dom";
import AssignDeliveryModal from "./AssignDeliveryModal";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
const API = "http://192.168.2.9:5000/api/v1/orders";
const normalizeStatus = (status) => {
  if (!status || typeof status !== "string") return "UNKNOWN";

  const s = status.toUpperCase().trim();

  if (s === "PLACED") return "PLACED";
  if (s === "OUT FOR DELIVERY") return "OUT_FOR_DELIVERY";

  return s.replace(/\s+/g, "_");
};

const Orders = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const role = (localStorage.getItem("role") || "").toUpperCase();
  const supplierId = localStorage.getItem("linked_id");
  const [searchParams] = useSearchParams();
  const orderIdFromUrl = searchParams.get("orderId");
  const { t, i18n } = useTranslation();


  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [chatOrder, setChatOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [priceFilter, setPriceFilter] = useState("ALL");
  const [deliveryOrder, setDeliveryOrder] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");


  /* ============================
     LOAD ORDERS (LIST)
  ============================ */
  useEffect(() => {
    if (!token || role !== "SUPPLIER") return;

    fetch(`${API}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
       const formatted = (data || []).map((o) => {
        const normalizedStatus = normalizeStatus(o.status);



        return {
          id: o.order_id,
          restaurant_en: o.restaurant_name_english,
          restaurant_ar: o.restaurant_name_arabic,
          date: o.order_date
          ? new Date(o.order_date).toLocaleDateString(
              i18n.language === "ar" ? "ar-EG" : "en-GB"
            )
          : "-",
          total: o.total_amount,
          status: normalizedStatus, // ✅ FIX
          payment: (o.payment_status || "UNPAID").toUpperCase(),
          paymentMethod: (o.payment_method || "COD").toUpperCase(),
          timeline: o.timeline || [],
          is_recurring: o.is_recurring,
          frequency: o.frequency,
          __raw: o,
        };
      });


        setOrders(formatted);
      })
      .catch((err) => {
        console.error("Orders fetch failed:", err);
        setOrders([]);
      });
  }, [token, role]);
  useEffect(() => {
  if (!orderIdFromUrl || orders.length === 0) return;

  const match = orders.find(o => o.id === orderIdFromUrl);

  if (match) {
    loadOrderDetails(match); // 🔥 IMPORTANT: load full details
  }
}, [orderIdFromUrl, orders]);


  /* ============================
     LOAD SINGLE ORDER (FULL DETAILS)
  ============================ */
  const loadOrderDetails = async (order) => {
    try {
      const res = await fetch(`${API}/${order.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to load order");

      const data = await res.json();

      setSelectedOrder({
        ...order,
        header: data.header,          // ✅ FULL HEADER
        items: data.items || [],      // ✅ FULL ITEMS
        timeline: data.timeline || [],// ✅ FULL TIMELINE
        has_pending_modification: data.has_pending_modification,
        modification_status: data.modification_status,
        recurring: data.recurring,
        is_recurring: data.header?.is_recurring, 
        __full: data,
      });
    } catch (err) {
      alert("Failed to load order details");
    }
  };

  /* ============================
     UPDATE ORDER STATE (MODAL)
  ============================ */
  // const updateOrder = (updatedOrder) => {
  //   setOrders((prev) =>
  //     prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
  //   );
  //   setSelectedOrder(updatedOrder);
  // };


  // const updateOrder = async (order) => {
  //   await loadOrderDetails(order); // 🔥 ALWAYS REFRESH FROM BACKEND
  // };


//   const updateOrder = async (order) => {
//   // 🔔 auto-mark notification read
//   await fetch(`${API}/supplier/notifications/auto-read`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({
//       reference_id: order.id,
//       type: "NEW_ORDER",
//     }),
//   });

//   window.dispatchEvent(new Event("refreshNotifications"));

//   // 🔄 always reload order from backend
//   await loadOrderDetails(order);
// };


const updateOrder = async (updatedOrder) => {

  // 🔔 auto-mark notification read
  await fetch(`${API}/supplier/notifications/auto-read`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      reference_id: updatedOrder.id,
      type: "NEW_ORDER",
    }),
  });

  window.dispatchEvent(new Event("refreshNotifications"));

  // ✅ Update orders list instantly
  setOrders(prev =>
    prev.map(o =>
      o.id === updatedOrder.id
        ? { ...o, status: updatedOrder.status || o.status }
        : o
    )
  );

  // ✅ Reload full details from backend (modal)
  await loadOrderDetails(updatedOrder);
};


const refreshOrders = async () => {
  const res = await fetch(`${API}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  const formatted = (data || []).map((o) => ({
    id: o.order_id,
    restaurant_en: o.restaurant_name_english,
    restaurant_ar: o.restaurant_name_arabic,
    date: o.order_date
      ? new Date(o.order_date).toLocaleDateString()
      : "-",
    total: o.total_amount,
    status: normalizeStatus(o.status),
    payment: (o.payment_status || "UNPAID").toUpperCase(),
    __raw: o,
  }));

  setOrders(formatted);
};

  const PRICE_RANGES = {
    "0-100": [0, 100],
    "100-500": [100, 500],
    "500-1000": [500, 1000],
    "1000-5000": [1000, 5000],
    "5000+": [5000, Infinity],
  };


  const STATUS_PRIORITY = {
  NEW: 1,
  PENDING: 1,
  ACCEPTED: 2,
  PREPARING: 3,
  OUT_FOR_DELIVERY: 4,
  DELIVERED: 99,
  CANCELLED: 100,
};

const filteredAndSortedOrders = orders
.filter((o) => {
  const search = searchText.toLowerCase();

  const searchOk =
    search === "" ||
    o.id.toString().includes(search) ||
    (o.restaurant || "").toLowerCase().includes(search);

  const statusOk =
    statusFilter === "ALL" || o.status === statusFilter;

  const paymentOk =
    paymentFilter === "ALL" || o.payment === paymentFilter;

  const priceOk = (() => {
    if (priceFilter === "ALL") return true;
    const [min, max] = PRICE_RANGES[priceFilter];
    return o.total >= min && o.total < max;
  })();

  // ✅ DATE FILTER LOGIC
  const orderDate = new Date(o.__raw.order_date);

  const fromOk = fromDate ? orderDate >= new Date(fromDate) : true;
  const toOk = toDate
    ? orderDate <= new Date(toDate + "T23:59:59")
    : true;

  const dateOk = fromOk && toOk;

  return searchOk && statusOk && paymentOk && priceOk && dateOk;
})
  .sort((a, b) => {
    // ✅ Only apply priority sort when showing ALL
    if (statusFilter !== "ALL") {
      return new Date(b.__raw.order_date) - new Date(a.__raw.order_date);
    }

    const pA = STATUS_PRIORITY[a.status] ?? 50;
    const pB = STATUS_PRIORITY[b.status] ?? 50;

    if (pA !== pB) return pA - pB;

    return new Date(b.__raw.order_date) - new Date(a.__raw.order_date);
  });

useEffect(() => {
  if (!orderIdFromUrl) return;

  fetch(`${API}/supplier/notifications/auto-read`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      reference_id: orderIdFromUrl,
      type: "NEW_ORDER",
    }),
  }).then(() => {
    window.dispatchEvent(new Event("refreshNotifications"));
  });
}, [orderIdFromUrl, token]);

const isArabic = i18n.language?.startsWith("ar");

const formatNumber = (num) => {
  return new Intl.NumberFormat(
    isArabic ? "ar-EG" : "en-US"
  ).format(num);
};

const formatOrderId = (id) => {
  if (!isArabic) return id;

  const prefix = String(id).replace(/[0-9]/g, "");
  const numbers = String(id).replace(/\D/g, "");

  return prefix + formatNumber(numbers);
};

const formatCurrency = (num) => {
  const value = formatNumber(Number(num || 0).toFixed(2));
  return isArabic ? `ر.ق ${value}` : `QAR ${value}`;
};
const formatDate = (date) => {
  return new Intl.DateTimeFormat(
    isArabic ? "ar-EG" : "en-GB"
  ).format(new Date(date));
};

  /* ============================
     RENDER
  ============================ */
  return (
    <div className="orders_page">
      <h3 className="page_title">{t("order_history")}</h3>

      <div className="filter_bar advanced">

        <input
          type="text"
          placeholder={t("search_orders")}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search_input"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">{t("all_status")}</option>
          <option value="PLACED">{t("placed")}</option>
          <option value="ACCEPTED">{t("accepted")}</option>
          <option value="PACKED">{t("packed")}</option>
          <option value="DELIVERED">{t("delivered")}</option>
          <option value="REJECTED">{t("rejected")}</option>
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          <option value="ALL">{t("all_payments")}</option>
          <option value="PAID">{t("paid")}</option>
          <option value="UNPAID">{t("unpaid")}</option>
        </select>
        <select
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
        >
          <option value="ALL">{t("all_amounts")}</option>
          <option value="0-100">{t("price_0_100")}</option>
          <option value="100-500">{t("price_100_500")}</option>
          <option value="500-1000">{t("price_500_1000")}</option>
          <option value="1000-5000">{t("price_1000_5000")}</option>
          <option value="5000+">{t("price_5000_plus")}</option>
        </select>



        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="date_input"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="date_input"
        />
      </div>


      <div className="table_wrapper">
        <table className="orders_table">
          <thead>
            <tr>
              <th>{t("order_id")}</th>
              <th>{t("restaurant")}</th>
              <th>{t("date")}</th>
              <th>{t("total")}</th>
              <th>{t("status")}</th>
              <th>{t("payment_type")}</th>
              <th>{t("payment")} </th>
              <th>{t("action")}</th>
            </tr>
          </thead>

<tbody>
  {orders.length === 0 && (
    <tr>
      <td colSpan="7" style={{ textAlign: "center" }}>
        {t("no_orders")}
      </td>
    </tr>
  )}

  {(filteredAndSortedOrders || []).map((order) => {
    if (!order) return null;

    return (
      <tr key={order.id}>
        <td>{formatOrderId(order.id)}</td>
        <td>
          {i18n.language === "ar"
            ? order.restaurant_ar || order.restaurant_en
            : order.restaurant_en}
        </td>
        <td>{(order.date)}</td>
        <td>{formatCurrency(order.total)}</td>

        <td>
          <span className={`status ${(order.status || "").toLowerCase()}`}>
            {t(`status_${order.status?.toLowerCase()}`)}
          </span>

          {order.is_recurring && (
            <span className="recurring_badge ms-2">
              🔁 {order.frequency || t("recurring")}
            </span>
          )}
        </td>

        <td>
          <span className={`method ${(order.paymentMethod || "").toLowerCase()}`}>
            {t(`method_${order.paymentMethod?.toLowerCase()}`)}
          </span>
        </td>

        <td>
          <span className={`payment ${(order.payment || "").toLowerCase()}`}>
            {t(`payment_${order.payment?.toLowerCase()}`)}
          </span>
        </td>

        <td>
          <button
            className="view_btn"
            onClick={() => loadOrderDetails(order)}
          >
            {t("view")}
          </button>

          {/* Assign Delivery */}
          {/* {order.status === "PACKED" && (
            <button
              className="btn btn-warning btn-sm"
              onClick={() => setDeliveryOrder(order)}
            >
              🚚 Assign Delivery
            </button>
          )} */}

          {/* Start Tracking
          {order.status === "OUT_FOR_DELIVERY" && (
            <button
              className="btn btn-success btn-sm"
              onClick={() => navigate(`/dashboard/track/${order.id}`)}
            >
              📍 View Delivery Status
            </button>
          )} */}
        </td>
      </tr>
    );
  })}
</tbody>
        </table>
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={updateOrder}
          onAssignDelivery={(order) => {
            setSelectedOrder(null);     // close modal
            setDeliveryOrder(order);    // open assign modal
          }}
        />
      )}

      {deliveryOrder && (
        <AssignDeliveryModal
          order={deliveryOrder}
          onClose={() => setDeliveryOrder(null)}
          onAssigned={() => {
            setDeliveryOrder(null);
            refreshOrders();   // ✅ clean refresh
          }}
        />
      )}


      {/* CHAT */}
      {selectedOrder && (
        <div
          className="floating_chat_btn"
          onClick={() => setChatOrder(selectedOrder)}
        >
          <i className="fa fa-comments"></i>
          <span>{t("chat")}</span>
        </div>
      )}

      {chatOrder && (
        <ChatModal
          order={chatOrder}
          onClose={() => setChatOrder(null)}
        />
      )}
    </div>
  );
};

export default Orders;