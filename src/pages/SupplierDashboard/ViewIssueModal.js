// import React from "react";

// const ViewIssueModal = ({ issue, onClose }) => {
//   return (
//     <div className="modal_overlay">
//       <div className="modal_box">
//         <h4>Issue Details</h4>

//         <p><b>Order:</b> {issue.id}</p>
//         <p><b>Restaurant:</b> {issue.restaurant}</p>
//         <p><b>Issue:</b> {issue.issue}</p>
//         <p><b>Description:</b> {issue.description}</p>

//         <hr />

//         <p><b>Action:</b> {issue.action}</p>
//         <p><b>Refund:</b> QAR {issue.refund}</p>
//         <p><b>Notes:</b> {issue.notes}</p>
//         <p><b>Resolved On:</b> {issue.resolvedOn}</p>

//         <button className="btn cancel" onClick={onClose}>
//           Close
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ViewIssueModal;




import React from "react";
import { useTranslation } from "react-i18next";

const ViewIssueModal = ({ issue, onClose }) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="modal_overlay">
      <div className="modal_box">
        <h4>{t("issue_details")}</h4>

        <p><b>{t("order")}:</b> {issue.order_id}</p>

        <p>
          <b>{t("restaurant")}:</b>{" "}
          {i18n.language === "ar"
            ? issue.restaurant_name_arabic || issue.restaurant_name_english
            : issue.restaurant_name_english}
        </p>

        <p><b>{t("issue")}:</b> {issue.issue_type}</p>
        <p><b>{t("description")}:</b> {issue.description || "—"}</p>

        <hr />

        <p>
          <b>{t("status")}:</b>{" "}
          <span className={`issue_status ${issue.status?.toLowerCase()}`}>
            {t(issue.status?.toLowerCase())}
          </span>
        </p>

        <p><b>{t("action_taken")}:</b> {issue.action || "—"}</p>

       
          <p>
            <b>{t("refund")}:</b>{" "}
            {issue.refund !== null && issue.refund !== undefined
              ? `${t("currency_code")} ${issue.refund}`
              : "—"}
          </p>

          <p>
            <b>{t("notes")}:</b>{" "}
            {issue.notes || "—"}
          </p>

        <p>
          <b>{t("resolved_on")}:</b>{" "}
          {issue.resolved_at
            ? new Date(issue.resolved_at).toLocaleDateString()
            : "—"}
        </p>

        <div className="modal_actions">
          <button className="btn cancel" onClick={onClose}>
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewIssueModal;