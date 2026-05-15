import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "jspdf-autotable";
import { useTranslation } from "react-i18next";
const ITEMS_PER_PAGE = 5;


const InvoiceReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();

  const [invoiceFilter, setInvoiceFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const token = localStorage.getItem("token");

  /* ================= FETCH ================= */
  useEffect(() => {
    axios
      .get("http://192.168.2.9:5000/api/reports/invoices", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data || []))
      .finally(() => setLoading(false));
  }, [token]);

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {
    return data.filter(
      (r) =>
        (invoiceFilter === "ALL" ||
          r.invoice_number === invoiceFilter) &&
        (statusFilter === "ALL" ||
          r.invoice_status === statusFilter)
    );
  }, [data, invoiceFilter, statusFilter]);

  /* ================= GROUP BY INVOICE ================= */
  const groupedInvoices = useMemo(() => {
    const map = new Map();

    filtered.forEach((row) => {
      if (!map.has(row.invoice_id)) {
        map.set(row.invoice_id, row);
      }
    });

    return Array.from(map.values());
  }, [filtered]);

  /* ================= PAGINATION ================= */
  const totalPages =
    Math.ceil(groupedInvoices.length / ITEMS_PER_PAGE) || 1;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const paginatedData = groupedInvoices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ================= DOWNLOAD ================= */
  const download = async (type) => {
    const res = await axios.get(
      `http://192.168.2.9:5000/api/reports/invoices/${type}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          invoice: invoiceFilter,
          status: statusFilter,
          lang: i18n.language,   // 🔥 ADD THIS LINE
        },
        responseType: "blob",
      }
    );

    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice_report.${type === "excel" ? "xlsx" : "pdf"}`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
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
  const prefix = id.replace(/[0-9]/g, "");
  const numbers = id.replace(/\D/g, "");
  return prefix + formatNumber(numbers);
};

  const statusMap = {
    GENERATED: isArabic ? "تم الإنشاء" : "Generated",
    CANCELLED: isArabic ? "ملغي" : "Cancelled",
  };

const paymentMap = {
  PAID: isArabic ? "مدفوع" : "Paid",
  UNPAID: isArabic ? "غير مدفوع" : "Unpaid",
  PARTIAL: isArabic ? "مدفوع جزئياً" : "Partial",
};

  /* ================= UI ================= */
  return (
    <div className="report_page">
      <div className="page_header glass">
        <h2>{t("invoice_report")}</h2>

        <div className="header_actions">
          <button
            className="btn dark bulk_btn"
            onClick={() => download("excel")}
          >
            ⬇ {t("download_excel")}
          </button>
          <button
            className="btn dark pdf_btn"
            onClick={() => download("pdf")}
          >
            ⬇ {t("download_pdf")}
          </button>
        </div>
      </div>

      <div className="filter_bar advanced">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="ALL">{t("all_status")}</option>
          {[...new Set(data.map((d) => d.invoice_status))].map(
            (s) => (
              <option key={s} value={s}>
                {statusMap[s] || s}
              </option>
            )
          )}
        </select>
      </div>

      <div className="table_scroll">
        <table className="mini_table">
          <thead>
            <tr>
              <th>{t("invoice_id")}</th>
              <th>{t("invoice_no")}</th>
              <th>{t("order")}</th>
              <th>{t("date")}</th>
              <th>{t("restaurant")}</th>
              <th>{t("product")}</th>
              <th>{t("qty")}</th>
              <th>{t("price")}</th>
              <th>{t("discount")}</th>
              <th>{t("item_total")}</th>
              <th>{t("subtotal")}</th>
              <th>{t("tax")}</th>
              <th>{t("grand_total")}</th>
              <th>{t("status")}</th>
              <th>{t("payment")}</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((r) => (
              <tr key={r.invoice_id}>
                <td>{formatId(r.invoice_id)}</td>
                <td>{formatId(r.invoice_number)}</td>
                <td>{formatId(r.order_id)}</td>
                <td>{formatDate(r.invoice_date)}</td>
                <td>
                  {i18n.language === "ar"
                    ? r.restaurant_name_arabic
                    : r.restaurant_name_english}
                </td>
                <td>
                  {i18n.language === "ar"
                    ? r.product_name_arabic
                    : r.product_name_english}
                </td>
                <td>{formatNumber(r.quantity)}</td>
                <td>{formatNumber(r.price_per_unit)}</td>
                <td>{formatNumber(r.discount)}</td>
                <td>{formatNumber(r.item_total)}</td>
                <td>{formatNumber(r.subtotal_amount)}</td>
                <td>{formatNumber(r.tax_amount)}</td>
                <td>{formatNumber(r.grand_total)}</td>
                <td>
                  <span className="status ok">
                    {statusMap[r.invoice_status] || r.invoice_status}
                  </span>
                </td>
                <td>
                  <span className="status danger">
                    {paymentMap[r.payment_status] || r.payment_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {groupedInvoices.length > 0 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((p) => Math.max(p - 1, 1))
              }
            >
              {t("prev")}
            </button>

            <span>
              {t("page")} {formatNumber(currentPage)} {t("of")} {formatNumber(totalPages)}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(p + 1, totalPages)
                )
              }
            >
              {t("next")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceReport;
