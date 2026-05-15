import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../pages/css/status.css";

const API = "http://192.168.2.9:5000/api/v1/orders/restaurant";

const RestaurantNotificationPopup = ({ notification: n, onClose }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!n) return;
    const t = setTimeout(onClose, 8000);
    return () => clearTimeout(t);
  }, [n, onClose]);

  if (!n) return null;

  const openNotification = async () => {
    // ✅ IDENTICAL to Notifications page
    await fetch(`${API}/notifications/${n.id}/read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` }
    });

    window.dispatchEvent(new Event("refreshNotifications"));

    if (n.type === "ORDER_MODIFICATION") {
      navigate(
        `/restaurantdashboard/RestaurantModificationRequests`
      );
    }

    if (n.type === "ORDER_ISSUE_UPDATE") {
      navigate(`/restaurantdashboard/issues/${n.reference_id}`);
    }

    onClose();
  };

  return (
    <div className="order_popup">
      <div className="order_popup_header">
        <span className="dot" />
        <strong>{n.title}</strong>
        <button className="popup_close" onClick={onClose}>×</button>
      </div>

      <div className="order_popup_body">
        <p>
          Order ID
          <br />
          <b>{n.reference_id}</b>
        </p>

        <button
          className="popup_view_btn"
          onClick={openNotification}
        >
          View
        </button>
      </div>
    </div>
  );
};

export default RestaurantNotificationPopup;
