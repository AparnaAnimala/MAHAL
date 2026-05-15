// import React, { useEffect, useState } from "react";
// import { useOutletContext } from "react-router-dom";

// // Icons
// import { FaUsers, FaChartBar, FaClipboardCheck, FaStore } from "react-icons/fa";

// // Modules
// import AdminUserManagement from "./AdminUserManagement";
// import SupplierUserManagement from "./SupplierUserManagement";
// import RestaurantUserManagement from "./RestaurantUserManagement";
// import SupplierMonitor from "./SupplierMonitor";
// import RestaurantMonitor from "./RestaurantMonitor";
// import ControlTower from "./ControlTower";
// import SupplierApproval from "./SupplierApproval";
// import RestaurantApproval from "./RestaurantApproval";

// /* ===================== TABS ===================== */

// const PlatformUserManagement = () => {
//   const [activeTab, setActiveTab] = useState("supplier");

//   return (
//     <div className="dashboard_card">
//       <div className="tab_row">
//         <button onClick={() => setActiveTab("supplier")}>
//           Supplier Management
//         </button>
//         <button onClick={() => setActiveTab("restaurant")}>
//           Restaurant Management
//         </button>
//       </div>

//       {activeTab === "supplier" && <SupplierUserManagement />}
//       {activeTab === "restaurant" && <RestaurantUserManagement />}
//     </div>
//   );
// };

// const PlatformMonitoring = () => {
//   const [activeTab, setActiveTab] = useState("supplier");
//   const [selectedId, setSelectedId] = useState(null);

//   return (
//     <div className="dashboard_card">
//       <div className="tab_row">
//         <button
//           onClick={() => {
//             setActiveTab("supplier");
//             setSelectedId(null);
//           }}
//         >
//           Supplier Monitor
//         </button>

//         <button
//           onClick={() => {
//             setActiveTab("restaurant");
//             setSelectedId(null);
//           }}
//         >
//           Restaurant Monitor
//         </button>
//       </div>

//       <input
//         type="number"
//         placeholder={`Enter ${activeTab} ID`}
//         value={selectedId || ""}
//         onChange={(e) => setSelectedId(e.target.value)}
//         className="form_input"
//       />

//       {activeTab === "supplier" && (
//         <SupplierMonitor supplierId={selectedId} />
//       )}

//       {activeTab === "restaurant" && (
//         <RestaurantMonitor restaurantId={selectedId} />
//       )}
//     </div>
//   );
// };

// /* ===================== MAIN DASHBOARD ===================== */

// const AdminDashboard = () => {
//   const { activeView, setActiveView } = useOutletContext();
//   const [kpis, setKpis] = useState(null);
//   const [permissions, setPermissions] = useState([]);

//   const ADMIN_TOKEN = localStorage.getItem("admin_token");

//   useEffect(() => {
//     if (!ADMIN_TOKEN) return;

//     fetch("http://192.168.2.9:5000/api/v1/admin/dashboard-metrics", {
//       headers: {
//         Authorization: `Bearer ${ADMIN_TOKEN}`,
//       },
//     })
//       .then((res) => {
//         if (res.status === 401) {
//           localStorage.clear();
//           window.location.href = "/admin/login";
//           return null;
//         }

//         if (res.status === 403) {
//           return {};
//         }

//         return res.json();
//       })
//       .then((data) => {
//         if (data && typeof data === "object") {
//           setKpis(data);

//           const perms = Array.isArray(data.permissions)
//             ? data.permissions
//             : [];

//           setPermissions(perms);

//           // ✅ FIX #1 — store for refresh consistency
//           localStorage.setItem(
//             "admin_permissions",
//             JSON.stringify(perms)
//           );

//           // ✅ FIX #2 — INSTANTLY notify Layout (no refresh needed)
//           window.dispatchEvent(
//             new CustomEvent("admin:permissions", {
//               detail: perms,
//             })
//           );
//         } else {
//           setKpis({});
//         }
//       })
//       .catch(console.error);
//   }, [ADMIN_TOKEN]);

//   const adminMenu = [
//     {
//       key: "overview",
//       label: "Control Tower",
//       icon: <FaChartBar />,
//       permission: "VIEW_DASHBOARD",
//     },
//     {
//       key: "supplierApproval",
//       label: "Supplier Approval",
//       icon: <FaClipboardCheck />,
//       component: <SupplierApproval />,
//       permission: "APPROVE_SUPPLIERS",
//     },
//     {
//       key: "restaurantApproval",
//       label: "Restaurant Approval",
//       icon: <FaStore />,
//       component: <RestaurantApproval />,
//       permission: "APPROVE_RESTAURANTS",
//     },
//     {
//       key: "userManagement",
//       label: "User Management",
//       icon: <FaUsers />,
//       component: <AdminUserManagement />,
//       permission: "MANAGE_ADMIN_USERS",
//     },
//     {
//       key: "platformUserManagement",
//       label: "Management",
//       icon: <FaUsers />,
//       permission: "MANAGE_ADMIN_USERS",
//     },
//     {
//       key: "platformMonitoring",
//       label: "Monitoring",
//       icon: <FaChartBar />,
//       permission: "VIEW_DASHBOARD",
//     },
//   ];

//   const renderContent = () => {
//     if (activeView === "overview") {
//       return (
//         <ControlTower
//           kpis={kpis}
//           permissions={permissions}
//           setActiveView={setActiveView}
//         />
//       );
//     }

//     if (activeView === "supplierApproval") return <SupplierApproval />;
//     if (activeView === "restaurantApproval") return <RestaurantApproval />;
//     if (activeView === "platformUserManagement")
//       return <PlatformUserManagement />;
//     if (activeView === "platformMonitoring")
//       return <PlatformMonitoring />;

//     const activeItem = adminMenu.find((m) => m.key === activeView);

//     if (!activeItem) {
//       return <div className="error_box">Module not found</div>;
//     }

//     if (
//       activeItem.permission &&
//       !permissions.includes(activeItem.permission)
//     ) {
//       return (
//         <div className="permission_denied">
//           🚫 You don’t have permission to access this module
//         </div>
//       );
//     }

//     return (
//       activeItem.component || (
//         <div className="coming_soon">
//           Module Configured Soon
//         </div>
//       )
//     );
//   };

//   return (
//     <div className="dashboard_content">
//       {renderContent()}
//     </div>
//   );
// };

// export default AdminDashboard;



import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import "../css/approval.css";
// Icons
import { FaUsers, FaChartBar, FaClipboardCheck, FaStore, FaProjectDiagram } from "react-icons/fa";

// Modules
import AdminUserManagement from "./AdminUserManagement";
// import SupplierUserManagement from "./SupplierUserManagement";
// import RestaurantUserManagement from "./RestaurantUserManagement";
import SupplierMonitor from "./SupplierMonitor";
import RestaurantMonitor from "./RestaurantMonitor";
import ControlTower from "./ControlTower";
import SupplierApproval from "./SupplierApproval";
import RestaurantApproval from "./RestaurantApproval";
import AdminProfileChanges from "./AdminProfileChanges";
import AdminPromotions from "./AdminPromotions";
import AdminSupplierPromotionRequests from "../AdminSupplierPromotionRequests";
import AdminPromotionReview from "../AdminPromotionReview";
import SupportAdminPanel from "./SupportAdminPanel";
import ManagePaidPromotions from "./ManagePaidPromotions";
import CouponManagement from "./CouponManagement";

/* ===================== TABS ===================== */

const PlatformUserManagement = () => {
  const [activeTab, setActiveTab] = useState("supplier");

  return (
    <div className="dashboard_card">
      {/* <div className="tab_row">
        <button onClick={() => setActiveTab("supplier")}>
          Supplier Management
        </button>
        <button onClick={() => setActiveTab("restaurant")}>
          Restaurant Management
        </button>
      </div> */}

      {/* {activeTab === "supplier" && <SupplierUserManagement />} */}
      {/* {activeTab === "restaurant" && <RestaurantUserManagement />} */}
    </div>
  );
};

const PlatformMonitoring = () => {
  const [activeTab, setActiveTab] = useState("supplier");
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div
      className="dashboard_card"
      style={{
        background: "#fff"
      }}
    >

      {/* 🔥 BUTTONS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
          marginBottom: "15px"
        }}
      >
        {/* LEFT - Supplier */}
        <button
          onClick={() => {
            setActiveTab("supplier");
            setSelectedId(null);
          }}
          style={{
            padding: "14px 30px",
            border: "none",
            borderRadius: "25px", // 🔥 FIXED (round shape)
            cursor: "pointer",
            fontWeight: "600",
            background: activeTab === "supplier" ? "#ff6a00" : "#eee", // 🔥 FIXED color
            color: activeTab === "supplier" ? "#fff" : "#333"
          }}
        >
          Supplier Monitor
        </button>

        {/* RIGHT - Restaurant */}
        <button
          onClick={() => {
            setActiveTab("restaurant");
            setSelectedId(null);
          }}
          style={{
            padding: "14px 30px",
            border: "none",
            borderRadius: "25px", // 🔥 FIXED (round shape)
            cursor: "pointer",
            fontWeight: "600",
            background: activeTab === "restaurant" ? "#ff6a00" : "#eee", // 🔥 FIXED color
            color: activeTab === "restaurant" ? "#fff" : "#333"
          }}
        >
          Restaurant Monitor
        </button>
      </div>

      {/* INPUT */}
      <input
        type="number"
        placeholder={`Enter ${activeTab} ID`}
        value={selectedId || ""}
        onChange={(e) => setSelectedId(e.target.value)}
        className="form_input"
      />

      {/* COMPONENT SWITCH */}
      {activeTab === "supplier" && (
        <SupplierMonitor supplierId={selectedId} />
      )}

      {activeTab === "restaurant" && (
        <RestaurantMonitor restaurantId={selectedId} />
      )}
    </div>
  );
};

/* ===================== MAIN DASHBOARD ===================== */

const AdminDashboard = () => {
  const { activeView, setActiveView } = useOutletContext();
  const [kpis, setKpis] = useState(null);
  const [permissions, setPermissions] = useState([]);

  const ADMIN_TOKEN = localStorage.getItem("admin_token");

  useEffect(() => {
    if (!ADMIN_TOKEN) return;

    fetch("http://192.168.2.9:5000/api/v1/admin/dashboard-metrics", {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.clear();
          window.location.href = "/admin/login";
          return null;
        }

        if (res.status === 403) {
          return {};
        }

        return res.json();
      })
      .then((data) => {
        if (data && typeof data === "object") {
          setKpis(data);

          const perms = Array.isArray(data.permissions)
            ? data.permissions
            : [];

          setPermissions(perms);

          // ✅ FIX #1 — store for refresh consistency
          localStorage.setItem(
            "admin_permissions",
            JSON.stringify(perms)
          );

          // ✅ FIX #2 — INSTANTLY notify Layout (no refresh needed)
          window.dispatchEvent(
            new CustomEvent("admin:permissions", {
              detail: perms,
            })
          );
        } else {
          setKpis({});
        }
      })
      .catch(console.error);
  }, [ADMIN_TOKEN]);

  const adminMenu = [
    {
      key: "overview",
      label: "Control Tower",
      icon: <FaChartBar />,
      permission: "VIEW_DASHBOARD",
    },
    {
      key: "supplierApproval",
      label: "Supplier Approval",
      icon: <FaClipboardCheck />,
      component: <SupplierApproval />,
      permission: "APPROVE_SUPPLIERS",
    },
    {
      key: "restaurantApproval",
      label: "Restaurant Approval",
      icon: <FaStore />,
      component: <RestaurantApproval />,
      permission: "APPROVE_RESTAURANTS",
    },
    {
      key: "profileChanges",
      label: "Profile Changes",
      icon: <FaClipboardCheck />,
      component: <AdminProfileChanges />,
      permission: "VIEW_DASHBOARD",   // you asked for this
    },

    {
      key: "userManagement",
      label: "User Management",
      icon: <FaUsers />,
      component: <AdminUserManagement />,
      permission: "MANAGE_ADMIN_USERS",
    },
    // {
    //   key: "platformUserManagement",
    //   label: "Management",
    //   icon: <FaUsers />,
    //   permission: "MANAGE_ADMIN_USERS",
    // },
    {
      key: "platformMonitoring",
      label: "Monitoring",
      icon: <FaChartBar />,
      permission: "VIEW_DASHBOARD",
    },

    {
      key: "adminPromotions",
      label: "Promotions",
      icon: <FaProjectDiagram />,
      component: <AdminPromotions />,
      // permission: "PROMOTION_INFORMATION"
      permission: "VIEW_DASHBOARD"
    },
    {
      key: "promotionRequests",
      label: "Promotion Requests",
      icon: <FaProjectDiagram />,
      component: <AdminSupplierPromotionRequests />,
      // permission: "VIEW_PROMOTION_REQUESTS"
      permission: "VIEW_DASHBOARD"
    },
    {
      key: "promotionReview",
      label: "Promotion Review",
      component: <AdminPromotionReview />,
      permission: "VIEW_DASHBOARD"
    },
    {
      key: "paidPromotions",
      label: "Paid Promotions",
      icon: <FaChartBar />,
      permission: "VIEW_PROMOTIONS",
    },
    // {
    //   key: "couponManagement",
    //   label: "Coupon Management",
    //   icon: <FaClipboardCheck />,
    //   permission: "MANAGE_COUPONS",
    // },

    {
      key: "supportTickets",
      label: "Support Tickets",
      icon: <FaClipboardCheck />,
      permission: "MANAGE_SUPPORT_TICKETS",
    },
  ];

  const renderContent = () => {
    if (activeView === "overview") {
      return (
        <ControlTower
          kpis={kpis}
          permissions={permissions}
          setActiveView={setActiveView}
        />
      );
    }

    if (activeView === "supplierApproval") return <SupplierApproval />;
    if (activeView === "restaurantApproval") return <RestaurantApproval />;
    if (activeView === "profileChanges") return <AdminProfileChanges />;

    if (activeView === "platformUserManagement")
      return <PlatformUserManagement />;
    if (activeView === "platformMonitoring")
      return <PlatformMonitoring />;
    if (activeView === "adminPromotions")
      return <AdminPromotions />;
    if (activeView === "promotionRequests")
      return <AdminSupplierPromotionRequests />;
    if (activeView === "supportTickets")
      return <SupportAdminPanel />;
    if (activeView === "paidPromotions")
      return <ManagePaidPromotions />;
    if (activeView === "couponManagement")
      return <CouponManagement />;
    // if (activeView === "promotionReview")
    //   return <AdminPromotionReview />;

    const activeItem = adminMenu.find((m) => m.key === activeView);

    if (!activeItem) {
      return <div className="error_box">Module not found</div>;
    }

    if (
      activeItem.permission &&
      !permissions.includes(activeItem.permission)
    ) {
      return (
        <div className="permission_denied">
          🚫 You don’t have permission to access this module
        </div>
      );
    }

    return (
      activeItem.component || (
        <div className="coming_soon">
          Module Configured Soon
        </div>
      )
    );
  };

  return (
    <div className="dashboard_content">
      {renderContent()}
    </div>
  );
};

export default AdminDashboard;