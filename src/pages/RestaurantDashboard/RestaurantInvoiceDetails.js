// import React from "react";

// const API = "http://192.168.2.22:5000/api/v1/restaurant/invoices";

// const RestaurantInvoiceDetailsModal = ({ invoice, onClose }) => {
//   const token = localStorage.getItem("token");

//   const downloadPDF = async () => {
//     const invoiceId =
//       invoice?.header?.invoice_id || invoice?.header?.invoice_number;

//     if (!invoiceId) {
//       alert("Invoice ID not found");
//       return;
//     }

//     try {
//       const res = await fetch(`${API}/${invoiceId}/pdf`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!res.ok) throw new Error("Failed");

//       const blob = await res.blob();
//       const url = window.URL.createObjectURL(blob);

//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `${invoiceId}.pdf`;
//       a.click();

//       window.URL.revokeObjectURL(url);
//     } catch {
//       alert("Failed to download invoice PDF");
//     }
//   };

//   if (!invoice) return null;

//   return (
//     <div className="modal_overlay">
//       <div className="order_modal">
//         {/* HEADER */}
//         <div className="modal_header">
//           <h4>Invoice Details</h4>
//           <button onClick={onClose}>✖</button>
//         </div>

//         {/* ACTION */}
//         <div className="modal_actions">
//           <button className="btn accept" onClick={downloadPDF}>
//             ⬇️ Download Invoice PDF
//           </button>
//         </div>

//         {/* SUMMARY */}
//         <div className="info_grid">
//           <div>
//             <b>Invoice</b>
//             <span>{invoice.header.invoice_number}</span>
//           </div>
//           <div>
//             <b>Order</b>
//             <span>{invoice.header.order_id}</span>
//           </div>
//           <div>
//             <b>Status</b>
//             <span className={`status ${invoice.header.invoice_status}`}>
//               {invoice.header.invoice_status}
//             </span>
//           </div>
//           <div>
//             <b>Total</b>
//             <span>QAR  {invoice.header.grand_total}</span>
//           </div>
//         </div>

//         {/* SUPPLIER */}
//         <div className="card">
//           <h5>Supplier Details</h5>
//           <div className="info_grid">
//             <div>
//               <b>Name</b>
//               <span>{invoice.header.supplier_name}</span>
//             </div>
//             <div>
//               <b>Contact</b>
//               <span>{invoice.header.supplier_contact_name}</span>
//             </div>
//             <div>
//               <b>Mobile</b>
//               <span>{invoice.header.supplier_contact_mobile}</span>
//             </div>
//             <div>
//               <b>Email</b>
//               <span>{invoice.header.supplier_email}</span>
//             </div>
//           </div>
//         </div>

//         {/* ITEMS */}
//         <div className="card">
//           <h5>Items</h5>
//           <table className="mini_table">
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
//               {(invoice.items || []).map((i, idx) => (
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
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RestaurantInvoiceDetailsModal;


import React from "react";
import { useTranslation } from "react-i18next";

const API = "http://192.168.2.22:5000/api/v1/restaurant/invoices";

const RestaurantInvoiceDetailsModal = ({ invoice, onClose }) => {
  const token = localStorage.getItem("token");
  const { t, i18n } = useTranslation();
  const formatNumber = (value) => {
  return new Intl.NumberFormat(
    i18n.language === "ar" ? "ar-QA" : "en-US"
  ).format(value);
};

const formatText = (value) => {
  if (i18n.language !== "ar") return value;

  return String(value)
    .replace(/INV/gi, "فاتورة")
    .replace(/ORD/gi, "طلب")
    .replace(/STATUS_/gi, "")
    .replace(/GENERATED/gi, "تم الإنشاء")
    .replace(/PAID/gi, "مدفوع")
    .replace(/PENDING/gi, "قيد الانتظار")
    .replace(/REJECTED/gi, "مرفوض")
    .replace(/APPROVED/gi, "تمت الموافقة")
    .replace(/CANCELLED/gi, "ملغي");
};
const toArabicDigitsOnly = (value) => {
  if (i18n.language !== "ar") return value;

  return String(value).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
};

  const downloadPDF = async () => {
    const invoiceId =
      invoice?.header?.invoice_id || invoice?.header?.invoice_number;

    if (!invoiceId) {
      alert(t("ResinvoiceIdNotFound"));
      return;
    }

    try {
      const res = await fetch(`${API}/${invoiceId}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoiceId}.pdf`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch {
      alert(t("ResdownloadFailed"));
    }
  };

  if (!invoice) return null;

  return (
    <div className="modal_overlay">
      <div
        className="order_modal"
        dir={i18n.language === "ar" ? "rtl" : "ltr"}
      >
        {/* HEADER */}
        <div className="modal_header">
          <h4>{t("ResinvoiceDetails")}</h4>
          <button onClick={onClose}>✖</button>
        </div>

        {/* ACTION */}
        <div className="modal_actions">
          <button className="btn accept" onClick={downloadPDF}>
            ⬇️ {t("ResdownloadInvoice")}
          </button>
        </div>

        {/* SUMMARY */}
        <div className="info_grid">
          <div>
            <b>{t("Resinvoice")}</b>
            <span>{toArabicDigitsOnly(formatText(invoice.header.invoice_number))}</span>
          </div>
          <div>
            <b>{t("Resorder")}</b>
            <span dir="ltr" style={{ unicodeBidi: "isolate" }}>
              {toArabicDigitsOnly(formatText(invoice.header.order_id))}
            </span>
          </div>
          <div>
            <b>{t("Resstatus")}</b>
            <span className={`status ${invoice.header.invoice_status}`}>
              {i18n.language === "ar"
                ? formatText(invoice.header.invoice_status)
                : invoice.header.invoice_status}
            </span>
          </div>
          <div>
            <b>{t("Restotal")}</b>
            <span>{t("resqar")} {formatNumber(invoice.header.grand_total)}</span>
          </div>
        </div>

        {/* SUPPLIER */}
        <div className="card">
          <h5>{t("RessupplierDetails")}</h5>
          <div className="info_grid">
            <div>
              <b>{t("Resname")}</b>
              <span>  {i18n.language === "ar"
                ? invoice.header.supplier_name_arabic || invoice.header.supplier_name
                : invoice.header.supplier_name}
              </span>
            </div>
            <div>
              <b>{t("Rescontact")}</b>
              <span>{invoice.header.supplier_contact_name}</span>
            </div>
            <div>
              <b>{t("Resmobile")}</b>
              <span>{invoice.header.supplier_contact_mobile}</span>
            </div>
            <div>
              <b>{t("Resemail")}</b>
              <span>{invoice.header.supplier_email}</span>
            </div>
          </div>
        </div>

        {/* ITEMS */}
        <div className="card">
          <h5>{t("Resitems")}</h5>
          <table className="mini_table">
            <thead>
              <tr>
                <th>{t("Resproduct")}</th>
                <th>{t("Resqty")}</th>
                <th>{t("Resprice")}</th>
                <th>{t("Resdiscount")}</th>
                <th>{t("Restotal")}</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.items || []).map((i, idx) => (
                <tr key={idx}>
                  <td>
                    {i18n.language === "ar"
                      ? i.product_name_arabic || i.product_name_english
                      : i.product_name_english}
                  </td>
                  <td>{formatNumber(i.quantity)}</td>
                  <td>{formatNumber(i.price_per_unit)}</td>
                  <td>{formatNumber(i.discount)}</td>
                  <td>{formatNumber(i.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RestaurantInvoiceDetailsModal;