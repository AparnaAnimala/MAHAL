import React, { useEffect, useState } from "react";
import axios from "axios";
import ReviewModal from "./ReviewModal";
import { useTranslation } from "react-i18next";
const RatingsAndReviews = () => {
  const token = localStorage.getItem("token");
  const { t, i18n } = useTranslation();
const [search, setSearch] = useState("");
const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const formatNumber = (value) => {
  return new Intl.NumberFormat(
    i18n.language === "ar" ? "ar-QA" : "en-US"
  ).format(value);
};

const toArabicDigitsOnly = (value) => {
  if (i18n.language !== "ar") return value;
  return String(value).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString(
    i18n.language === "ar" ? "ar-QA" : "en-US"
  );
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString(
    i18n.language === "ar" ? "ar-QA" : "en-US"
  );
};
  

  /* ================= LOAD DELIVERED ORDERS ================= */
  useEffect(() => {
    axios
      .get(
        "http://192.168.2.9:5000/api/v1/orders/restaurant/orders?status=DELIVERED",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {

        const flattened = [];

        (res.data || []).forEach((group) => {

          (group.split_orders || []).forEach((order) => {

            flattened.push({
              ...order,
              master_order_id: group.master_order_id,
              grand_total: group.grand_total,
            });

          });

        });

        setOrders(flattened);

      })
      .catch(() => alert("Failed to load delivered orders"));
  }, [token]);

  return (
    <div className="dashboard_page" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      {/* HEADER */}
      <div className="page_header">
        <h2>⭐ {t("ResreviewsRatings")}</h2>
        <p className="page_subtitle">
          {t("ResreviewsSubtitle")}
        </p>
      </div>

      {/* TABLE */}
      <div className="card mt-3">
        <div className="filters_bar">

          {/* 🔍 SEARCH */}
          <input
            type="text"
            placeholder={t("ressearch_order")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter_input"
          />

          {/* 📅 FROM */}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="filter_input"
          />

          {/* 📅 TO */}
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="filter_input"
          />

          {/* RESET */}
          <button
            className="reset_btn"
            onClick={() => {
              setSearch("");
              setFromDate("");
              setToDate("");
            }}
          >
            {t("reset")}
          </button>

        </div>
        <table className="table order_table">
          <thead>
            <tr>
              <th>{t("ResorderId")}</th>
              <th>{t("Resdate")}</th>
              <th>{t("Ressupplier")}</th>
              <th>{t("Restotal")}</th>
              <th>{t("Resstatus")}</th>
              <th className="text-end">{t("Resaction")}</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4">
                 {t("ResnoDeliveredOrders")}
                </td>
              </tr>
            )}

            {orders
              .filter(o => {

                // 🔍 SEARCH (order + supplier)
                const matchesSearch =
                  !search ||
                  o.order_id?.toLowerCase().includes(search.toLowerCase()) ||
                  o.company_name_english?.toLowerCase().includes(search.toLowerCase()) ||
                  o.company_name_arabic?.toLowerCase().includes(search.toLowerCase());

                // 📅 DATE FILTER
                const orderDate = o.order_date
                  ? new Date(o.order_date)
                  : null;

                const matchesFrom =
                  !fromDate || (orderDate && orderDate >= new Date(fromDate));

                const matchesTo =
                  !toDate || (orderDate && orderDate <= new Date(toDate));

                return matchesSearch && matchesFrom && matchesTo;
              })
              .map((o) => (
              <tr key={o.order_id}>
                <td dir="ltr" style={{ unicodeBidi: "isolate" }}>
                  {toArabicDigitsOnly(o.order_id)}
                </td>

                <td>
                  {formatDate(o.order_date)}
                  <br />
                  <small>{formatTime(o.order_date)}</small>
                </td>

                <td>
                  {i18n.language === "ar"
                    ? o.company_name_arabic || o.company_name_english
                    : o.company_name_english}
                </td>

                <td>
                  {t("resqar")} {formatNumber(o.total_amount)}
                </td>

                <td>
                  {/* <span className="status_badge success">
                    {o.status}
                  </span> */}
                  <span className="status_badge success">
                    {i18n.language === "ar"
                      ? {
                          DELIVERED: "تم التوصيل",
                          PENDING: "قيد الانتظار",
                          CANCELLED: "تم الإلغاء",
                          ACCEPTED: "تم القبول",
                          REJECTED: "مرفوض",
                        }[o.status] || o.status
                      : o.status}
                  </span>
                </td>

                <td className="text-end">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setSelectedOrder(o)}
                  >
                    {t("Resview")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* REVIEW MODAL */}
      {selectedOrder && (
        <ReviewModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default RatingsAndReviews;    