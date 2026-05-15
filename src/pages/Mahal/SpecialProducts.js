// import React from "react";
// import { Link } from "react-router-dom";
// import { FaStar, FaShoppingCart } from "react-icons/fa";

// /* IMAGE IMPORTS */
// import bannerImg from "../../images/special_pro_banner_img.jpg";
// import sp1 from "../../images/special_product_1.jpg";
// import sp2 from "../../images/special_product_2.jpg";
// import sp3 from "../../images/special_product_3.jpg";
// import sp4 from "../../images/special_product_4.jpg";
// import sp5 from "../../images/special_product_5.jpg";
// import sp6 from "../../images/special_product_6.jpg";

// const products = [
//   { img: sp1, title: "Butter Garlic Crab", price: "10.00", old: "12.00", discount: "70% OFF" },
//   { img: sp2, title: "Bengal Meat Bone", price: "13.00", old: "15.00" },
//   { img: sp3, title: "Three Carrot", price: "17.00", old: "20.00", discount: "40% OFF" },
//   { img: sp4, title: "Lemon Meat Bone", price: "29.00", old: "32.00", discount: "50% OFF" },
//   { img: sp5, title: "Orange Slice Mix", price: "20.00", old: "22.00" },
//   { img: sp6, title: "Carrot Vegetables", price: "16.00", old: "18.00", discount: "30% OFF" },
//   { img: sp1, title: "Butter Garlic Crab", price: "10.00", old: "12.00", discount: "80% OFF" },
//   { img: sp2, title: "Bengal Meat Bone", price: "13.00", old: "15.00" },
// ];

// const SpecialProducts = () => {
//   return (
//     <section className="mm-special-section pt-5 pb-5">
//       <div className="container">

//         {/* HEADING */}
//         <div className="text-center mb-5">
//           <span className="mm-section-badge">Special Products</span>
//           <h2 className="mm-section-title">Exclusive Deals for Your Kitchen</h2>
//         </div>

//         <div className="row g-4">

//           {/* LEFT PROMO BANNER */}
//           <div className="col-xl-4">
//             <div className="mm-special-banner">
//               <img src={bannerImg} alt="special banner" />
//               <div className="mm-special-overlay"></div>

//               <div className="mm-special-banner-content">
//                 <h4>Weekly Discounts</h4>
//                 <h3>Fresh Fruits & Vegetables</h3>
//                 <p>Save more when you buy in bulk.</p>
//                 <Link to="/ShopDetails" className="mm-special-btn">
//                   Shop Now →
//                 </Link>
//               </div>
//             </div>
//           </div>

//           {/* RIGHT PRODUCT GRID */}
//           <div className="col-xl-8">
//             <div className="row g-4">

//               {products.map((item, index) => (
//                 <div className="col-md-6 col-lg-3" key={index}>
//                   <div className="mm-special-card">

//                     {item.discount && (
//                       <span className="mm-discount-tag">
//                         {item.discount}
//                       </span>
//                     )}

//                     <div className="mm-special-img">
//                       <img src={item.img} alt={item.title} />
//                     </div>

//                     <div className="mm-special-content">
//                       <h5>{item.title}</h5>

//                       <div className="mm-rating">
//                         {[...Array(5)].map((_, i) => (
//                           <FaStar key={i} className="active" />
//                         ))}
//                       </div>

//                       <div className="mm-price">
//                         <span className="mm-new">${item.price}</span>
//                         <span className="mm-old">${item.old}</span>
//                       </div>

//                       <button className="mm-cart-btn">
//                         <FaShoppingCart /> Add
//                       </button>

//                     </div>
//                   </div>
//                 </div>
//               ))}

//             </div>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// };

// export default SpecialProducts;


import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaShoppingCart } from "react-icons/fa";
import axios from "axios";

/* IMAGE IMPORT */
import bannerImg from "../../images/special_pro_banner_img.jpg";


const API_BASE = "http://192.168.2.9:5000/api";

const SpecialProducts = () => {
  const [products, setProducts] = useState([]);
const [ratings, setRatings] = useState({});




  /* ================= FETCH FROM BACKEND ================= */

  useEffect(() => {
    fetch("http://192.168.2.9:5000/api/special-products")
      .then((res) => res.json())
      .then((data) => {
        if (data.products) {
          setProducts(data.products);
          fetchRatings(data.products);
        }
      })
      .catch((err) =>
        console.error("Error fetching special products:", err)
      );
  }, []);

  const fetchRatings = async (products) => {
  try {
    const ratingData = {};

    await Promise.all(
      products.map(async (p) => {
        const productId = p.id || p.product_id;

        try {
          const res = await fetch(
            `http://192.168.2.9:5000/api/reviews/product/${productId}`
          );
          const data = await res.json();

          if (data.length > 0) {
            const total = data.reduce((sum, r) => sum + r.rating, 0);
            ratingData[productId] = total / data.length;
          } else {
            ratingData[productId] = 0;
          }
        } catch {
          ratingData[productId] = 0;
        }
      })
    );

    setRatings(ratingData);
  } catch (err) {
    console.error("Rating fetch error:", err);
  }
};

  /* ================= ADD TO CART ================= */

  const addToCart = (product) => {
    console.log("PRODUCT:", product); // 🔥 debug

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login");
      return;
    }

    const productId = product.id || product.product_id;

    if (!productId) {
      alert("Invalid product ❌");
      console.error("BAD PRODUCT:", product);
      return;
    }

    axios
      .post(
        `${API_BASE}/cart/add`,
        {
          product_id: Number(productId),
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        console.log("SUCCESS:", res.data);
        alert("Added to cart ✅");
      })
      .catch((err) => {
        console.log("FULL ERROR:", err.response || err);

        alert(
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Backend error"
        );
      });
  };

  return (
    <section className="mm-special-section pt-5 pb-5">
      <div className="container">

        {/* HEADING */}
        <div className="text-center mb-5">
          <span className="mm-section-badge">Special Products</span>
          <h2 className="mm-section-title">Exclusive Deals for Your Kitchen</h2>
        </div>

        <div className="row g-4">

          {/* LEFT PROMO BANNER */}
          <div className="col-xl-4">
            <div className="mm-special-banner">
              <img src={bannerImg} alt="special banner" />
              <div className="mm-special-overlay"></div>

              <div className="mm-special-banner-content">
                <h4>Weekly Discounts</h4>
                <h3>Fresh Fruits & Vegetables</h3>
                <p>Save more when you buy in bulk.</p>
                <Link to="/CategorieList" className="mm-special-btn">
                  Shop Now →
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT PRODUCT GRID */}
          <div className="col-xl-8">
            <div className="row g-4">

                {products.slice(0, 8).map((item, index) => {
                  const productId = item.id || item.product_id;   // ✅ ADD
                  const ratingValue = ratings[productId] || 0;    // ✅ ADD

                  return (
                    <div className="col-md-6 col-lg-3" key={productId || index}>
                      <div className="mm-special-card">

                        {item.label && (
                          <span className="mm-discount-tag">
                            {item.label}
                          </span>
                        )}

                        <div className="mm-special-img">
                          <img
                            src={item.img1 || "/placeholder.jpg"}
                            alt={item.title || item.name}
                          />

                          <Link to={`/shopdetails/${productId}`}>
                            <i className="fa fa-eye"></i>
                          </Link>
                        </div>

                        <div className="mm-special-content">
                          <h5>{item.title || item.name}</h5>

                          {/* ✅ FIXED RATING */}
                          <div className="mm-rating">
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
                            <span className="mm-new">
                              QAR{item.price || item.price_per_unit}
                            </span>
                            {item.old && (
                              <span className="mm-old">{item.old}</span>
                            )}
                          </div>

                          <button
                            className="mm-cart-btn"
                            onClick={() => addToCart(item)}
                          >
                            <FaShoppingCart /> Add
                          </button>

                        </div>
                      </div>
                    </div>
                  );
                })}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SpecialProducts;