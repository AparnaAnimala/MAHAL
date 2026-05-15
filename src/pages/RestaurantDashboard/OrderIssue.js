// import React, { useEffect, useState } from "react";
// import "../css/OrderIssue.css";

// const API = "http://192.168.2.9:5000/api/v1/orders";

// export default function OrderIssue({ orderId, onBack }) {
//   const [issue, setIssue] = useState(null);
//   const [issueType, setIssueType] = useState("Missing Items");
//   const [desc, setDesc] = useState("");
//   const [images, setImages] = useState([]); // ✅ MULTIPLE IMAGES
//   const [loading, setLoading] = useState(true);

//   const token = localStorage.getItem("token");

//   // Preview values (before submit)
//   const previewIssueId = `IR-${new Date().getFullYear()}-${String(orderId).slice(-4)}`;
//   const previewReportedAt = new Date().toISOString();

//   // ===============================
//   // LOAD ISSUE (IF EXISTS)
//   // ===============================
//   useEffect(() => {
//     setLoading(true);

//     fetch(`${API}/${orderId}/issue`, {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     })
//       .then(res => res.json())
//       .then(data => {
//         if (data && data.issue_report_id) {
//           setIssue(data);
//         } else {
//           setIssue(null);
//         }
//       })
//       .catch(() => setIssue(null))
//       .finally(() => setLoading(false));
//   }, [orderId, token]);

//   // ===============================
//   // HANDLE MULTIPLE IMAGE UPLOAD
//   // ===============================
//   const handleImageChange = e => {
//     const files = Array.from(e.target.files);
//     if (!files.length) return;

//     setImages(prev => [...prev, ...files]);
//   };

//   const removeImage = index => {
//     setImages(prev => prev.filter((_, i) => i !== index));
//   };

//   // ===============================
//   // SUBMIT ISSUE
//   // ===============================
//   const submitIssue = async () => {
//     if (!desc.trim()) {
//       alert("Please describe the issue");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("issue_type", issueType);
//     formData.append("description", desc);

//     images.forEach(file => {
//       formData.append("images", file); // ✅ backend: request.files.getlist("images")
//     });

//     const res = await fetch(`${API}/${orderId}/issue`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`
//       },
//       body: formData
//     });

//     if (!res.ok) {
//       alert("Failed to report issue");
//       return;
//     }

//     const result = await res.json();

//     setIssue({
//       issue_report_id: result.issue_report_id,
//       issue_type: issueType,
//       description: desc,
//       status: "UNDER_REVIEW",
//       reported_at: new Date().toISOString()
//     });

//     setImages([]);
//     setDesc("");
//   };

//   if (loading) {
//     return <div className="oi-page">Loading...</div>;
//   }

//   return (
//     <div className="oi-page">
//       {/* HEADER */}
//       <div className="oi-header">
//         <button type="button" className="oi-back-btn" onClick={onBack}>
//           ← Back
//         </button>
//         <h2 className="oi-title">Order Issue Details</h2>
//       </div>

//       {/* SUMMARY */}
//       <div className="oi-summary">
//         <div className="oi-summary-row">
//           <span className="oi-summary-label">Issue Report ID</span>
//           <span className="oi-summary-value">
//             {issue ? issue.issue_report_id : previewIssueId}
//           </span>
//         </div>

//         <div className="oi-summary-row">
//           <span className="oi-summary-label">Order ID</span>
//           <span className="oi-summary-value">{orderId}</span>
//         </div>

//         <div className="oi-summary-row">
//           <span className="oi-summary-label">Reported on</span>
//           <span className="oi-summary-value">
//             {new Date(issue?.reported_at || previewReportedAt).toLocaleString()}
//           </span>
//         </div>
//       </div>

//       <div className="oi-layout">
//         {/* LEFT PANEL */}
//         <div className="oi-left">
//           <h3>Issue Information</h3>

//           {!issue && (
//             <>
//               <label>Issue Type</label>
//               <select
//                 value={issueType}
//                 onChange={e => setIssueType(e.target.value)}
//               >
//                 <option>Missing Items</option>
//                 <option>Damaged Items</option>
//                 <option>Wrong Items</option>
//               </select>

//               <textarea
//                 placeholder="Describe the issue..."
//                 value={desc}
//                 onChange={e => setDesc(e.target.value)}
//               />

// {/* IMAGE UPLOAD */}
// <div className="oi-image-upload">
//   <label htmlFor="issueImage" className="oi-image-label">
//     📷 Add Photos
//   </label>

//   <input
//     id="issueImage"
//     type="file"
//     accept="image/*"
//     multiple
//     className="oi-image-input"
//     onChange={handleImageChange}
//   />

//   {images.length > 0 && (
//     <div className="oi-image-preview">
//       {images.map((file, idx) => (
//         <div key={idx} className="oi-image-thumb">
//           <img
//             src={URL.createObjectURL(file)}
//             alt={`preview-${idx}`}
//           />
//           <button
//             type="button"
//             className="oi-image-remove"
//             onClick={() => removeImage(idx)}
//           >
//             ✕
//           </button>
//         </div>
//       ))}
//     </div>
//   )}
// </div>


//               <button className="oi-submit" onClick={submitIssue}>
//                 Submit Issue
//               </button>
//             </>
//           )}

//           {issue && <p className="oi-desc">{issue.description}</p>}
//         </div>

//         {/* RIGHT PANEL */}
//         <div className="oi-right">
//           <h3>Recent Activity</h3>

//           {issue && (
//             <>
//               <div className="oi-activity">
//                 <b>Issue Reported</b>
//                 <small>{new Date(issue.reported_at).toLocaleString()}</small>
//               </div>

//               <div className="oi-activity">
//                 <b>Issue Under Review</b>
//                 <small>Waiting for supplier response</small>
//               </div>

//               {issue.status === "ISSUE_RESOLVED" && (
//                 <div className="oi-activity">
//                   <b>Issue Resolved</b>
//                   <small>
//                     {issue.resolved_at
//                       ? new Date(issue.resolved_at).toLocaleString()
//                       : "Resolved"}
//                   </small>
//                 </div>
//               )}
//             </>
//           )}

//           <div className="oi-help">
//             <p>Need Help?</p>
//             <button>Contact Support</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import "../css/OrderIssue.css";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
const API = "http://192.168.2.9:5000/api/v1/orders";

export default function OrderIssue() {
  const [orderItems, setOrderItems] = useState([]);

  const { orderId } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [issueType, setIssueType] = useState("Missing Items");
  const [desc, setDesc] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ MULTI PRODUCT SELECTION
  const [selectedProducts, setSelectedProducts] = useState([]);

  const token = localStorage.getItem("token");

  const previewIssueId = `IR-${new Date().getFullYear()}-${String(orderId).slice(-4)}`;
  const previewReportedAt = new Date().toISOString();
  const { t, i18n } = useTranslation();

  const formatNumber = (value) => {
  return new Intl.NumberFormat(
    i18n.language === "ar" ? "ar-QA" : "en-US"
  ).format(value);
};

const formatOrderId = (id) => {
  if (i18n.language !== "ar") return id;

  return id.replace(/\d/g, (d) =>
    new Intl.NumberFormat("ar-QA").format(d)
  );
};

 // ===============================
// LOAD ISSUE (IF EXISTS)
// ===============================
useEffect(() => {
  setLoading(true);

  fetch(`${API}/${orderId}/issue`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      if (data && data.issue_report_id) {
        setIssue({
          ...data,
          damaged_products: data.damaged_products || [],
          issue_images: data.issue_images || []
        });
      } else {
        setIssue(null);
      }
    })
    .catch(() => setIssue(null))
    .finally(() => setLoading(false));
}, [orderId, token]);


  // ===============================
  // IMAGE HANDLERS
  // ===============================
  const handleImageChange = e => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = index => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // ===============================
  // PRODUCT HANDLERS
  // ===============================
  const handleProductSelect = e => {
  const value = String(e.target.value);
  if (!value) return;

  setSelectedProducts(prev =>
    prev.includes(value) ? prev : [...prev, value]
  );

  e.target.value = "";
};


  const removeProduct = product => {
    setSelectedProducts(prev => prev.filter(p => p !== product));
  };

  // ===============================
  // SUBMIT ISSUE
  // ===============================
  const submitIssue = async () => {
    if (!desc.trim()) {
      alert(t("resdescribe_issue_error"));
      return;
    }

    if (!selectedProducts.length) {
     alert(t("resselect_product_error"));
      return;
    }

    const formData = new FormData();
    formData.append("issue_type", issueType);
    formData.append("description", desc);

    selectedProducts.forEach(p => {
      formData.append("products", p);
    });

    images.forEach(file => {
      formData.append("images", file);
    });

    const res = await fetch(`${API}/${orderId}/issue`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (!res.ok) {
      alert(t("resissue_failed"));
      return;
    }

    const result = await res.json();

    // ✅ FIX: store product_name immediately after submit
    setIssue({
      issue_report_id: result.issue_report_id,
      issue_type: issueType,
      description: desc,
      status: "UNDER_REVIEW",
      reported_at: new Date().toISOString(),
      damaged_products: selectedProducts.map(p => ({
        product_id: p,
        product_name: p

      })),
      issue_images: images.map(file => URL.createObjectURL(file))
    });

    setImages([]);
    setDesc("");
    setSelectedProducts([]);
  };

  useEffect(() => {
  if (!orderId) return;

  fetch(
    `http://192.168.2.9:5000/api/v1/orders/restaurant/orders/${orderId}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  )

    .then(res => res.json())
    .then(data => {
      console.log("ORDER ITEMS:", data);
      setOrderItems(data.items || []);
    })
    .catch(() => setOrderItems([]));
}, [orderId, token]);


  if (loading) {
    return <div className="oi-page">Loading...</div>;
  }



//   useEffect(() => {
//   if (!orderId) return;

//   fetch(`${API}/${orderId}`, {
//     headers: { Authorization: `Bearer ${token}` }
//   })
//     .then(res => res.json())
//     .then(data => setOrderItems(data.items || []))
//     .catch(() => setOrderItems([]));
// }, [orderId, token]);

 return (
  <div className="dashboard_page order_issue_page">

    {/* HEADER */}
    <div className="issue_header">
      <h5 className="page_title">{t("resorder_issue_details")}</h5>
      <button className="back_btn" onClick={() => navigate(-1)}>
       ← {t("resback_to_orders")}
      </button>
    </div>

    {/* SUMMARY STRIP */}
    <div className="issue_summary_strip">
      <div>
        <label>{t("resissue_report_id")}</label>
        {formatOrderId(issue ? issue.issue_report_id : previewIssueId)}
      </div>

      <div>
        <label>{t("resorder_id")}</label>
        <span dir="ltr" style={{ unicodeBidi: "isolate" }}>
        {formatOrderId(orderId)}
      </span>
      </div>

      <div>
        <label>{t("resreported_on")}</label>
        <span>
          {new Date(issue?.reported_at || previewReportedAt).toLocaleString(i18n.language === "ar" ? "ar-QA" : "en-US")}
        </span>
      </div>
    </div>

    {/* MAIN CONTENT */}
    <div className="row mt-4">

      {/* LEFT PANEL */}
      <div className="col-md-8">
        <div className="card issue_card">
          <h6 className="section_title">{t("resissue_information")}</h6>

          {!issue && (
            <>
              <div className="mb-3">
                <label className="form-label">{t("resissue_type")}</label>
                <select
                  className="form-select"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                >
                  <option>{t("resmissing_items")}</option>
                  <option>{t("resdamaged_items")}</option>
                  <option>{t("reswrong_items")}</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Damaged Products</label>
                <select
                  className="form-select"
                  onChange={handleProductSelect}
                >
                  <option value="">{t("resselect_product")}</option>
                  {orderItems.map((item) => (
                    <option
                      key={item.product_name_english}
                      value={item.product_name_english}
                    >
                        {i18n.language === "ar"
                          ? item.product_name_arabic || item.product_name_english
                          : item.product_name_english}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProducts.length > 0 && (
                <div className="oi-selected-products mb-3">
                  {selectedProducts.map((pid, idx) => {
                    const product = orderItems.find(
                      (i) => i.product_name_english === pid
                    );

                    return (
                      <span key={idx} className="oi-product-chip">
                        {product
                          ? (i18n.language === "ar"
                              ? product.product_name_arabic || product.product_name_english
                              : product.product_name_english)
                          : pid}
                        <button
                          type="button"
                          onClick={() => removeProduct(pid)}
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="mb-4">
                <label className="form-label">{t("resdescription")}</label>
                <textarea
                  className="form-control"
                  rows="4"
                   placeholder={t("resdescribe_issue")}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                ></textarea>
              </div>

              {/* IMAGE UPLOAD */}
              <div className="mb-3">
                <input
                  id="issueImage"
                  type="file"
                  accept="image/*"
                  multiple
                  className="d-none"
                  onChange={handleImageChange}
                />

                <button
                  type="button"
                  className="btn btn-outline-orange"
                  onClick={() =>
                    document.getElementById("issueImage").click()
                  }
                >
                  <i className="fa fa-camera me-2"></i>
                  {t("resadd_photos")}
                </button>
              </div>

              {images.length > 0 && (
                <div className="oi-image-preview mb-3">
                  {images.map((file, idx) => (
                    <div key={idx} className="oi-image-thumb">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`preview-${idx}`}
                      />
                      <button
                        type="button"
                        className="oi-image-remove"
                        onClick={() => removeImage(idx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="action_buttons d-flex">
                <button className="btn btn-orange" onClick={submitIssue}>
                  <i className="fa fa-paper-plane me-2"></i>
                  {t("ressubmit_issue")}
                </button>
              </div>
            </>
          )}

          {issue && (
            <div className="oi-issue-view">

              <div className="mb-3">
                <label className="form-label">{t("resproducts")}</label>

                <div className="oi-selected-products">
                  {issue.damaged_products.map((p, idx) => {
                    const product = orderItems.find(
                      (i) => i.product_id === p.product_id
                    );

                    const name =
                      i18n.language === "ar"
                        ? product?.product_name_arabic || product?.product_name_english
                        : product?.product_name_english ;

                    return (
                      <span key={idx} className="oi-product-chip">
                        {name}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">{t("resdescription")}</label>
                <p>{issue.description}</p>
              </div>

              {issue.issue_images
                ?.filter((img) => typeof img === "string" && img.length > 0)
                .length > 0 && (
                <div className="oi-image-preview">
                  {issue.issue_images
                    .filter((img) => typeof img === "string" && img.length > 0)
                    .map((img, idx) => (
                      <div key={idx} className="oi-image-thumb">
                        <img
                          src={
                            img.startsWith("blob:")
                              ? img
                              : `data:image/jpeg;base64,${img}`
                          }
                          alt={`issue-${idx}`}
                        />
                      </div>
                    ))}
                </div>
              )}

              {issue.status !== "UNDER_REVIEW" && (
                <div className="oi-field oi-supplier-response mt-3">
                 <h6>{t("ressupplier_response")}</h6>

                  {issue.action && (
                    <p>
                      <b>{t("resaction")}:</b> {issue.action}
                    </p>
                  )}

                  {issue.refund !== null && (
                    <p>
                      <b>{t("resrefund")}:</b> ${formatNumber(issue.refund)}
                    </p>
                  )}

                  {issue.notes && (
                    <p>
                      <b>{t("resnotes")}:</b> {issue.notes}
                    </p>
                  )}

                  <p>
                    <b>{t("resstatus")}:</b> {issue.status}
                  </p>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="col-md-4">
        <div className="card issue_card h-100">
          <h6 className="section_title">{t("resrecent_activity")}</h6>

          {issue && (
            <>
              <div className="oi-activity">
                <b>{t("resissue_reported")}</b>
                <small>
                  {new Date(issue.reported_at).toLocaleString()}
                </small>
              </div>

              <div className="oi-activity">
               <b>{t("resissue_under_review")}</b>
                <small>{t("reswaiting_supplier")}</small>
              </div>

              {issue.resolved_at && (
                <div className="oi-activity">
                  <b>{t("resissue_resolved")}</b>
                  <small>
                    {new Date(issue.resolved_at).toLocaleString()}
                  </small>
                </div>
              )}
            </>
          )}

          <div className="support_box">
            <i className="fa fa-headset support_icon"></i>
            <p className="fw-bold mb-1">{t("resneed_help")}</p>

            <a
              href={`tel:${issue?.supplier_phone}`}
              className="btn btn-outline-orange btn-sm"
            >
              {t("rescontact_support")}
            </a>
          </div>
        </div>
      </div>

    </div>
  </div>
);
}