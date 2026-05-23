

// import React, { useEffect, useRef, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { resolveIdentity } from "../../utils/identity";
// import { dashboardSearchMap } from "../../utils/dashboardSearchMap";
// import { useTranslation } from "react-i18next";

// const Header = ({ onProfileClick }) => {
//   const navigate = useNavigate();
//   const searchRef = useRef(null);

//   const identity = resolveIdentity();
//   const username =
//     localStorage.getItem("username")?.split("@")[0] || "User";

//   const [query, setQuery] = useState("");
//   const [searchCategory, setSearchCategory] = useState("All");

//   const [allProducts, setAllProducts] = useState([]);
//   const [recentSearches, setRecentSearches] = useState([]);
//   const [trendingSearches, setTrendingSearches] = useState([]);
//   const [suggestions, setSuggestions] = useState([]);

//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [showOverlay, setShowOverlay] = useState(false);
//   const [activeIndex, setActiveIndex] = useState(-1);

//   const [notificationCount, setNotificationCount] = useState(0);
//   const [cartCount, setCartCount] = useState(0);
//   const [wishlistCount, setWishlistCount] = useState(0);
//   const [credit, setCredit] = useState(null);
//    const { t, i18n } = useTranslation();

//   // ✅ LOCATION STATE
//   const [location, setLocation] = useState(null);

//   // ✅ GET CURRENT LOCATION FUNCTION
//   const getCurrentLocation = () => {
//     if (!navigator.geolocation) return;

//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const { latitude, longitude } = position.coords;

//         console.log("Location:", latitude, longitude);

//         setLocation({ latitude, longitude });

//         // 🔥 send to backend
//         fetch("http://192.168.2.22:5000/api/location/save", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//           body: JSON.stringify({ latitude, longitude }),
//         }).catch(() => {});
//       },
//       (error) => {
//         console.error("Location error:", error);
//       }
//     );
//   };

//   // ✅ AUTO CALL (LIKE SWIGGY)
//   useEffect(() => {
//     getCurrentLocation();
//   }, []);

//   const loadNotificationCount = () => {
//     const token = localStorage.getItem("token");

//     fetch("http://192.168.2.22:5000/api/v1/orders/restaurant/notifications/count", {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then(res => res.json())
//       .then(data => setNotificationCount(data.count || 0))
//       .catch(() => setNotificationCount(0));
//   };

//   const loadCredit = () => {
//     const token = localStorage.getItem("token");

//     fetch("http://192.168.2.22:5000/api/restaurant/credit-info", {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then(res => res.json())
//       .then(setCredit)
//       .catch(() => setCredit(null));
//   };

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) return;

//     loadNotificationCount();
//     loadCredit();

//     window.addEventListener("refreshNotifications", loadNotificationCount);
//     window.addEventListener("creditUpdated", loadCredit);

//     return () => {
//       window.removeEventListener("refreshNotifications", loadNotificationCount);
//       window.removeEventListener("creditUpdated", loadCredit);
//     };
//   }, []);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) return;

//     fetch("http://192.168.2.22:5000/api/notifications/count", {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then(res => res.json())
//       .then(d => setNotificationCount(d.count || 0))
//       .catch(() => setNotificationCount(0));

//     fetch("http://192.168.2.22:5000/api/cart/count", {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then(res => res.json())
//       .then(d => setCartCount(d.count || 0))
//       .catch(() => setCartCount(0));

//     fetch("http://192.168.2.22:5000/api/wishlist/count", {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then(res => res.json())
//       .then(d => setWishlistCount(d.count || 0))
//       .catch(() => setWishlistCount(0));
//   }, []);

//   useEffect(() => {
//     const token = localStorage.getItem("token");

//     fetch("http://192.168.2.22:5000/api/gridlist", {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then(res => res.json())
//       .then(data => setAllProducts(data.products || []))
//       .catch(() => setAllProducts([]));
//   }, []);

//   useEffect(() => {
//     fetch("http://192.168.2.22:5000/api/search/recent")
//       .then(res => res.json())
//       .then(setRecentSearches)
//       .catch(() => {});

//     fetch("http://192.168.2.22:5000/api/search/trending")
//       .then(res => res.json())
//       .then(setTrendingSearches)
//       .catch(() => {});
//   }, []);

//   useEffect(() => {
//     if (!query) {
//       setSuggestions([]);
//       return;
//     }

//     const filtered = allProducts
//       .filter(p =>
//         (p.name || p.product_name_english || "")
//           .toLowerCase()
//           .includes(query.toLowerCase())
//       )
//       .slice(0, 16);

//     setSuggestions(filtered);
//     setShowSuggestions(true);
//     setActiveIndex(-1);
//   }, [query, allProducts]);

//   useEffect(() => {
//     const handleClick = e => {
//       if (searchRef.current && !searchRef.current.contains(e.target)) {
//         setShowSuggestions(false);
//         setShowOverlay(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClick);
//     return () => document.removeEventListener("mousedown", handleClick);
//   }, []);

// const handleSearch = () => {
//   const text = query.toLowerCase().trim();
//   if (!text) return;

//   // 🔹 1. Check dashboard routes (orders, invoices, etc.)
//   const routeMatch = dashboardSearchMap.find((item) =>
//     item.keywords.some((k) => text.includes(k.toLowerCase()))
//   );

//   if (routeMatch) {
//     navigate(routeMatch.route);
//     setQuery("");
//     return;
//   }

//   // 🔹 2. Check product list
//   const productMatch = allProducts.find((p) =>
//     (p.name || p.product_name_english || "")
//       .toLowerCase()
//       .includes(text)
//   );

//   if (productMatch) {
//     // 👉 change route based on your app
//     navigate(`/product/${productMatch.id}`);
//     setQuery("");
//     return;
//   }

//   // 🔹 3. fallback → go to search page
//   navigate(`/search?q=${encodeURIComponent(text)}`);
// };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("role");
//     localStorage.removeItem("linked_id");
//     navigate("/");
//   };


//   return (
//     <>
//       {showOverlay && <div className="search_overlay" />}

//       <div className="dashboard_header">
//         <div className="header_top">

//           <div className="header_left">
//             <h4 className="welcome_text">
//               {t("welcome")}, <span>{username}!</span>
//             </h4>

//             {credit && (
//               <div className="header_credit">
//                 <i className="fas fa-wallet"></i>

//                 <div className="credit_text">
//                   <span className="credit_label">{t("credit")}</span>
//                   <b>QAR  {Number(credit.credit_available || 0).toFixed(2)}</b>
//                 </div>
//               </div>
//             )}

//             <div className="search_wrapper">
//             <input
//               className="search_bar"
//               placeholder={t("search_placeholder")}
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && handleSearch()}
//             />
//             <button className="search_btn" onClick={handleSearch}>
//               <i className="fas fa-search"></i>
//             </button>
//           </div>
//           </div>

//           <div>
//           <select
//             className="lang_dropdown"
//             value={i18n.language}
//             onChange={(e) => {
//               const lang = e.target.value;
//               i18n.changeLanguage(lang);
//               document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
//               localStorage.setItem("i18nextLng", lang);
//             }}
//           >
//             <option value="en">English</option>
//             <option value="ar">العربية</option>
//           </select>
//             </div>
          

//           <div className="header_right">
//             {/* <Link to="/restaurantdashboard/CategorieList" className="icon_box Icon_Btn">
//               <i className="fas fa-shop"></i> Shop Now
//             </Link> */}
            

//             <Link to="/restaurantOffers" className="icon_box Icon_Btn">
//               <i className="fas fa-shop"></i> {t("shop_now")}
//             </Link>

//             <Link to="/restaurantdashboard/notifications" className="icon_box">
//               <i className="fas fa-bell"></i>
//               {notificationCount > 0 && (
//                 <span className="badge">{notificationCount}</span>
//               )}
//             </Link>

//             {/* <div className="icon_box logout_icon" onClick={onProfileClick}>
//               <i className="fas fa-user-circle"></i>
//             </div> */}

//             <Link to={`/profile/${localStorage.getItem("role")}/${localStorage.getItem("linked_id")}`} className="icon_box">
//               <i className="fas fa-user"></i>    
//             </Link>

//               <Link to="/wishlist" className="icon_box">
//               <i className="far fa-heart"></i>
//               {wishlistCount > 0 && (
//                 <span className="badge">{wishlistCount}</span>
//               )}
//             </Link>

//             <Link to="/CartView" className="icon_box">
//               <i className="fas fa-shopping-cart"></i>
//               {cartCount > 0 && (
//                 <span className="badge">{cartCount}</span>
//               )}
//             </Link>

//             <div className="icon_box logout_icon" onClick={handleLogout}>
//               <i className="fas fa-sign-out-alt"></i>
//             </div>
//           </div>

//         </div>
//       </div>
//     </>
//   );
// };

// export default Header;






















import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { resolveIdentity } from "../../utils/identity";
import { dashboardSearchMap } from "../../utils/dashboardSearchMap";
import { useTranslation } from "react-i18next";

const Header = ({ onProfileClick }) => {
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const identity = resolveIdentity();
  const username =
    localStorage.getItem("username")?.split("@")[0] || "User";

  const [query, setQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("All");

  const [allProducts, setAllProducts] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const [notificationCount, setNotificationCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [credit, setCredit] = useState(null);
   const { t, i18n } = useTranslation();

  // ✅ LOCATION STATE
  const [location, setLocation] = useState(null);

  // ✅ GET CURRENT LOCATION FUNCTION
  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        console.log("Location:", latitude, longitude);

        setLocation({ latitude, longitude });

        // 🔥 send to backend
        fetch("http://192.168.2.22:5000/api/location/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ latitude, longitude }),
        }).catch(() => {});
      },
      (error) => {
        console.error("Location error:", error);
      }
    );
  };

  // ✅ AUTO CALL (LIKE SWIGGY)
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const loadNotificationCount = () => {
    const token = localStorage.getItem("token");

    fetch("http://192.168.2.22:5000/api/v1/orders/restaurant/notifications/count", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setNotificationCount(data.count || 0))
      .catch(() => setNotificationCount(0));
  };

  const loadCredit = () => {
    const token = localStorage.getItem("token");

    fetch("http://192.168.2.22:5000/api/restaurant/credit-info", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setCredit)
      .catch(() => setCredit(null));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    loadNotificationCount();
    loadCredit();

    window.addEventListener("refreshNotifications", loadNotificationCount);
    window.addEventListener("creditUpdated", loadCredit);

    return () => {
      window.removeEventListener("refreshNotifications", loadNotificationCount);
      window.removeEventListener("creditUpdated", loadCredit);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://192.168.2.22:5000/api/notifications/count", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(d => setNotificationCount(d.count || 0))
      .catch(() => setNotificationCount(0));

    fetch("http://192.168.2.22:5000/api/cart/count", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(d => setCartCount(d.count || 0))
      .catch(() => setCartCount(0));

    fetch("http://192.168.2.22:5000/api/wishlist/count", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(d => setWishlistCount(d.count || 0))
      .catch(() => setWishlistCount(0));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://192.168.2.22:5000/api/gridlist", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setAllProducts(data.products || []))
      .catch(() => setAllProducts([]));
  }, []);

  useEffect(() => {
    fetch("http://192.168.2.22:5000/api/search/recent")
      .then(res => res.json())
      .then(setRecentSearches)
      .catch(() => {});

    fetch("http://192.168.2.22:5000/api/search/trending")
      .then(res => res.json())
      .then(setTrendingSearches)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const filtered = allProducts
      .filter(p =>
        (p.name || p.product_name_english || "")
          .toLowerCase()
          .includes(query.toLowerCase())
      )
      .slice(0, 16);

    setSuggestions(filtered);
    setShowSuggestions(true);
    setActiveIndex(-1);
  }, [query, allProducts]);

  useEffect(() => {
    const handleClick = e => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setShowOverlay(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

const handleSearch = async () => {
  const text = query.toLowerCase().trim();

  if (!text) return;

  // 🔥 DASHBOARD SEARCH FROM DB
  const dashboardRes = await fetch(
    `http://192.168.2.22:5000/api/dashboard/search?q=${text}`
  );

  const dashboardData = await dashboardRes.json();

  if (dashboardData.length > 0) {
    navigate(dashboardData[0].route);
    setQuery("");
    return;
  }

  // 🔥 PRODUCT SEARCH
  const productMatch = allProducts.find((p) =>
    (p.name || p.product_name_english || "")
      .toLowerCase()
      .includes(text)
  );

  if (productMatch) {
    navigate(`/product/${productMatch.id}`);
    setQuery("");
    return;
  }

  // 🔥 NORMAL SEARCH
navigate(`/restaurantdashboard/${text}`);
};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("linked_id");
    navigate("/");
  };


  return (
    <>
      {showOverlay && <div className="search_overlay" />}

      <div className="dashboard_header">
        <div className="header_top">

          <div className="header_left">
            <h4 className="welcome_text">
              {t("welcome")}, <span>{username}!</span>
            </h4>

            {credit && (
              <div className="header_credit">
                <i className="fas fa-wallet"></i>

                <div className="credit_text">
                  <span className="credit_label">{t("credit")}</span>
                  <b>QAR  {Number(credit.credit_available || 0).toFixed(2)}</b>
                </div>
              </div>
            )}

            <div className="search_wrapper">
            <input
              className="search_bar"
              placeholder={t("search_placeholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="search_btn" onClick={handleSearch}>
              <i className="fas fa-search"></i>
            </button>
          </div>
          </div>

          <div>
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
            </div>
          

          <div className="header_right">
            {/* <Link to="/restaurantdashboard/CategorieList" className="icon_box Icon_Btn">
              <i className="fas fa-shop"></i> Shop Now
            </Link> */}
            

            <Link to="/restaurantOffers" className="icon_box Icon_Btn">
              <i className="fas fa-shop"></i> {t("shop_now")}
            </Link>

            <Link to="/restaurantdashboard/notifications" className="icon_box">
              <i className="fas fa-bell"></i>
              {notificationCount > 0 && (
                <span className="badge">{notificationCount}</span>
              )}
            </Link>

            {/* <div className="icon_box logout_icon" onClick={onProfileClick}>
              <i className="fas fa-user-circle"></i>
            </div> */}

            <Link to={`/profile/${localStorage.getItem("role")}/${localStorage.getItem("linked_id")}`} className="icon_box">
              <i className="fas fa-user"></i>    
            </Link>

              <Link to="/wishlist" className="icon_box">
              <i className="far fa-heart"></i>
              {wishlistCount > 0 && (
                <span className="badge">{wishlistCount}</span>
              )}
            </Link>

            <Link to="/CartView" className="icon_box">
              <i className="fas fa-shopping-cart"></i>
              {cartCount > 0 && (
                <span className="badge">{cartCount}</span>
              )}
            </Link>

            <div className="icon_box logout_icon" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Header;