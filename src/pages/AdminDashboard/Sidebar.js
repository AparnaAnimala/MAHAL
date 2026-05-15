// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import {
//   FaUsers,
//   FaStore,
//   FaClipboardCheck,
//   FaChartBar,
// } from "react-icons/fa";
// import logo from "../../images/Logo.png";

// /* ADMIN MENU — MUST MATCH DASHBOARD */
// const adminMenu = [
//   { key: "overview", label: "Control Tower", icon: <FaChartBar />, permission: "VIEW_DASHBOARD" },
//   { key: "supplierApproval", label: "Supplier Approval", icon: <FaClipboardCheck />, permission: "APPROVE_SUPPLIERS" },
//   { key: "restaurantApproval", label: "Restaurant Approval", icon: <FaStore />, permission: "APPROVE_RESTAURANTS" },
//   { key: "userManagement", label: "User Management", icon: <FaUsers />, permission: "MANAGE_ADMIN_USERS" },
//   { key: "platformUserManagement", label: "Management", icon: <FaUsers />, permission: "MANAGE_ADMIN_USERS" },
//   { key: "platformMonitoring", label: "Monitoring", icon: <FaChartBar />, permission: "VIEW_DASHBOARD" },
// ];

// const AdminSidebar = ({ permissions = [], activeView, onNavigate }) => {
//   const [collapsed, setCollapsed] = useState(false);

//   const allowedMenu = adminMenu.filter((item) => {
//     if (!item.permission) return true;

//     // Exact match works first (like old dashboard)
//     if (permissions.includes(item.permission)) return true;

//     // Approvals visible if user can VIEW approvals
//     if (
//       (item.key === "supplierApproval" ||
//         item.key === "restaurantApproval") &&
//       permissions.includes("VIEW_APPROVALS")
//     ) {
//       return true;
//     }

//     // Management visible if ANY management permission exists
//     if (item.key === "platformUserManagement") {
//       return (
//         permissions.includes("MANAGE_SUPPLIER_USERS") ||
//         permissions.includes("MANAGE_RESTAURANT_USERS") ||
//         permissions.includes("MANAGE_ADMIN_USERS")
//       );
//     }

//     return false;
//   });

//   return (
//     <aside className={`dashboard_sidebar ${collapsed ? "collapsed" : ""}`}>
//       <div className="sidebar_logo">
//         <Link to="/admin/dashboard">
//           <img src={logo} alt="Mahal" style={{ cursor: "pointer" }} />
//         </Link>

//         <button
//           className="collapse_btn"
//           onClick={() => setCollapsed(!collapsed)}
//         >
//           <i className="fas fa-bars"></i>
//         </button>
//       </div>

//       <ul className="sidebar_menu">
//         {allowedMenu.map((item) => (
//           <li
//             key={item.key}
//             className={`menu_link ${activeView === item.key ? "active" : ""}`}
//             onClick={() => onNavigate(item.key)}
//             style={{ cursor: "pointer" }}
//           >
//             {item.icon}
//             {!collapsed && <span>{item.label}</span>}
//           </li>
//         ))}
//       </ul>
//     </aside>
//   );
// };

// export default AdminSidebar;


import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaStore,
  FaClipboardCheck,
  FaChartBar,
  FaProjectDiagram
} from "react-icons/fa";
import logo from "../../images/Logo.png";
import SupportAdminPanel from "../../pages/AdminDashboard/SupportAdminPanel";
import ManagePaidPromotions from "../../pages/AdminDashboard/ManagePaidPromotions";
import CouponManagement from "../../pages/AdminDashboard/CouponManagement";

/* ===================== ADMIN MENU ===================== */

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
    permission: "APPROVE_SUPPLIERS",
  },
  {
    key: "restaurantApproval",
    label: "Restaurant Approval",
    icon: <FaStore />,
    permission: "APPROVE_RESTAURANTS",
  },
  {
    key: "creditManagement",
    label: "Credit Management",
    icon: <FaChartBar />,
    permission: "VIEW_DASHBOARD",
  },
  {
  key: "creditSettlement",
  label: "Credit Settlement",
  icon: <FaChartBar />,
  permission: "VIEW_DASHBOARD",
},
{
    key: "supplierPayments",
    label: "Supplier Payments",
    icon: <FaChartBar />,
    permission: "VIEW_DASHBOARD",
  },
  {
    key: "profileChanges",
    label: "Profile Changes",
    icon: <FaClipboardCheck />,
    permission: "VIEW_DASHBOARD",
  },
  {
    key: "userManagement",
    label: "User Management",
    icon: <FaUsers />,
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
  // { key: "adminPromotions", label: "Promotions", icon: <FaProjectDiagram />, permission: "PROMOTION_INFORMATION"},
  { key: "adminPromotions", label: "Promotions", icon: <FaProjectDiagram />, permission: "VIEW_DASHBOARD" },
  // { key: "promotionRequests", label: "Promotion Requests", icon: <FaProjectDiagram />, permission: "VIEW_PROMOTION_REQUESTS" },
  { key: "promotionRequests", label: "Promotion Requests", icon: <FaProjectDiagram />, permission: "VIEW_DASHBOARD" },
  {
      key: "paidPromotions",
      label: "Paid Promotions",
      icon: <FaChartBar />,
      component: <ManagePaidPromotions />,
      permission: "VIEW_PROMOTIONS",
    },
    {
      key: "couponManagement",
      label: "Coupon Management",
      icon: <FaClipboardCheck />,
      component: <CouponManagement />,
      permission: "MANAGE_COUPONS",
    },

    {
      key: "supportTickets",
      label: "Support Tickets",
      icon: <FaClipboardCheck />,
      component: <SupportAdminPanel />,
      permission: "MANAGE_SUPPORT_TICKETS",
    },

];

const AdminSidebar = ({ permissions = [], activeView, onNavigate }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate(); // ✅ IMPORTANT

  /* ================= ROUTE MAP ================= */
const routeMap = {
  overview: "/admin/dashboard",
  creditManagement: "/admin/dashboard/credit",
  creditSettlement: "/admin/dashboard/credit-settlement",
  supplierPayments: "/admin/dashboard/supplier-payments",
  supplierApproval: "/admin/dashboard",
  restaurantApproval: "/admin/dashboard",
  profileChanges: "/admin/dashboard",
  userManagement: "/admin/dashboard",
  platformUserManagement: "/admin/dashboard",
  platformMonitoring: "/admin/dashboard",

  supportTickets: "/admin/dashboard/support",
  paidPromotions: "/admin/dashboard/paid-promotions",
  couponManagement: "/admin/dashboard/coupons",
};

  /* ================= PERMISSION FILTER ================= */
  const allowedMenu = adminMenu.filter((item) => {
    if (!item.permission) return true;

    if (permissions.includes(item.permission)) return true;

    if (
      (item.key === "supplierApproval" ||
        item.key === "restaurantApproval") &&
      permissions.includes("VIEW_APPROVALS")
    ) {
      return true;
    }

    if (item.key === "platformUserManagement") {
      return (
        permissions.includes("MANAGE_SUPPLIER_USERS") ||
        permissions.includes("MANAGE_RESTAURANT_USERS") ||
        permissions.includes("MANAGE_ADMIN_USERS")
      );
    }

    return false;
  });

  /* ================= CLICK HANDLER ================= */
  const handleClick = (itemKey) => {
    onNavigate(itemKey);

    if (routeMap[itemKey]) {
      navigate(routeMap[itemKey]);
    }
  };

  return (
    <aside className={`dashboard_sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar_logo">
        <Link to="/admin/dashboard">
          <img src={logo} alt="Mahal" style={{ cursor: "pointer" }} />
        </Link>

        <button
          className="collapse_btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>

      <ul className="sidebar_menu">
        {allowedMenu.map((item) => (
          <li
            key={item.key}
            className={`menu_link ${activeView === item.key ? "active" : ""}`}
            onClick={() => handleClick(item.key)}
            style={{ cursor: "pointer" }}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default AdminSidebar;