

// import React, { useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
// import Slider from "react-slick";

// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// const API_BASE = "http://192.168.2.9:5000";

// const RestaurantDeals = () => {
//   const { t } = useTranslation();

//   const [deals, setDeals] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         let res = await fetch(`${API_BASE}/api/category`);

//         if (!res.ok) {
//           res = await fetch(`${API_BASE}/categories`);
//         }

//         const data = await res.json();

//         let categoriesArray = [];

//         if (Array.isArray(data)) {
//           categoriesArray = data;
//         } else if (data.categories) {
//           categoriesArray = data.categories;
//         }

//         const formatted = categoriesArray.map((item) => ({
//           id: item.id,
//           name: item.name || "Unnamed",
//           img: item.image || null,
//         }));

//         setDeals(formatted);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCategories();
//   }, []);

//   const settings = {
//     dots: false,
//     arrows: true,
//     infinite: deals.length > 5,
//     speed: 600,
//     slidesToShow: 5,
//     slidesToScroll: 1,
//     autoplay: deals.length > 0,
//     autoplaySpeed: 3000,
//     responsive: [
//       { breakpoint: 1200, settings: { slidesToShow: 4 } },
//       { breakpoint: 992, settings: { slidesToShow: 3 } },
//       { breakpoint: 768, settings: { slidesToShow: 2 } },
//       { breakpoint: 576, settings: { slidesToShow: 1 } },
//     ],
//   };

//   return (
//     <section className="mahal-deals-section">
//       <div className="container">

//         {/* HEADING */}
//         <div className="row mb-4">
//           <div className="col-lg-6">
//             <h2 className="mahal-title">
//               {t("restaurantdeals.shop_by")}{" "}
//               <span>{t("restaurantdeals.category")}</span>
//             </h2>
//             <p className="mahal-desc">
//               {t("restaurantdeals.popular_categories")}
//             </p>
//           </div>
//         </div>

//         {/* LOADING */}
//         {loading ? (
//           <div className="text-center">
//             {t("restaurantdeals.loading")}
//           </div>
//         ) : deals.length === 0 ? (
//           <div className="text-center text-danger">
//             {t("restaurantdeals.no_data")}
//           </div>
//         ) : (
//           <Slider {...settings}>
//             {deals.map((deal) => (
//               <div key={deal.id} className="px-2">
//                 <div className="mahal-deal-card">

//                   <img
//                     src={
//                       deal.img
//                         ? deal.img
//                         : "https://via.placeholder.com/300x200?text=No+Image"
//                     }
//                     alt={deal.name}
//                     style={{
//                       width: "100%",
//                       height: "200px",
//                       objectFit: "cover",
//                       borderRadius: "10px",
//                     }}
//                   />

//                   <h4
//                     style={{
//                       textAlign: "center",
//                       marginTop: "10px",
//                       fontSize: "16px",
//                     }}
//                   >
//                     {deal.name}
//                   </h4>

//                 </div>
//               </div>
//             ))}
//           </Slider>
//         )}

//       </div>
//     </section>
//   );
// };

// export default RestaurantDeals;













import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Slider from "react-slick";
import axios from "axios";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const API_BASE =
  "http://192.168.2.22:5000/api";

const RestaurantDeals = () => {

  const { t } = useTranslation();

  const location = useLocation();

  const navigate = useNavigate();

  const [deals, setDeals] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [cart, setCart] = useState({});

  const [timers, setTimers] =
    useState({});

  /* ================= AUTH CHECK ================= */

  const checkAuth = () => {

    const user =
      localStorage.getItem("customer") ||
      localStorage.getItem("user") ||
      localStorage.getItem("token");

    if (!user) {

      alert(
        "Please Register/Login First To Continue"
      );

      return false;

    }

    return true;

  };

  /* ================= FETCH PRODUCTS ================= */

  useEffect(() => {

    const fetchDeals = async () => {

      try {

        const res = await axios.get(
          `${API_BASE}/gridlist`
        );

        const products =
          res.data.products || [];

        /* ================= FILTER OFFERS ================= */

        const offers = products.filter(
          (p) =>
            p.offer_type &&
            (
              Number(
                p.discount_percentage
              ) > 0 ||
              Number(p.flat_amount) > 0 ||
              Number(p.buy_quantity) > 0
            )
        );

        /* ================= FORMAT ================= */

        const formatted = offers.map(
          (item) => {

            const expiryDate =
              item.offer_expiry_date ||
              item.expiry_date ||
              item.offer_end_date;

            let remainingSeconds = 0;

            if (expiryDate) {

              const expiry = new Date(
                `${expiryDate}T23:59:59`
              ).getTime();

              const now =
                new Date().getTime();

              remainingSeconds =
                Math.max(
                  Math.floor(
                    (expiry - now) / 1000
                  ),
                  0
                );

            }

            return {
              ...item,
              id: item.id,
              remainingSeconds,
            };

          }
        );

        /* ================= RANDOM PRODUCTS ================= */

        const shuffledDeals =
          formatted.sort(
            () => 0.5 - Math.random()
          );

        const limitedDeals =
          shuffledDeals.slice(0, 24);

        setDeals(limitedDeals);

        const timerObj = {};

        limitedDeals.forEach(
          (deal) => {

            timerObj[deal.id] =
              deal.remainingSeconds;

          }
        );

        setTimers(timerObj);

      } catch (err) {

        console.error(
          "FETCH ERROR:",
          err
        );

      } finally {

        setLoading(false);

      }

    };

    fetchDeals();

    /* ================= AUTO REFRESH EVERY 4 HOURS ================= */

    const refreshInterval =
      setInterval(() => {

        fetchDeals();

      }, 4 * 60 * 60 * 1000);

    return () =>
      clearInterval(refreshInterval);

  }, []);

  /* ================= LIVE TIMER ================= */

  useEffect(() => {

    const interval = setInterval(() => {

      setTimers((prev) => {

        const updated = { ...prev };

        Object.keys(updated).forEach(
          (id) => {

            if (updated[id] > 0) {

              updated[id] -= 1;

            }

          }
        );

        return updated;

      });

    }, 1000);

    return () =>
      clearInterval(interval);

  }, []);

  /* ================= FORMAT TIMER ================= */

  const formatTime = (seconds) => {

    if (seconds <= 0) {

      return "Offer Expired";

    }

    const days = Math.floor(
      seconds / (24 * 60 * 60)
    );

    const hours = Math.floor(
      (seconds %
        (24 * 60 * 60)) /
        3600
    );

    const minutes = Math.floor(
      (seconds % 3600) / 60
    );

    const secs = seconds % 60;

    if (days > 0) {

      return `${days}d ${hours}h left`;

    }

    if (hours > 0) {

      return `${hours}h ${minutes}m left`;

    }

    if (minutes > 0) {

      return `${minutes}m ${secs}s left`;

    }

    return `${secs}s left`;

  };

  /* ================= DISCOUNT PRICE ================= */

  const getDiscountedPrice = (
    price,
    offer
  ) => {

    if (!offer) return price;

    const type = (
      offer.offer_type || ""
    ).toLowerCase();

    if (type.includes("percent")) {

      return (
        price -
        (price *
          Number(
            offer.discount_percentage ||
              0
          )) /
          100
      );

    }

    if (type.includes("flat")) {

      return Math.max(
        price -
          Number(
            offer.flat_amount || 0
          ),
        0
      );

    }

    return price;

  };

  /* ================= COUNTRY FLAG ================= */

  const getFlag = (country) => {

    const flags = {
      India: "🇮🇳",
      Qatar: "🇶🇦",
      USA: "🇺🇸",
      UK: "🇬🇧",
      Turkey: "🇹🇷",
      China: "🇨🇳",
      Pakistan: "🇵🇰",
      Italy: "🇮🇹",
    };

    return flags[country] || "🌍";

  };

  /* ================= CART ================= */

  const addItem = (item) => {

    setCart((prev) => ({
      ...prev,
      [item.id]:
        (prev[item.id] || 0) + 1,
    }));

  };

  const removeItem = (item) => {

    setCart((prev) => {

      const updated = { ...prev };

      if (updated[item.id] === 1) {

        delete updated[item.id];

      } else {

        updated[item.id] -= 1;

      }

      return updated;

    });

  };

  /* ================= SLIDER ================= */

  const settings = {

    dots: false,

    arrows: true,

    infinite: deals.length > 6,

    speed: 600,

    slidesToShow: 6,

    slidesToScroll: 1,

    autoplay: true,

    autoplaySpeed: 3000,

    responsive: [

      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4,
        },
      },

      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
        },
      },

      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },

      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
        },
      },

    ],

  };

  return (

    <section className="mahal-deals-section py-4">

      <div className="container">

        {/* ================= HEADING ================= */}

        <div className="row mb-4">

          <div className="col-lg-6">

            <h2 className="mahal-title">

              Top <span>Discounts</span>

            </h2>

            <p className="mahal-desc">

              Explore trending supplier offers,
              flash discounts.

            </p>

          </div>

        </div>

        {/* ================= LOADING ================= */}

        {loading ? (

          <div className="text-center py-5">
            Loading...
          </div>

        ) : deals.length === 0 ? (

          <div className="text-center text-danger py-5">

            No deals found

          </div>

        ) : (

          <Slider {...settings}>

            {deals.map((p, i) => {

              const originalPrice =
                Number(
                  String(
                    p.price_numeric ||
                      p.price ||
                      0
                  ).replace(
                    /[^^\d.]/g,
                    ""
                  )
                );

              const finalPrice =
                getDiscountedPrice(
                  originalPrice,
                  p
                );

              return (

                <div
                  className="px-2"
                  key={`${p.id}-${i}`}
                >

                  <div className="product_card h-100">

                    {/* ================= IMAGE ================= */}

                    <div className="product_img position-relative">

                      <img
                        src={
                          p.image &&
                          p.image.trim() !==
                            ""
                            ? p.image.startsWith(
                                "http"
                              )
                              ? p.image
                              : `http://192.168.2.22:5000/${p.image}`
                            : p.img1 &&
                                p.img1.trim() !==
                                  ""
                              ? p.img1.startsWith(
                                  "http"
                                )
                                ? p.img1
                                : `http://192.168.2.22:5000/${p.img1}`
                              : "/fallback.png"
                        }
                        alt={p.name}
                        className="img-fluid"
                        style={{
                          cursor:
                            "pointer",
                        }}
                        onClick={() => {

                          if (
                            !checkAuth()
                          )
                            return;

                          navigate(
                            `/ShopDetails/${p.id}${location.search}`
                          );

                        }}
                        onError={(e) => {

                          e.target.src =
                            "/fallback.png";

                        }}
                      />

                      {/* ================= OFFER RIBBON ================= */}

                      <div className="discount-ribbon">

                        <svg
                          width="57"
                          height="60"
                          viewBox="0 0 29 28"
                        >

                          <defs>

                            <linearGradient
                              id={`grad-${i}`}
                              x1="0"
                              y1="0"
                              x2="1"
                              y2="1"
                            >

                              <stop
                                offset="0%"
                                stopColor="#FF8C00"
                              />

                              <stop
                                offset="100%"
                                stopColor="#FF3D00"
                              />

                            </linearGradient>

                          </defs>

                          <path
                            d="M28.9499 0C28.3999 0 27.9361 1.44696 27.9361 2.60412V27.9718L24.5708 25.9718L21.2055 27.9718L17.8402 25.9718L14.4749 27.9718L11.1096 25.9718L7.74436 27.9718L4.37907 25.9718L1.01378 27.9718V2.6037C1.01378 1.44655 0.549931 0 0 0H28.9499Z"
                            fill={`url(#grad-${i})`}
                          />

                        </svg>

                        <span>

                          {(() => {

                            const t = (
                              p.offer_type ||
                              ""
                            ).toLowerCase();

                            if (
                              t.includes(
                                "percent"
                              )
                            ) {

                              return `${Math.round(
                                p.discount_percentage
                              )}% OFF`;

                            }

                            if (
                              t.includes(
                                "flat"
                              )
                            ) {

                              return `QAR ${p.flat_amount} OFF`;

                            }

                            if (
                              t.includes(
                                "bogo"
                              ) ||
                              t.includes(
                                "buy"
                              )
                            ) {

                              return `BUY ${p.buy_quantity || 1} GET ${p.get_quantity || 1}`;

                            }

                            return "SPECIAL OFFER";

                          })()}

                        </span>

                      </div>

                      {/* ================= COUNTRY ================= */}

                      {p.country_of_origin && (

                        <div className="country_badge_new">

                          <span>
                            {getFlag(
                              p.country_of_origin
                            )}
                          </span>

                          <span>
                            {
                              p.country_of_origin
                            }
                          </span>

                        </div>

                      )}

                      {/* ================= HOVER ICONS ================= */}

                      <div className="hover_icons">

                        <button
                          onClick={() => {

                            if (
                              !checkAuth()
                            )
                              return;

                            navigate(
                              `/ShopDetails/${p.id}${location.search}`
                            );

                          }}
                        >

                          <i className="far fa-eye"></i>

                        </button>

                        <button>

                          <i className="far fa-heart"></i>

                        </button>

                      </div>

                    </div>

                    {/* ================= TEXT ================= */}

                    <div className="product_text">

                      <h4 className="product_title">

                        {p.name}

                        <div className="unit_badge">

                          {p.unit_of_measure ||
                            "Unit"}

                        </div>

                      </h4>

                      {/* ================= PRICE ================= */}

                      <p className="product_price">

                        <span className="product_price">

                          QAR{" "}
                          {finalPrice.toFixed(
                            2
                          )}

                        </span>

                        {finalPrice <
                          originalPrice && (

                          <del
                            style={{
                              marginLeft:
                                "8px",
                              color:
                                "#999",
                            }}
                          >

                            QAR{" "}
                            {originalPrice.toFixed(
                              2
                            )}

                          </del>

                        )}

                      </p>

                      {/* ================= ACTIONS ================= */}

                      <div className="product_actions">

                        {p.deliveryTime >
                          0 && (

                          <div className="delivery_strip_label_new">

                            <i className="fas fa-shipping-fast delivery_icon"></i>

                            <span>

                              <strong
                                className={
                                  p.deliveryTime <=
                                  20
                                    ? "fast"
                                    : p.deliveryTime <=
                                        35
                                      ? "medium"
                                      : "slow"
                                }
                              >

                                {
                                  p.deliveryTime
                                }{" "}
                                MIN

                              </strong>

                            </span>

                          </div>

                        )}
                     <button
                    className="add_cart_btn"
                    onClick={() => {

                      if (!checkAuth()) return;

                      navigate(
                        `/ShopDetails/${p.id}${location.search}`
                      );

                    }}
                  >
                    View Product
                  </button>
                     

                      </div>
                      

                    </div>

                  </div>

                </div>

              );

            })}

          </Slider>

        )}

      </div>

    </section>

  );

};

export default RestaurantDeals;