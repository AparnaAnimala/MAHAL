

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
// import "../../pages/css/status.css";

const API = "http://192.168.2.22:5000/api/v1/orders";
const ORDERS_API = "http://192.168.2.22:5000/api/v1/orders";
const PROMO_API = "http://192.168.2.22:5000/api/v1";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    Promise.allSettled([
      fetch(`${ORDERS_API}/supplier/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept-Language": i18n.language   // ✅ FIXED
        }
      }).then(res => res.ok ? res.json() : []).catch(() => []),

      fetch(`${PROMO_API}/supplier/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept-Language": i18n.language   // ✅ FIXED
        }
      }).then(res => res.ok ? res.json() : []).catch(() => [])
    ])
    .then(([orderRes, promoRes]) => {
      const orderData = orderRes.status === "fulfilled" ? orderRes.value : [];
      const promoData = promoRes.status === "fulfilled" ? promoRes.value : [];

      setNotifications([
        ...(Array.isArray(orderData) ? orderData : []),
        ...(Array.isArray(promoData) ? promoData : [])
      ]);
    });

  }, [token]);

  const openNotification = async (n) => {
    const baseUrl =
      n.type === "PROMOTION_INVITE" || n.type === "PROMOTION_DECISION"
        ? PROMO_API
        : ORDERS_API;

    await fetch(`${baseUrl}/supplier/notifications/${n.id}/read`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Accept-Language": i18n.language
      }
    });

    setNotifications(prev =>
      prev.map(x =>
        x.id === n.id ? { ...x, is_read: true } : x
      )
    );

    window.dispatchEvent(new CustomEvent("decrementNotification"));
    window.dispatchEvent(new Event("refreshNotifications"));

    if (n.type === "ORDER_ISSUE") {
      navigate(`/dashboard/order-issues?issueId=${n.reference_id}`);
    } else if (n.type === "NEW_ORDER") {
      navigate(`/dashboard/orders?orderId=${n.reference_id}`);
    } else if (n.type === "PROMOTION_INVITE") {
      navigate(`/dashboard/promotion-review/${n.reference_id}`);
    } else if (n.type === "PROMOTION_DECISION") {
      alert(n.message);
    } else if (n.type === "PAYMENT_RECEIVED") {
      const ref = JSON.parse(n.reference_id || "{}");

      navigate(`/dashboard/credit-wallet`, {
        state: {
          openTab: "payments",
          highlightOrders: ref.order_ids || [],
          paymentId: Number(ref.payment_id)
        }
      });
    }
  };

  return (
    <div className={`notifications_page ${i18n.language === "ar" ? "rtl" : ""}`} >

      <div className="notifications_header">
      <h3>{t("notifications.title")}</h3>

      <button
        className="notification_btn"
        onClick={async () => {
          await fetch(`${API}/supplier/notifications/read-all`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Accept-Language": i18n.language
            }
          });

          setNotifications(n =>
            n.map(x => ({ ...x, is_read: true }))
          );

          window.dispatchEvent(new Event("refreshNotifications"));
        }}
      >
        <i className="fas fa-read"></i>
        {t("notifications.mark_all")}
      </button>
      </div>

      {notifications.length === 0 && (
        <p>{t("notifications.empty")}</p>
      )}

      {notifications.map(n => (
        <div
          key={n.id}
          className={`notification_card ${n.is_read ? "read" : "unread"}`}
          onClick={() => openNotification(n)}
        >
          <b>{n.title}</b>
          <p style={{ whiteSpace: "pre-line" }}>{n.message}</p>
          <small>
            {new Date(n.created_at).toLocaleString(
              i18n.language === "ar" ? "ar-QA" : "en-US",
              {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: i18n.language !== "ar"
              }
            )}
          </small>
        </div>
      ))}
    </div>
  );
};

export default Notifications;