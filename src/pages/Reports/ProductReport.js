import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";
import "jspdf-autotable";

const ProductReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [nameFilter, setNameFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [minStock, setMinStock] = useState("");
  const [maxStock, setMaxStock] = useState("");
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  

  const token = localStorage.getItem("token");

  /* ================= FETCH ================= */
  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://192.168.2.22:5000/api/reports/products",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load product report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  useEffect(() => {
  document.documentElement.dir = isArabic ? "rtl" : "ltr";
}, [isArabic]);

  /* ================= FILTER ================= */
  const filteredData = useMemo(() => {
    return data.filter((p) => {
      /* Status */
      const statusOk =
        statusFilter === "ALL" || p.product_status === statusFilter;

      /* Active / Inactive */
      const activeOk =
        activeFilter === "ALL" ||
        (activeFilter === "ACTIVE" && p.flag === "A") ||
        (activeFilter === "INACTIVE" && p.flag === "D");

      /* Product name search */
      const nameOk =
        !nameFilter ||
        p.product_name_english
          ?.toLowerCase()
          .includes(nameFilter.toLowerCase());

      /* Stock category */
      const stock = Number(p.stock_availability || 0);
      const minQty = Number(p.minimum_order_quantity || 0);

      let stockOk = true;
      if (stockFilter === "IN_STOCK") stockOk = stock > minQty;
      if (stockFilter === "LOW_STOCK")
        stockOk = stock > 0 && stock <= minQty;
      if (stockFilter === "OUT_OF_STOCK") stockOk = stock === 0;

      /* Stock range */
      const minStockOk = minStock === "" || stock >= Number(minStock);
      const maxStockOk = maxStock === "" || stock <= Number(maxStock);

      return (
        statusOk &&
        activeOk &&
        nameOk &&
        stockOk &&
        minStockOk &&
        maxStockOk
      );
    });
  }, [
    data,
    statusFilter,
    activeFilter,
    nameFilter,
    stockFilter,
    minStock,
    maxStock,
  ]);
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ================= COLUMNS (ALL DB FIELDS) ================= */
  const columns = useMemo(() => {
    if (filteredData.length === 0) return [];
    return Object.keys(filteredData[0]);
  }, [filteredData]);

  /* ================= DOWNLOAD ================= */
  const download = async (type) => {
    const params = {
      status: statusFilter,
      active: activeFilter,
      name: nameFilter,
      stock: stockFilter,
      minStock,
      maxStock,
    };

    const res = await axios.get(
      `http://192.168.2.22:5000/api/reports/products/${type}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          status: statusFilter,
          active: activeFilter,
          name: nameFilter,
          stock: stockFilter,
          minStock,
          maxStock,
          lang: i18n.language   // ✅ ADD THIS
        },
        responseType: "blob",
      }
    );

    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `product_report.${type === "excel" ? "xlsx" : "pdf"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
const currencyMap = {
  QAR: isArabic ? "ر.ق" : "QAR",
  INR: isArabic ? "₹" : "INR",
};


  /* ================= UI ================= */
  return (
  <div className="report_page">
    {/* BACK */}
    {/* <button className="back_btn" onClick={() => window.history.back()}>
      ← Back to Reports
    </button> */}

    {/* HEADER */}
    <div className="page_header glass">
      <h2>{t("productReport")}</h2>

      <div className="header_actions">
        <button className="btn dark bulk_btn" onClick={() => download("excel")}>
          {t("excel")}
        </button>
        <button className="btn dark pdf_btn" onClick={() => download("pdf")}>
          {t("download_pdf")}
        </button>
      </div>
    </div>

    {/* FILTER BAR */}
    <div className="filter_bar advanced">
      <select
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value);
          setCurrentPage(1);
        }}
      >
        <option value="ALL">{t("allStatus")}</option>
        <option value="Pending Approval">{t("pending")}</option>
        <option value="Approved">{t("approved")}</option>
      </select>

      <input
        type="text"
        placeholder={t("search")}
        value={nameFilter}
        onChange={(e) => {
          setNameFilter(e.target.value);
          setCurrentPage(1);
        }}
      />

      <select
        value={stockFilter}
        onChange={(e) => {
          setStockFilter(e.target.value);
          setCurrentPage(1);
        }}
      >
        <option value="ALL">{t("allStock")}</option>
        <option value="IN_STOCK">{t("inStock")}</option>
        <option value="LOW_STOCK">{t("lowStock")}</option>
        <option value="OUT_OF_STOCK">{t("outOfStock")}</option>
      </select>

      <input
        type="number"
        placeholder={t("minStock")}
        value={minStock}
        onChange={(e) => setMinStock(e.target.value)}
      />

      <input
        type="number"
        placeholder={t("maxStock")} 
        value={maxStock}
        onChange={(e) => setMaxStock(e.target.value)}
      />
    </div>

    {/* TABLE */}
    {loading ? (
      <div className="report-loading">{t("loading")}</div>
    ) : paginatedData.length === 0 ? (
      <div className="report-empty">{t("noProducts")}</div>
    ) : (
      <>
        <div className="table_scroll">
          <table className="mini_table">
            <thead>
              <tr>
                <th>{t("table.branch")}</th>
                <th>{t("table.category")}</th>
                <th>{t("table.company")}</th>
                <th>{t("table.createdAt")}</th>
                <th>{t("table.currency")}</th>
                <th>{t("table.expiryDate")}</th>
                <th>{t("table.price")}</th>
                <th>{t("table.productId")}</th>
                <th>{t("table.productAr")}</th>
                <th>{t("table.productEn")}</th>
                <th>{t("table.status")}</th>
                <th>{t("table.shelfLife")}</th>
                <th>{t("table.stock")}</th>
                <th>{t("table.store")}</th>
                <th>{t("table.unit")}</th>
                <th>{t("table.updated")}</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((p) => (
                <tr key={p.product_id}>

                  {/* Branch */}
                  <td>{p.branch_name_english}</td>

                  {/* Category */}
                  <td>{formatNumber(p.category_id)}</td>

                  {/* Company */}
                  <td>
                    {isArabic ? p.company_name_arabic : p.company_name_english}
                  </td>

                  {/* Created At */}
                  <td>
                    {p.created_at ? formatDate(p.created_at) : "-"}
                  </td>

                  {/* Currency */}
                  <td>{currencyMap[p.currency] || p.currency}</td>

                  {/* Expiry Date */}
                  <td>
                    {p.expiry_date ? formatDate(p.expiry_date) : "-"}
                  </td>

                  {/* Price */}
                  <td>{formatNumber(p.price_per_unit)}</td>

                  {/* Product ID */}
                  <td>{formatNumber(p.product_id)}</td>

                  {/* Product (AR) */}
                  <td>{p.product_name_arabic}</td>

                  {/* Product (EN) */}
                  <td>{p.product_name_english}</td>

                  {/* Status */}
                  <td>
                    <span className="status warn">
                      {p.product_status}
                    </span>
                  </td>

                  {/* Shelf Life */}
                  <td>
                  {isArabic
                    ? p.shelf_life
                        ?.replace("days", "أيام")
                        .replace("day", "يوم")
                        .replace("months", "أشهر")
                        .replace("month", "شهر")
                    : p.shelf_life}
                </td>

                  {/* Stock */}
                  <td>{formatNumber(p.stock_availability)}</td>

                  {/* Store */}
                  <td>{p.store_name_english}</td>

                  {/* Unit */}
                  <td>{p.unit_of_measure}</td>

                  {/* Updated */}
                  <td>
                    {p.updated_at ? formatDate(p.updated_at) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        {/* PAGINATION */}
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
      </>
    )}
  </div>
);

};

export default ProductReport;