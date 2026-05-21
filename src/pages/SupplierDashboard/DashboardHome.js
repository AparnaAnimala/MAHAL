// import React from "react";
// import {
//   LineChart,
//   Line,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// const salesData = [
//   { month: "Jan", sales: 0, orders: 0 },
//   { month: "Feb", sales: 0, orders: 0 },
//   { month: "Mar", sales: 0, orders: 0 },
//   { month: "Apr", sales: 0, orders: 0 },
//   { month: "May", sales: 0, orders: 0 },
//   { month: "Jun", sales: 0, orders: 0 },
// ];

// const DashboardHome = () => {
//   return (
//     <div className="dashboard_page">

//       {/* TOP STATS */}
//       <div className="card_grid">
//         <div className="stat_card">
//           <p>Fulfillment Rate</p>
//           <h3>0%</h3>
//         </div>
//         <div className="stat_card">
//           <p>Revenue</p>
//           <h3>QAR  0</h3>
//         </div>
//         <div className="stat_card">
//           <p>New Orders</p>
//           <h3>0</h3>
//         </div>
//         <div className="stat_card highlight">
//           <p>Expiring Today</p>
//           <h3>0</h3>
//         </div>
//       </div>

//       {/* CHARTS */}
//       <div className="chart_grid">

//         {/* SALES CHART */}
//         <div className="chart_card">
//           <h4>Sales</h4>
//           <ResponsiveContainer width="100%" height={250}>
//             <LineChart data={salesData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="month" />
//               <YAxis />
//               <Tooltip />
//               <Line
//                 type="monotone"
//                 dataKey="sales"
//                 stroke="#ff9800"
//                 strokeWidth={3}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>

//         {/* ORDERS CHART */}
//         <div className="chart_card">
//           <h4>Orders</h4>
//           <ResponsiveContainer width="100%" height={250}>
//             <BarChart data={salesData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="month" />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey="orders" fill="#ff9800" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//       </div>

//     </div>
//   );
// };

// export default DashboardHome;



import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import introJs from "intro.js";
import { dashboardTourSteps } from "../../tours/dashboardTour";
import { tourLock } from "../../utils/tourLock";
import { useTranslation } from "react-i18next";

const API = "http://192.168.2.22:5000/api";
const LOW_STOCK_LIMIT = 10;

const DashboardHome = () => {
  const supplierId = localStorage.getItem("linked_id");
  const token = localStorage.getItem("token");
  const tourStartedRef = React.useRef(false);
  const { t, i18n } = useTranslation();


  /* ================= KPIs ================= */
  const [revenue, setRevenue] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [expiringToday, setExpiringToday] = useState(0);
  const [fulfillmentRate, setFulfillmentRate] = useState(0);

  /* ================= CHART DATA ================= */
  const [salesData, setSalesData] = useState([
    { month: "Jan", sales: 0, orders: 0 },
    { month: "Feb", sales: 0, orders: 0 },
    { month: "Mar", sales: 0, orders: 0 },
    { month: "Apr", sales: 0, orders: 0 },
    { month: "May", sales: 0, orders: 0 },
    { month: "Jun", sales: 0, orders: 0 },
    { month: "Jul", sales: 0, orders: 0 },
    { month: "Aug", sales: 0, orders: 0 },
    { month: "Sep", sales: 0, orders: 0 },
    { month: "Oct", sales: 0, orders: 0 },
    { month: "Nov", sales: 0, orders: 0 },
    { month: "Dec", sales: 0, orders: 0 },
  ]);

  /* ================= LOAD DASHBOARD ================= */
  const loadDashboard = async () => {
    if (!supplierId) return;

    try {
      /* ================= ORDERS ================= */
      const ordersRes = await fetch(
        `${API}/reports/orders?supplier_id=${supplierId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const orders = await ordersRes.json();
      const rows = Array.isArray(orders) ? orders : [];

      /* ----- TOTAL REVENUE ----- */
      const totalRevenue = rows.reduce(
        (sum, r) => sum + Number(r.item_total || 0),
        0
      );
      setRevenue(totalRevenue);

      /* ----- TOTAL ORDERS ----- */
      const uniqueOrders = new Set(rows.map(r => r.order_id));
      setOrdersCount(uniqueOrders.size);

      /* ----- FULFILLMENT RATE ----- */
      const delivered = rows.filter(r => r.order_status === "DELIVERED");
      const rate =
        uniqueOrders.size === 0
          ? 0
          : Math.round((delivered.length / uniqueOrders.size) * 100);
      setFulfillmentRate(rate);

      /* ----- MONTHLY SALES & ORDERS ----- */
      const monthly = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(0, i).toLocaleString(
          i18n.language === "ar" ? "ar-EG" : "en-US",
          { month: "short" }
        ),
        sales: 0,
        orders: 0,
      }));

      rows.forEach(r => {
        const date = new Date(r.order_date);
        const m = date.getMonth();
        monthly[m].sales += Number(r.item_total || 0);
        monthly[m].orders += 1;
      });

      setSalesData(monthly);

      /* ================= INVENTORY ================= */
      const invRes = await fetch(
        `${API}/products/inventory?supplier_id=${supplierId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const inventory = await invRes.json();
      const items = Array.isArray(inventory) ? inventory : [];

      /* ----- EXPIRING TODAY ----- */
      const today = new Date().toISOString().split("T")[0];
      const expiring = items.filter(
        p => p.expiry_date && p.expiry_date.startsWith(today)
      );
      setExpiringToday(expiring.length);

    } catch (err) {
      console.error("Dashboard load failed", err);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [supplierId]);
//   useEffect(() => {
//   const shouldStart =
//     localStorage.getItem("startDashboardTour") === "true";
//   const hasSeen =
//     localStorage.getItem("supplierDashboardTourSeen") === "true";

//   if (!shouldStart || hasSeen) return;

//   const timer = setTimeout(() => {
//     introJs()
//       .setOptions({
//         steps: dashboardTourSteps,
//         showProgress: true,
//         showBullets: false,
//         exitOnOverlayClick: false,
//         nextLabel: "Next →",
//         prevLabel: "← Back",
//         doneLabel: "Finish",
//         overlayOpacity: 0.65,
//       })
//       .oncomplete(() => {
//         localStorage.setItem("supplierDashboardTourSeen", "true");
//         localStorage.setItem("startToolsTour", "true");
//         localStorage.removeItem("startDashboardTour");

//         // 🔥 notify sidebar in same tab
//         window.dispatchEvent(new Event("storage"));
//       })
//       .onexit(() => {
//         localStorage.setItem("supplierDashboardTourSeen", "true");
//         localStorage.setItem("startToolsTour", "true");
//         localStorage.removeItem("startDashboardTour");

//         window.dispatchEvent(new Event("storage"));
//       })
//       .start();
//   }, 600);

//   return () => clearTimeout(timer);
// }, []);

useEffect(() => {
  const hasSeen =
    localStorage.getItem("supplierDashboardTourSeen") === "true";

  const manualStart =
    localStorage.getItem("startDashboardTour") === "true";

  // 🔒 already running
  if (tourLock.dashboard) return;

  // ❌ auto-run only once
  if (hasSeen && !manualStart) return;

  // 🔒 lock immediately
  tourLock.dashboard = true;

  // 🧹 clear manual trigger immediately
  // localStorage.removeItem("startDashboardTour");

  const timer = setTimeout(() => {
    const isArabic = localStorage.getItem("i18nextLng") === "ar";
    introJs()
    
      .setOptions({
        steps: dashboardTourSteps.map(step => ({
          ...step,
          intro:
            localStorage.getItem("i18nextLng") === "ar"
              ? step.intro // Arabic already inside
              : step.intro,
        })),
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        

        nextLabel: isArabic ? "التالي →" : "Next →",
        prevLabel: isArabic ? "← السابق" : "← Back",
        doneLabel: isArabic ? "إنهاء" : "Finish",
        overlayOpacity: 0.65,
      })
      .oncomplete(() => {
        localStorage.setItem("supplierDashboardTourSeen", "true");
        localStorage.setItem("startToolsTour", "true");
        localStorage.removeItem("startDashboardTour"); // 👉 chain sidebar tour
        tourLock.dashboard = false;
        window.dispatchEvent(new Event("storage"));
      })
      .onexit(() => {
        localStorage.setItem("supplierDashboardTourSeen", "true");
        localStorage.setItem("startToolsTour", "true");
        localStorage.removeItem("startDashboardTour"); 
        tourLock.dashboard = false;
        window.dispatchEvent(new Event("storage"));
      })
      .start();
  }, 600);

  return () => clearTimeout(timer);
}, []);
const isArabic = i18n.language?.startsWith("ar");

const formatNumber = (num) => {
  return new Intl.NumberFormat(
    isArabic ? "ar-EG" : "en-US"
  ).format(num);
};

const formatCurrency = (num) => {
  const value = formatNumber(Number(num || 0).toFixed(2));
  return isArabic ? `ر.ق ${value}` : `QAR ${value}`;
};

const formatPercent = (num) => {
  return isArabic
    ? `${formatNumber(num)}٪`
    : `${num}%`;
};



  
  return (
    <div className="dashboard_page">

      {/* ================= TOP STATS ================= */}
      <div className="card_grid">
        <div className="stat_card" id="tour-fulfillment">
          <p>{t("fulfillment_rate")}</p>
          <h3>{formatPercent(fulfillmentRate)}</h3>
        </div>

        <div className="stat_card" id="tour-revenue">
          <p>{t("revenue")}</p>
          <h3>{formatCurrency(revenue)}</h3>
        </div>

        <div className="stat_card" id="tour-dashboard-orders">
          <p>{t("new_orders")}</p>
          <h3>{formatNumber(ordersCount)}</h3>
        </div>

        <div className="stat_card highlight" id="tour-expiring">
          <p>{t("expiring_today")}</p>
          <h3>{formatNumber(expiringToday)}</h3>
        </div>
      </div>

      {/* ================= CHARTS ================= */}
      <div className="chart_grid">

        {/* SALES CHART */}
        <div className="chart_card" id="tour-sales-chart">
          <h4>{t("sales")}</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis width={60} tickFormatter={(v) => formatNumber(v)} />
              <Tooltip
                formatter={(value) => formatNumber(value)}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#ff9800"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ORDERS CHART */}
        <div className="chart_card" id="tour-orders-chart">
          <h4>{t("orders")}</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis width={60} tickFormatter={(v) => formatNumber(v)} />
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Bar dataKey="orders" fill="#ff9800" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default DashboardHome;
