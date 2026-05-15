



import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../../styles/Mahal.css";
import { resolveIdentity } from "../../utils/identity";

/* IMAGES */
import logo from "../../images/Logo1.png";
import userAvatar from "../../images/user-avatar.png";
const Header = ({ onProfileClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const identity = resolveIdentity();
  const [locationText, setLocationText] = useState("Fetching location...");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const restaurantId = localStorage.getItem("linked_id");
  const username = localStorage.getItem("username")?.split("@")[0] || "User";
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

  /* LOAD COUNTS */
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;
  fetch("http://192.168.2.9:5000/api/notifications/count", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(d => setNotificationCount(d.count || 0))
    .catch(() => setNotificationCount(0));
  fetch("http://192.168.2.9:5000/api/cart/count", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(d => setCartCount(d.count || 0))
    .catch(() => setCartCount(0));
  /* WISHLIST COUNT */
  fetch("http://192.168.2.9:5000/api/wishlist/count", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(d => setWishlistCount(d.count || 0))
    .catch(() => setWishlistCount(0));
}, []);

  /* LOAD PRODUCTS */
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://192.168.2.9:5000/api/gridlist", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setAllProducts(data.products || []))
      .catch(() => setAllProducts([]));
  }, []);

  /* RECENT + TRENDING */
  useEffect(() => {
    fetch("http://192.168.2.9:5000/api/search/recent")
      .then(res => res.json())
      .then(setRecentSearches)
      .catch(() => {});

    fetch("http://192.168.2.9:5000/api/search/trending")
      .then(res => res.json())
      .then(setTrendingSearches)
      .catch(() => {});
  }, []);
  // ✅ PUT IT HERE
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const searchParam = params.get("search");

  if (searchParam) {
    setQuery(searchParam);
  }
}, [location.search]);

  /* AUTOCOMPLETE */
  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      // setShowSuggestions(true);   // 👈 IMPORTANT
      return;
    }
const filtered = Array.from(
  new Map(
    allProducts
      .filter(p =>
        (p.name || p.product_name_english || "")
          .toLowerCase()
          .includes(query.toLowerCase())
      )
      .map(p => {
        const name = p.name || p.product_name_english;
        return [name.toLowerCase(), { ...p, displayName: name }];
      })
  ).values()
).slice(0, 8);
    setSuggestions(filtered);
    setShowSuggestions(true);
    setActiveIndex(-1);
  }, [query, allProducts]);

  /* CLICK OUTSIDE */
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

const handleSearch = text => {
  const q = (text || query).trim();
  if (!q) return;

  fetch("http://192.168.2.9:5000/api/search/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ search_text: q }),
  });

  setQuery(q);          // ← important
  setShowSuggestions(false);
  setShowOverlay(false);

  navigate(
    `/CategorieList?search=${encodeURIComponent(
      q
    )}&category=${searchCategory}`
  );
};
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("linked_id");
    // ❌ DO NOT remove tourSeen_restaurant_*
    navigate("/");
  };
useEffect(() => {
  const loadCount = () => {
    fetch(
      "http://192.168.2.9:5000/api/v1/orders/restaurant/notifications/count",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
      .then(res => res.json())
      .then(data => setNotificationCount(data.count || 0))
      .catch(() => setNotificationCount(0));
  };

  loadCount();
  window.addEventListener("refreshNotifications", loadCount);

  return () =>
    window.removeEventListener("refreshNotifications", loadCount);
}, []);
useEffect(() => {
  const restaurantId = localStorage.getItem("linked_id");

  const loadDefaultLocation = async () => {
    try {
      const res = await fetch(
        `http://192.168.2.9:5000/api/location/address/default/${restaurantId}`
      );
      const data = await res.json();

      if (data?.area) {
        setLocationText(`${data.area}, ${data.city}`);
      }
    } catch {}
  };

  const detectLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        );
        const geo = await res.json();

        const area =
          geo.address.suburb ||
          geo.address.neighbourhood ||
          geo.address.village ||
          geo.address.town ||
          "";

        const city =
          geo.address.city ||
          geo.address.state_district ||
          "";

        const state = geo.address.state || "";

        setLocationText(`${area}, ${city}`);

        await fetch("http://192.168.2.9:5000/api/location/address", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            restaurant_id: restaurantId,
            latitude: lat,
            longitude: lon,
            area,
            city,
            state,
            address_text: geo.display_name,
            is_default: true
          }),
        });
      },
      async () => {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        setLocationText(`${data.city}`);
      }
    );
  };

  loadDefaultLocation();
  detectLocation();
}, []);
  return (
    <>
      {showOverlay && <div className="search_overlay" />}

      <div className="mahal_dashboard dashboard_header">
        <div className="mahal_header header_top">

          {/* LEFT */}
          <div className="header_left">
            <Link to="/restaurantoffers" className="mahal_logo">
              <img src={logo} alt="logo" />
            </Link>

              {/* LOCATION */}
            <div className="location_box">
              <i className="fas fa-map-marker-alt"></i>
              <span className="location_text">{locationText}</span>
              <i className="fas fa-chevron-down"></i>
            </div>
          </div>
            {/* SEARCH */}
            <div className="search_wrapper" id="search" ref={searchRef}>
              {/* <select
                className="search_bar"
                style={{ maxWidth: "120px" }}
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Groceries">Groceries</option>
              </select> */}

              <input
                className="search_bar"
                placeholder="Search for ingredients or products..."
                value={query}
               onFocus={() => {
  setShowOverlay(true);

  if (query) {
    const filtered = Array.from(
      new Map(
        allProducts
          .filter(p =>
            (p.name || p.product_name_english || "")
              .toLowerCase()
              .includes(query.toLowerCase())
          )
          .map(p => {
            const name = p.name || p.product_name_english;
            return [name.toLowerCase(), { ...p, displayName: name }];
          })
      ).values()
    ).slice(0, 8);

    setSuggestions(filtered);
  }

  setShowSuggestions(true);
}}


                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown")
                    setActiveIndex(i =>
                      Math.min(i + 1, suggestions.length - 1)
                    );

                  if (e.key === "ArrowUp")
                    setActiveIndex(i => Math.max(i - 1, 0));

                 if (e.key === "Enter") {
                    const selected =
                      activeIndex >= 0
                        ? suggestions[activeIndex].displayName ||
                          suggestions[activeIndex].name ||
                          suggestions[activeIndex].product_name_english
                        : query;

                    setShowSuggestions(false);
                    setShowOverlay(false);
                    handleSearch(selected);
                  }

                }}
              />

              <button className="search_btn" onClick={handleSearch}>
                <i className="fas fa-search"></i>
              </button>

           {showSuggestions && (
  <div className="search_dropdown">

    {!query && recentSearches.length > 0 && (
      <>
        <div className="search_item" style={{ fontWeight: "bold" }}>
          Recent
        </div>
        {recentSearches.map((r, i) => (
          <div
            key={`recent-${i}`}
            className="search_item"
            onClick={() => handleSearch(r.search_text)}
          >
            🕒 {r.search_text}
          </div>
        ))}
      </>
    )}

    {!query && trendingSearches.length > 0 && (
      <>
        {/* <div className="search_item" style={{ fontWeight: "bold" }}>
          Trending
        </div> */}
        {trendingSearches.map((t, i) => (
          <div
            key={`trend-${i}`}
            className="search_item"
            onClick={() => handleSearch(t.search_text)}
          >
            🔥 {t.search_text}
          </div>
        ))}
      </>
    )}

        {suggestions.map((p, i) => {
          const name = p.displayName || p.name || p.product_name_english;

          return (
            <div
              key={p.product_id || p.id}
              className={`search_item ${i === activeIndex ? "active" : ""}`}
              onClick={() => handleSearch(name)}
            >
              {name}
            </div>
          );
        })}



          </div>
        )}

            </div>

            {/* LOCATION
            <div className="location_box">
              <i className="fas fa-map-marker-alt"></i>
              <span className="location_text">{locationText}</span>
              <i className="fas fa-chevron-down"></i>
            </div>
          </div> */}

          {/* RIGHT */}
          <div className="header_right">
            <div
              className="user_box"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <img src={userAvatar} alt="user" className="user_avatar" />
              <span className="user_name">{username}</span>

              {showUserMenu && (
                <div className="user_dropdown">
                  <Link to="/my-profile/restuarent">My Profile</Link>
                </div>
              )}
            </div>

            <Link to="/restaurantdashboard/notifications" className="icon_box">
              <i className="fas fa-bell"></i>
              {notificationCount > 0 && (
                <span className="badge">{notificationCount}</span>
              )}
            </Link>

            <Link to="/cartview" className="icon_box">
              <i className="fas fa-shopping-cart"></i>
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </Link>

            <Link to="/wishlist" className="icon_box">
              <i className="fa fa-heart"></i>
              {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
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

























