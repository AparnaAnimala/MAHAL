import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "jspdf-autotable";
import { useTranslation } from "react-i18next";
const API = "http://192.168.2.22:5000/api/reports/inventory";

const InventoryReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stockFilter, setStockFilter] = useState("ALL");
  const [expiryFilter, setExpiryFilter] = useState("ALL");
  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith("ar");

  const token = localStorage.getItem("token");

  /* ================= FETCH ================= */
  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  /* ================= FILTER ================= */
  const filteredData = useMemo(() => {
    return data.filter((r) => {
      const stockOk = stockFilter === "ALL" || r.stock_status === stockFilter;
      const expiryOk = expiryFilter === "ALL" || r.expiry_status === expiryFilter;
      return stockOk && expiryOk;
    });
  }, [data, stockFilter, expiryFilter]);

  /* ================= DOWNLOAD ================= */
  const downloadExcel = async () => {
    const res = await axios.get(`${API}/excel`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { stock: stockFilter, expiry: expiryFilter },
      responseType: "blob"
    });

    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory_report.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    const res = await axios.get(`${API}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { stock: stockFilter, expiry: expiryFilter, lang: i18n.language },
      responseType: "blob"
    });

    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory_report.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };
const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
const stockMap = {
  IN_STOCK: isArabic ? "متوفر" : "In Stock",
  LOW_STOCK: isArabic ? "مخزون منخفض" : "Low Stock",
  OUT_OF_STOCK: isArabic ? "غير متوفر" : "Out of Stock"
};
const expiryMap = {
  VALID: isArabic ? "صالح" : "Valid",
  EXPIRING_SOON: isArabic ? "ينتهي قريباً" : "Expiring Soon",
  EXPIRED: isArabic ? "منتهي" : "Expired",
  NO_EXPIRY: isArabic ? "بدون تاريخ انتهاء" : "No Expiry"
};
const paginatedData = filteredData.slice(
  (currentPage - 1) * ITEMS_PER_PAGE,
  currentPage * ITEMS_PER_PAGE
);

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

return (
  <div className="report_page">

    {/* <button className="back_btn" onClick={() => window.history.back()}>
      ← Back to Reports
    </button> */}

    <div className="page_header glass">
      <h2>{t("supinventory.title")}</h2>

      <div className="header_actions">
        <button className="btn dark bulk_btn" onClick={downloadExcel}>{t("excel")}</button>
        <button className="btn dark pdf_btn" onClick={downloadPDF}> {t("download_pdf")}</button>
      </div>
    </div>

    <div className="filter_bar">
      <select value={stockFilter} onChange={e => {setStockFilter(e.target.value);setCurrentPage(1);}}>
        <option value="ALL">{t("supinventory.allStock")}</option>
        <option value="IN_STOCK">{t("inStock")}</option>
        <option value="LOW_STOCK">{t("lowStock")}</option>
        <option value="OUT_OF_STOCK">{t("outOfStock")}</option>
      </select>

      <select value={expiryFilter} onChange={e => {setExpiryFilter(e.target.value);setCurrentPage(1);}}>
        <option value="ALL">{t("supinventory.allExpiry")}</option>
        <option value="VALID">{t("supinventory.valid")}</option>
        <option value="EXPIRING_SOON">{t("supinventory.expiringSoon")}</option>
        <option value="EXPIRED">{t("supinventory.expired")}</option>
      </select>
    </div>

    <table className="mini_table">
      <thead>
        <tr>
          <th>{t("supinventory.product")}</th>
          <th>{t("supinventory.stock")}</th>
          <th>{t("supinventory.status")}</th>
          <th>{t("supinventory.expiry")}</th>
          <th>{t("supinventory.updated")}</th>
        </tr>
      </thead>
      <tbody>
        {paginatedData.map(r => (
          <tr key={r.product_id}>
            <td>
              {isArabic ? r.product_name_arabic : r.product_name_english}
            </td>
            <td>{formatNumber(r.stock_availability)}</td>
            <td>
              <span className={`status ${r.stock_status === "IN_STOCK" ? "ok" : "danger"}`}>
                {stockMap[r.stock_status] || r.stock_status}
              </span>
            </td>
            <td>
              <span className={`status ${
                r.expiry_status === "VALID" ? "ok" :
                r.expiry_status === "EXPIRING_SOON" ? "warn" : "danger"
              }`}>
                {expiryMap[r.expiry_status] || r.expiry_status}
              </span>
            </td>
            <td>{r.updated_at ? formatDate(r.updated_at) : "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          {t("prev")}
        </button>

        <span>
          {t("page")} {formatNumber(currentPage)} {t("of")} {formatNumber(totalPages)}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          {t("next")}
        </button>
      </div>

  </div>
);

};

export default InventoryReport;