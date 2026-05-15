import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://192.168.2.9:5000/api/v1/orders/restaurant";

export default function RestaurantNotifications() {
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);



  useEffect(() => {
    fetch(`${API}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setNotifications(Array.isArray(data) ? data : []));
  }, [token]);


const markAllRead = async () => {

  await fetch(`${API}/notifications/read-all`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` }
  });

  // update UI instantly
  setNotifications(prev =>
    prev.map(n => ({ ...n, is_read: true }))
  );

  // refresh bell counter
  window.dispatchEvent(new Event("refreshNotifications"));
};

  // const openNotification = async (n) => {
  //   await fetch(`${API}/notifications/${n.id}/read`, {
  //     method: "PUT",
  //     headers: { Authorization: `Bearer ${token}` }
  //   });

  //   window.dispatchEvent(new Event("refreshNotifications"));

  //   if (n.type === "ORDER_MODIFICATION") {
  //     navigate(`/restaurantdashboard/RestaurantModificationRequests`);
  //   }
  //   if (n.type === "ORDER_ISSUE_UPDATE") {
  //       navigate(`/restaurantdashboard/issues/${n.reference_id}`);
  //   }

  // };


  const openNotification = async (n) => {
    await fetch(`${API}/notifications/${n.id}/read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` }
    });

    // 🔥 refresh count
    window.dispatchEvent(new Event("refreshNotifications"));

    // 🔥 refresh list
    setNotifications(prev =>
      prev.map(x =>
        x.id === n.id ? { ...x, is_read: true } : x
      )
    );

    if (n.type === "ORDER_MODIFICATION") {
      navigate(`/restaurantdashboard/RestaurantModificationRequests`);
    }

    if (n.type === "ORDER_ISSUE_UPDATE") {
      navigate(`/restaurantdashboard/issues/${n.reference_id}`);
    }
    if (n.type === "CREDIT_USED") {
      navigate(`/restaurantdashboard/orders`);
    }

    if (n.type === "LOW_CREDIT") {
      navigate(`/restaurantdashboard/checkout`);
    }
    if (n.type === "DELIVERY_ASSIGNED") {
      navigate(`/restaurantdashboard/orders?orderId=${n.reference_id}`);
    }
    if (n.type === "PAYMENT_SETTLED") {
      navigate(`/restaurantdashboard/credit-wallet`, {
        state: {
          settlementId: n.reference_id,
          openTab: "payments"
        }
      });
    }
  };




  return (
    <div className="notifications_page">

      <div className="notifications_header">
      <h3>Notifications</h3>

        {notifications.some(n => !n.is_read) && (
          <button onClick={markAllRead} className="notification_btn">
            Mark All Read
          </button>
        )}
      </div>

      {notifications.length === 0 && <p>No notifications</p>}

      

      {notifications.map(n => (
        <div
          key={n.id}
          className={`notification_card ${n.is_read ? "read" : "unread"}`}
          onClick={() => openNotification(n)}
        >
          <b>{n.title}</b>
          <p>{n.message}</p>
          <small>{new Date(n.created_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}