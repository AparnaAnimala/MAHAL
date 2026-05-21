// import React from "react";

// const OrderDetailsModal = ({ order, onClose, onUpdate }) => {
//   const acceptOrder = () => {
//     onUpdate({
//       ...order,
//       status: "ACCEPTED",
//       timeline: [...order.timeline, "ACCEPTED"],
//     });
//   };

//   const rejectOrder = () => {
//     onUpdate({
//       ...order,
//       status: "REJECTED",
//       timeline: [...order.timeline, "REJECTED"],
//     });
//   };

//   const markPacked = () => {
//     onUpdate({
//       ...order,
//       status: "PACKED",
//       timeline: [...order.timeline, "PACKED"],
//     });
//   };

//   const markDelivered = () => {
//     onUpdate({
//       ...order,
//       status: "DELIVERED",
//       timeline: [...order.timeline, "DELIVERED"],
//     });
//   };

//   return (
//     <div className="modal_overlay">
//       <div className="order_modal">

//         {/* HEADER */}
//         <div className="modal_header">
//           <h4>Order Details</h4>
//           <button onClick={onClose}>✖</button>
//         </div>

//         {/* INFO */}
//         <div className="info_grid">
//           <div><b>Order ID</b><span>{order.id}</span></div>
//           <div><b>Restaurant</b><span>{order.restaurant}</span></div>
//           <div><b>Status</b><span className={`status ${order.status.toLowerCase()}`}>{order.status}</span></div>
//           <div><b>Payment</b><span>{order.payment}</span></div>
//         </div>

//         {/* PRODUCTS */}
//         <div className="card">
//           <h5>Products</h5>
//           <table className="mini_table">
//             <thead>
//               <tr>
//                 <th>Product</th>
//                 <th>Qty</th>
//                 <th>Price</th>
//                 <th>Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               {order.products.map((p, i) => (
//                 <tr key={i}>
//                   <td>{p.name}</td>
//                   <td>{p.qty}</td>
//                   <td>${p.price}</td>
//                   <td>${p.qty * p.price}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* TIMELINE */}
//         <div className="card">
//           <h5>Order Timeline</h5>
//           <ul className="timeline">
//             {["PLACED", "ACCEPTED", "PACKED", "DELIVERED"].map((step) => (
//               <li
//                 key={step}
//                 className={order.timeline.includes(step) ? "active" : ""}
//               >
//                 {step}
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* ACTIONS */}
//         <div className="modal_actions">
//           {order.status === "PLACED" && (
//             <>
//               <button className="btn accept" onClick={acceptOrder}>Accept</button>
//               <button className="btn reject" onClick={rejectOrder}>Reject</button>
//             </>
//           )}

//           {order.status === "ACCEPTED" && (
//             <button className="btn packed" onClick={markPacked}>Mark Packed</button>
//           )}

//           {order.status === "PACKED" && (
//             <button className="btn delivered" onClick={markDelivered}>Mark Delivered</button>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// };

// export default OrderDetailsModal;



// import React, { useState, useEffect } from "react";
// import ReceiptView from "./ReceiptView";
// import { useNavigate } from "react-router-dom";
// const API = "http://192.168.2.22:5000/api/v1/orders";

// const OrderDetailsModal = ({ order, onClose, onUpdate, onAssignDelivery }) => {
//   const token = localStorage.getItem("token");
//   const navigate = useNavigate();
//   const [showReceiptModal, setShowReceiptModal] = useState(null);
//   const [isModifyMode, setIsModifyMode] = useState(false);
//   const [modifiedItems, setModifiedItems] = useState([]);
//   const [modificationNote, setModificationNote] = useState("");
//   const statusFlow = [
//     "PLACED",
//     "ACCEPTED",
//     "PACKED",
//     "OUT_FOR_DELIVERY",
//     "DELIVERED"
//   ];
//   const currentIndex = statusFlow.indexOf(order.status);

//   /* ==========================
//      UPDATE STATUS
//   ========================== */
//   const updateStatus = async (status) => {
//     try {
//       const res = await fetch(`${API}/${order.id}/status`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ status }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         alert(data.error || "Status update failed");
//         return;
//       }

//       onUpdate({
//         ...order,
//         status,
//       });
//     } catch (err) {
//       alert("Status update failed");
//     }
//   };
// const submitModification = async () => {
//   console.log("MODIFY PAYLOAD:", modifiedItems);

//   try {
//     const res = await fetch(
//       `${API}/${order.id}/modify-request`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           items: modifiedItems,
//           note: modificationNote,
//         }),
//       }
//     );

//     if (!res.ok) throw new Error();

//     alert("Modification request sent to restaurant");
//     setIsModifyMode(false);
//   } catch {
//     alert("Failed to send modification request");
//   }
// };


//   /* ================= ESC CLOSE RECEIPT ================= */
//   useEffect(() => {
//     const esc = (e) => e.key === "Escape" && setShowReceiptModal(null);
//     window.addEventListener("keydown", esc);
//     return () => window.removeEventListener("keydown", esc);
//   }, []);
  
//  useEffect(() => {
//   if (isModifyMode) {
//     setModifiedItems(
//       order.items.map(i => ({
//         item_id: i.item_id,                 // ✅ REQUIRED (backend validation)
//         product_id: i.product_id,           // ✅ REQUIRED (backend validation)
//         product_name_english: i.product_name_english,

//         quantity: Number(i.quantity),
//         price_per_unit: Number(i.price_per_unit),
//         // discount: Number(i.discount || 0)
//       }))
//     );
//   }
// }, [isModifyMode, order.items]);



//   return (
//     <div className="modal_overlay">
//       <div className="order_modal">

//         {/* HEADER */}
//         <div className="modal_header">
//           <h4>Order Details</h4>
//           <button onClick={onClose}>✖</button>
//         </div>

//         {/* ORDER INFO */}
//         <div className="info_grid">
//           <div><b>Order ID</b><span>{order.id}</span></div>
//           <div><b>Status</b><span>{order.status}</span></div>
//           <div><b>Payment</b><span>{order.payment}</span></div>
//         </div>

//         {/* MODIFICATION STATUS */}
//         {/* MODIFICATION STATUS (SIMPLE TEXT) */}
//         {(order.has_pending_modification || order.modification_status) && (
//           <div className="card">
//             <h5>Order Modification</h5>

//             <p>
//               <b>Status:</b>{" "}
//               {order.has_pending_modification && "Pending"}
//               {order.modification_status === "APPROVED" && "Approved"}
//               {order.modification_status === "REJECTED" && "Rejected"}
//             </p>
//           </div>
//         )}



//         {/* RESTAURANT DETAILS */}
//         <div className="card">
//           <h5>Restaurant Details</h5>

//           <p><b>Name:</b> {order.header?.restaurant_name_english || "-"}</p>
//           <p><b>Branch:</b> {order.header?.branch_name || "-"}</p>
//           <p><b>Contact:</b> {order.header?.contact_person_name || "-"}</p>
//           <p><b>Mobile:</b> {order.header?.contact_person_mobile || "-"}</p>
//           <p><b>Email:</b> {order.header?.email || "-"}</p>

//           <p>
//             <b>Address:</b>{" "}
//             {[
//               order.header?.street,
//               order.header?.building,
//               order.header?.zone,
//               order.header?.shop_no,
//             ].filter(Boolean).join(", ") || "-"}
//           </p>
//         </div>
//         {/* {order.has_pending_modification && (
//   <span className="btn accept">Modification Pending</span>
// )} */}


//         {/* PRODUCTS */}
//         <div className="card">
//           <h5>Products</h5>
//              {isModifyMode ? (
//             <table className="mini_table">
//               <thead>
//                 <tr>
//                   <th>Product</th>
//                   <th>Qty</th>
//                   <th>Unit Price</th>
//                   {/* <th>Discount</th> */}
//                   <th>Total</th>
//                   <th>Remove</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {modifiedItems.map((p, i) => {
//                   const qty = Number(p.quantity || 0);
//                   const price = Number(p.price_per_unit || 0);
//                   const lineTotal = Math.max(qty * price, 0);


//                   return (
//                     <tr key={i}>
//                       <td>{p.product_name_english}</td>

//                       {/* QUANTITY */}
//                       <td>
//                         <input
//                           type="number"
//                           min="0"
//                           value={qty}
//                           onChange={(e) => {
//                             const copy = [...modifiedItems];
//                             copy[i].quantity = Number(e.target.value);
//                             setModifiedItems(copy);
//                           }}
//                         />
//                       </td>

//                       {/* PRICE */}
//                       <td>
//                         <input
//                           type="number"
//                           min="0"
//                           step="0.01"
//                           value={price}
//                           onChange={(e) => {
//                             const copy = [...modifiedItems];
//                             copy[i].price_per_unit = Number(e.target.value);
//                             setModifiedItems(copy);
//                           }}
//                         />
//                       </td>

//                       {/* DISCOUNT */}
//                       {/* <td>
//                         <input
//                           type="number"
//                           min="0"
//                           step="0.01"
//                           value={discount}
//                           onChange={(e) => {
//                             const copy = [...modifiedItems];
//                             copy[i].discount = Number(e.target.value);
//                             setModifiedItems(copy);
//                           }}
//                         />
//                       </td> */}

//                       {/* TOTAL (CALCULATED) */}
//                       <td>
//                         ${lineTotal.toFixed(2)}
//                       </td>

//                       {/* REMOVE */}
//                       <td>
//                         <button
//                           onClick={() =>
//                             setModifiedItems(
//                               modifiedItems.filter((_, idx) => idx !== i)
//                             )
//                           }
//                         >
//                           ✖
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>

//           ) : (
//           <table className="mini_table">
//             <thead>
//               <tr>
//                 <th>Product</th>
//                 <th>Qty</th>
//                 <th>Price</th>
//                 <th>Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               {(order.items || []).map((p, i) => (
//                 <tr key={i}>
//                   <td>{p.product_name_english}</td>
//                   <td>{p.quantity}</td>
//                   <td>QAR  {p.price_per_unit}</td>
//                   <td>QAR  {p.total_amount}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           )}
//           {isModifyMode && (
//               <textarea
//                 placeholder="Reason for modification (e.g. item out of stock)"
//                 value={modificationNote}
//                 onChange={(e) => setModificationNote(e.target.value)}
//               />
//             )}

//             {isModifyMode && (
//               <button
//                 className="btn accept"
//                 onClick={submitModification}
//               >
//                 Send Modification Request
//               </button>
//             )}

//         </div>

//         {/* TIMELINE */}
//         <div className="card">
//           <h5>Order Timeline</h5>

//           <ul className="timeline">
//             {statusFlow.map((step, index) => (
//               <li
//                 key={step}
//                 className={
//                   index <= currentIndex
//                     ? "active"
//                     : ""
//                 }
//               >
//                 {step}
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* ACTIONS */}
//         <div className="modal_actions">

//           {order.status === "PLACED" && !order.has_pending_modification && (
//             <>
//               <button className="btn accept" onClick={() => updateStatus("ACCEPTED")}>
//                 Accept
//               </button>
//               <button className="btn reject" onClick={() => updateStatus("REJECTED")}>
//                 Reject
//               </button>
//             </>
//           )}

//          {order.status === "ACCEPTED" && (
//             <button
//               className="btn packed"
//               onClick={() => updateStatus("PACKED")}
//             >
//               Mark Packed
//             </button>
//           )}
//           {/* {order.status === "PACKED" && (
//             <button
//               className="btn delivered"
//               onClick={() => updateStatus("DELIVERED")}
//             >
//               Mark Delivered
//             </button>
//           )} */}
//           {order.status === "OUT_FOR_DELIVERY" && (
//             <button
//               className="btn delivered"
//               onClick={() => navigate(`/dashboard/track/${order.id}`)}
//             >
//               📍 View Delivery Status
//             </button>
//           )}
//           {order.status === "DELIVERED" &&
//             order.header?.grn_status === "CONFIRMED" && (
//               <button
//                 className="btn packed"
//                 onClick={async () => {
//                   try {
//                     const res = await fetch(
//                       `http://192.168.2.22:5000/api/v1/invoice/generate/${order.id}`,
//                       {
//                         method: "POST",
//                         headers: { Authorization: `Bearer ${token}` },
//                       }
//                     );

//                     const data = await res.json();

//                     if (!res.ok) {
//                       alert(data.error || "Invoice generation failed");
//                       return;
//                     }

//                     alert(`Invoice generated\nInvoice ID: ${data.invoice_id}`);
//                   } catch {
//                     alert("Invoice generation error");
//                   }
//                 }}
//               >
//                 Generate Invoice
//               </button>
//             )}

           

//           {/* RECEIPT */}
//           {order.header?.payment_status === "PAID" && (
//             <button
//               className="btn packed"
//               onClick={async () => {
//                 const orderId = order.header.order_id;

//                 const gen = await fetch(
//                   `http://192.168.2.22:5000/api/v1/receipt/generate/${orderId}`,
//                   {
//                     method: "POST",
//                     headers: { Authorization: `Bearer ${token}` },
//                   }
//                 );

//                 let resp = {};
//                 try { resp = await gen.json(); } catch {}

//                 if (resp.receipt_id || resp.message === "Receipt already exists") {
//                   setShowReceiptModal(orderId);
//                   return;
//                 }

//                 alert(resp.error || "Receipt generation failed");
//               }}
//             >
//               View Receipt
//             </button>
//           )}

//           {showReceiptModal && (
//             <div
//               className="receipt-backdrop"
//               onClick={() => setShowReceiptModal(null)}
//             >
//               <div
//                 className="receipt-modal-container"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <ReceiptView
//                   orderId={showReceiptModal}
//                   onBack={() => setShowReceiptModal(null)}
//                 />
//               </div>
//             </div>
//           )}
          
//           {order.status === "PACKED" && (
//             <button
//               className="btn delivered"
//               onClick={() => onAssignDelivery(order)}
//             >
//               🚚 Assign Delivery
//             </button>
//           )}

//           {order.status === "PLACED" && !order.has_pending_modification &&  !order.modification_status && (
//             <button
//               className="btn edit"
//               onClick={() => setIsModifyMode(true)}
//             >
//               Modify Order
//             </button>
//           )}
         
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderDetailsModal;


import React, { useState, useEffect } from "react";
import ReceiptView from "./ReceiptView";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
const API = "http://192.168.2.22:5000/api/v1/orders";

const OrderDetailsModal = ({ order, onClose, onUpdate, onAssignDelivery }) => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [showReceiptModal, setShowReceiptModal] = useState(null);
  const [isModifyMode, setIsModifyMode] = useState(false);
  const [modifiedItems, setModifiedItems] = useState([]);
  const [modificationNote, setModificationNote] = useState("");
  const { t, i18n } = useTranslation();
  const statusFlow = [
    "PLACED",
    "ACCEPTED",
    "PACKED",
    "OUT_FOR_DELIVERY",
    "DELIVERED"
  ];
  const currentIndex = statusFlow.indexOf(order.status);

  /* ==========================
     UPDATE STATUS
  ========================== */
  const updateStatus = async (status) => {
    try {
      const res = await fetch(`${API}/${order.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Status update failed");
        return;
      }

      onUpdate({
        ...order,
        status,
      });
    } catch (err) {
      alert("Status update failed");
    }
  };

  const skipToday = async () => {
  try {
    const res = await fetch(`${API}/${order.id}/skip-today`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to skip");
      return;
    }

    alert("Skipped successfully");

    // 🔥 OPTIONAL: refresh UI
    onUpdate({
      ...order,
      recurring: {
        ...order.recurring,
        next_run_date: "Updated" // better if you refetch
      }
    });

  } catch {
    alert("Skip failed");
  }
};



const submitModification = async () => {
  console.log("MODIFY PAYLOAD:", modifiedItems);

  try {
    const res = await fetch(
      `${API}/${order.id}/modify-request`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: modifiedItems,
          note: modificationNote,
        }),
      }
    );

    if (!res.ok) throw new Error();

    alert("Modification request sent to restaurant");
    setIsModifyMode(false);
  } catch {
    alert("Failed to send modification request");
  }
};


  /* ================= ESC CLOSE RECEIPT ================= */
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setShowReceiptModal(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);
  
 useEffect(() => {
  if (isModifyMode) {
    setModifiedItems(
      order.items.map(i => ({
        item_id: i.item_id,                 // ✅ REQUIRED (backend validation)
        product_id: i.product_id,           // ✅ REQUIRED (backend validation)
        product_name_english: i.product_name_english,

        quantity: Number(i.quantity),
        price_per_unit: Number(i.price_per_unit),
        // discount: Number(i.discount || 0)
      }))
    );
  }
}, [isModifyMode, order.items]);

const isArabic = i18n.language?.startsWith("ar");

const formatNumber = (num) =>
  new Intl.NumberFormat(isArabic ? "ar-EG" : "en-US").format(num);

const formatId = (id) => {
  if (!isArabic) return id;
  const prefix = String(id).replace(/[0-9]/g, "");
  const numbers = String(id).replace(/\D/g, "");
  return prefix + formatNumber(numbers);
};
const formatCurrency = (num) => {
  const value = formatNumber(Number(num || 0).toFixed(2));
  return isArabic ? `ر.ق ${value}` : `QAR ${value}`;
};
const formatDate = (date) =>
  new Intl.DateTimeFormat(
    isArabic ? "ar-EG" : "en-GB"
  ).format(new Date(date));

  return (
    <div className="modal_overlay">
      <div className="order_modal">

        {/* HEADER */}
        <div className="modal_header">
          <h4>{t("order_details")}</h4>
          <button onClick={onClose}>✖</button>
        </div>

        {/* ORDER INFO */}
        <div className="info_grid">
          <div><b>{t("order_id")}</b><span>{formatId(order.id)}</span></div>
          <div>
            <b>{t("status")}</b>
            <span>
              {t(`status_${order.status?.toLowerCase()}`)}
              {order.is_recurring && (
                <span className="badge recurring"> 🔁 {t("recurring")}</span>
              )}
            </span>
          </div>
          <div><b>{t("payment")}</b><span>{t(`payment_${order.payment?.toLowerCase()}`)}</span></div>
        </div>

        {/* MODIFICATION STATUS */}
        {/* MODIFICATION STATUS (SIMPLE TEXT) */}
        {(order.has_pending_modification || order.modification_status) && (
          <div className="card">
            <h5>{t("order_modification")}</h5>

            <p>
              <b>{t("status")}:</b>{" "}
                {order.has_pending_modification && t("pending")}
                {order.modification_status === "APPROVED" && t("approved")}
                {order.modification_status === "REJECTED" && t("rejected")}
            </p>
          </div>
        )}

        {/* {order.recurring && (
            <div className="card">
              <h5>Recurring Order</h5>

              <p><b>Frequency:</b> {order.recurring.frequency}</p>
              <p><b>Next Run:</b> {order.recurring.next_run_date}</p>

              <button
                className="btn reject"
                onClick={skipToday}
              >
                ⏭ Skip Today
              </button>
            </div>
          )} */}

               {order.recurring && (
                <div className="card">
                  <h5>🔁 {t("recurring_details")}</h5>

                  <p><b>{t("frequency")}:</b> {order.recurring.frequency}</p>
                  <p><b>{t("next_run")}:</b> {order.recurring.next_run_date}</p>

                  <p>
                    <b>{t("start_date")}:</b>{" "}
                    {order.recurring.start_date
                      ? formatDate(order.recurring.start_date)
                      : "-"}
                  </p>

                  <p>
                    <b>{t("end_date")}:</b>{" "}
                    {order.recurring.end_date
                      ? new Date(order.recurring.end_date).toLocaleDateString()
                      : "No End Date"}
                  </p>
                  <button
                              className="btn reject"
                              onClick={skipToday}
                            >
                              ⏭ {t("skip_today")}
                            </button>
                </div>
              )}

        {/* RESTAURANT DETAILS */}
        <div className="card">
          <h5>{t("restaurant_details")}</h5>

          <p>
            <b>{t("name")}:</b>{" "}
            { i18n.language === "ar"
              ? (order.header?.restaurant_name_arabic?.trim()
                  ? order.header?.restaurant_name_arabic
                  : order.header?.restaurant_name_english)
              : order.header?.restaurant_name_english
            }
          </p>
          <p><b>{t("supbranch")}:</b> {order.header?.branch_name || "-"}</p>
          <p><b>{t("contact")}:</b> {order.header?.contact_person_name || "-"}</p>
          <p><b>{t("mobile")}:</b> {order.header?.contact_person_mobile || "-"}</p>
          <p><b>{t("email")}:</b> {order.header?.email || "-"}</p>

          <p>
            <b>{t("supaddress")}:</b>{" "}
            {[
              order.header?.street,
              order.header?.building,
              order.header?.zone,
              order.header?.shop_no,
            ].filter(Boolean).join(", ") || "-"}
          </p>
        </div>
        {/* {order.has_pending_modification && (
  <span className="btn accept">Modification Pending</span>
)} */}


        {/* PRODUCTS */}
        <div className="card">
          <h5>{t("products")}</h5>
             {isModifyMode ? (
            <table className="mini_table">
              <thead>
                <tr>
                  <th>{t("product")}</th>
                  <th>{t("qty")}</th>
                  <th>{t("price")}</th>
                  {/* <th>Discount</th> */}
                  <th>{t("total")}</th>
                  <th>{t("remove")}</th>
                </tr>
              </thead>

              <tbody>
                {modifiedItems.map((p, i) => {
                  const qty = Number(p.quantity || 0);
                  const price = Number(p.price_per_unit || 0);
                  const lineTotal = Math.max(qty * price, 0);


                  return (
                    <tr key={i}>
                      <td>
                        {i18n.language === "ar"
                          ? p.product_name_arabic || p.product_name_english
                          : p.product_name_english}
                      </td>

                      {/* QUANTITY */}
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={qty}
                          onChange={(e) => {
                            const copy = [...modifiedItems];
                            copy[i].quantity = Number(e.target.value);
                            setModifiedItems(copy);
                          }}
                        />
                      </td>

                      {/* PRICE */}
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={price}
                          onChange={(e) => {
                            const copy = [...modifiedItems];
                            copy[i].price_per_unit = Number(e.target.value);
                            setModifiedItems(copy);
                          }}
                        />
                      </td>

                      {/* DISCOUNT */}
                      {/* <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={discount}
                          onChange={(e) => {
                            const copy = [...modifiedItems];
                            copy[i].discount = Number(e.target.value);
                            setModifiedItems(copy);
                          }}
                        />
                      </td> */}

                      {/* TOTAL (CALCULATED) */}
                      <td>
                        {formatCurrency(lineTotal)}
                      </td>

                      {/* REMOVE */}
                      <td>
                        <button
                          onClick={() =>
                            setModifiedItems(
                              modifiedItems.filter((_, idx) => idx !== i)
                            )
                          }
                        >
                          ✖
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

          ) : (
          <table className="mini_table">
            <thead>
              <tr>
                <th>{t("product")}</th>
                <th>{t("qty")}</th>
                <th>{t("price")}</th>
                <th>{t("total")}</th>
              </tr>
            </thead>

            <tbody>
              {(order.items || []).map((p, i) => (
                <tr key={i}>
                  <td>
                    {i18n.language === "ar"
                      ? (p.product_name_arabic && p.product_name_arabic.trim()
                          ? p.product_name_arabic
                          : p.product_name_english)
                      : p.product_name_english}
                  </td>

                  <td>{formatNumber(p.quantity)}</td>

                  <td>{formatCurrency(p.price_per_unit)}</td>

                  <td>{formatCurrency(p.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
          {isModifyMode && (
              <textarea
                placeholder={t("modification_reason")}
                value={modificationNote}
                onChange={(e) => setModificationNote(e.target.value)}
              />
            )}

            {isModifyMode && (
              <button
                className="btn accept"
                onClick={submitModification}
              >
               {t("send_modification")}
              </button>
            )}

        </div>

        {/* TIMELINE */}
        <div className="card">
          <h5>{t("order_timeline")}</h5>

          <ul className="timeline">
            {statusFlow.map((step, index) => (
              <li
                key={step}
                className={
                  index <= currentIndex
                    ? "active"
                    : ""
                }
              >
                {t(`status_${step.toLowerCase()}`)}
              </li>
            ))}
          </ul>
        </div>

        {/* ACTIONS */}
        <div className="modal_actions">

          {order.status === "PLACED" && !order.has_pending_modification && (
            <>
              <button className="btn accept" onClick={() => updateStatus("ACCEPTED")}>
                {t("accept")}
              </button>
              <button className="btn reject" onClick={() => updateStatus("REJECTED")}>
                {t("reject")}
              </button>
            </>
          )}

         {order.status === "ACCEPTED" && (
            <button
              className="btn packed"
              onClick={() => updateStatus("PACKED")}
            >
              {t("mark_packed")}
            </button>
          )}
          {/* {order.status === "PACKED" && (
            <button
              className="btn delivered"
              onClick={() => updateStatus("DELIVERED")}
            >
              Mark Delivered
            </button>
          )} */}
          {order.status === "OUT_FOR_DELIVERY" && (
            <button
              className="btn delivered"
              onClick={() => navigate(`/dashboard/track/${order.id}`)}
            >
              {t("view_delivery")}
            </button>
          )}
          {order.status === "DELIVERED" &&
            order.header?.grn_status === "CONFIRMED" && (
              <button
                className="btn packed"
                onClick={async () => {
                  try {
                    const res = await fetch(
                      `http://192.168.2.22:5000/api/v1/invoice/generate/${order.id}`,
                      {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );

                    const data = await res.json();

                    if (!res.ok) {
                      alert(data.error || "Invoice generation failed");
                      return;
                    }

                    alert(`Invoice generated\nInvoice ID: ${data.invoice_id}`);
                  } catch {
                    alert("Invoice generation error");
                  }
                }}
              >
                {t("generate_invoice")}
              </button>
            )}

           

          {/* RECEIPT */}
          {order.header?.payment_status === "PAID" && (
            <button
              className="btn packed"
              onClick={async () => {
                const orderId = order.header.order_id;

                const gen = await fetch(
                  `http://192.168.2.22:5000/api/v1/receipt/generate/${orderId}`,
                  {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );

                let resp = {};
                try { resp = await gen.json(); } catch {}

                if (resp.receipt_id || resp.message === "Receipt already exists") {
                  setShowReceiptModal(orderId);
                  return;
                }

                alert(resp.error || "Receipt generation failed");
              }}
            >
              {t("view_receipt")}
            </button>
          )}

          {showReceiptModal && (
            <div
              className="receipt-backdrop"
              onClick={() => setShowReceiptModal(null)}
            >
              <div
                className="receipt-modal-container"
                onClick={(e) => e.stopPropagation()}
              >
                <ReceiptView
                  orderId={showReceiptModal}
                  onBack={() => setShowReceiptModal(null)}
                />
              </div>
            </div>
          )}
          
          {order.status === "PACKED" && (
            <button
              className="btn delivered"
              onClick={() => onAssignDelivery(order)}
            >
              {t("assign_delivery")}
            </button>
          )}

          {order.status === "PLACED" && !order.has_pending_modification &&  !order.modification_status && (
            <button
              className="btn edit"
              onClick={() => setIsModifyMode(true)}
            >
              {t("modify_order")}
            </button>
          )}
         
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;