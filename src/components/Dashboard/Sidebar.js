import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { NavLink } from "react-router-dom";
import logo from "../../images/Logo.png";
import "../../pages/css/status.css";
import introJs from "intro.js";
import { toolsTourSteps } from "../../tours/toolsTour";
import { tourLock } from "../../utils/tourLock";
import { useTranslation } from "react-i18next";
const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [startToolsTour, setStartToolsTour] = useState(
    localStorage.getItem("startToolsTour")
  );
  const API = "http://192.168.2.9:5000/api/v1";

  const [issueCount, setIssueCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const token = localStorage.getItem("token");
  const normalizeStatus = (status = "") => {
    const s = status.toUpperCase().trim();



    if (s === "OUT FOR DELIVERY") return "OUT_FOR_DELIVERY";
    return s.replace(/\s+/g, "_");
  };
  const { t } = useTranslation();



  useEffect(() => {
    fetch(`${API}/supplier/issues`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;

        const unresolvedCount = data.filter(
          (i) => i.status !== "ISSUE_RESOLVED"
        ).length;

        setIssueCount(unresolvedCount);
      })
      .catch(() => setIssueCount(0));
  }, []);

  useEffect(() => {
    if (!token) return;

    fetch(`${API}/orders/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;

        const pendingOrders = data.filter((o) =>
          ["PLACED", "ACCEPTED", "PACKED"].includes(
            normalizeStatus(o.status)
          )
        ).length;


        setOrderCount(pendingOrders);
      })
      .catch(() => setOrderCount(0));
  }, [token]);

  useEffect(() => {
    // 🔒 HARD GLOBAL LOCK
    if (tourLock.tools) return;

    const shouldStart = startToolsTour === "true";
    const hasSeen =
      localStorage.getItem("supplierToolsTourSeen") === "true";

    if (!shouldStart || hasSeen) return;

    // 🔒 lock immediately
    tourLock.tools = true;

    const timer = setTimeout(() => {
      introJs()
        .setOptions({
          steps: toolsTourSteps,
          showProgress: true,
          showBullets: false,
          exitOnOverlayClick: false,
          nextLabel: "Next →",
          prevLabel: "← Back",
          doneLabel: "Finish",
          overlayOpacity: 0.65,
        })
        .oncomplete(() => {
          localStorage.setItem("supplierToolsTourSeen", "true");
          localStorage.removeItem("startToolsTour");
          setStartToolsTour(null);
        })
        .onexit(() => {
          localStorage.setItem("supplierToolsTourSeen", "true");
          localStorage.removeItem("startToolsTour");
          setStartToolsTour(null);
        })
        .start();
    }, 500);

    return () => clearTimeout(timer);
  }, [startToolsTour]);


  // 🔄 Sync when Dashboard sets the flag
  useEffect(() => {
    const sync = () => {
      setStartToolsTour(localStorage.getItem("startToolsTour"));
    };

    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return (
    <aside className={`dashboard_sidebar ${collapsed ? "collapsed" : ""}`}>

      {/* LOGO */}
      <div className="sidebar_logo">
        <Link to="/dashboard">
          <img
            src={logo}
            alt="Mahal"
            style={{ cursor: "pointer" }}
          />
        </Link>

        <button
          className="collapse_btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>


      {/* MENU */}
      <ul className="sidebar_menu">

        <NavLink to="/dashboard/products" className="menu_link">
          {({ isActive }) => (
            <li id="tour-products" className={isActive ? "active" : ""}>
              <i className="fas fa-box"></i>
              {!collapsed && <span>{t("my_products")}</span>}
            </li>
          )}
        </NavLink>

        <NavLink to="/dashboard/add-product" className="menu_link">
          {({ isActive }) => (
            <li id="tour-add-product" className={isActive ? "active" : ""}>
              <i className="fas fa-plus-circle"></i>
              {!collapsed && <span>{t("add_product")}</span>}
            </li>
          )}
        </NavLink>

        <NavLink to="/dashboard/offers" className="menu_link">
          {({ isActive }) => (
            <li id="tour-offers" className={isActive ? "active" : ""}>
              <i className="fas fa-gift"></i>
              {!collapsed && <span>{t("offers")}</span>}
            </li>
          )}
        </NavLink>
        <NavLink to="/dashboard/orders" className="menu_link">
          {({ isActive }) => (
            <li id="tour-orders" className={isActive ? "active" : ""}>
              <div className="icon_with_badge">
                <i className="fas fa-shopping-cart"></i>

                {/* {orderCount > 0 && (
                  <span className="sidebar_badge">
                    {orderCount > 9 ? "9+" : orderCount}
                  </span>
                )} */}
              </div>

              {!collapsed && <span>{t("orders")}</span>}
            </li>
          )}
        </NavLink>

        <NavLink to="/dashboard/credit-wallet" className="menu_link">
          {({ isActive }) => (
            <li id="tour-credit" className={isActive ? "active" : ""}>
              <i className="fas fa-wallet"></i>
              {!collapsed && <span>{t("credit_wallet")}</span>}
            </li>
          )}
        </NavLink>





        <NavLink to="/dashboard/invoice" className="menu_link">
          {({ isActive }) => (
            <li id="tour-invoice" className={isActive ? "active" : ""}>
              <i className="fas fa-file-invoice"></i>
              {!collapsed && <span>{t("invoice")}</span>}
            </li>
          )}
        </NavLink>

        <NavLink to="/dashboard/receipt-manager" className="menu_link">
          {({ isActive }) => (
            <li id="tour-receipt" className={isActive ? "active" : ""}>
              <i className="fas fa-receipt"></i>
              {!collapsed && <span>{t("receipts")}</span>}
            </li>
          )}
        </NavLink>




        <NavLink to="/dashboard/reports" className="menu_link">
          {({ isActive }) => (
            <li id="tour-reports" className={isActive ? "active" : ""}>
              <i className="fa fa-chart-line"></i>
              {!collapsed && <span>{t("reports")}</span>}
            </li>
          )}
        </NavLink>

        <NavLink to="/dashboard/order-issues" className="menu_link">
          {({ isActive }) => (
            <li id="tour-issues" className={isActive ? "active" : ""}>
              <div className="icon_with_badge">
                <i className="fa fa-exclamation-triangle"></i>

                {issueCount > 0 && (
                  <span className="sidebar_badge">
                    {issueCount > 9 ? "9+" : issueCount}
                  </span>
                )}
              </div>

              {!collapsed && <span>{t("issues")}</span>}
            </li>
          )}
        </NavLink>
        <NavLink to="/dashboard/delivery-boys" className="menu_link">
          {({ isActive }) => (
            <li id="tour-delivery" className={isActive ? "active" : ""}>
              <i className="fas fa-truck"></i>
              {!collapsed && <span>{t("delivery")}</span>}
            </li>
          )}
        </NavLink>

        <NavLink to="/dashboard/promotion-review" className="menu_link">
          {({ isActive }) => (
            <li id="tour-promotionreview" className={isActive ? "active" : ""}>
              <i className="fas fa-bullhorn"></i>
              {!collapsed && <span>{t("promotion_review")}</span>}
            </li>
          )}
        </NavLink>

        <NavLink to="/dashboard/promotion-request" className="menu_link">
          {({ isActive }) => (
            <li id="tour-paidpromotion" className={isActive ? "active" : ""}>
              <i className="fas fa-bullhorn"></i>
              {!collapsed && <span>{t("paid_promotion")}</span>}
            </li>
          )}
        </NavLink>

        <NavLink to="/dashboard/support" className="menu_link">
          {({ isActive }) => (
            <li id="tour-support" className={isActive ? "active" : ""}>
              <i className="fas fa-headset"></i>
              {!collapsed && <span>{t("support")}</span>}
            </li>
          )}
        </NavLink>

        <NavLink to="/dashboard/documentation" className="menu_link">
          {({ isActive }) => (
            <li id="tour-docs" className={isActive ? "active" : ""}>
              <i className="fas fa-book"></i>
              {!collapsed && <span>{t("documentation")}</span>}
            </li>
          )}
        </NavLink>

        <NavLink to="/dashboard/help" className="menu_link">
          {({ isActive }) => (
            <li id="tour-help" className={isActive ? "active" : ""}>
              <i className="fas fa-question-circle"></i>
              {!collapsed && <span>{t("help")}</span>}
            </li>
          )}
        </NavLink>





      </ul>
    </aside>
  );
};

export default Sidebar;
