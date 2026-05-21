// import React, { useState } from "react";
// import { Link } from "react-router-dom";

// // image
// import logo from "../images/Logo.png";

// const Header = () => {
//   const [showLogin, setShowLogin] = useState(false);
//   const createRipple = (e) => {
//   const card = e.currentTarget;
//   const ripple = document.createElement("span");
//   const rect = card.getBoundingClientRect();

//   ripple.style.left = `${e.clientX - rect.left}px`;
//   ripple.style.top = `${e.clientY - rect.top}px`;
//   ripple.className = "ripple_span";

//   card.appendChild(ripple);

//   setTimeout(() => ripple.remove(), 600);
// };


//   return (
//     <>
//       {/* ================= HEADER ================= */}
//       <header className="header_2 main_menu">
//         <div className="container">
//           <div className="row align-items-center">

//             {/* LOGO */}
//             <div className="col-lg-2 col-12">
//               <div className="header_logo_area">
//                 <Link to="/" className="header_logo">
//                   <img src={logo} alt="Logo" className="img-fluid w-100" />
//                 </Link>

//                 {/* MOBILE MENU ICON */}
//                 <div
//                   className="mobile_menu_icon d-block d-lg-none"
//                   data-bs-toggle="offcanvas"
//                   data-bs-target="#mobileMenu"
//                 >
//                   <i className="fa-solid fa-bars menu_icon_bar"></i>
//                 </div>
//               </div>
//             </div>

//             {/* DESKTOP MENU */}
//             <div className="col-lg-10 d-none d-lg-flex justify-content-between align-items-center">
//               <ul className="menu_item">
//                 <li><Link to="/">Home</Link></li>
//                 <li><Link to="/Restaurants">For Restaurants</Link></li>
//                 <li><Link to="/Suppliers">For Suppliers</Link></li>
//                 <li><Link to="/About">About Us</Link></li>
//                 <li><Link to="/Blog">Blog</Link></li>
//                 <li><Link to="/Contact">Contact</Link></li>
//               </ul>

//               <ul className="menu_icon">
//                 <li>
                  
//                   <button
//                     className="lgn_btn"
//                     onClick={() => setShowLogin(true)}
//                   >
//                     <i className="fa-solid fa-user"></i> Login
//                   </button>

                  

//                 </li>
//               </ul>
//             </div>

//           </div>
//         </div>
//       </header>

//       {/* ================= LOGIN MODAL ================= */}
//       {showLogin && (
//        <div className="login_modal_overlay">
//   <div className="login_modal_v2">
//     <button className="close_btn" onClick={() => setShowLogin(false)}>✕</button>

//     <h3 className="login_title">Login As</h3>

//     <div className="login_cards_v2">
//       <Link to="/restaurantlogin" className="login_card_v2 restaurant  "  onClick={createRipple}>
//         <div className="icon_wrap">
//           <i className="fa-solid fa-utensils"></i>
//         </div>
//         <h5>Restaurant</h5>
//         <p>Orders & Menu</p>
//       </Link>

//       <Link to="/supplierlogin" className="login_card_v2 supplier">
//         <div className="icon_wrap">
//           <i className="fa-solid fa-truck"></i>
//         </div>
//         <h5>Supplier</h5>
//         <p>Supply Management</p>
//       </Link>

//       <Link to="/admin/login" className="login_card_v2 admin">
//         <div className="icon_wrap">
//           <i className="fa-solid fa-user-shield"></i>
//         </div>
//         <h5>Admin</h5>
//         <p>System Control</p>
//       </Link>
//     </div>
//   </div>
// </div>

//       )}

//       {/* ================= MOBILE OFFCANVAS ================= */}
//       <div className="offcanvas offcanvas-start" tabIndex="-1" id="mobileMenu">
//         <div className="offcanvas-header">
//           <Link to="/">
//             <img src={logo} alt="Logo" style={{ width: "140px" }} />
//           </Link>
//           <button className="btn-close" data-bs-dismiss="offcanvas"></button>
//         </div>

//         <div className="offcanvas-body">
//           <ul className="mobile_menu">
//             <li><Link to="/" data-bs-dismiss="offcanvas">Home</Link></li>
//             <li><Link to="/Restaurants" data-bs-dismiss="offcanvas">For Restaurants</Link></li>
//             <li><Link to="/Suppliers" data-bs-dismiss="offcanvas">For Suppliers</Link></li>
//             <li><Link to="/About" data-bs-dismiss="offcanvas">About Us</Link></li>
//             <li><Link to="/Blog" data-bs-dismiss="offcanvas">Blog</Link></li>
//             <li><Link to="/Contact" data-bs-dismiss="offcanvas">Contact</Link></li>

//             {/* MOBILE LOGIN */}
//             <li>
//               <button
//                 className="lgn_btn w-100 mt-3"
//                 onClick={() => setShowLogin(true)}
//                 data-bs-dismiss="offcanvas"
//               >
//                 <i className="fa-solid fa-user"></i> Login
//               </button>
//             </li>
//           </ul>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Header;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../images/Logo.png";

const Header = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { t, i18n } = useTranslation();

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="header_2 main_menu">
        <div className="container">
          <div className="row align-items-center">

            <div className="col-lg-2 col-12">
              <div className="header_logo_area">
                <Link to="/" className="header_logo">
                  <img src={logo} alt="Logo" className="img-fluid w-100" />
                </Link>
              </div>
            </div>

            <div className="col-lg-10 d-none d-lg-flex justify-content-between align-items-center">
              <ul className="menu_item">
                <li><Link to="/">{t("home")}</Link></li>
                <li><Link to="/Restaurants">{t("restaurants")}</Link></li>
                <li><Link to="/Suppliers">{t("suppliers")}</Link></li>
                <li><Link to="/About">{t("about.menu")}</Link></li>
                <li><Link to="/Blog">{t("blog")}</Link></li>
                <li><Link to="/Contact">{t("contact")}</Link></li>
              </ul>

              {/* LANGUAGE */}
              <select
                className="lang_dropdown"
                value={i18n.language}
                onChange={(e) => {
                  const lang = e.target.value;
                  i18n.changeLanguage(lang);
                  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
                  localStorage.setItem("i18nextLng", lang);
                }}
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>

              {/* LOGIN BUTTON */}
              <ul className="menu_icon">
                <li>
                  <button className="lgn_btn" onClick={() => setShowLogin(true)}>
                    <i className="fa-solid fa-user"></i> {t("login")}
                  </button>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </header>

      {/* ================= LOGIN MODAL ================= */}
      {showLogin && (
        <div className="login_modal_overlay">
          <div className="login_modal_v2">

            <button className="close_btn" onClick={() => setShowLogin(false)}>✕</button>

            <h3 className="login_title">{t("login_as")}</h3>

            <div className="login_cards_v2">

              {/* RESTAURANT */}
              <Link to="/restaurantlogin" className="login_card_v2 restaurant">
                <div className="icon_wrap">
                  <i className="fa-solid fa-utensils"></i>
                </div>
                <h5>{t("restaurant")}</h5>
                <p>{t("orders_menu")}</p>
              </Link>

              {/* SUPPLIER */}
              <Link to="/supplierlogin" className="login_card_v2 supplier">
                <div className="icon_wrap">
                  <i className="fa-solid fa-truck"></i>
                </div>
                <h5>{t("supplier")}</h5>
                <p>{t("supply_mgmt")}</p>
              </Link>

              {/* ADMIN */}
              {/* <Link to="/admin/login" className="login_card_v2 admin">
                <div className="icon_wrap">
                  <i className="fa-solid fa-user-shield"></i>
                </div>
                <h5>{t("admin")}</h5>
                <p>{t("system_control")}</p>
              </Link> */}

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;