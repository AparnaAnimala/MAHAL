// import React from "react";
// import { Link, useNavigate } from "react-router-dom";

// const Header = () => {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     // auth data clear (if any)
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");

//     // redirect to index / home
//     navigate("/");
//   };

//   return (
//     <div className="dashboard_header">

//       {/* ROW 1 – SEARCH + USER */}
//       <div className="header_top">

//         {/* LEFT */}
//         <div className="header_left">
//           <h4 className="welcome_text">
//             Welcome, <span>Rakesh!</span>
//           </h4>

//           <div className="search_wrapper">
//             <input
//               className="search_bar"
//               placeholder="Search for ingredients or products..."
//             />
//             <button className="search_btn">
//               <i className="fas fa-search"></i>
//             </button>
//           </div>
//         </div>

//         {/* RIGHT */}
//         <div className="header_right">

//           {/* NOTIFICATION */}
//           <Link to="/notifications" className="icon_box">
//             <i className="fas fa-bell"></i>
//             <span className="badge">3</span>
//           </Link>

//           {/* CART */}
//           <Link to="/cart" className="icon_box">
//             <i className="fas fa-shopping-cart"></i>
//             <span className="badge">5</span>
//           </Link>

//           {/* LOGOUT */}
//           <div
//             className="icon_box logout_icon"
//             title="Logout"
//             onClick={handleLogout}
//             style={{ cursor: "pointer" }}
//           >
//             <i className="fas fa-sign-out-alt"></i>
//           </div>

//         </div>
//       </div>

//     </div>
//   );
// };

// export default Header;





// import React, { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { resolveIdentity } from "../../utils/identity"; // adjust path
// import "../../pages/css/halfscreen.css";

// const Header = ({ onProfileClick }) => {
// // const Header = () => {
//   const navigate = useNavigate();

//   const identity = resolveIdentity();

//   const role = identity?.role;
//   const linkedId = identity?.linkedId;

//   const [query, setQuery] = useState("");
//   const [notificationCount, setNotificationCount] = useState(0);
//   const [cartCount, setCartCount] = useState(0);

//   const username =
//     localStorage.getItem("username")?.split("@")[0] || "User";

//   /* LOAD COUNTS */
//   useEffect(() => {
//     const token = localStorage.getItem("token");

//     if (!token) return;

//     fetch("http://192.168.2.18:5000/api/notifications/count", {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then(res => res.json())
//       .then(d => setNotificationCount(d.count || 0))
//       .catch(() => setNotificationCount(0));

//     fetch("http://192.168.2.18:5000/api/cart/count", {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then(res => res.json())
//       .then(d => setCartCount(d.count || 0))
//       .catch(() => setCartCount(0));
//   }, []);

//   const handleSearch = () => {
//     if (!query.trim()) return;
//     navigate(`/search?q=${encodeURIComponent(query)}`);
//   };

//   const handleLogout = () => {
//     localStorage.clear();
//     navigate("/");
//   };

//   const goToProfile = () => {
//     if (!role) return;

//     // admin → no linkedId
//     if (role === "admin") {
//       navigate(`/admin/profile/admin/0`);
//     } else {
//       navigate(`/admin/profile/${role}/${linkedId}`);
//     }
//   };

//   return (
//     <div className="dashboard_header">

//       <div className="header_top">

//         {/* LEFT */}
//         <div className="header_left">
//           <h4 className="welcome_text">
//             Welcome, <span>{username}!</span>
//           </h4>

//           <div className="search_wrapper">
//             <input
//               className="search_bar"
//               placeholder="Search for ingredients or products..."
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && handleSearch()}
//             />
//             <button className="search_btn" onClick={handleSearch}>
//               <i className="fas fa-search"></i>
//             </button>
//           </div>
//         </div>

//         {/* RIGHT */}
//         <div className="header_right">

//           <Link to="/restaurantdashboard/CategorieList" className="icon_box Icon_Btn">
//               <i className="fas fa-shop"></i> Shop Now
//             </Link>

  

//           {/* NOTIFICATIONS */}
//           <Link to="/restaurantdashboard/notifications" className="icon_box">
//             <i className="fas fa-bell"></i>
//             {notificationCount > 0 && (
//               <span className="badge">{notificationCount}</span>
//             )}
//           </Link>

//           <div
//             className="icon_box logout_icon"
//             style={{ cursor: "pointer" }}
//             // onClick={goToProfile}
//             onClick={onProfileClick}
//             title="My Profile"
//           >
//             <i className="fas fa-user-circle"></i>
//           </div>


//           {/* CART */}
//           <Link to="/restaurantdashboard/CartView" className="icon_box">
//             <i className="fas fa-shopping-cart"></i>
//             {cartCount > 0 && (
//               <span className="badge">{cartCount}</span>
//             )}
//           </Link>

//           {/* LOGOUT */}
//           <div
//             className="icon_box logout_icon"
//             title="Logout"
//             onClick={handleLogout}
//             style={{ cursor: "pointer" }}
//           >
//             <i className="fas fa-sign-out-alt"></i>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default Header;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../pages/css/halfscreen.css";

const AdminHeader = ({ onProfileClick }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const username =
    localStorage.getItem("admin_email")?.split("@")[0] || "Admin";

  // ✅ FIX 1: DEFINE ROLE SAFELY
  const ADMIN_ROLE = localStorage.getItem("admin_role");

  const handleSearch = () => {
    if (!query.trim()) return;
    navigate(`/admin/search?q=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_role");
    localStorage.removeItem("admin_permissions");
    navigate("/admin/login");
  };

  // ✅ FIX 2: CREATE USER NAVIGATION
  const handleCreateUser = () => {
    navigate("/admin/dashboard/create-user");
  };

  return (
    <div className="dashboard_header">
      <div className="header_top">

        {/* LEFT */}
        <div className="header_left">
          <h4 className="welcome_text">
            Welcome, <span>{username}!</span>
          </h4>

          <div className="search_wrapper">
            <input
              className="search_bar"
              placeholder="Search products, orders, invoices..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="search_btn" onClick={handleSearch}>
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="header_right">

          <div className="header_right">

            {/* CREATE USER BUTTON — SUPER_ADMIN ONLY */}
            {ADMIN_ROLE === "SUPER_ADMIN" && (
              <button
                className="register_btn"
                style={{ marginRight: "15px" }}
                onClick={handleCreateUser}
              >
                + Create User
              </button>
            )}

            {/* LOGOUT */}
            <div
              className="icon_box logout_icon"
              title="Logout"
              onClick={handleLogout}
              style={{ cursor: "pointer" }}
            >
              <i className="fas fa-sign-out-alt"></i>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminHeader;


