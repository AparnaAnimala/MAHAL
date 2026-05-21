

import React, { useEffect, useState } from "react";
import ReceiptView from "./ReceiptView";
// import "../css/receipt.css";
import { useTranslation } from "react-i18next";

const API = "http://192.168.2.22:5000/api/v1/orders";

export default function ReceiptManager() {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith("ar");

  const token = localStorage.getItem("token");

  // helper
  const getText = (en, ar) => (isArabic ? (ar || en) : en);

  useEffect(() => {
    if (!token) return;

    fetch(`${API}/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data.filter(o => o.payment_status === "PAID"));
        }
      });
  }, [token]);

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

const formatId = (id, prefix = "") => {
  if (!isArabic) return `${prefix}${id}`;

  const numbers = String(id).replace(/\D/g, "");
  return prefix + formatNumber(numbers);
};

const currencyMap = {
  QAR: isArabic ? "ر.ق" : "QAR"
};

  return (
    <div className="orders_page">
      <h3 className="page_title">{t("receipt_history")}</h3>

      <div className="filter_bar modern">
        <input
          type="text"
          placeholder={t("search_placeholder")}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search_input"
        />

        <label>{t("from")}:</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="date_input"
        />

        <label>{t("to")}:</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="date_input"
        />
      </div>

      <div className="table_wrapper">
        <table className="orders_table">
          <thead>
            <tr>
              <th>{t("receipt_id")}</th>
              <th>{t("order_id")}</th>
              <th>{t("restaurant")}</th>
              <th>{t("date")}</th>
              <th>{t("total")}</th>
              <th>{t("status")}</th>
              <th>{t("action")}</th>
            </tr>
          </thead>

          <tbody>
            {orders
              .filter((o) => {
                const search = searchText.toLowerCase();

                const restaurantName = getText(
                  o.restaurant_name_english,
                  o.restaurant_name_arabic
                );

                const normalizedSearch = searchText
                .toLowerCase()
                .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));

              const searchOk =
                normalizedSearch === "" ||
                (`RCP-${o.order_id}`).toLowerCase().includes(normalizedSearch) ||
                o.order_id.toString().includes(normalizedSearch) ||
                (restaurantName || "").toLowerCase().includes(normalizedSearch);

                const orderDate = new Date(o.order_date);

                const fromOk = fromDate
                  ? orderDate >= new Date(fromDate).setHours(0, 0, 0, 0)
                  : true;

                const toOk = toDate
                  ? orderDate <= new Date(toDate).setHours(23, 59, 59, 999)
                  : true;

                return searchOk && fromOk && toOk;
              })
              .map(o => (
                <tr key={o.order_id}>
                  <td>{formatId(o.order_id, "RCP-")}</td>
                  <td>{formatId(o.order_id)}</td>

                  <td>
                    {getText(
                      o.restaurant_name_english,
                      o.restaurant_name_arabic
                    )}
                  </td>

                  <td>{formatDate(o.order_date)}</td>

                  <td>
                    {currencyMap["QAR"]} {formatNumber(o.total_amount)}
                  </td>

                  <td>
                    <span className="status received">
                      {t("paid")}
                    </span>
                  </td>

                  <td>
                    <button
                      className="view_btn"
                      onClick={() => setSelectedOrderId(o.order_id)}
                    >
                      {t("view")}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {selectedOrderId && (
        <ReceiptView
          orderId={selectedOrderId}
          onBack={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
}