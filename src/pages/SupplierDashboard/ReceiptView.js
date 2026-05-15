// import React, { useEffect, useState } from "react";
// import "../../css/receiptView.css";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";

// const API = "http://192.168.1.193:5000/api/v1/receipt";

// export default function ReceiptView({ orderId, onBack }) {
//   const [data, setData] = useState(null);
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     if (!orderId) return;

//     fetch(`${API}/${orderId}`, {
//       headers: { Authorization: `Bearer ${token}` }
//     })
//       .then(res => res.json())
//       .then(resp => {
//         if (resp.error) {
//           alert(resp.error);
//           onBack?.();
//           return;
//         }
//         setData(resp);
//       })
//       .catch(() => alert("Failed to load receipt"));
//   }, [orderId, token, onBack]);

//   if (!data) return <div className="rcp-loading">Loading receipt...</div>;

//   const { receipt = {}, items = [] } = data;

//   const downloadPDF = async () => {
//     const element = document.querySelector(".rcp-document");
//     if (!element) return;

//     const canvas = await html2canvas(element, { scale: 2, useCORS: true });
//     const imgData = canvas.toDataURL("image/png");
//     const pdf = new jsPDF("p", "mm", "a4");
//     const pdfWidth = pdf.internal.pageSize.getWidth();
//     const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
//     pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
//     pdf.save(`Receipt-${receipt.receipt_number || orderId}.pdf`);
//   };

//   return (
//     <div className="receipt-container">

//       {/* === ACTION TOOLBAR === */}
//       <div className="receipt-toolbar no-print">
//         {onBack && <button onClick={onBack}>← Back</button>}
//         <button onClick={() => window.print()}>Print</button>
//         <button onClick={downloadPDF}>Download PDF</button>
//       </div>

//       {/* === RECEIPT DOCUMENT === */}
//       <div className="rcp-document">

//         {/* HEADER */}
//         <div className="rcp-header">
//           <h1>ORDER RECEIPT</h1>
//           <div className="rcp-meta">
//             <div>
//               Receipt No: <b>{receipt.receipt_number || "-"}</b>
//             </div>
//             <div>
//               Date:{" "}
//               {receipt.receipt_date
//                 ? new Date(receipt.receipt_date).toLocaleDateString()
//                 : "-"}
//             </div>
//           </div>
//         </div>

//         {/* SNAPSHOT DETAILS (VERTICAL OPTION B) */}
//         <div className="snap-info-container">
//           <div className="snap-info-block">
//             <h3 className="snap-title">Restaurant</h3>
//             <span>{receipt.restaurant_name || "-"}</span>
//             <span>City: {receipt.restaurant_city || "-"}</span>
//             <span>Phone: {receipt.restaurant_phone || "-"}</span>
//             <span>VAT: {receipt.restaurant_vat || "-"}</span>
//           </div>

//           <div className="snap-info-block">
//             <h3 className="snap-title">Supplier</h3>
//             <span>{receipt.supplier_name || "-"}</span>
//             <span>City: {receipt.supplier_city || "-"}</span>
//             <span>Phone: {receipt.supplier_phone || "-"}</span>
//             <span>VAT: {receipt.supplier_vat || "-"}</span>
//           </div>
//         </div>

//         {/* ITEMS TABLE */}
//         <table className="rcp-table">
//           <thead>
//             <tr>
//               <th>Product</th>
//               <th>Qty</th>
//               <th>Price</th>
//               <th>Discount</th>
//               <th>Total</th>
//             </tr>
//           </thead>

//           <tbody>
//             {items.length === 0 ? (
//               <tr>
//                 <td colSpan="5" style={{ textAlign: "center" }}>
//                   No items found
//                 </td>
//               </tr>
//             ) : (
//               items.map((i, idx) => (
//                 <tr key={idx}>
//                   <td>{i.product}</td>
//                   <td>{i.quantity}</td>
//                   <td>{i.unit_price}</td>
//                   <td>{i.discount}</td>
//                   <td>{i.line_total}</td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>

//         {/* TOTAL */}
//         <div className="rcp-totals">
//           <div>
//             <span>Grand Total</span>
//             <span>{receipt.total_amount || "-"}</span>
//           </div>
//         </div>

//         {/* FOOTER */}
//         <div className="rcp-footer">
//           <p><b>Status:</b> {receipt.status || "-"}</p>
//           <p><b>Settlement:</b> {receipt.settlement_type || "SYSTEM"} Generated</p>
//           <small>This receipt is system generated and does not require signature.</small>
//         </div>

//       </div>
//     </div>
//   );
// }






import React, { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useTranslation } from "react-i18next";

const API = "http://192.168.2.9:5000/api/v1/receipt";

export default function ReceiptView({ orderId, onBack }) {
  const [data, setData] = useState(null);
  const token = localStorage.getItem("token");

  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith("ar");

  const getText = (en, ar) => (isArabic ? (ar || en) : en);

  useEffect(() => {
    fetch(`${API}/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (res.status === 404) {
          alert(t("no_receipt"));
          onBack();
          return null;
        }

        if (!res.ok) throw new Error("Error");

        return res.json();
      })
      .then((resp) => {
        if (resp) setData(resp);
      })
      .catch(() => {
        alert(t("receipt_error"));
        onBack();
      });
  }, [orderId, token, t, onBack]);

  if (!data) return null;

  const { receipt, items } = data;

  const downloadPDF = async () => {
    const el = document.getElementById("receipt-pdf");

    const canvas = await html2canvas(el, { scale: 2 });
    const img = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;

    pdf.addImage(img, "PNG", 0, 0, w, h);
    pdf.save(`Receipt-${receipt.receipt_number}.pdf`);
  };

  const formatNumber = (num) =>
  new Intl.NumberFormat(
    isArabic ? "ar-EG" : "en-US"
  ).format(num);

const formatCurrency = (num) => {
  const value = formatNumber(Number(num || 0).toFixed(2));
  return isArabic ? `ر.ق ${value}` : `QAR ${value}`;
};

const formatId = (id) => {
  if (!isArabic) return id;

  const prefix = String(id).replace(/[0-9]/g, "");
  const numbers = String(id).replace(/\D/g, "");

  return prefix + formatNumber(numbers);
};

const formatDate = (date) =>
  new Intl.DateTimeFormat(
    isArabic ? "ar-EG" : "en-GB",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }
  ).format(new Date(date));

  return (
    <div className="receipt-modal-overlay">
      <div className="receipt-modal">

        {/* ✅ RTL SUPPORT */}
        <div
          className="receipt-paper"
          id="receipt-pdf"
          dir={isArabic ? "rtl" : "ltr"}
        >

          {/* HEADER */}
          <div className="receipt-header">
            <h3>{t("receipt_details.title")}</h3>
            <div className="receipt-meta">
              <div>
                {t("receipt_details.no")}:
                <b>{formatId(receipt.receipt_number)}</b>
              </div>
              <div>
                {t("date")}:
                <b>{formatDate(receipt.receipt_date)}</b>
              </div>
            </div>
          </div>

          <hr />

          {/* PARTIES */}
          <div className="receipt-parties">
            <div>
              <h6>{t("receipt_details.restaurant")}</h6>
              <p>
                {getText(
                  receipt.restaurant_name_english,
                  receipt.restaurant_name_arabic
                )}
              </p>
              <p>{t("city")}: {receipt.restaurant_city}</p>
              <p>{t("phone")}: {receipt.restaurant_phone}</p>
              <p>VAT: {receipt.restaurant_vat}</p>
            </div>

            <div>
              <h6>{t("receipt_details.supplier")}</h6>
              <p>
                {getText(
                  receipt.supplier_name_english,
                  receipt.supplier_name_arabic
                )}
              </p>
              <p>{t("city")}: {receipt.supplier_city}</p>
              <p>{t("phone")}: {receipt.supplier_phone}</p>
              <p>VAT: {receipt.supplier_vat}</p>
            </div>
          </div>

          {/* ITEMS */}
          <table className="receipt-table">
            <thead>
              <tr>
                <th>{t("product")}</th>
                <th>{t("qty")}</th>
                <th>{t("price")}</th>
                <th>{t("discount")}</th>
                <th>{t("total")}</th>
              </tr>
            </thead>

            <tbody>
              {items.map((i, idx) => (
                <tr key={idx}>
                  <td>
                    {getText(i.product_english, i.product_arabic)}
                  </td>
                  <td>{formatNumber(i.quantity)}</td>
                  <td>{formatCurrency(i.unit_price)}</td>
                  <td>{formatCurrency(i.discount)}</td>
                  <td>{formatCurrency(i.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* TOTAL */}
          <div className="receipt-total">
            <span>{t("grand_total")}</span>
            <b>{formatCurrency(receipt.total_amount)}</b>
          </div>

          <hr className="dashed" />

          {/* FOOTER */}
          <div className="receipt-footer">
            <p>
              <b>{t("status")}:</b> {t("paid")}
            </p>
            <p>
              <b>{t("settlement")}:</b> {t("system_generated")}
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="receipt-actions">
          <button className="btn-orange" onClick={onBack}>
            ← {t("back")}
          </button>
          <button className="btn-orange" onClick={() => window.print()}>
            {t("print")}
          </button>
          <button className="btn-orange" onClick={downloadPDF}>
            {t("download_pdf")}
          </button>
        </div>

      </div>
    </div>
  );
}