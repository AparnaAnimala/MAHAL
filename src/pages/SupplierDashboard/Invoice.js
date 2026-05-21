
// src/pages/Dashboard/Invoice.js
import React, { useEffect, useState } from "react";
import InvoiceDetailsModal from "./InvoiceDetailsModal";
// import "../css/receipt.css";
import { useTranslation } from "react-i18next";
const API = "http://192.168.2.22:5000/api/v1/invoice";

const Invoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchInvoiceId, setSearchInvoiceId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const { t, i18n } = useTranslation();

  const token = localStorage.getItem("token");

  /* =========================
     LOAD INVOICE LIST
  ========================= */
  useEffect(() => {
    if (!token) return;

    fetch(`${API}?lang=${i18n.language}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setInvoices(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Invoice list fetch failed:", err);
        setInvoices([]);
      });
  }, [token]);
useEffect(() => {
  document.body.dir = i18n.language === "ar" ? "rtl" : "ltr";
}, [i18n.language]);
  /* =========================
     LOAD SINGLE INVOICE
  ========================= */
  const loadInvoice = async (invoiceId) => {
    try {
      const res = await fetch(`${API}/${invoiceId}?lang=${i18n.language}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setSelectedInvoice(data);
    } catch (err) {
      alert("Unable to load invoice");
    }
  };

  /* =========================
     FILTER
  ========================= */
  const filteredInvoices = invoices.filter((i) => {
    // const search = searchInvoiceId.toLowerCase();

    // ✅ SEARCH (multi-field)
    const normalize = (val) =>
      String(val)
        .toLowerCase()
        .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));

    const search = normalize(searchInvoiceId);

    const searchOk =
      search === "" ||
      normalize(i.invoice_id).includes(search) ||
      normalize(i.order_id).includes(search) ||
      normalize(i.restaurant_name_english).includes(search);

    // ✅ DATE FILTER
    const invoiceDate = new Date(i.invoice_date);

    const fromOk = fromDate
      ? invoiceDate >= new Date(fromDate).setHours(0, 0, 0, 0)
      : true;

    const toOk = toDate
      ? invoiceDate <= new Date(toDate).setHours(23, 59, 59, 999)
      : true;

    return searchOk && fromOk && toOk;
  });

  const isArabic = i18n.language?.startsWith("ar");

  const formatNumber = (num) => {
    return new Intl.NumberFormat(
      isArabic ? "ar-EG" : "en-US"
    ).format(num);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat(
      isArabic ? "ar-EG" : "en-GB"
    ).format(new Date(date));
  };

  const formatId = (id) => {
    if (!isArabic) return id;

    const prefix = String(id).replace(/[0-9]/g, "");
    const numbers = String(id).replace(/\D/g, "");

    return prefix + formatNumber(numbers);
  };

  const currency = isArabic ? "ر.ق" : "QAR";

  return (
    <div className="orders_page">
      <h3 className="page_title">{t("invoice_history")}</h3>

      {/* SEARCH */}
      <div className="filter_bar modern">

        <input
          type="text"
          placeholder={t("search_invoice")}
          value={searchInvoiceId}
          onChange={(e) => setSearchInvoiceId(e.target.value)}
          className="search-input"
        />
      {/* <div className="date_group"> */}
        <label>{t("from")}:</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="date_input"
        />
      {/* </div> */}
      {/* <div className="date_group"> */}
        <label>{t("to")}:</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="date_input"
        />
      {/* </div> */}

      </div>

      {/* TABLE */}
      <div className="table_wrapper">
        <table className="orders_table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t("invoice_id")}</th>
              <th>{t("order_id")}</th>
              <th>{t("restaurant")}</th>
              <th>{t("date")}</th>
              <th>{t("total")}</th>
              <th>{t("status")}</th>
              <th>{t("action")}</th>
            </tr>
          </thead>

          <tbody>
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: 20 }}>
                  {t("no_invoices")}
                </td>
              </tr>
            )}

            {filteredInvoices.map((inv, index) => (
              <tr key={inv.invoice_id}>
                <td>{formatNumber(index + 1)}</td>
                <td>{formatId(inv.invoice_id)}</td>
                <td>{formatId(inv.order_id)}</td>
                <td>
                  {isArabic
                    ? inv.restaurant_name_arabic || inv.restaurant_name
                    : inv.restaurant_name_english || inv.restaurant_name}
                </td>
                <td>
                  {inv.invoice_date ? formatDate(inv.invoice_date) : "-"}
                </td>
                <td>
                  {currency} {formatNumber(inv.grand_total)}
                </td>
                <td>
                  <span className={`status ${inv.invoice_status}`}>
                    {t(inv.invoice_status.toLowerCase())}
                  </span>
                </td>
                <td>
                  <button
                    className="view_btn"
                    onClick={() => loadInvoice(inv.invoice_id)}
                  >
                    {t("view")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DETAILS MODAL */}
      {selectedInvoice && (
        <InvoiceDetailsModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};

export default Invoice;
