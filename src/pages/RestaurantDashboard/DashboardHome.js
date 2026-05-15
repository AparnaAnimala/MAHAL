// import React from "react";
//           import DashboardCharts from "./DashboardCharts";


// const RestaurantDashboardHome = () => {
//   return (
//     <div className="dashboard_page">

//       {/* HEADER */}
//       <div className="page_header">
//         <h2>Dashboard</h2>
//         <p>Welcome back! Here’s today’s restaurant summary  </p>
//       </div>

//       {/* STATS */}
//       <div className="row mt-4">

//         <div className="col-lg-3 col-md-6">
//           <div className="stat_card">
//             <i className="fas fa-receipt"></i>
//             <div>
//               <h3>42</h3>
//             <p>Today Orders</p> 
//             </div>
            
//           </div>
//         </div>

//         <div className="col-lg-3 col-md-6">
//           <div className="stat_card">
//             <i className="fas fa-rupee-sign"></i>
//             <div>
//               <h3>QAR 12,340</h3>
//               <p>Total Revenue</p>  
//             </div>
            
//           </div>
//         </div>

//         <div className="col-lg-3 col-md-6">
//           <div className="stat_card">
//             <i className="fas fa-users"></i>
//             <div> 
//               <h3>128</h3>
//               <p>Total Customers</p>
//             </div>
//           </div>
//         </div>

//         <div className="col-lg-3 col-md-6">
//           <div className="stat_card">
//             <i className="fas fa-star"></i>
//             <div> 
//             <h3>4.5</h3>
//             <p>Avg Rating</p>
//             </div>
//           </div>
//         </div>

//       </div>

//       {/* CHARTS */}
// <DashboardCharts />

//       {/* RECENT ORDERS */}
//       <div className="card mt-4">
//         <div className="card-header">
//           <h5>Recent Orders</h5>
//         </div>

//         <div className="table-responsive">
//           <table className="table table-hover mb-0">
//             <thead>
//               <tr>
//                 <th>Order ID</th>
//                 <th>Customer</th>
//                 <th>Amount</th>
//                 <th>Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td>#ORD201</td>
//                 <td>Ramesh</td>
//                 <td>QAR 540</td>
//                 <td><span className="badge bg-success">Delivered</span></td>
//               </tr>
//               <tr>
//                 <td>#ORD202</td>
//                 <td>Sneha</td>
//                 <td>QAR 320</td>
//                 <td><span className="badge bg-warning">Preparing</span></td>
//               </tr>
//               <tr>
//                 <td>#ORD203</td>
//                 <td>Kiran</td>
//                 <td>QAR 760</td>
//                 <td><span className="badge bg-danger">Cancelled</span></td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* TOP SELLING ITEMS */}
//       <div className="card mt-4">
//         <div className="card-header">
//           <h5>Top Selling Items</h5>
//         </div>

//         <ul className="list-group list-group-flush">
//           <li className="list-group-item d-flex justify-content-between">
//             <span>Chicken Biryani</span>
//             <strong>56 Orders</strong>
//           </li>
//           <li className="list-group-item d-flex justify-content-between">
//             <span>Paneer Butter Masala</span>
//             <strong>42 Orders</strong>
//           </li>
//           <li className="list-group-item d-flex justify-content-between">
//             <span>Fried Rice</span>
//             <strong>38 Orders</strong>
//           </li>
//         </ul>
//       </div>

//     </div>
//   );
// };

// export default RestaurantDashboardHome;








import React, { useEffect, useState } from "react";
import DashboardCharts from "./DashboardCharts";
import { getRestaurantDashboardTourSteps } from "../../tours/restaurantDashboardTour";
import introJs from "intro.js";
import { useTranslation } from "react-i18next";

const RestaurantDashboardHome = () => {
  const [stats, setStats] = useState(null);
  const token = localStorage.getItem("token");
  const [credit, setCredit] = useState(null);
  const { t, i18n } = useTranslation();


  useEffect(() => {
  document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
}, [i18n.language]);

const formatOrderId = (id) => {
  if (i18n.language !== "ar") return id;

  return id.replace(/\d/g, (d) =>
    new Intl.NumberFormat("ar-QA").format(d)
  );
};
  /* =========================
     LOAD DASHBOARD DATA
  ========================= */
  useEffect(() => {
    if (!token) return;

    fetch("http://192.168.2.9:5000/api/v1/orders/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load dashboard");
        return res.json();
      })
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
      });

    fetch("http://192.168.2.9:5000/api/restaurant/credit-info", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setCredit(data))
      .catch(() => setCredit(null));
  }, [token]);

  useEffect(() => {
    const shouldStartTour =
      localStorage.getItem("startRestaurantDashboardTour") === "true";

    if (!shouldStartTour) return;

    localStorage.removeItem("startRestaurantDashboardTour");

    setTimeout(() => {
      const intro = introJs();

          intro.setOptions({
            steps: getRestaurantDashboardTourSteps(),

            showProgress: true,
            showBullets: false,

            nextLabel: i18n.language === "ar" ? "التالي →" : "Next →",
            prevLabel: i18n.language === "ar" ? "← السابق" : "← Back",
            doneLabel: i18n.language === "ar" ? "إنهاء" : "Finish",

            overlayOpacity: 0.65,
            disableInteraction: true,
            exitOnOverlayClick: false,
          });

      intro.onbeforechange((targetElement) => {
        const scrollContainer = document.querySelector(".dashboard_page");
        if (scrollContainer && targetElement) {
          const containerTop = scrollContainer.getBoundingClientRect().top;
          const elementTop = targetElement.getBoundingClientRect().top;

          scrollContainer.scrollTo({
            top:
              scrollContainer.scrollTop +
              (elementTop - containerTop) -
              90,
            behavior: "smooth",
          });
        }
      });

      intro.onafterchange(() => {
        setTimeout(() => {
          window.dispatchEvent(new Event("resize"));
        }, 120);
      });

      intro.oncomplete(() => {
        localStorage.setItem("tourSeen_restaurant_dashboard", "true");
        localStorage.setItem("startRestaurantToolsTour", "true");
        window.dispatchEvent(new Event("restaurantToolsTour"));
      });

      intro.onexit(() => {
        localStorage.setItem("tourSeen_restaurant_dashboard", "true");
        localStorage.setItem("startRestaurantToolsTour", "true");
        window.dispatchEvent(new Event("restaurantToolsTour"));
      });

      intro.start();
    }, 700);
  }, []);

  /* =========================
     STATUS TRANSLATION
  ========================= */
  const getStatusLabel = (status) => {
    if (i18n.language === "ar") {
      switch (status) {
        case "PLACED":
          return "تم الطلب";
        case "PENDING":
          return "قيد الانتظار";
        case "CONFIRMED":
          return "تم التأكيد";
        case "PREPARING":
          return "قيد التحضير";
        case "READY":
          return "جاهز";
        case "OUT_FOR_DELIVERY":
          return "خرج للتوصيل";
        case "DELIVERED":
          return "تم التوصيل";
        case "CANCELLED":
          return "تم الإلغاء";
        default:
          return status;
      }
    }
    return status;
  };
const formatCurrency = (value) => {
  return new Intl.NumberFormat(
    i18n.language === "ar" ? "ar-QA" : "en-US",
    {
      style: "currency",
      currency: "QAR",
    }
  ).format(value);
};

const formatNumber = (value) => {
  return new Intl.NumberFormat(
    i18n.language === "ar" ? "ar-QA" : "en-US"
  ).format(value);
};

  return (
    <div className="dashboard_page">
      {/* HEADER */}
      <div className="page_header">
        <h2>{t("resdashboard")}</h2>
        <p>{t("resdashboard_subtitle")}</p>
      </div>

      {/* CREDIT SUMMARY */}
      {credit && (
        <div className="row mt-3" >
          <div className="col-lg-3 col-md-6">
            <div className="stat_card credit_card" id="tour-credit-limit">
              <i className="fas fa-wallet"></i>
              <div>
                  <h3 >
                    {formatCurrency(Number(credit.credit_limit || 0))}
                  </h3>
                                  <p>{t("rescredit_limit")}</p>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6" >
            <div className="stat_card credit_card_used" id="tour-used-credit">
              <i className="fas fa-chart-line"></i>
              <div>
                <h3>{formatCurrency(Number(credit.credit_used || 0))}</h3>
                <p>{t("resused_credit")}</p>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6" >
            <div className="stat_card credit_card_available" id="tour-available">
              <i className="fas fa-coins"></i>
              <div>
                <h3>{formatCurrency(Number(credit.credit_available || 0))}</h3>
                <p>{t("resavailable_credit")}</p>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6" >
            <div className="stat_card credit_card_due" id="tour-due-date">
              <i className="fas fa-calendar-alt"></i>
              <div>
                <h3>
                  {credit.next_due_date
                    ? new Date(credit.next_due_date).toLocaleDateString(
                        i18n.language === "ar" ? "ar-QA" : "en-US"
                      )
                    : "—"}
                </h3>
                <p>{t("resnext_due_date")}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATS */}
      <div className="row mt-4">

  {/* TODAY ORDERS */}
    <div className="col-lg-3 col-md-6">
      <div className="stat_card" id="tour-today-orders">
        <i className="fas fa-receipt" ></i>
        <div>
          <h3>{formatNumber(stats?.today_orders ?? 0)}</h3>
          <p>Today Orders</p>
        </div>
      </div>
    </div>

    {/* TODAY SPENT */}
    <div className="col-lg-3 col-md-6">
      <div className="stat_card" id="tour-revenue">
        <i className="fas fa-money-bill-wave"></i>
        <div>
          <h3>{formatCurrency(stats?.today_spent ?? 0)}</h3>
          <p>Today Spend</p>
        </div>
      </div>
    </div>

    {/* PENDING ORDERS */}
    <div className="col-lg-3 col-md-6">
      <div className="stat_card" id="tour-pending">
        <i className="fas fa-clock"></i>
        <div>
          <h3>{formatNumber(stats?.pending_orders ?? 0)}</h3>
          <p>Pending Orders</p>
        </div>
      </div>
    </div>

    {/* TOTAL ORDERS */}
    <div className="col-lg-3 col-md-6">
      <div className="stat_card" id="tour-total-orders">
        <i className="fas fa-box"></i>
        <div>
          <h3>{formatNumber(stats?.total_orders ?? 0)}</h3>
          <p>Total Orders</p>
        </div>
      </div>
    </div>

  </div>

      {/* CHARTS */}
      <DashboardCharts
        stats={stats}
        salesTourId="tour-sales-chart"
        ordersTourId="tour-orders-chart"
      />

      {/* RECENT ORDERS */}
      <div className="card mt-4">
        <div className="card-header" >
          <h5>{t("resrecent_orders")}</h5>
        </div>

        <div className="table-responsive">
          <table className="table table-hover mb-0" id="tour-recent-orders">
            <thead>
              <tr>
                <th>{t("resorder_id")}</th>
                <th>{t("ressupplier") || "Supplier"}</th>
                <th>{t("resamount")}</th>
                <th>{t("resstatus")}</th>
              </tr>
            </thead>

              <tbody>
                {stats?.recent_orders?.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: 20 }}>
                      {t("resno_recent_orders")}
                    </td>
                  </tr>
                )}

                {stats?.recent_orders?.map((o) => (
                  <tr key={o.order_id}>
                    <td
                      dir="ltr"
                      style={{
                        textAlign: i18n.language === "ar" ? "right" : "left",
                      }}
                    >
                      {formatOrderId(o.order_id)}
                    </td>

                    <td>
                      {o.supplier_name || "-"}
                    </td>

                    <td
                      dir="ltr"
                      style={{
                        textAlign: i18n.language === "ar" ? "right" : "left",
                      }}
                    >
                      {formatCurrency(o.total_amount)}
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          o.status === "DELIVERED"
                            ? "bg-success"
                            : o.status === "CANCELLED"
                            ? "bg-danger"
                            : "bg-warning"
                        }`}
                        style={{
                          display: "inline-block",
                          minWidth: "95px",
                          textAlign: "center",
                          whiteSpace: "nowrap",
                          fontSize: i18n.language === "ar" ? "11px" : "13px",
                          padding: "8px 12px",
                        }}
                      >
                        {getStatusLabel(o.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
        </div>
      </div>

      {/* TOP SELLING ITEMS */}
      {/* <div className="card mt-4" id="tour-top-selling">
        <div className="card-header">
          <h5>{t("restop_selling_items")}</h5>
        </div>

        <ul className="list-group list-group-flush">
          <li className="list-group-item d-flex justify-content-between">
            <span>{t("resitem_biryani")}</span>
            <strong dir="ltr">{formatNumber(56)} {t("resorders")}</strong>
          </li>
          <li className="list-group-item d-flex justify-content-between">
            <span>{t("resitem_paneer")}</span>
            <strong dir="ltr">{formatNumber(42)} {t("resorders")}</strong>
          </li>
          <li className="list-group-item d-flex justify-content-between">
            <span>{t("resitem_fried_rice")}</span>
            <strong dir="ltr">{formatNumber(38)} {t("resorders")}</strong>
          </li>
        </ul>
      </div> */}
    </div>
  );
};

export default RestaurantDashboardHome;