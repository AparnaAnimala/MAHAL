

import React, { useState,useEffect } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../../components/RestaurantDashboard/Sidebar";
import Header from "../../components/RestaurantDashboard/Header";
import ProfileSetup from "../../pages/ProfileSetup";
import { resolveIdentity } from "../../utils/identity";
import { getRestaurantDashboardTourSteps } from "../../tours/restaurantDashboardTour";
import introJs from "intro.js";
import "../../pages/css/halfscreen.css";
import RestaurantNotificationPopup from "../../components/RestaurantDashboard/RestaurantNotificationPopup";

const DashboardLayout = () => {
  const identity = resolveIdentity();
  const userRole = identity?.role;
  const linkedId = identity?.linkedId;

  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

    const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const openProfileDrawer = () => setProfileDrawerOpen(true);
  const closeProfileDrawer = () => setProfileDrawerOpen(false);
  const [popupNotification, setPopupNotification] = useState(null);
useEffect(() => {
  if (localStorage.getItem("startRestaurantDashboardTour")) {
    introJs()
      .setOptions({
        steps: restaurantDashboardTourSteps,
        showProgress: true,
        showBullets: false,
        doneLabel: "Finish",
      })
      .start();

    localStorage.removeItem("startRestaurantDashboardTour");
  }
}, []);

useEffect(() => {
  const handler = (e) => {
    setPopupNotification(e.detail);
  };

  window.addEventListener("restaurantNotification", handler);
  return () => window.removeEventListener("restaurantNotification", handler);
}, []);
  return (
    <>

      <RestaurantNotificationPopup
        notification={popupNotification}
        onClose={() => setPopupNotification(null)}
      />

      {/* MAIN DASHBOARD */}
      <div className="dashboard_wrapper">
        <Sidebar />

        <div className="dashboard_body">
          <Header
          onProfileClick={openProfileDrawer}
          setIsSearching={setIsSearching}
          setSearchResults={setSearchResults}
        />
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

