import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../../pages/css/status.css";

const NewOrderPopup = ({ notification, onClose }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (!notification) return;
    const tmr = setTimeout(onClose, 8000);
    return () => clearTimeout(tmr);
  }, [notification, onClose]);

  if (!notification) return null;

  const isIssue = notification.type === "ORDER_ISSUE";

  return (
    <div className={`order_popup ${i18n.language === "ar" ? "rtl" : ""}`}>
      
      {/* HEADER */}
      <div className="order_popup_header">
        <span className="dot" />

        <strong>
          {isIssue
            ? t("popup.new_issue")
            : t("popup.new_order")}
        </strong>

        <button className="popup_close" onClick={onClose}>×</button>
      </div>

      {/* BODY */}
      <div className="order_popup_body">
        <p>
          {t("popup.order_id")}
          <br />
          <b>{notification.reference_id}</b>
        </p>

        <button
          className="popup_view_btn"
          onClick={() => {
            if (isIssue) {
              navigate(
                `/dashboard/order-issues?issueId=${notification.reference_id}`
              );
            } else {
              navigate(
                `/dashboard/orders?orderId=${notification.reference_id}`
              );
            }
            onClose();
          }}
        >
          {t("popup.view")}{" "}
          {isIssue ? t("popup.issue") : t("popup.order")}
        </button>
      </div>
    </div>
  );
};

export default NewOrderPopup;