import React, { useEffect, useState } from "react";
import "../css/suppliercredit.css";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
const API = "http://192.168.2.9:5000/api/supplier/credit";

export default function SupplierCreditWallet() {

  const token = localStorage.getItem("token");
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [summary, setSummary] = useState({});
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tab, setTab] = useState(
    location.state?.openTab || "orders"
  );
  const [searchText, setSearchText] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [highlightOrders, setHighlightOrders] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const toggleExpand = (id) => {
    setExpandedRow(prev => (prev === id ? null : id));
  };
  useEffect(() => {
    if (!token) return;
    loadSummary();
    loadOrders();
    loadPayments();
  }, [token]);
useEffect(() => {
  if (location.state?.paymentId) {
    setExpandedRow(Number(location.state.paymentId));
  }
}, [payments]);

useEffect(() => {
  document.body.dir = i18n.language === "ar" ? "rtl" : "ltr";
}, [i18n.language]);



  const loadSummary = async () => {
    try {

      const lang = i18n.language;

      const res = await fetch(`${API}/summary?lang=${lang}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) return;

      const data = await res.json();
      setSummary(data);

    } catch (err) {
      console.error("Summary error", err);
    }
  };



  const loadOrders = async () => {
    try {
      const lang = i18n.language;

      const res = await fetch(`${API}/orders?lang=${lang}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) return;

      const data = await res.json();
      setOrders(data);

    } catch (err) {
      console.error("Orders error", err);
    }
  };



  const loadPayments = async () => {
    try {
      const lang = i18n.language;

      const res = await fetch(`${API}/payments?lang=${lang}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) return;

      const data = await res.json();
      setPayments(data);

    } catch (err) {
      console.error("Payments error", err);
    }
  };



  // const formatCurrency = (val) => {
  //   const amount = Number(val || 0).toFixed(2);

  //   if (i18n.language === "ar") {
  //     return `ر.ق ${amount}`;   // Arabic Riyal
  //   }

  //   return `QAR ${amount}`;
  // };

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

  const formatId = (id, prefix = "") => {
    if (!isArabic) return `${prefix}${id}`;

    const numbers = String(id).replace(/\D/g, "");
    return prefix + formatNumber(numbers);
  };

  const paymentModeMap = {
    BANK: isArabic ? "تحويل بنكي" : "Bank",
    CASH: isArabic ? "نقدي" : "Cash",
  };

  const paidByMap = {
    "System Admin": isArabic ? "مدير النظام" : "System Admin",
  };
  const formatCurrency = (val) => {
    const num = formatNumber(Number(val || 0));
    return isArabic ? `ر.ق ${num}` : `QAR ${num}`;
  };

const formatOrderId = (id) => {
  if (!isArabic) return id;

  const prefix = String(id).replace(/[0-9]/g, "");
  const numbers = String(id).replace(/\D/g, "");

  return prefix + formatNumber(numbers);
};

  return (
    <div className="supplier_wallet">

      <h2>{t("supplier_wallet")}</h2>

      {/* SUMMARY CARDS */}

      <div className="wallet_cards">

        <div className="wallet_card">
          <h4>{t("total_orders")}</h4>
          <p>{formatNumber(summary.total_orders || 0)}</p>
        </div>

        <div className="wallet_card">
          <h4>{t("total_value")}</h4>
          <p>{formatCurrency(summary.total_amount)}</p>
        </div>

        <div className="wallet_card paid">
          <h4>{t("admin_paid")}</h4>
          <p>{formatCurrency(summary.paid_amount)}</p>
        </div>

        <div className="wallet_card due">
          <h4>{t("outstanding")}</h4>
          <p>{formatCurrency(summary.due_amount)}</p>
        </div>

      </div>



      {/* NAVIGATION */}

      <div className="wallet_nav">

        <button
          className={tab === "orders" ? "active" : ""}
          onClick={() => setTab("orders")}
        >
          {t("credit_orders")}
        </button>

        <button
          className={tab === "payments" ? "active" : ""}
          onClick={() => setTab("payments")}
        >
          {t("payment_history")}
        </button>

      </div>

      <div className="wallet_filters">

        <input
          type="text"
          placeholder={
            tab === "orders"
              ? t("search_orders")
              : t("search_payments")
          }
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />

      </div>



      {/* CREDIT ORDERS */}

      {tab === "orders" && (

        <div className="wallet_table">
        <table>

          <thead>
            <tr>
              <th>{t("order")}</th>
              <th>{t("restaurant")}</th>
              <th>{t("total")}</th>
              <th>{t("paid")}</th>
              <th>{t("due")}</th>
              <th>{t("status")}</th>
            </tr>
          </thead>

          <tbody>

            {orders.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center">
                  No credit orders found
                </td>
              </tr>
            )}

            {orders
                .filter((o) => {
                  const normalize = (val) =>
                    String(val)
                      .toLowerCase()
                      .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));

                  const search = normalize(searchText);

                  const searchOk =
                    search === "" ||
                    o.order_id.toString().includes(search) ||
                    (o.restaurant_name || "").toLowerCase().includes(search);

                  const orderDate = new Date(o.created_at || o.order_date);

                  const fromOk = fromDate
                    ? orderDate >= new Date(fromDate).setHours(0,0,0,0)
                    : true;

                  const toOk = toDate
                    ? orderDate <= new Date(toDate).setHours(23,59,59,999)
                    : true;

                  return searchOk && fromOk && toOk;
                })
                .map(o => (

              <tr key={o.order_id}>
                <td>{formatOrderId(o.order_id)}</td>
                <td>{o.restaurant_name}</td>
                <td>{formatCurrency(o.total_amount)}</td>
                <td>{formatCurrency(o.supplier_paid_amount)}</td>
                <td className="text-danger">{formatCurrency(o.supplier_due_amount)}</td>
                <td className={o.supplier_due_amount > 0 ? "status_due" : "status_paid"}>
                {o.supplier_payment_status}
                </td>
              </tr>

            ))}

          </tbody>

        </table>
        </div>

      )}



      {/* PAYMENT HISTORY */}

      {tab === "payments" && (

        <div className="wallet_table">
        <table>

          <thead>
            <tr>
              <th>{t("date")}</th>
              <th>{t("payment_id")}</th>
              <th>{t("amount")}</th>
              <th>{t("mode")}</th>
              <th>{t("reference")}</th>
              <th>{t("orders")}</th>
              <th>{t("paid_by")}</th>
              <th>{t("receipt")}</th>
            </tr>
          </thead>

          <tbody>

            {payments.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center">
                  {t("no_payments")}
                </td>
              </tr>
            )}

            {payments
                .filter((p) => {
                  const normalize = (val) =>
                    String(val)
                      .toLowerCase()
                      .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));

                  const search = normalize(searchText);

                  const searchOk =
                    search === "" ||
                    p.payment_id.toString().includes(search) ||
                    (p.reference_no || "").toLowerCase().includes(search);

                  const paymentDate = new Date(p.created_at);

                  const fromOk = fromDate
                    ? paymentDate >= new Date(fromDate).setHours(0,0,0,0)
                    : true;

                  const toOk = toDate
                    ? paymentDate <= new Date(toDate).setHours(23,59,59,999)
                    : true;

                  return searchOk && fromOk && toOk;
                })
              .map(p => {

                const orderIds = Array.isArray(p.order_ids)
                  ? p.order_ids
                  : JSON.parse(p.order_ids || "[]");

                return (

                      <tr
                    key={p.payment_id}
                    className={
                      highlightOrders.some(id => orderIds.includes(id))
                        ? "highlight_row"
                        : ""
                    }
                  >

                    <td>
                      {formatDate(p.created_at)}
                    </td>

                    <td>
                      {formatId(p.payment_id, isArabic ? "دفعة-" : "PAY-")}
                    </td>

                    <td className="text-success">
                      {formatCurrency(p.amount)}
                    </td>

                    <td>{paymentModeMap[p.payment_mode] || p.payment_mode}</td>

                    <td>{p.reference_no || "-"}</td>

                    <td>
  <div className="order_ids_container">

    {orderIds.slice(0, 3).map(id => (
      <span
        key={id}
        className={`order_chip ${
          highlightOrders.includes(id) ? "highlight" : ""
        }`}
      >
        #{formatOrderId(id)}
      </span>
    ))}

    {/* SHOW +MORE ONLY IF NOT AUTO EXPANDED */}
    {orderIds.length > 3 && expandedRow !== p.payment_id && (
      <span
        className="expand_chip"
        onClick={() => setExpandedRow(p.payment_id)}
      >
        +{formatOrderId(orderIds.length - 3)}
      </span>
    )}
  </div>

  {/* AUTO EXPAND */}
  {expandedRow === p.payment_id && (
    <div className="expanded_orders">
      {orderIds.map(id => (
        <div key={id} className="expanded_order_item">
          {formatOrderId(i18n.language === "ar" ? `طلب #${id}` : `Order #${id}`)}
        </div>
      ))}
    </div>
  )}
</td>

                    <td>{paidByMap[p.paid_by] || p.paid_by || "-"}</td>

                    <td>
                      <div className="payment_actions">

                        {/* {p.receipt_filename && (
                          <button
                            className="btn_download"
                            onClick={() =>
                              window.open(`${API}/receipt/${p.payment_id}?token=${token}`, "_blank")
                            }
                          >
                            {t("receipt")}
                          </button>
                        )} */}

                        <button
                          className="btn_pdf"
                          onClick={() =>
                            window.open(`${API}/payment-pdf/${p.payment_id}?token=${token}&lang=${i18n.language}`)
                          }
                        >
                          {t("pdf")}
                        </button>

                      </div>
                    </td>

                  </tr>

                );

              })}

          </tbody>

        </table>
        </div>

      )}

    </div>
  );
}