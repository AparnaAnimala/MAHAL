// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import OrderIssue from "./OrderIssue";
// import CreateGRN from "./CreateGRN";
// import InvoiceForm from "./RestaurantInvoiceForm";
// import { useNavigate } from "react-router-dom";

// /* ✅ IMPORT REVIEW MODAL */
// import ReviewModal from "./ReviewModal";

// const OrderDetails = ({ orderId, onBack, onTrack }) => {
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const [issueOrderId, setIssueOrderId] = useState(null);

//   /* ✅ REVIEW MODAL STATE */
//   const [showReviewModal, setShowReviewModal] = useState(false);

//   /* ================= LOAD ORDER DETAILS ================= */
//   useEffect(() => {
//     if (!orderId) return;

//     setLoading(true);

//     axios
//       .get(
//         `http://192.168.2.22:5000/api/v1/orders/restaurant/orders/${orderId}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       )
//       .then((res) => setData(res.data))
//       .catch(() => setError("Failed to load order details"))
//       .finally(() => setLoading(false));
//   }, [orderId, token]);

//   /* ================= SAFE RETURNS ================= */
//   if (!orderId) return null;
//   if (loading) return <p>Loading order details…</p>;
//   if (error) return <p className="err">{error}</p>;
//   if (!data) return null;

//   const { header, items, timeline = [] } = data;

//   /* ================= ISSUE PAGE ================= */
//   if (issueOrderId) {
//     return (
//       <OrderIssue
//         orderId={issueOrderId}
//         orderItems={items}
//         onBack={() => setIssueOrderId(null)}
//       />
//     );
//   }

//   /* ================= STATUS HELPERS ================= */
//   const statusLabel = (s) => {
//     if (s === "PACKED") return "Out For Delivery";
//     if (s === "ACCEPTED") return "Confirmed";
//     if (s === "DELIVERED") return "Delivered";
//     if (s === "REJECTED") return "Cancelled";
//     return "Placed";
//   };

//   const statusClass = (s) => {
//     if (s === "DELIVERED") return "success";
//     if (s === "PACKED") return "warning";
//     if (s === "REJECTED") return "danger";
//     return "info";
//   };

//   /* ================= UI ================= */
//   return (
//     <div className="dashboard_page">
//       {/* HEADER */}
//       <div className="page_header">
//         <h2>Order Details</h2>

//         <button className="btn_add_item_v2" onClick={onBack}>
//           <i className="fa fa-arrow-left me-2"></i>Back
//         </button>
//       </div>

//       {/* ORDER SUMMARY */}
//       <div className="card order_summary">
//         <div className="summary_left">
//           <p>
//             <b>Order ID:</b> {header.order_id}
//           </p>
//           <p>
//             <b>Order Date:</b>{" "}
//             {new Date(header.order_date).toLocaleString()}
//           </p>
//           <p>
//             <b>Supplier:</b> {header.supplier_name}
//           </p>

//           <span className={`status_badge ${statusClass(header.status)}`}>
//             {statusLabel(header.status)}
//           </span>
//         </div>

//         <div className="summary_right">
//           <span>Total Amount</span>
//           <h3>QAR  {header.total_amount}</h3>
//         </div>
//       </div>

//       {/* INFO GRID */}
//       <div className="row mt-4">
//         {/* RESTAURANT DETAILS */}
//         <div className="col-md-6">
//           <div className="card">
//             <h5 className="card_title">Restaurant Details</h5>
//             <p>
//               <b>Name:</b> {header.restaurant_name_english}
//             </p>
//             <p>
//               <b>Contact:</b> {header.restaurant_contact_name}
//             </p>
//             <p>
//               <b>Mobile:</b> {header.restaurant_contact_mobile}
//             </p>
//             <p>
//               <b>Email:</b> {header.restaurant_contact_email}
//             </p>

//             <p className="mt-2">
//               <b>Address:</b>
//               <br />
//               {header.restaurant_street}, {header.restaurant_building}
//               <br />
//               Shop No: {header.restaurant_shop_no}
//               <br />
//               Zone: {header.restaurant_zone}
//               <br />
//               {header.restaurant_city}, {header.restaurant_country}
//             </p>
//           </div>
//         </div>

//         {/* SUPPLIER DETAILS */}
//         <div className="col-md-6">
//           <div className="card">
//             <h5 className="card_title">Supplier Details</h5>
//             <p>
//               <b>Name:</b> {header.supplier_name}
//             </p>
//             <p>
//               <b>Contact:</b> {header.supplier_contact}
//             </p>
//             <p>
//               <b>Mobile:</b> {header.supplier_mobile}
//             </p>
//             <p>
//               <b>Email:</b> {header.supplier_email}
//             </p>

//             <p className="mt-2">
//               <b>Address:</b>
//               <br />
//               {header.supplier_address || header.supplier_street}
//               <br />
//               Zone: {header.supplier_zone}
//               <br />
//               {header.supplier_country}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* TRACKING */}
//       {timeline.length > 0 && (
//         <div className="card mt-4">
//           <h5 className="card_title">Tracking History</h5>

//           <ul className="timeline">
//             {timeline.map((t, i) => (
//               <li key={i}>
//                 <span className="dot"></span>
//                 <div>
//                   <b>{t.status}</b>
//                   <small className="d-block">
//                     {new Date(t.changed_at).toLocaleString()}
//                   </small>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {/* ITEMS */}
//       <div className="card mt-4">
//         <h5 className="card_title">Order Items</h5>

//         <table className="table order_table">
//           <thead>
//             <tr>
//               <th>Item</th>
//               <th>Qty</th>
//               <th className="text-end">Price</th>
//             </tr>
//           </thead>

//           <tbody>
//             {items.map((i, idx) => (
//               <tr key={idx}>
//                 <td>{i.product_name_english}</td>
//                 <td>{i.quantity}</td>
//                 <td className="text-end">QAR  {i.total_amount}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* ✅ REVIEW MODAL POPUP */}
//       {showReviewModal && (
//         <ReviewModal
//           order={{
//             order_id: header.order_id,
//             supplier_name: header.supplier_name,
//             total_amount: header.total_amount,
//           }}
//           onClose={() => setShowReviewModal(false)}
//         />
//       )}

//       {/* ACTION BAR */}
//       <div className="cta_bar mt-4">
//         {header.status !== "DELIVERED" && (
//           <button
//             className="btn btn-primary btn-lg"
//             onClick={() => onTrack(orderId)}
//           >
//             <i className="fa fa-location-arrow me-2"></i>
//             Track Your Order
//           </button>
//         )}

//         {header.status === "DELIVERED" && (
//           <>
//             {/* ✅ REVIEW BUTTON */}
//             <button
//               className="btn btn-outline-success btn-lg"
//               onClick={() => setShowReviewModal(true)}
//             >
//               ⭐ Submit Review
//             </button>

//             <button
//               className="btn btn-outline-danger btn-lg"
//               onClick={() => setIssueOrderId(header.order_id)}
//             >
//               Report Issue
//             </button>

//             <button
//               className="btn btn-outline-secondary btn-lg"
//               onClick={() =>
//                 navigate("/restaurantdashboard/invoices", {
//                   state: { orderId: header.order_id },
//                 })
//               }
//             >
//               View Invoice
//             </button>

//             <button
//               className="btn btn-outline-primary btn-lg"
//               onClick={() =>
//                 navigate(`/restaurantdashboard/grn/${header.order_id}`)
//               }
//             >
//               Create / View GRN
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default OrderDetails;








import React, { useEffect, useState } from "react";
import axios from "axios";
import OrderIssue from "./OrderIssue";
import CreateGRN from "./CreateGRN";
import InvoiceForm from "./RestaurantInvoiceForm";

import { useNavigate } from "react-router-dom";
/* ✅ IMPORT REVIEW MODAL */
import ReviewModal from "./ReviewModal";
import { useTranslation } from "react-i18next";

const OrderDetails = ({ orderId, onBack, onTrack }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { t, i18n } = useTranslation();

  const formatCurrency = (value) => {
  return new Intl.NumberFormat(
    i18n.language === "ar" ? "ar-QA" : "en-US",
    {
      style: "currency",
      currency: "QAR",
    }
  ).format(value);
};

const formatOrderId = (id) => {
  if (i18n.language !== "ar") return id;

  return id.replace(/\d/g, (d) =>
    new Intl.NumberFormat("ar-QA").format(d)
  );
};


  const formatDateTime = (date) => {
  if (!date) return "-";

  const d = new Date(date);

  return d.toLocaleString(
    i18n.language === "ar" ? "ar-QA" : "en-US",
    {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    }
  );
};

  useEffect(() => {
    if (!orderId) return;

    setLoading(true);
    axios
      .get(
        `http://192.168.2.22:5000/api/v1/orders/restaurant/orders/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(res => setData(res.data))
      .catch(() => setError("Failed to load order details"))
      .finally(() => setLoading(false));
  }, [orderId, token]);

  if (!orderId) return null;
  if (loading) return <p>Loading order details…</p>;
  if (error) return <p className="err">{error}</p>;
  if (!data) return null;

  /* ✅ IMPORTANT */
  const { header, items, recurring, timeline = [], delivery } = data;

  /* ================= OPEN SCREENS ================= */
  // if (showGRN) return <CreateGRN orderId={orderId} onBack={() => setShowGRN(false)} />;
  // if (showInvoice) return <InvoiceForm orderId={orderId} onBack={() => setShowInvoice(false)}/>;

  // if (issueOrderId) {
  //   return (
  //     <OrderIssue
  //       orderId={issueOrderId}
  //       orderItems={items}
  //       onBack={() => setIssueOrderId(null)}
  //     />
  //   );
  // }

const statusLabel = (s) => {
  if (s === "OUT_FOR_DELIVERY") return t("resout_for_delivery");
  if (s === "ACCEPTED") return t("resconfirmed");
  if (s === "DELIVERED") return t("resdelivered");
  if (s === "REJECTED") return t("rescancelled");
  return t("resplaced");
};

  const statusClass = (s) => {
    if (s === "DELIVERED") return "success";
    if (s === "OUT_FOR_DELIVERY") return "warning";
    if (s === "REJECTED") return "danger";
    return "info";
  };

  return (
    <div className="dashboard_page">

      {/* HEADER */}
      <div className="page_header">
      <h2>{t("resorder_details")}</h2>

      <button className="btn_add_item_v2" onClick={onBack}>
        <i className="fa fa-arrow-left me-2"></i>{t("resback")}
      </button>
      </div>

      {/* ORDER SUMMARY */}
      <div className="card order_summary">
        <div className="summary_left">
          <p>
            <b>{t("resorder_id")}:</b>{" "}
            <span dir="ltr" style={{ unicodeBidi: "isolate" }}>
              {formatOrderId(header.order_id)}
            </span>
          </p>
          <p><b>{t("resorder_date")}:</b>{" "}{formatDateTime(header.order_date)}</p>
          <p><b>{t("ressupplier")}:</b> {i18n.language === "ar"
            ? header.company_name_arabic || header.company_name_english
            : header.company_name_english}</p>
          <span className={`status_badge ${statusClass(header.status)}`}>
            {statusLabel(header.status)}
          </span>
        </div>

        <div className="summary_right">
          <span>{t("restotal_amount")}</span>
          <h3>{formatCurrency(header.total_amount)}</h3>
        </div>
      </div>

      {/* INFO GRID */}
      <div className="row mt-4">

      {/* RESTAURANT DETAILS */}
      <div className="col-md-6">
        <div className="card">
          <h5 className="card_title">{t("resrestaurant_details")}</h5>

          <p>
            <b>{t("resname")}:</b>{" "}
            {i18n.language === "ar"
              ? header.restaurant_name_arabic || header.restaurant_name_english
              : header.restaurant_name_english}
          </p>
          <p><b>{t("rescontact")}:</b> {header.restaurant_contact_name}</p>
          <p><b>{t("resmobile")}:</b> {header.restaurant_contact_mobile}</p>
          <p><b>{t("resemail")}:</b> {header.restaurant_contact_email}</p>

          <p className="mt-2">
            <b>{t("resaddress")}:</b><br />
            {header.restaurant_street}, {header.restaurant_building}<br />
            {t("resshop_no")}: {header.restaurant_shop_no}<br />
            {t("reszone")}: {header.restaurant_zone}<br />
            {header.restaurant_city}, {header.restaurant_country}
          </p>
        </div>
      </div>


      {/* SUPPLIER DETAILS */}
      <div className="col-md-6">
        <div className="card">
          <h5 className="card_title">{t("ressupplier_details")}</h5>

          <p>
            <b>{t("resname")}:</b>{" "}
            {i18n.language === "ar"
              ? header.company_name_arabic || header.company_name_english
              : header.company_name_english}
          </p>
          <p><b>{t("rescontact")}:</b> {header.supplier_contact}</p>
          <p><b>{t("resmobile")}:</b> {header.supplier_mobile}</p>
          <p><b>{t("resemail")}:</b> {header.supplier_email}</p>

          <p className="mt-2">
            <b>{t("resaddress")}:</b><br />
            {header.supplier_address || header.supplier_street}<br />
            {t("reszone")}: {header.supplier_zone}<br />
            {header.supplier_country}
          </p>
        </div>
      </div>
      </div>


      {/* DELIVERY DETAILS */}
      {delivery && header.status === "OUT_FOR_DELIVERY" && (
        <div className="card mt-4">
            <h5 className="card_title">🚚 {t("resdelivery_details")}</h5>

            <p><b>{t("resdelivery_type")}:</b> {delivery.delivery_type}</p>

          {delivery.delivery_type === "OWN" && (
            <>
              <p><b>{t("resdriver")}:</b> {delivery.driver_name}</p>
              <p><b>{t("resdriver_mobile")}:</b> {delivery.driver_mobile}</p>

              <p><b>{t("resvehicle_type")}:</b> {delivery.vehicle_type || "-"}</p>
              <p><b>{t("resvehicle_number")}:</b> {delivery.vehicle_number || "-"}</p>
            </>
          )}

          {delivery.delivery_type === "PARTNER" && (
            <>
              <p><b>{t("respartner")}:</b> {delivery.partner_name}</p>
            </>
          )}

            <p>
              <b>{t("resestimated_arrival")}:</b>{" "}
              {delivery.estimated_delivery_time
                ? formatDateTime(delivery.estimated_delivery_time)
                : "-"}
            </p>
        </div>
      )}


      {delivery && header.status === "DELIVERED" && (
        <div className="card mt-4 border-success">
          <h5 className="card_title">✅ {t("resdelivery_completed")}</h5>

          {/* <p>
            <b>Delivered To:</b>{" "}
            {delivery.received_by || "Not specified"}
          </p>

          <p>
            <b>Delivered At:</b>{" "}
            {delivery.delivered_at
              ? new Date(delivery.delivered_at).toLocaleString()
              : "-"}
          </p> */}

          <hr />

            <p><b>{t("resdriver")}:</b> {delivery.driver_name}</p>
            <p><b>{t("resdriver_mobile")}:</b> {delivery.driver_mobile}</p>

            <p>
              <b>{t("resvehicle")}:</b>{" "}
              {delivery.vehicle_type || "-"} {delivery.vehicle_number || ""}
            </p>
        </div>
      )}
      

      {recurring && (
        <div className="card mt-3">
          <h5 className="card_title">{t("resrecurring_schedule")}</h5>

          <p><b>{t("resfrequency")}:</b> {recurring.frequency}</p>

          {recurring.weekdays?.length > 0 && (
            <p><b>{t("resdays")}:</b> {recurring.weekdays.join(", ")}</p>
          )}

          <p><b>{t("resstart_date")}:</b> {formatDateTime(recurring.start_date)}</p>

          {recurring.end_date && (
            <p><b>{t("resend_date")}:</b> {formatDateTime(recurring.end_date)}</p>
          )}

          <p><b>{t("resnext_run")}:</b> {formatDateTime(recurring.next_run_date)}</p>

          <p><b>{t("resstatus")}:</b> {recurring.status}</p>
        </div>
      )}

    

      {/* ITEMS */}
      <div className="card mt-4">
        <h5 className="card_title">{t("resorder_items")}</h5>
        <table className="table order_table">
          <thead>
            <tr>
              <th>{t("resitem")}</th>
              <th>{t("resqty")}</th>
              <th className="text-end">{t("resprice")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i, idx) => (
              <tr key={idx}>
                <td>
                  {i18n.language === "ar"
                    ? i.product_name_arabic || i.product_name_english
                    : i.product_name_english}
                </td>
                <td>{i.quantity}</td>
                <td className="text-end" dir="ltr">
                  {formatCurrency(i.total_amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


       {/* ✅ REVIEW MODAL POPUP */}
      {showReviewModal && (
        <ReviewModal
          order={{
            order_id: header.order_id,
            supplier_name: header.supplier_name,
            total_amount: header.total_amount,
          }}
          onClose={() => setShowReviewModal(false)}
        />
      )}

      {/* ACTION BAR */}
      <div className="cta_bar">
        {header.status !== "DELIVERED" &&     
        header.status !== "REJECTED" &&
        header.status !== "CANCELLED" &&(
          <button
            className="btn btn-primary btn-lg"
            onClick={() => onTrack(orderId)}
          >
            <i className="fa fa-location-arrow me-2"></i>
            {t("restrack_order")}
          </button>
        )}

        {header.status === "DELIVERED" && (
          <>
                {/* ✅ REVIEW BUTTON */}
            <button
              className="btn btn-outline-success btn-lg"
              onClick={() => setShowReviewModal(true)}
            >
              {t("ressubmit_review")}
            </button>
            <button
              className="btn btn-outline-danger btn-lg"
              onClick={() =>
                navigate(`/restaurantdashboard/issues/${header.order_id}`)
              }
            >
              {t("resreport_issue")}
            </button>

            <button
              className="btn btn-outline-secondary btn-lg"
              onClick={() =>
                navigate("/restaurantdashboard/invoices", {
                  state: { orderId: header.order_id }
                })
              }
            >
              {t("resview_invoice")}
            </button>


            <button
              className="btn btn-outline-primary btn-lg"
              onClick={() =>
                navigate(`/restaurantdashboard/grn/${header.order_id}`)
              }
            >
              {t("rescreate_grn")}
            </button>

          </>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
