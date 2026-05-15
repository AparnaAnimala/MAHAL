// import React from "react";

// const ModificationRequestDetails = ({ request, onBack, onDecision }) => {
//   if (!request) return null;

//   const originalItems = request.original_items || [];
//   const modifiedItems = request.modified_items || [];

//   return (
//     <div className="dashboard_page">

//       {/* HEADER */}
//       <div className="page_header">
//         <h2>Modification Request</h2>
//         <button className="btn_add_item_v2" onClick={onBack}>
//           <i className="fa fa-arrow-left me-2"></i>Back
//         </button>
//       </div>

//       {/* SUMMARY */}
//       <div className="card order_summary">
//         <div className="summary_left">
//           <p><b>Order ID:</b> {request.order_id}</p>
//           <p><b>Reason:</b> {request.note}</p>

//           <span className="status_badge warning">
//             Pending Approval
//           </span>
//         </div>
//           <div className="summary_right">
//         <span>Before</span>
//         <h4>QAR  {request.total_before}</h4>

//         <span className="mt-2 d-block">After</span>
//         <h3
//             className={
//             request.total_after < request.total_before
//                 ? "text-danger"
//                 : "text-success"
//             }
//         >
//             QAR  {request.total_after}
//         </h3>
//         </div>
//       </div>


//       {/* ITEMS COMPARISON */}
//       <div className="row mt-4">

//         {/* ORIGINAL */}
//         <div className="col-md-6">
//           <div className="card">
//             <h5 className="card_title">Original Items</h5>
//             <table className="table order_table">
//               <thead>
//                 <tr>
//                   <th>Item</th>
//                   <th>Qty</th>
//                   <th className="text-end">Price</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {originalItems.map((i, idx) => (
//                   <tr key={idx}>
//                     <td>{i.product_name_english}</td>
//                     <td>{i.quantity}</td>
//                     <td className="text-end">
//                       QAR  {i.price_per_unit}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* MODIFIED */}
//         <div className="col-md-6">
//           <div className="card">
//             <h5 className="card_title">Modified Items</h5>
//             <table className="table order_table">
//               <thead>
//                 <tr>
//                   <th>Item</th>
//                   <th>Qty</th>
//                   <th className="text-end">Price</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {modifiedItems.map((i, idx) => {
//                   const oldQty = originalItems[idx]?.quantity;
//                   const qtyChanged = oldQty !== i.quantity;

//                   return (
//                     <tr key={idx}>
//                       <td>{i.product_name_english}</td>
//                       <td className={qtyChanged ? "text-danger fw-bold" : ""}>
//                         {i.quantity}
//                       </td>
//                       <td className="text-end">
//                         QAR  {i.price_per_unit}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* ACTION BAR */}
//       <div className="cta_bar">
//         <button
//           className="btn btn-outline-danger btn-lg"
//           onClick={() => onDecision(request.id, "REJECTED")}
//         >
//           Reject Changes
//         </button>

//         <button
//           className="btn btn-success btn-lg"
//           onClick={() => onDecision(request.id, "APPROVED")}
//         >
//           Accept Changes
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ModificationRequestDetails;


import React from "react";
import { useTranslation } from "react-i18next";

const ModificationRequestDetails = ({ request, onBack, onDecision }) => {
  const { t, i18n } = useTranslation();
  const getName = (item) =>
  i18n.language === "ar"
    ? item.product_name_arabic || item.product_name_english
    : item.product_name_english || item.product_name_arabic;

  if (!request) return null;

  const originalItems = request.original_items || [];
  const modifiedItems = request.modified_items || [];
  const formatNumber = (value) => {
  return new Intl.NumberFormat(
    i18n.language === "ar" ? "ar-QA" : "en-US"
  ).format(value);
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat(
    i18n.language === "ar" ? "ar-QA" : "en-US",
    {
      style: "currency",
      currency: "QAR",
      minimumFractionDigits: 2,
    }
  ).format(value);
};

const formatOrderId = (id) => {
  if (i18n.language !== "ar") return id;

  return id.replace(/\d/g, (d) =>
    new Intl.NumberFormat("ar-QA").format(d)
  );
};

  return (
    <div className="dashboard_page">
      {/* HEADER */}
      <div className="page_header">
        <h2>{t("resmodification_request")}</h2>

        <button className="btn_add_item_v2" onClick={onBack}>
          <i className="fa fa-arrow-left me-2"></i>
          {t("resback")}
        </button>
      </div>

      {/* SUMMARY */}
      <div className="card order_summary">
        <div className="summary_left">
          <p>
            <b>{t("resorder_id")}:</b> 
            <span dir="ltr" style={{ unicodeBidi: "isolate" }}>
                {formatOrderId(request.order_id)}
            </span>
          </p>

          <p>
            <b>{t("resreason")}:</b> {request.note}
          </p>

          <span className="status_badge warning">
            {t("respending_approval")}
          </span>
        </div>

        <div className="summary_right">
          <span>{t("resbefore")}</span>
          <h4>
            {t("resqar")} {formatCurrency(request.total_before)}
          </h4>

          <span className="mt-2 d-block">{t("resafter")}</span>

          <h3
            className={
              request.total_after < request.total_before
                ? "text-danger"
                : "text-success"
            }
          >
            {t("resqar")} {formatCurrency(request.total_after)}
          </h3>
        </div>
      </div>

      {/* ITEMS COMPARISON */}
      <div className="row mt-4">
        {/* ORIGINAL */}
        <div className="col-md-6">
          <div className="card">
            <h5 className="card_title">{t("resoriginal_items")}</h5>

            <table className="table order_table">
              <thead>
                <tr>
                  <th>{t("resitem")}</th>
                  <th>{t("resqty")}</th>
                  <th className="text-end">{t("resprice")}</th>
                </tr>
              </thead>

              <tbody>
                {originalItems.map((i, idx) => (
                  <tr key={idx}>
                    <td>{getName(i)}</td>

                    <td>{formatNumber(i.quantity)}</td>

                    <td className="text-end">
                       {formatCurrency(i.price_per_unit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODIFIED */}
        <div className="col-md-6">
          <div className="card">
            <h5 className="card_title">{t("resmodified_items")}</h5>

            <table className="table order_table">
              <thead>
                <tr>
                  <th>{t("resitem")}</th>
                  <th>{t("resqty")}</th>
                  <th className="text-end">{t("resprice")}</th>
                </tr>
              </thead>

              <tbody>
                {modifiedItems.map((i, idx) => {
                  const oldQty = originalItems[idx]?.quantity;
                  const qtyChanged = oldQty !== i.quantity;

                  return (
                    <tr key={idx}>
                      <td>
                        {i18n.language === "ar"
                          ? i.product_name_arabic || i.product_name_english
                          : i.product_name_english}
                      </td>

                      <td className={qtyChanged ? "text-danger fw-bold" : ""}>
                        {formatNumber(i.quantity)}
                      </td>

                      <td className="text-end">
                         {formatCurrency(i.price_per_unit)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="cta_bar">
        <button
          className="btn btn-outline-danger btn-lg"
          onClick={() => onDecision(request.id, "REJECTED")}
        >
          {t("resreject_changes")}
        </button>

        <button
          className="btn btn-success btn-lg"
          onClick={() => onDecision(request.id, "APPROVED")}
        >
          {t("resaccept_changes")}
        </button>
      </div>
    </div>
  );
};

export default ModificationRequestDetails;