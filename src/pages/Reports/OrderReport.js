import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "jspdf-autotable";
import { useTranslation } from "react-i18next";
const ITEMS_PER_PAGE = 5;

const OrderReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [orderIdFilter, setOrderIdFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [productFilter, setProductFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const { t, i18n } = useTranslation();
const isArabic = i18n.language?.startsWith("ar");

  const token = localStorage.getItem("token");

  /* ================= FETCH ================= */
  useEffect(() => {
    axios
      .get("http://192.168.2.22:5000/api/reports/orders", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data || []))
      .finally(() => setLoading(false));
  }, [token]);

  /* ================= UNIQUE VALUES ================= */
  const statuses = useMemo(
    () => [...new Set(data.map((d) => d.order_status))],
    [data]
  );

  const payments = useMemo(
    () => [...new Set(data.map((d) => d.payment_status))],
    [data]
  );

  const products = useMemo(
  () =>
    [
      ...new Set(
        data.map((d) =>
          isArabic ? d.product_name_arabic : d.product_name_english
        )
      ),
    ],
  [data, isArabic]
);

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {
    return data.filter(
      (r) =>
        (orderIdFilter === "ALL" || r.order_id === orderIdFilter) &&
        (statusFilter === "ALL" || r.order_status === statusFilter) &&
        (paymentFilter === "ALL" ||
          r.payment_status === paymentFilter) &&
        (productFilter === "ALL" ||
          (isArabic
  ? r.product_name_arabic === productFilter
  : r.product_name_english === productFilter))
    );
  }, [
    data,
    orderIdFilter,
    statusFilter,
    paymentFilter,
    productFilter,
  ]);

  /* ================= GROUP BY ORDER ================= */
  const groupedOrders = useMemo(() => {
    const map = new Map();

    filtered.forEach((row) => {
      if (!map.has(row.order_id)) {
        map.set(row.order_id, row);
      }
    });

    return Array.from(map.values());
  }, [filtered]);

  /* ================= PAGINATION ================= */
  const totalPages =
    Math.ceil(groupedOrders.length / ITEMS_PER_PAGE) || 1;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const paginatedData = groupedOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ================= DOWNLOAD ================= */
  const download = async (type) => {
    const res = await axios.get(
      `http://192.168.2.22:5000/api/reports/orders/${type}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          orderId: orderIdFilter,
          status: statusFilter,
          payment: paymentFilter,
          product: productFilter,
          lang: i18n.language 
        },
        responseType: "blob",
      }
    );

    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `order_report.${type === "excel" ? "xlsx" : "pdf"}`;
    a.click();
    URL.revokeObjectURL(url);
  };
const statusMap = {
  PLACED: isArabic ? "تم الطلب" : "Placed",
  PACKED: isArabic ? "تم التعبئة" : "Packed",
  DELIVERED: isArabic ? "تم التسليم" : "Delivered",
  OUT_FOR_DELIVERY: isArabic ? "خرج للتوصيل" : "Out for Delivery",
};

const paymentMap = {
  PAID: isArabic ? "مدفوع" : "Paid",
  UNPAID: isArabic ? "غير مدفوع" : "Unpaid",
  PENDING: isArabic ? "قيد الانتظار" : "Pending",
  PARTIAL: isArabic ? "مدفوع جزئياً" : "Partial",
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
const formatOrderId = (id) => {
  if (!isArabic) return id;

  const prefix = id.replace(/[0-9]/g, "");
  const numbers = id.replace(/\D/g, "");

  return prefix + formatNumber(numbers);
};

  /* ================= UI ================= */
  return (
    <div className="report_page">
      <div className="page_header glass">
        <h2>{t("orde.title")}</h2>

        <div className="header_actions">
          <button
            className="btn dark bulk_btn"
            onClick={() => download("excel")}
          >
            {t("excel")}
          </button>
          <button
            className="btn dark pdf_btn"
            onClick={() => download("pdf")}
          >
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
          <option value="ALL">{t("orde.allStatus")}</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {statusMap[s] || s}
            </option>
          ))}
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => {
            setPaymentFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="ALL">{t("orde.allPayments")}</option>
          {payments.map((p) => (
            <option key={p} value={p}>
              {paymentMap[p] || p}
            </option>
          ))}
        </select>

        <select
          value={productFilter}
          onChange={(e) => {
            setProductFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="ALL">{t("orde.allProducts")}</option>
          {products.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="report-loading">Loading...</div>
      ) : paginatedData.length === 0 ? (
        <div className="report-empty">No orders found</div>
      ) : (
        <>
          <table className="mini_table">
            <thead>
              <tr>
                <th>{t("orde.orderId")}</th>
                <th>{t("orde.date")}</th>
                <th>{t("orde.status")}</th>
                <th>{t("orde.payment")}</th>
                <th>{t("orde.product")}</th>
                <th>{t("orde.qty")}</th>
                <th>{t("orde.price")}</th>
                <th>{t("orde.total")}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((r) => (
                <tr key={r.order_id}>
                  <td>{formatOrderId(r.order_id)}</td>
                  <td>{formatDate(r.order_date)}</td>
                  <td>
                    <span
                      className={`status ${
                        r.order_status === "DELIVERED"
                          ? "ok"
                          : "warn"
                      }`}
                    >
                      {statusMap[r.order_status] || r.order_status}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status ${
                        r.payment_status === "PAID"
                          ? "ok"
                          : "danger"
                      }`}
                    >
                      {paymentMap[r.payment_status] || r.payment_status}
                    </span>
                  </td>
                  <td>
                    {isArabic ? r.product_name_arabic : r.product_name_english}
                  </td>
                  <td>{formatNumber(r.quantity)}</td>
                  <td>{formatNumber(r.price_per_unit)}</td>
                  <td>{formatNumber(r.item_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINATION */}
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
        </>
      )}
    </div>
  );
};

export default OrderReport;
