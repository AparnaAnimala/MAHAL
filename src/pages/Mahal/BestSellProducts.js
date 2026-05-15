// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import axios from "axios"; // ✅ IMPORTANT
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation, Autoplay } from "swiper/modules";
// import { FaStar, FaShoppingCart, FaEye } from "react-icons/fa";

// import "swiper/css";
// import "swiper/css/navigation";

// import bannerImg from "../../images/side_img1.jpg";

// const API_BASE = "http://192.168.2.9:5000"; // ✅ SAME AS SECOND FILE

// /* PRICE FIX */
// const parsePrice = (val) => {
//   if (!val) return 0;
//   return Number(String(val).replace(/[^\d.]/g, "")) || 0;
// };

// const BestSellProducts = () => {
//   const [products, setProducts] = useState([]);
//   const [ratings, setRatings] = useState({});

//   /* ================= FETCH ================= */
//   useEffect(() => {
//     fetch(`${API_BASE}/api/deals-of-the-day`)
//       .then((res) => res.json())
//       .then((data) => {
//         let items = data.data || data.products || [];

//         if (!items.length) {
//           return fetch(`${API_BASE}/api/gridlist`)
//             .then((res) => res.json())
//             .then((data2) => {
//                const list = data2.products || [];
//             setProducts(list);
//             fetchRatings(list);
//             });
//         }

//         setProducts(items);
//         fetchRatings(items);
//       })
//       .catch((err) => {
//         console.error("FETCH ERROR:", err);
//       });
//   }, []);


//     const fetchRatings = async (products) => {
//       try {
//         const ratingData = {};

//         await Promise.all(
//           products.map(async (p) => {
//             try {
//               const res = await fetch(
//                 '${API_BASE}/api/reviews/products/${p.id}'
//               );
//               const data = await res.json();

//               if (data.length > 0) {
//                 const total = data.reduce((sum, r) => sum + r.rating, 0);
//                 ratingData[p.id] = total / data.length;
//               } else {
//                 ratingData[p.id] = 0;
//               }
//             } catch {
//               ratingData[p.id] = 0;
//             }
//           })
//         );

//         setRatings(ratingData);
//       } catch (err) {
//         console.error("Rating fetch error:", err);
//       }
//     };

//   /* ================= ADD TO CART (LIKE SECOND FILE) ================= */
//   const addToCart = (item) => {
//     const token = localStorage.getItem("token");

//     if (!token) {
//       alert("Please login");
//       return;
//     }

//     axios.post(
//       `${API_BASE}/api/cart/add`,
//       {
//         product_id: item.id,
//         quantity: 1,
//         price: item.price_numeric || parsePrice(item.price),
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     )
//     .then(() => {
//       alert("Added to cart 🛒");
//     })
//     .catch((err) => {
//       console.error("CART ERROR", err);
//       alert("Backend error");
//     });
//   };

//   return (
//     <section className="best_sell popular_products mt_100 xs_mt_80">
//       <div className="container">

//         {/* HEADING */}
//         <div className="row">
//           <div className="col-xl-5 m-auto">
//             <div className="section_heading text-center heading_left mb_25 m-auto">
//               <h4 className="premium_badge text-white">
//                 🔥 Best Selling Offers
//               </h4>
//               <h2 className="premium_title">Top Deals For You</h2>
//             </div>
//           </div>
//         </div>

//         <div className="row mt-5">

//           {/* LEFT BANNER */}
//           <div className="col-xl-3 col-md-6 col-lg-4">
//             <div className="special_product_banner">
//               <img src={bannerImg} alt="special" className="img-fluid w-100" />
//               <div className="text">
//                 <h5>Hot Deals</h5>
//                 <h3>Save Big on Today’s Offers</h3>
//                 <Link to="/ShopDetails" className="common_btn">
//                   shop now <i className="fas fa-long-arrow-right"></i>
//                 </Link>
//               </div>
//             </div>
//           </div>

//           {/* PRODUCT SLIDER */}
//           <div className="col-xl-9 col-md-6 col-lg-8">
//             <Swiper
//               modules={[Navigation, Autoplay]}
//               slidesPerView={4}
//               spaceBetween={10}
//               navigation
//               autoplay={{ delay: 3500 }}
//               loop
//               breakpoints={{
//                 0: { slidesPerView: 1 },
//                 576: { slidesPerView: 2 },
//                 768: { slidesPerView: 3 },
//                 1200: { slidesPerView: 4 },
//               }}
//               className="best_sell_slider"
//             >
//               {products.map((p) => {

//                 const price =
//                   p.price_numeric ??
//                   p.selling_price ??
//                   parsePrice(p.price);

//                 const old =
//                   p.old_price_numeric ??
//                   p.mrp ??
//                   parsePrice(p.old_price);

//                 const discount =
//                   old > price
//                     ? Math.round(((old - price) / old) * 100)
//                     : 0;

//                 return (
//                   <SwiperSlide key={p.id}>
//                     <div className="mm-product-card">

//                       {/* DISCOUNT */}
//                       {discount > 0 && (
//                         <span className="mm-discount-badge">
//                           {discount}% OFF
//                         </span>
//                       )}

//                       {/* IMAGE */}
//                       <div className="mm-product-img">
//                        <img
//                         src={
//                           p.img1 && p.img1.trim() !== ""
//                             ? p.img1.startsWith("http")
//                               ? p.img1
//                               : `${API_BASE}/${p.img1}`
//                             : null
//                         }
//                         alt={p.name}
//                         onError={(e) => {
//                           console.log("Image failed:", p.img1);
//                           e.target.style.display = "none";
//                         }}
//                       />
//                       </div>

//                       {/* CONTENT */}
//                       <div className="mm-product-content">

//                         {/* RATING */}
//                         {/* <div className="mm-rating">
//                           {Array.from({ length: 5 }).map((_, i) => (
//                             <FaStar
//                               key={i}
//                               className={
//                                 i < Math.floor(p.rating || 4) ? "active" : ""
//                               }
//                             />
//                           ))}
//                         </div> */}

//                         {/* RATING */}
//                         <div
//                           className="mm-rating"
//                         >
//                           {Array.from({ length: 5 }).map((_, i) => (
//                             <FaStar
//                               key={i}
//                               color={
//                                 i < Math.round(ratings[p.id] || 0)
//                                   ? "#f59e0b"
//                                   : "#d1d5db"
//                               }
//                               size={13}
//                             />
//                           ))}

//                           <span
                            
//                           >
//                             ({(ratings[p.id] || 0).toFixed(1)})
//                           </span>
//                         </div>

//                         {/* TITLE */}
//                         <Link
//                           to={`/shopdetails/${p.id}`}
//                           className="mm-product-title"
//                         >
//                           {p.name}
//                         </Link>

//                         {/* PRICE */}
//                         <div className="mm-price">
//                           <span className="mm-new">
//                             QAR {price}
//                           </span>

//                           {old > price && (
//                             <span className="mm-old">
//                               QAR {old}
//                             </span>
//                           )}
//                         </div>

//                         {/* ACTIONS */}
//                         <div className="mm-actions">

//                           {/* ADD TO CART */}
//                           <button
//                             onClick={() => addToCart(p)}
                          
//                           >
//                             <FaShoppingCart />
//                           </button>

//                           {/* VIEW */}
//                           <Link to={`/shopdetails/${p.id}`}>
//                             <FaEye />
//                           </Link>

//                         </div>

//                       </div>
//                     </div>
//                   </SwiperSlide>
//                 );
//               })}
//             </Swiper>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// };

// export default BestSellProducts;



import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios"; // ✅ IMPORTANT
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { FaStar, FaShoppingCart, FaEye } from "react-icons/fa";
import { formatPrice, getCurrencySymbol } from "../../utils/currency";

import "swiper/css";
import "swiper/css/navigation";

import bannerImg from "../../images/side_img1.jpg";

const API_BASE = "http://192.168.2.9:5000"; // ✅ SAME AS SECOND FILE

/* PRICE FIX */
const parsePrice = (val) => {
  if (!val) return 0;
  return Number(String(val).replace(/[^\d.]/g, "")) || 0;
};

const BestSellProducts = () => {
  const [products, setProducts] = useState([]);
  // const [ratings, setRatings] = useState({});

  /* ================= FETCH ================= */
  // useEffect(() => {
  //   fetch(`${API_BASE}/api/deals-of-the-day`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       let items = data.data || data.products || [];

  //       // ✅ ONLY OFFER PRODUCTS
  //       items = items.filter(
  //         (p) =>
  //           p.offer_type ||
  //           p.has_offer ||
  //           p.discount_percentage ||
  //           p.flat_amount ||
  //           p.buy_quantity
  //       );

  //       // if (!items.length) {
  //       //   return fetch(`${API_BASE}/api/gridlist`)
  //       //     .then((res) => res.json())
  //       //     .then((data2) => {
  //       //        const list = data2.products || [];
  //       //     setProducts(list);
  //       //     fetchRatings(list);
  //       //     });
  //       // }

  //       setProducts(items);
  //       fetchRatings(items);
  //     })
  //     .catch((err) => {
  //       console.error("FETCH ERROR:", err);
  //     });
  // }, []);

  useEffect(() => {

    const loadProducts = async () => {

      try {

        const res = await fetch(
          `${API_BASE}/api/top-deals`
        );

        // const data = await res.json();

        if (!res.ok) {
          throw new Error("API Failed");
        }

        const data = await res.json();

        const items = Array.isArray(data.products)
          ? data.products
          : [];

        // ONLY OFFER PRODUCTS
        // const filtered = items.filter(
        //   (p) => p && p.has_offer
        // );

        // setProducts(filtered);

        setProducts(items || []);

        // if (filtered.length > 0) {
        //   fetchRatings(filtered);
        // }

      } catch (err) {

        console.error(
          "PRODUCT FETCH ERROR:",
          err
        );

      }
    };

    loadProducts();

  }, []);

  // const fetchRatings = async (products) => {
  //   try {
  //     const ratingData = {};

  //     await Promise.all(
  //       products.map(async (p) => {
  //         try {

  //           // const res = await fetch(
  //           //   '${API_BASE}/api/reviews/products/${p.id}'
  //           // );

  //           const res = await fetch(
  //             `${API_BASE}/api/reviews/product/${p.id}`
  //           );
  //           const data = await res.json();

  //           if (data.length > 0) {
  //             const total = data.reduce((sum, r) => sum + r.rating, 0);
  //             ratingData[p.id] = total / data.length;
  //           } else {
  //             ratingData[p.id] = 0;
  //           }
  //         } catch {
  //           ratingData[p.id] = 0;
  //         }
  //       })
  //     );

  //     setRatings(ratingData);
  //   } catch (err) {
  //     console.error("Rating fetch error:", err);
  //   }
  // };

  /* ================= ADD TO CART (LIKE SECOND FILE) ================= */
  const addToCart = (item) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login");
      return;
    }

    axios.post(
      `${API_BASE}/api/cart/add`,
      {
        product_id: item.id,
        quantity: 1,
        price: item.price_numeric || parsePrice(item.price),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then(() => {
      alert("Added to cart 🛒");
    })
    .catch((err) => {
      console.error("CART ERROR", err);
      alert("Backend error");
    });
  };

  return (
    <>
    <style>
    {`
      .mm-product-card {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .mm-product-img {
        width: 100%;
        height: 160px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fff;
      }

      .mm-product-img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .mm-product-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .mm-product-title {
        min-height: 52px;
        display: block;
      }
    `}
    </style>
      <section className="best_sell popular_products mt_100 xs_mt_80">
        <div className="container">

          {/* HEADING */}
          <div className="row">
            <div className="col-xl-5 m-auto">
              <div className="section_heading text-center heading_left mb_25 m-auto">
                <h4 className="premium_badge text-white">
                  🔥 Best Selling Offers
                </h4>
                <h2 className="premium_title">Top Deals For You</h2>
              </div>
            </div>
          </div>

          <div className="row mt-5">

            {/* LEFT BANNER */}
            <div className="col-xl-3 col-md-6 col-lg-4">
              <div className="special_product_banner">
                <img src={bannerImg} alt="special" className="img-fluid w-100" />
                <div className="text">
                  <h5>Hot Deals</h5>
                  <h3>Save Big on Today’s Offers</h3>
                  <Link to="/ShopDetails" className="common_btn">
                    shop now <i className="fas fa-long-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>

            {/* PRODUCT SLIDER */}
            <div className="col-xl-9 col-md-6 col-lg-8">
            {/* <div className="col-xl-9 col-md-12 col-lg-8"> */}
              <Swiper
                key={products.length}
                modules={[Navigation, Autoplay]}
                slidesPerView={4}
                slidesPerGroup={1}
                spaceBetween={12}
                speed={700}
                observer={true}
                observeParents={true}
                watchOverflow={true}
                centeredSlides={false}
                // loopFillGroupWithBlank={false}
                navigation={products.length > 4}
                loop={products.length > 4}
                autoplay={
                  products.length > 1
                    ? {
                        delay: 2200,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                      }
                    : false
                }
                breakpoints={{
                  0: {
                    slidesPerView: 1,
                  },
                  576: {
                    slidesPerView: 2,
                  },
                  768: {
                    slidesPerView: 2,
                  },
                  992: {
                    slidesPerView: 3,
                  },
                  1200: {
                    slidesPerView: 4,
                  },
                }}
                className="best_sell_slider"
              >
                {/* {products.map((p) => { */}
                {Array.isArray(products) && products.map((p, index) => {

                  const price =
                    p.price_numeric ??
                    p.selling_price ??
                    parsePrice(p.price);

                  const old =
                    p.old_price_numeric ??
                    p.mrp ??
                    parsePrice(p.old_price);

                  // const discount =
                  //   old > price
                  //     ? Math.round(((old - price) / old) * 100)
                  //     : 0;

                  const offerType =
                    (p.offer_type || "").toLowerCase();

                  const hasOffer =
                    p.has_offer ||
                    !!offerType ||
                    Number(p.discount_percentage) > 0 ||
                    Number(p.flat_amount) > 0 ||
                    Number(p.buy_quantity) > 0;

                  const hasPercentageOffer =
                    offerType === "percentage";

                  const hasFlatOffer =
                    offerType === "flat";

                  const hasBogoOffer =
                    offerType === "bogo";

                  const discount =
                    Number(p.discount_percentage || 0);

                  return (
                    // <SwiperSlide key={p.id}>
                    <SwiperSlide key={`${p.id}-${index}`}>
                      <div className="mm-product-card">

                        {/* DISCOUNT */}
                        {/* {discount > 0 && (
                          <span className="mm-discount-badge">
                            {discount}% OFF
                          </span>
                        )} */}

                        {hasOffer && (
                          <span className="mm-discount-badge">

                            {hasPercentageOffer &&
                              `${discount}% OFF`}

                            {hasFlatOffer &&
                              `${getCurrencySymbol(p.currency)}
                              ${Number(p.flat_amount)}
                              OFF`}

                            {hasBogoOffer &&
                              `BUY ${Number(
                                p.buy_quantity || 1
                              )} GET ${Number(
                                p.get_quantity || 1
                              )}`}

                            {!hasPercentageOffer &&
                              !hasFlatOffer &&
                              !hasBogoOffer &&
                              "SPECIAL OFFER"}

                          </span>
                        )}

                        {/* IMAGE */}
                        <div className="mm-product-img">
                        <img
                          loading="lazy"
                          decoding="async"
                          src={
                            p.img1 && p.img1.trim() !== ""
                              ? p.img1.startsWith("http")
                                ? p.img1
                                : `${API_BASE}/${p.img1}`
                              : null
                          }
                          alt={p.name}
                          onError={(e) => {
                            console.log("Image failed:", p.img1);
                            e.target.style.display = "none";
                          }}
                        />
                        </div>

                        {/* CONTENT */}
                        <div className="mm-product-content">

                          {/* RATING */}
                          {/* <div className="mm-rating">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <FaStar
                                key={i}
                                className={
                                  i < Math.floor(p.rating || 4) ? "active" : ""
                                }
                              />
                            ))}
                          </div> */}

                          {/* RATING */}
                          <div
                            className="mm-rating"
                          >
                            {Array.from({ length: 5 }).map((_, i) => (
                              <FaStar
                                key={i}
                                color={
                                  // i < Math.round(ratings[p.id] || 0)
                                  i <  4
                                    ? "#f59e0b"
                                    : "#d1d5db"
                                }
                                size={13}
                              />
                            ))}

                            <span
                              
                            >
                              {/* ({(ratings[p.id] || 0).toFixed(1)}) */}
                              (4.0)
                            </span>
                          </div>

                          {/* TITLE */}
                          <Link
                            to={`/shopdetails/${p.id}`}
                            className="mm-product-title"
                          >
                            {p.name}
                          </Link>

                          {/* PRICE */}
                          {/* <div className="mm-price">
                            <span className="mm-new">
                              QAR {price}
                            </span>

                            {old > price && (
                              <span className="mm-old">
                                QAR {old}
                              </span>
                            )}
                          </div> */}
                          
                          <div className="mm-price">

                            <span className="mm-new">
                              {
                                formatPrice(
                                  p.discounted_price || price,
                                  p.currency
                                )
                              }
                            </span>

                            {hasOffer &&
                            Number(p.original_price || price) >
                            Number(p.discounted_price || price) && (
                              <span className="mm-old">
                                {
                                  formatPrice(
                                    p.original_price || price,
                                    p.currency
                                  )
                                }
                              </span>
                            )}

                          </div>

                          {/* ACTIONS */}
                          <div className="mm-actions">

                            {/* ADD TO CART */}
                            <button
                              onClick={() => addToCart(p)}
                            
                            >
                              <FaShoppingCart />
                            </button>

                            {/* VIEW */}
                            <Link to={`/shopdetails/${p.id}`}>
                              <FaEye />
                            </Link>

                          </div>

                        </div>
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default BestSellProducts;