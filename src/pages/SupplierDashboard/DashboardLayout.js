
import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../../components/Dashboard/Sidebar";
import Header from "../../components/Dashboard/Header";
import NewOrderPopup from "../../components/Dashboard/NewOrderPopup";
import { resolveIdentity } from "../../utils/identity";

// import "../../pages/css/halfscreen.css";

const API = "http://192.168.2.22:5000/api/v1/orders";

const DashboardLayout = () => {
  const identity = resolveIdentity();
  const userRole = identity?.role;
  const linkedId = identity?.linkedId;

  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [bannerNotification, setBannerNotification] = useState(null);
  const [notificationQueue, setNotificationQueue] = useState([]);


  const openProfileDrawer = () => setProfileDrawerOpen(true);
  const closeProfileDrawer = () => setProfileDrawerOpen(false);
  const [newOrder, setNewOrder] = useState(null);
  // 🔔 FETCH NEW ORDER FOR BANNER
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  fetch(`${API}/supplier/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => {
      if (!Array.isArray(data)) return;

      // 🔴 Priority 1: Order Issues
      const issue = data.find(
        (n) => n.type === "ORDER_ISSUE" && !n.is_read
      );

      // 🟢 Priority 2: New Orders
      const order = data.find(
        (n) => n.type === "NEW_ORDER" && !n.is_read
      );

      const notification = issue || order;

      if (notification) {
        setBannerNotification(notification);
        setTimeout(() => setBannerNotification(null), 8000);
      }
    });
}, []);

useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;


  fetch(`${API}/supplier/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => {
      if (!Array.isArray(data)) return;

      const unread = data
        .filter(n => !n.is_read)
        .sort((a, b) =>
          a.type === "ORDER_ISSUE" ? -1 : 1
        ); // issues first

      setNotificationQueue(unread);
    });
}, []);

// useEffect(() => {
//   const token = localStorage.getItem("token");
//   if (!token) return;

//   fetch(`${API}/supplier/notifications`, {
//     headers: { Authorization: `Bearer ${token}` }
//   })
//     .then(res => res.json())
//     .then(data => {
//       const unreadOrder = data.find(
//         n => n.type === "NEW_ORDER" && !n.is_read
//       );
//       if (unreadOrder) {
//         setBannerNotification(unreadOrder);
//         setTimeout(() => setBannerNotification(null), 8000);
//       }
//     });
// }, []);
useEffect(() => {
  if (!bannerNotification && notificationQueue.length > 0) {
    setBannerNotification(notificationQueue[0]);
    setNotificationQueue(q => q.slice(1));
  }
}, [notificationQueue, bannerNotification]);

// auto read msg will not be shown after refresh
// useEffect(() => {
//   if (!bannerNotification) return;

//   const token = localStorage.getItem("token");
//   fetch(`${API}/supplier/notifications/${bannerNotification.id}/read`, {
//     method: "PUT",
//     headers: { Authorization: `Bearer ${token}` },
//   });
// }, [bannerNotification]);

  return (
    <>
      {/* 🔔 NEW ORDER BANNER */}
      <NewOrderPopup
        notification={bannerNotification}
        onClose={() => setBannerNotification(null)}
      />

      {/* MAIN DASHBOARD */}
      <div className="dashboard_wrapper">
        <Sidebar />

        <div className="dashboard_body">
          <Header onProfileClick={openProfileDrawer} />


          <div className="dashboard_content">
            <Outlet />
          </div>
        </div>
      </div>

      {/* PROFILE DRAWER */}
      {profileDrawerOpen && (
        <div className="drawer-overlay" onClick={closeProfileDrawer}>
          <div
            className="drawer-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="drawer-close-btn"
              onClick={closeProfileDrawer}
            >
              ×
            </button>

            <ProfileSetup
              identity={identity}
              role={userRole}
              linkedId={linkedId}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardLayout;
