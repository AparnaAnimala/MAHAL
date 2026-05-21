// import React from "react";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// const InvoiceDetailsModal = ({ invoice, onClose }) => {

//   const downloadInvoicePDF = () => {
//     const doc = new jsPDF();

//     // TITLE
//     doc.setFontSize(16);
//     doc.text("Invoice", 14, 15);

//     // BASIC INFO
//     doc.setFontSize(10);
//     doc.text(`Invoice ID: ${invoice.id}`, 14, 25);
//     doc.text(`Order ID: ${invoice.orderId}`, 14, 32);
//     doc.text(`Date: ${invoice.date}`, 14, 39);
//     doc.text(`Status: ${invoice.status}`, 14, 46);

//     // SUPPLIER DETAILS
//     doc.setFontSize(11);
//     doc.text("Supplier Details", 14, 58);
//     doc.setFontSize(10);
//     doc.text(`Store: ${invoice.supplier.store}`, 14, 65);
//     doc.text(`Contact: ${invoice.supplier.contact}`, 14, 72);
//     doc.text(`Mobile: ${invoice.supplier.mobile}`, 14, 79);
//     doc.text(`Email: ${invoice.supplier.email}`, 14, 86);

//     // PRODUCTS TABLE ✅ (FIXED)
//     autoTable(doc, {
//       startY: 95,
//       head: [["Product", "Qty", "Price", "Total"]],
//       body: invoice.products.map(p => [
//         p.name,
//         p.qty,
//         `$${p.price}`,
//         `$${p.qty * p.price}`
//       ]),
//       styles: { fontSize: 10 },
//       headStyles: { fillColor: [255, 140, 0] }
//     });

//     // GRAND TOTAL
//     const finalY = doc.lastAutoTable.finalY || 110;
//     doc.setFontSize(11);
//     doc.text(`Grand Total: $${invoice.total}`, 14, finalY + 10);

//     // SAVE
//     doc.save(`${invoice.id}.pdf`);
//   };

//   return (
//     <div className="modal_overlay">
//       <div className="order_modal">

//         {/* HEADER */}
//         <div className="modal_header">
//           <h4>Invoice Details</h4>
//           <button onClick={onClose}>✖</button>
//         </div>

//         {/* BASIC INFO */}
//         <div className="info_grid">
//           <div><b>Invoice ID</b><span>{invoice.id}</span></div>
//           <div><b>Order ID</b><span>{invoice.orderId}</span></div>
//           <div><b>Status</b><span className="status generated">{invoice.status}</span></div>
//           <div><b>Total</b><span>${invoice.total}</span></div>
//         </div>

//         {/* SUPPLIER */}
//         <div className="card">
//           <h5>Supplier Details</h5>
//           <div className="info_grid">
//             <div><b>Store</b><span>{invoice.supplier.store}</span></div>
//             <div><b>Contact</b><span>{invoice.supplier.contact}</span></div>
//             <div><b>Mobile</b><span>{invoice.supplier.mobile}</span></div>
//             <div><b>Email</b><span>{invoice.supplier.email}</span></div>
//             <div><b>Address</b><span>{invoice.supplier.address}</span></div>
//           </div>
//         </div>

//         {/* RESTAURANT */}
//         <div className="card">
//           <h5>Restaurant Details</h5>
//           <div className="info_grid">
//             <div><b>Name</b><span>{invoice.restaurantDetails.name}</span></div>
//             <div><b>Contact</b><span>{invoice.restaurantDetails.contact}</span></div>
//             <div><b>Mobile</b><span>{invoice.restaurantDetails.mobile}</span></div>
//             <div><b>Email</b><span>{invoice.restaurantDetails.email}</span></div>
//             <div><b>Address</b><span>{invoice.restaurantDetails.address}</span></div>
//           </div>
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
//               {invoice.products.map((p, i) => (
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

//         {/* DOWNLOAD BUTTON */}
//         <div className="modal_actions">
//           <button className="btn accept" onClick={downloadInvoicePDF}>
//             Download Invoice PDF
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default InvoiceDetailsModal;



// import React from "react";

// const API = "http://192.168.2.22:5000/api/v1/invoice";

// const InvoiceDetailsModal = ({ invoice, onClose }) => {
//   const token = localStorage.getItem("token");

//   const downloadPDF = async () => {
//   const invoiceId =
//   invoice?.header?.invoice_id || invoice?.header?.invoice_number;


//   if (!invoiceId) {
//     alert("Invoice ID not found");
//     return;
//   }

//   try {
//     const res = await fetch(
//       `http://192.168.2.22:5000/api/v1/invoice/${invoiceId}/pdf`,
//       {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       }
//     );

//     if (!res.ok) throw new Error("Unauthorized");

//     const blob = await res.blob();
//     const url = window.URL.createObjectURL(blob);

//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `${invoiceId}.pdf`;
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//     window.URL.revokeObjectURL(url);
//   } catch (err) {
//     alert("Failed to download invoice PDF");
//   }
// };



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
//           <div><b>Invoice ID</b><span>{invoice.header.invoice_id}</span></div>
//           <div><b>Order ID</b><span>{invoice.header.order_id}</span></div>
//           <div>
//             <b>Status</b>
//             <span className={`status ${invoice.header.invoice_status}`}>
//               {invoice.header.invoice_status}
//             </span>
//           </div>
//           <div><b>Total</b><span>${invoice.header.grand_total}</span></div>
//         </div>

//         {/* SUPPLIER */}
//         <div className="card">
//           <h5>Supplier Details</h5>
//           <div className="info_grid">
//             <div><b>Store</b><span>{invoice.header.supplier_store}</span></div>
//             <div><b>Contact</b><span>{invoice.header.supplier_contact_name}</span></div>
//             <div><b>Mobile</b><span>{invoice.header.supplier_contact_mobile}</span></div>
//             <div><b>Email</b><span>{invoice.header.supplier_email}</span></div>
//             <div>
//               <b>Address</b>
//               <span>
//                 {invoice.header.supplier_street},{" "}
//                 {invoice.header.supplier_zone},{" "}
//                 {invoice.header.supplier_building},{" "}
//                 {invoice.header.supplier_shop_no}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* RESTAURANT */}
//         <div className="card">
//           <h5>Restaurant Details</h5>
//           <div className="info_grid">
//             <div><b>Name</b><span>{invoice.header.restaurant_name_english}</span></div>
//             <div><b>Contact</b><span>{invoice.header.restaurant_contact_name}</span></div>
//             <div><b>Mobile</b><span>{invoice.header.restaurant_contact_mobile}</span></div>
//             <div><b>Email</b><span>{invoice.header.restaurant_email}</span></div>
//             <div>
//               <b>Address</b>
//               <span>
//                 {invoice.header.restaurant_street},{" "}
//                 {invoice.header.restaurant_zone},{" "}
//                 {invoice.header.restaurant_building},{" "}
//                 {invoice.header.restaurant_shop_no}
//               </span>
//             </div>
//           </div>
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
//                 <th>Discount</th>
//                 <th>Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               {(invoice.items || []).map((p, i) => (
//                 <tr key={i}>
//                   <td>{p.product_name_english}</td>
//                   <td>{p.quantity}</td>
//                   <td>{p.price_per_unit}</td>
//                   <td>{p.discount}</td>
//                   <td>{p.total_amount}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* PAYMENTS */}
//         <div className="card">
//           <h5>Payment Details</h5>
//           {(invoice.payments || []).length === 0 ? (
//             <span>No payments recorded</span>
//           ) : (
//             invoice.payments.map((p, i) => (
//               <div key={i} className="info_row">
//                 <span>{p.payment_method}</span>
//                 <span>${p.paid_amount}</span>
//               </div>
//             ))
//           )}
//         </div>

//       </div>
//     </div>
//   );
// };

// export default InvoiceDetailsModal;





// import React from "react";

// const API = "http://192.168.2.22:5000/api/v1/invoice";

// const InvoiceDetailsModal = ({ invoice, onClose }) => {
//   const token = localStorage.getItem("token");

//   const downloadPDF = async () => {
//   const invoiceId =
//   invoice?.header?.invoice_id || invoice?.header?.invoice_number;


//   if (!invoiceId) {
//     alert("Invoice ID not found");
//     return;
//   }

//   try {
//     const res = await fetch(
//       `http://192.168.2.22:5000/api/v1/invoice/${invoiceId}/pdf`,
//       {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       }
//     );

//     if (!res.ok) throw new Error("Unauthorized");

//     const blob = await res.blob();
//     const url = window.URL.createObjectURL(blob);

//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `${invoiceId}.pdf`;
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//     window.URL.revokeObjectURL(url);
//   } catch (err) {
//     alert("Failed to download invoice PDF");
//   }
// };



//   return (
//   <div className="invoice_overlay">
//     <div className="invoice_drawer">

//       {/* HEADER */}
//       <div className="drawer_header">
//         <h5 className="mb-0">Invoice Details</h5>
//         <button className="btn btn-sm btn-outline-orange" onClick={onClose}>
//           <i className="fa fa-times"></i>
//         </button>
//       </div>

//       {/* BODY */}
//       <div className="drawer_body">

//         {/* ACTION */}
//         <div className="invoice_section">
//           <button
//             className="btn btn-outline-orange w-100"
//             onClick={downloadPDF}
//           >
//             <i className="fa fa-download me-2"></i>
//             Download Invoice PDF
//           </button>
//         </div>

//         {/* SUMMARY */}
//         <div className="invoice_section">
//           <div className="info_row">
//             <span>Invoice ID</span>
//             <strong>{invoice.header.invoice_id}</strong>
//           </div>

//           <div className="info_row">
//             <span>Order ID</span>
//             <strong>{invoice.header.order_id}</strong>
//           </div>

//           <div className="info_row">
//             <span>Status</span>
//             <strong className={`badge badge-status-${invoice.header.invoice_status}`}>
//               {invoice.header.invoice_status}
//             </strong>
//           </div>

//           <div className="info_row total_row">
//             <span>Total</span>
//             <strong>${invoice.header.grand_total}</strong>
//           </div>
//         </div>

//         {/* SUPPLIER */}
//         <div className="invoice_section">
//           <h6 className="section_heading">Supplier Details</h6>

//           <div className="info_row">
//             <span>Store</span>
//             <strong>{invoice.header.supplier_store}</strong>
//           </div>

//           <div className="info_row">
//             <span>Contact</span>
//             <strong>{invoice.header.supplier_contact_name}</strong>
//           </div>

//           <div className="info_row">
//             <span>Mobile</span>
//             <strong>{invoice.header.supplier_contact_mobile}</strong>
//           </div>

//           <div className="info_row">
//             <span>Email</span>
//             <strong>{invoice.header.supplier_email}</strong>
//           </div>

//           <div className="info_row">
//             <span>Address</span>
//             <strong>
//               {invoice.header.supplier_street},{" "}
//               {invoice.header.supplier_zone},{" "}
//               {invoice.header.supplier_building},{" "}
//               {invoice.header.supplier_shop_no}
//             </strong>
//           </div>
//         </div>

//         {/* RESTAURANT */}
//         <div className="invoice_section">
//           <h6 className="section_heading">Restaurant Details</h6>

//           <div className="info_row">
//             <span>Name</span>
//             <strong>{invoice.header.restaurant_name_english}</strong>
//           </div>

//           <div className="info_row">
//             <span>Contact</span>
//             <strong>{invoice.header.restaurant_contact_name}</strong>
//           </div>

//           <div className="info_row">
//             <span>Mobile</span>
//             <strong>{invoice.header.restaurant_contact_mobile}</strong>
//           </div>

//           <div className="info_row">
//             <span>Email</span>
//             <strong>{invoice.header.restaurant_email}</strong>
//           </div>

//           <div className="info_row">
//             <span>Address</span>
//             <strong>
//               {invoice.header.restaurant_street},{" "}
//               {invoice.header.restaurant_zone},{" "}
//               {invoice.header.restaurant_building},{" "}
//               {invoice.header.restaurant_shop_no}
//             </strong>
//           </div>
//         </div>

//         {/* PRODUCTS */}
//         <div className="invoice_section">
//           <h6 className="section_heading">Products</h6>

//           <table className="table table-sm">
//             <thead>
//               <tr>
//                 <th>Product</th>
//                 <th>Qty</th>
//                 <th className="text-end">Price</th>
//                 <th className="text-end">Discount</th>
//                 <th className="text-end">Total</th>
//               </tr>
//             </thead>

//             <tbody>
//               {(invoice.items || []).map((p, i) => (
//                 <tr key={i}>
//                   <td>{p.product_name_english}</td>
//                   <td>{p.quantity}</td>
//                   <td className="text-end">{p.price_per_unit}</td>
//                   <td className="text-end">{p.discount}</td>
//                   <td className="text-end">{p.total_amount}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* PAYMENTS */}
//         <div className="invoice_section">
//           <h6 className="section_heading">Payment Details</h6>

//           {(invoice.payments || []).length === 0 ? (
//             <span>No payments recorded</span>
//           ) : (
//             invoice.payments.map((p, i) => (
//               <div key={i} className="info_row">
//                 <span>{p.payment_method}</span>
//                 <strong>${p.paid_amount}</strong>
//               </div>
//             ))
//           )}
//         </div>

//       </div>

//     </div>
//   </div>
// );
// };

// export default InvoiceDetailsModal;



import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

const API = "http://192.168.2.22:5000/api/v1/invoice";

const InvoiceDetailsModal = ({ invoice, onClose }) => {
  const { t, i18n } = useTranslation();

  // const formatCurrency = (val) => {
  //   return i18n.language === "ar"
  //     ? `ر.ق ${val}`
  //     : `QAR ${val}`;
  // };

  const downloadPDF = async () => {
    const invoiceId =
      invoice?.header?.invoice_id || invoice?.header?.invoice_number;

    try {
      const res = await fetch(
        `${API}/${invoiceId}/pdf?lang=${i18n.language}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoiceId}.pdf`;
      a.click();
    } catch {
      alert(t("pdf_error"));
    }
  };
useEffect(() => {
  document.body.dir = i18n.language === "ar" ? "rtl" : "ltr";
}, [i18n.language]);

const isArabic = i18n.language?.startsWith("ar");

const formatNumber = (num) =>
  new Intl.NumberFormat(
    isArabic ? "ar-EG" : "en-US"
  ).format(num);

const formatCurrency = (val) => {
  const num = formatNumber(Number(val || 0).toFixed(2));
  return isArabic ? `ر.ق ${num}` : `QAR ${num}`;
};

const formatId = (id) => {
  if (!isArabic) return id;

  const prefix = String(id).replace(/[0-9]/g, "");
  const numbers = String(id).replace(/\D/g, "");

  return prefix + formatNumber(numbers);
};
  return (
    <div className="modal_overlay">
      <div className="order_modal">

        {/* HEADER */}
        <div className="modal_header">
          <h4>{t("invoice_details")}</h4>
          <button onClick={onClose}>✖</button>
        </div>

        {/* BASIC INFO */}
        <div className="info_grid">
          <div>
            <b>{t("invoice_id")}</b>
            <span>{formatId(invoice.header.invoice_id)}</span>
          </div>

          <div>
            <b>{t("order_id")}</b>
            <span>{formatId(invoice.header.order_id)}</span>
          </div>

          <div>
            <b>{t("status")}</b>
            <span className={`status ${invoice.header.invoice_status}`}>
              {t(invoice.header.invoice_status.toLowerCase())}
            </span>
          </div>

          <div>
            <b>{t("total")}</b>
            <span>{formatCurrency(invoice.header.grand_total)}</span>
          </div>
        </div>

        {/* SUPPLIER */}
        <div className="card">
          <h5>{t("supplier_details")}</h5>

          <div className="info_grid">
            <div>
              <b>{t("supstore")}</b>
              <span>{invoice.header.supplier_store}</span>
            </div>

            <div>
              <b>{t("contact")}</b>
              <span>{invoice.header.supplier_contact_name}</span>
            </div>

            <div>
              <b>{t("mobile")}</b>
              <span>{invoice.header.supplier_contact_mobile}</span>
            </div>

            <div>
              <b>{t("email")}</b>
              <span>{invoice.header.supplier_email}</span>
            </div>

            <div>
              <b>{t("supaddress")}</b>
              <span>
                {invoice.header.supplier_street},{" "}
                {invoice.header.supplier_zone},{" "}
                {invoice.header.supplier_building},{" "}
                {invoice.header.supplier_shop_no}
              </span>
            </div>
          </div>
        </div>

        {/* RESTAURANT */}
        <div className="card">
          <h5>{t("restaurant_details")}</h5>

          <div className="info_grid">
            <div>
              <b>{t("name")}</b>
              <span>{invoice.header.restaurant_name}</span>
            </div>

            <div>
              <b>{t("contact")}</b>
              <span>{invoice.header.restaurant_contact_name}</span>
            </div>

            <div>
              <b>{t("mobile")}</b>
              <span>{invoice.header.restaurant_contact_mobile}</span>
            </div>

            <div>
              <b>{t("email")}</b>
              <span>{invoice.header.restaurant_email}</span>
            </div>

            <div>
              <b>{t("supaddress")}</b>
              <span>
                {invoice.header.restaurant_street},{" "}
                {invoice.header.restaurant_zone},{" "}
                {invoice.header.restaurant_building},{" "}
                {invoice.header.restaurant_shop_no}
              </span>
            </div>
          </div>
        </div>

        {/* PRODUCTS */}
        <div className="card">
          <h5>{t("products")}</h5>

          <table className="mini_table">
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
              {(invoice.items || []).map((p, i) => (
                <tr key={i}>
                  <td>{p.product_name}</td>
                  <td>{formatNumber(p.quantity)}</td>
                  <td>{formatCurrency(p.price_per_unit)}</td>
                  <td>{formatCurrency(p.discount)}</td>
                  <td>{formatCurrency(p.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAYMENTS */}
        <div className="card">
          <h5>{t("payment_details")}</h5>

          {(invoice.payments || []).length === 0 ? (
            <span>{t("no_payments")}</span>
          ) : (
            invoice.payments.map((p, i) => (
              <div key={i} className="info_grid">
                <div>
                  <b>{p.payment_method}</b>
                  <span>{formatCurrency(p.paid_amount)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DOWNLOAD */}
        <div className="modal_actions">
          <button className="btn accept" onClick={downloadPDF}>
            {t("download_pdf")}
          </button>
        </div>

      </div>
    </div>
  );
};

export default InvoiceDetailsModal;
