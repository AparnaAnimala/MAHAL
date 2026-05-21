import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const API = "http://192.168.2.22:5000/api/v1";

export default function OrderIssueList() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");
const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
  const formatNumber = (value) => {
  return new Intl.NumberFormat(
    i18n.language === "ar" ? "ar-QA" : "en-US"
  ).format(value);
};

const formatOrderId = (id) => {
  if (i18n.language !== "ar") return id;

  return id.replace(/\d/g, (d) =>
    new Intl.NumberFormat("ar-QA").format(d)
  );
};

  useEffect(() => {
    fetch(`${API}/orders/restaurant/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {

        const flattened = [];

        (Array.isArray(data) ? data : []).forEach((group) => {

          (group.split_orders || []).forEach((o) => {

            if (o.status === "DELIVERED") {

              flattened.push({
                ...o,

                master_order_id: group.master_order_id,

                supplier_name:
                  i18n.language === "ar"
                    ? (
                        o.company_name_arabic ||
                        o.company_name_english ||
                        "-"
                      )
                    : (
                        o.company_name_english ||
                        "-"
                      )

              });

            }

          });

        });

        setOrders(flattened);

      })
      .catch(() => setOrders([]));
  }, [token, i18n.language]);

  return (
    <div className="orders_page">
      <h3 className="page_title">{t("resorder_issues")}</h3>

      <div className="table_wrapper">

        <div className="filters_bar">

          {/* 🔍 SEARCH */}
          <input
            type="text"
            placeholder={t("ressearch_order")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter_input"
          />

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
        <table className="orders_table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t("resorder_id")}</th>
              <th>{t("ressupplier")}</th>
              <th>{t("resstatus")}</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: 20 }}>
                  {t("resno_delivered_orders")}
                </td>
              </tr>
            )}

            {orders
              .filter(o => {

                // 🔍 SEARCH (order id + supplier)
                const matchesSearch =
                  !search ||
                  o.order_id?.toLowerCase().includes(search.toLowerCase()) ||
                  o.supplier_name?.toLowerCase().includes(search.toLowerCase());

                // 📅 DATE FILTER (use order_date)
                const orderDate = o.order_date
                  ? new Date(o.order_date)
                  : null;

                const matchesFrom =
                  !fromDate || (orderDate && orderDate >= new Date(fromDate));

                const matchesTo =
                  !toDate || (orderDate && orderDate <= new Date(toDate));

                return matchesSearch && matchesFrom && matchesTo;
              })
              .map((o, i) => (
              <tr key={o.order_id}>
                <td>{formatNumber(i + 1)}</td>
                <td>{formatOrderId(o.order_id)}</td>
                <td>{o.supplier_name}</td>
                <td>
                  <span className={`status ${o.status}`}>
                    {t(`status_${o.status.toLowerCase()}`, o.status)}
                  </span>
                </td>
                <td>
                  <button
                    className="view_btn"
                    onClick={() =>
                      navigate(`/restaurantdashboard/issues/${o.order_id}`)
                    }
                  >
                    {t("resreport_view")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}