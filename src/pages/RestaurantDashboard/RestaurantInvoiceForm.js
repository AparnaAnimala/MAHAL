








import React, { useEffect, useState } from "react";
// import "../css/OrdersDashboard.css";
import RestaurantInvoiceDetailsModal from "./RestaurantInvoiceDetails";
import { useTranslation } from "react-i18next";

const API = "http://192.168.2.22:5000/api/v1/restaurant/invoices";

export default function InvoiceForm({ invoiceId, orderId, onBack }) {
  const token = localStorage.getItem("token");

  const [invoices, setInvoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const { t, i18n } = useTranslation();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const toArabicDigits = (value) => {
    if (i18n.language !== "ar") return value;

    return String(value)
      .replace(/ORD/gi, "طلب")
      .replace(/INV/gi, "فاتورة")
      .replace(/STATUS_/gi, "")
      .replace(/GENERATED/gi, "تم الإنشاء")
      .replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
  };

  /* ================= LOAD LIST ================= */
  useEffect(() => {
    if (!token) return;

    fetch(API, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setInvoices(Array.isArray(data) ? data : []))
      .catch(() => setInvoices([]));
  }, [token]);

  /* ================= AUTO OPEN ================= */
  useEffect(() => {
    if (!invoiceId && !orderId) return;

    const url = invoiceId
      ? `${API}/${invoiceId}`
      : `${API}/by-order/${orderId}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSelected(data))
      .catch(() => setSelected(null));
  }, [invoiceId, orderId, token]);

  /* ================= LOAD SINGLE ================= */
  const loadInvoice = async (id) => {
    try {
      const res = await fetch(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();
      setSelected(await res.json());
    } catch {
      alert("Unable to load invoice");
    }
  };

  /* ================= FILTER ================= */
  const filteredInvoices = invoices.filter((i) => {

    // 🔍 SEARCH
    const matchesSearch =
      !search ||
      String(i.invoice_number).toLowerCase().includes(search.toLowerCase()) ||
      String(i.order_id).toLowerCase().includes(search.toLowerCase());

    // 📊 STATUS
    const matchesStatus =
      statusFilter === "ALL" ||
      String(i.invoice_status || "").toUpperCase() === statusFilter;

    // 📅 DATE
    const invDate = i.invoice_date
      ? new Date(i.invoice_date)
      : null;

    const matchesFrom =
      !fromDate || (invDate && invDate >= new Date(fromDate));

    const matchesTo =
      !toDate || (invDate && invDate <= new Date(toDate));

    return matchesSearch && matchesStatus && matchesFrom && matchesTo;
  });

  return (
    <div className="orders_page">
      <h3 className="page_title">{t("ResinvoiceHistory")}</h3>



      <div className="table_wrapper">

        <div className="filters_bar">

          {/* 🔍 SEARCH */}
          <input
            placeholder={t("RessearchInvoice")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter_input"
          />

          {/* 📊 STATUS */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter_input"
          >
            <option value="ALL">{t("resall_status")}</option>
            <option value="GENERATED">GENERATED</option>
            <option value="PAID">PAID</option>
            <option value="UNPAID">UNPAID</option>
          </select>

          {/* 📅 FROM DATE */}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="filter_input"
          />

          {/* 📅 TO DATE */}
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="filter_input"
          />

          {/* RESET */}
          <button
            className="reset_btn1"
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
              setFromDate("");
              setToDate("");
            }}
          >
            {t("reset")}
          </button>

        </div>
        <table className="orders_table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t("Resinvoice")}</th>
              <th>{t("Resorder")}</th>
              <th>{t("Resdate")}</th>
              <th>{t("Restotal")}</th>
              <th>{t("Resstatus")}</th>
              <th>{t("Resaction")}</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: 20 }}>
                  {t("ResnoInvoices")}
                </td>
              </tr>
            )}

            {filteredInvoices.map((inv, idx) => (
              <tr key={inv.invoice_id}>
                <td>{toArabicDigits(idx + 1)}</td>
                <td>{toArabicDigits(inv.invoice_number)}</td>
                <td>{toArabicDigits(inv.order_id)}</td>

                <td>
                  {inv.invoice_date
                    ? new Date(inv.invoice_date).toLocaleDateString(
                        i18n.language === "ar" ? "ar-QA" : "en-US"
                      )
                    : "-"}
                </td>

                <td>
                  {t("resqar")}{" "}
                  {toArabicDigits(Number(inv.grand_total).toFixed(2))}
                </td>

                <td>
                  <span className={`status ${inv.invoice_status}`}>
                    {i18n.language === "ar"
                      ? toArabicDigits(inv.invoice_status)
                      : inv.invoice_status}
                  </span>
                </td>

                <td>
                  <button
                    className="view_btn"
                    onClick={() => loadInvoice(inv.invoice_id)}
                  >
                    {t("Resview")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <RestaurantInvoiceDetailsModal
          invoice={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}