// import React, { useState } from "react";

// const ResolveIssueModal = ({ issue, onClose, onResolve }) => {
//   const [action, setAction] = useState("");
//   const [refund, setRefund] = useState("");
//   const [notes, setNotes] = useState("");

//   const submit = () => {
//     onResolve({
//       ...issue,
//       status: "RESOLVED",
//       action,
//       refund,
//       notes,
//       resolvedOn: new Date().toLocaleDateString(),
//     });
//   };

//   return (
//     <div className="modal_overlay">
//       <div className="modal_box">
//         <h4>Resolve Issue</h4>

//         <p><b>Order:</b> {issue.id}</p>
//         <p><b>Issue:</b> {issue.issue}</p>

//         <select value={action} onChange={(e) => setAction(e.target.value)}>
//           <option value="">Select Action</option>
//           <option value="Refund Issued">Refund Issued</option>
//           <option value="Replacement Sent">Replacement Sent</option>
//           <option value="Issue Fixed">Issue Fixed</option>
//         </select>

//         <input
//           type="number"
//           placeholder="Refund Amount (optional)"
//           value={refund}
//           onChange={(e) => setRefund(e.target.value)}
//         />

//         <textarea
//           placeholder="Notes"
//           value={notes}
//           onChange={(e) => setNotes(e.target.value)}
//         />

//         <div className="modal_actions">
//           <button className="btn resolve" onClick={submit}>
//             Mark as Resolved
//           </button>
//           <button className="btn cancel" onClick={onClose}>
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResolveIssueModal;




import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const API = "http://192.168.2.22:5000/api/v1";

const ResolveIssueModal = ({ issue, onClose, onResolved }) => {
  const { t, i18n } = useTranslation();

  const [action, setAction] = useState(issue.action || "");
  const [refund, setRefund] = useState(issue.refund || "");
  const [notes, setNotes] = useState(issue.notes || "");
  const [preview, setPreview] = useState(null);

  const token = localStorage.getItem("token");

  const submit = async () => {
    const res = await fetch(
      `${API}/supplier/issues/${issue.issue_report_id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: "ISSUE_RESOLVED",
          action,
          refund: refund ? Number(refund) : null,
          notes
        })
      }
    );

    const updated = await res.json();

    const mergedIssue = {
      ...issue,
      ...updated
    };

    onResolved(mergedIssue);
    onClose();
  };

  return (
    <div className="modal_overlay">
      <div className="order_modal">

        {/* HEADER */}
        <div className="modal_header">
          <h4>{t("resolve_issue")}</h4>
          <button onClick={onClose}>✖</button>
        </div>

        {/* BODY */}
        <div className="modal_body">

          <p><b>{t("order")}:</b> {issue.order_id}</p>

          <p><b>{t("issue")}:</b> {issue.issue_type}</p>

          {/* PRODUCTS */}
          {Array.isArray(issue.damaged_products) &&
            issue.damaged_products.length > 0 && (
              <>
                <hr />
                <p><b>{t("damaged_products")}</b></p>
                <ul className="damaged-products-list">
                  {issue.damaged_products.map((p, idx) => (
                    <li key={idx}>
                      {i18n.language === "ar"
                      ? (p.product_name_arabic || p.product_name_english)
                      : p.product_name_english}
                    </li>
                  ))}
                </ul>
              </>
            )}

          <hr />

          <label><b>{t("description")}</b></label>
          <p className="issue-description-readonly">
            {issue.description || "—"}
          </p>

          {/* IMAGES */}
          {Array.isArray(issue.issue_images) &&
            issue.issue_images.length > 0 && (
              <>
                <hr />
                <div className="issue-image-grid">
                  {issue.issue_images.map((img, idx) => (
                    <img
                      key={idx}
                      src={`data:image/jpeg;base64,${img}`}
                      alt=""
                      className="issue-thumb"
                      onClick={() => setPreview(img)}
                    />
                  ))}
                </div>
              </>
            )}

          <hr />

          {/* ACTION */}
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="">{t("select_action")}</option>
            <option value="Refund Issued">{t("refund_issued")}</option>
            <option value="Replacement Sent">{t("replacement_sent")}</option>
            <option value="Issue Fixed">{t("issue_fixed")}</option>
          </select>

          <input
            type="number"
            placeholder={t("refund_amount")}
            value={refund}
            onChange={(e) => setRefund(e.target.value)}
          />

          <textarea
            placeholder={t("notes")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* FOOTER */}
        <div className="modal_actions">
          <button className="btn resolve" onClick={submit}>
            {t("mark_resolved")}
          </button>

          <button className="btn cancel" onClick={onClose}>
            {t("cancel")}
          </button>
        </div>
      </div>

      {/* IMAGE PREVIEW */}
      {preview && (
        <div className="image-preview-overlay" onClick={() => setPreview(null)}>
          <img
            src={`data:image/jpeg;base64,${preview}`}
            className="image-preview"
            alt="preview"
          />
        </div>
      )}
    </div>
  );
};

export default ResolveIssueModal;