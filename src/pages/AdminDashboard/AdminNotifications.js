import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://192.168.2.9:5000/api/v1";

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    axios.get(`${API}/admin/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setNotifications(res.data || []));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Notifications</h2>

      {notifications.map(n => (
        <div key={n.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
          <b>{n.title}</b>
          <p>{n.message}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminNotifications;