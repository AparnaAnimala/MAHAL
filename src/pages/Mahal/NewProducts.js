// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { FaStar, FaShoppingCart, FaEye, FaHeart } from "react-icons/fa";
// import axios from "axios";

// const API_BASE = "http://192.168.2.9:5000";
// const ITEMS_PER_PAGE = 12;

// const NewProducts = () => {
//   const [products, setProducts] = useState([]);
//   const [startIndex, setStartIndex] = useState(0);
//   const [ratings, setRatings] = useState({}); // ✅ NEW

//   /* ================= FETCH ================= */
// useEffect(() => {
//   fetch(`${API_BASE}/api/trending`)
//     .then((res) => res.json())
//     .then((data) => {
//       const items = data.products || [];

//       const mapped = items.map((item) => ({
//         id: item.id,
//         title: item.name,
//         price: item.price_numeric || 0,
//         rating: item.rating || 4,
//         img:
//           item.img1 && item.img1.trim() !== ""
//             ? item.img1.startsWith("http")
//               ? item.img1
//               : `${API_BASE}/${item.img1}`
//             : null,
//       }));

//       setProducts(mapped);
//       fetchRatings(mapped);
//     })
//     .catch((err) => {
//       console.error("❌ Trending API error:", err);
//     });
// }, []);

//   /* ================= FETCH RATINGS ================= */
// const fetchRatings = async (products) => {
//   try {
//     const ratingData = {};

//     await Promise.all(
//       products.map(async (p) => {
//         try {
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
//   /* ================= AUTO CHANGE ================= */
//   useEffect(() => {
//     if (products.length <= ITEMS_PER_PAGE) return;

//     const interval = setInterval(() => {
//       setStartIndex((prev) => {
//         const next = prev + ITEMS_PER_PAGE;
//         return next >= products.length ? 0 : next;
//       });
//     }, 10800000);

//     return () => clearInterval(interval);
//   }, [products]);

//   /* ================= ADD TO CART ================= */
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
//         price: item.price,
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
//       console.error("ADD TO CART ERROR", err);
//       alert("Backend error");
//     });
//   };

//   /* ================= ADD TO WISHLIST ================= */
//   const addToWishlist = (item) => {
//     const token = localStorage.getItem("token");

//     if (!token) {
//       alert("Please login");
//       return;
//     }

//     axios.post(
//       `${API_BASE}/api/wishlist/add`,
//       {
//         product_id: item.id,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     )
//     .then(() => {
//       alert("Added to wishlist ❤️");
//     })
//     .catch((err) => {
//       if (err.response?.status === 409) {
//         alert("Already in wishlist");
//       } else {
//         console.error("WISHLIST ERROR", err);
//         alert("Wishlist backend error");
//       }
//     });
//   };

//   /* ================= VISIBLE PRODUCTS ================= */
//   const visibleProducts = products.slice(
//     startIndex,
//     startIndex + ITEMS_PER_PAGE
//   );

//   return (
//     <section className="trending_products bg1">
//       <div className="container">

//         <div className="row">
//           <div className="col-xl-6 m-auto text-center">
//             <div className="section_heading mb-3">
//               <h4 className="premium_badge text-white">
//                 Trending Now
//               </h4>
//               <h2 className="premium_title">
//                 Discover what people are loving today
//               </h2>
//             </div>
//           </div>
//         </div>

//         <div className="row mt-4">
//           {visibleProducts.length === 0 ? (
//             <p className="text-center">Loading products...</p>
//           ) : (
//             visibleProducts.map((item) => {
//               const ratingValue = ratings[item.id] || 0; // ✅ NEW

//               return (
//                 <div
//                   key={item.id}
//                   className="col-xl-2 col-lg-3 col-sm-6 mb-4"
//                 >

//                   <div className="mm-trending-card">

//                     <span className="mm-trend-tag new">New</span>

//                     <div className="mm-trending-img">
//                      <img
//                       src={
//                         item.img && item.img.trim() !== ""
//                           ? item.img.startsWith("http")
//                             ? item.img
//                             : `${API_BASE}/${item.img}`
//                           : null
//                       }
//                       alt={item.title}
//                       onError={(e) => {
//                         console.log("Image failed:", item.img);
//                         e.target.style.display = "none";
//                       }}
//                     />
//                     </div>

//                     <div className="mm-trend-actions">

//                       <button onClick={() => addToCart(item)}>
//                         <FaShoppingCart />
//                       </button>

//                       <Link to={`/shopdetails/${item.id}`}>
//                         <FaEye />
//                       </Link>

//                       <button onClick={() => addToWishlist(item)}>
//                         <FaHeart />
//                       </button>

//                     </div>

//                     <div className="mm-trending-info">
//                       <h4>{item.title}</h4>

//                       {/* ✅ UPDATED RATING */}
//                       <div className="mm-trend-rating">
//                         {Array.from({ length: 5 }).map((_, i) => (
//                           <FaStar
//                             key={i}
//                             color={
//                               i < Math.round(ratingValue)
//                                 ? "#f59e0b"
//                                 : "#e5e7eb"
//                             }
//                           />
//                         ))}

//                         <span className="ms-1 text-muted">
//                           ({ratingValue.toFixed(1)})
//                         </span>
//                       </div>

//                       <div className="mm-price">
//                         QAR{item.price.toFixed(2)}
//                       </div>

//                       <Link
//                         to={`/shopdetails/${item.id}`}
//                         className="add_cart_btn"
//                       >
//                         View Product
//                       </Link>

//                     </div>

//                   </div>

//                 </div>
//               );
//             })
//           )}
//         </div>

//       </div>
//     </section>
//   );
// };

// export default NewProducts;




import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaShoppingCart, FaEye, FaHeart } from "react-icons/fa";
import axios from "axios";
import { formatPrice, getCurrencySymbol } from "../../utils/currency";

const API_BASE = "http://192.168.2.9:5000";
const ITEMS_PER_PAGE = 12;

const NewProducts = () => {
  const [products, setProducts] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [ratings, setRatings] = useState({}); // ✅ NEW

  /* ================= FETCH ================= */
  useEffect(() => {
    fetch(`${API_BASE}/api/trending`)
      .then((res) => res.json())
      .then((data) => {
        const items = data.products || [];

        const mapped = items.map((item) => ({
          id: item.id,
          title: item.name,
          price: item.price_numeric || 0,
          currency: item .currency || "QAR",
          rating: item.rating || 4,
          img:
            item.img1 && item.img1.trim() !== ""
              ? item.img1.startsWith("http")
                ? item.img1
                : `${API_BASE}/${item.img1}`
              : null,
        }));

        setProducts(mapped);
        fetchRatings(mapped);
      })
      .catch((err) => {
        console.error("❌ Trending API error:", err);
      });
  }, []);

  /* ================= FETCH RATINGS ================= */
  const fetchRatings = async (products) => {
    try {
      const ratingData = {};

      await Promise.all(
        products.map(async (p) => {
          try {
            const res = await fetch(
              `${API_BASE}/api/reviews/product/${p.id}`
            );
            const data = await res.json();

            if (data.length > 0) {
              const total = data.reduce((sum, r) => sum + r.rating, 0);
              ratingData[p.id] = total / data.length;
            } else {
              ratingData[p.id] = 0;
            }
          } catch {
            ratingData[p.id] = 0;
          }
        })
      );

      setRatings(ratingData);
    } catch (err) {
      console.error("Rating fetch error:", err);
    }
  };

  /* ================= AUTO CHANGE ================= */
  useEffect(() => {
    if (products.length <= ITEMS_PER_PAGE) return;

    const interval = setInterval(() => {
      setStartIndex((prev) => {
        const next = prev + ITEMS_PER_PAGE;
        return next >= products.length ? 0 : next;
      });
    }, 10800000);

    return () => clearInterval(interval);
  }, [products]);

  /* ================= ADD TO CART ================= */
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
        price: item.price,
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
      console.error("ADD TO CART ERROR", err);
      alert("Backend error");
    });
  };

  /* ================= ADD TO WISHLIST ================= */
  const addToWishlist = (item) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login");
      return;
    }

    axios.post(
      `${API_BASE}/api/wishlist/add`,
      {
        product_id: item.id,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then(() => {
      alert("Added to wishlist ❤️");
    })
    .catch((err) => {
      if (err.response?.status === 409) {
        alert("Already in wishlist");
      } else {
        console.error("WISHLIST ERROR", err);
        alert("Wishlist backend error");
      }
    });
  };

  /* ================= VISIBLE PRODUCTS ================= */
  const visibleProducts = products.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <>
      <style>
        {`
          .mm-trending-img {
            width: 100%;
            height: 220px;   /* same fixed height */
            overflow: hidden;

            display: flex;
            align-items: center;
            justify-content: center;

            background: #fff;
          }

          .mm-trending-img img {
            width: 100%;
            height: 100%;

            object-fit: contain;   /* full image visible */
            /* object-fit: cover; */ /* use this if you want crop-fill */

            transition: 0.3s;
          }

          .mm-trending-card {
            height: 100%;
          }

          .mm-trending-info h4 {
            min-height: 48px;
          }
        `}
      </style>
      <section className="trending_products bg1">
        <div className="container">

          <div className="row">
            <div className="col-xl-6 m-auto text-center">
              <div className="section_heading mb-3">
                <h4 className="premium_badge text-white">
                  Trending Now
                </h4>
                <h2 className="premium_title">
                  Discover what people are loving today
                </h2>
              </div>
            </div>
          </div>

          <div className="row mt-4">
            {visibleProducts.length === 0 ? (
              <p className="text-center">Loading products...</p>
            ) : (
              visibleProducts.map((item) => {
                const ratingValue = ratings[item.id] || 0; // ✅ NEW

                return (
                  <div
                    key={item.id}
                    className="col-xl-2 col-lg-3 col-sm-6 mb-4"
                  >

                    <div className="mm-trending-card">

                      <span className="mm-trend-tag new">New</span>

                      <div className="mm-trending-img">
                      <img
                        src={
                          item.img && item.img.trim() !== ""
                            ? item.img.startsWith("http")
                              ? item.img
                              : `${API_BASE}/${item.img}`
                            : null
                        }
                        alt={item.title}
                        onError={(e) => {
                          console.log("Image failed:", item.img);
                          e.target.style.display = "none";
                        }}
                      />
                      </div>

                      <div className="mm-trend-actions">

                        <button onClick={() => addToCart(item)}>
                          <FaShoppingCart />
                        </button>

                        <Link to={`/shopdetails/${item.id}`}>
                          <FaEye />
                        </Link>

                        <button onClick={() => addToWishlist(item)}>
                          <FaHeart />
                        </button>

                      </div>

                      <div className="mm-trending-info">
                        <h4>{item.title}</h4>

                        {/* ✅ UPDATED RATING */}
                        <div className="mm-trend-rating">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FaStar
                              key={i}
                              color={
                                i < Math.round(ratingValue)
                                  ? "#f59e0b"
                                  : "#e5e7eb"
                              }
                            />
                          ))}

                          <span className="ms-1 text-muted">
                            ({ratingValue.toFixed(1)})
                          </span>
                        </div>

                        <div className="mm-price">
                          {/* QAR{item.price.toFixed(2)} */}
                          {formatPrice(item.price, item.currency)}
                        </div>

                        <Link
                          to={`/shopdetails/${item.id}`}
                          className="add_cart_btn"
                        >
                          View Product
                        </Link>

                      </div>

                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      </section>
    </>
  );
};

export default NewProducts;