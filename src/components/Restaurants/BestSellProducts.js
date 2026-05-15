
// dynamic

// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation, Autoplay } from "swiper/modules";

// import "swiper/css";
// import "swiper/css/navigation";

// import bannerImg from "../../images/special_pro_banner_img_3.jpg";

// const BestSellProducts = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch("http://192.168.2.9:5000/api/tab-products")
//       .then((res) => res.json())
//       .then((data) => {
//         setProducts(data.bestseller || []);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("API ERROR:", err);
//         setLoading(false);
//       });
//   }, []);

//   return (
//     <section className="best_sell popular_products mt_100 xs_mt_80 pt-80">
//       <div className="container">

//         <div className="row">
//           <div className="col-xl-5 m-auto">
//             <div className="section_heading text-center heading_left mb_25 m-auto">
//               <h4 className="premium_badge text-white">
//                 🔥 Best Sells Products
//               </h4>
//               <h2 className="premium_title">
//                 Organic Bestseller Product
//               </h2>
//             </div>
//           </div>
//         </div>

//         <div className="row">

//           <div className="col-xl-3 col-md-6 col-lg-4">
//             <div className="special_product_banner">
//               <img
//                 src={bannerImg}
//                 alt="special"
//                 className="img-fluid w-100"
//               />
//               <div className="text">
//                 <h5>Organic Food</h5>
//                 <h3>Fresh Foods Up To 45% Off</h3>
//                 <Link to="/CategorieList" className="common_btn">
//                   shop now <i className="fas fa-long-arrow-right"></i>
//                   <span></span>
//                 </Link>
//               </div>
//             </div>
//           </div>

//           <div className="col-xl-9 col-md-6 col-lg-8">
//             {loading ? (
//               <p className="text-center">Loading...</p>
//             ) : (
//               <Swiper
//                 modules={[Navigation, Autoplay]}
//                 slidesPerView={4}
//                 spaceBetween={10}
//                 navigation
//                 autoplay={{ delay: 3500 }}
//                 loop
//                 breakpoints={{
//                   0: { slidesPerView: 1 },
//                   576: { slidesPerView: 2 },
//                   768: { slidesPerView: 3 },
//                   1200: { slidesPerView: 4 },
//                 }}
//                 className="best_sell_slider"
//               >
//                 {products.map((p) => (
//                   <SwiperSlide key={p.id}>
//                     <div className="single_product">

//                       <div className="single_product_img">
//                         <img
//                           src={p.img1}
//                           alt={p.name}
//                           className="img-fluid w-100"
//                         />

//                         <ul>
//                           <li>
//                             <Link to="/Cart">
//                               <i className="fa fa-shopping-basket"></i>
//                             </Link>
//                           </li>
//                           <li>
//                             <Link to={`/ShopDetails/${p.id}`}>
//                               <i className="fa fa-eye"></i>
//                             </Link>
//                           </li>
//                         </ul>
//                       </div>

//                       <div className="single_product_text">
//                         <span className="rating">
//                           {Array.from({ length: 5 }).map((_, i) => (
//                             <i
//                               key={i}
//                               className={
//                                 i < p.rating
//                                   ? "fas fa-star"
//                                   : "far fa-star"
//                               }
//                             ></i>
//                           ))}
//                         </span>

//                         <Link to="/CategorieList" className="title">
//                           {p.name}
//                         </Link>

//                         <p>{p.price}</p>
//                       </div>

//                     </div>
//                   </SwiperSlide>
//                 ))}
//               </Swiper>
//             )}
//           </div>

//         </div>

//       </div>
//     </section>
//   );
// };

// export default BestSellProducts;







import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

/* ------------ STATIC IMAGES ------------ */
import bannerImg from "../../images/special_pro_banner_img_3.jpg";

import p1 from "../../images/product_img_1.jpg";
import p2 from "../../images/product_img_2.jpg";
import p3 from "../../images/product_img_3.jpg";
import p4 from "../../images/product_img_4.jpg";

const STATIC_IMAGES = [p1, p2, p3, p4];

const BestSellProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* 🔴 TEMP restaurant_id (login ayyaka replace cheyyi) */
  const restaurantId = 1;

  /* ------------ FETCH PRODUCTS ------------ */
  useEffect(() => {
    fetch("http://192.168.2.9:5000/api/tab-products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.bestseller || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("PRODUCT API ERROR:", err);
        setLoading(false);
      });
  }, []);

  /* ------------ ADD TO CART (BACKEND) ------------ */
  const addToCart = async (product) => {
    try {
      const res = await fetch("http://192.168.2.9:5000/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          product_id: product.id,
          quantity: 1,
          price: product.price_numeric,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to add to cart");
        return;
      }

      // ✅ CONFIRM POPUP
      const goToCart = window.confirm(
        "Product added to cart 🛒\n\nGo to cart page?"
      );

      if (goToCart) {
        navigate("/restaurantdashboard/cartview");
      }

    } catch (err) {
      console.error("ADD TO CART ERROR:", err);
      alert("Server error");
    }
  };

  /* ------------ VIEW PRODUCT ------------ */
  const viewProduct = (id) => {
    navigate(`/restaurantdashboard/shopdetails/${id}`);
  };

  return (
    <section className="best_sell popular_products mt_100 xs_mt_80 pt-80">
      <div className="container">

        {/* ---------- HEADING ---------- */}
        <div className="row">
          <div className="col-xl-5 m-auto">
            <div className="section_heading text-center heading_left mb_25 m-auto">
              <h4 className="premium_badge text-white">
                🔥 Best Sells Products
              </h4>
              <h2 className="premium_title">
                Organic Bestseller Product
              </h2>
            </div>
          </div>
        </div>

        <div className="row">

          {/* ---------- LEFT STATIC BANNER ---------- */}
          <div className="col-xl-3 col-md-6 col-lg-4">
            <div className="special_product_banner">
              <img
                src={bannerImg}
                alt="special"
                className="img-fluid w-100"
              />
              <div className="text">
                <h5>Organic Food</h5>
                <h3>Fresh Foods Up To 45% Off</h3>
                
                <Link
                to="/restaurantdashboard/categorielist"
                className="common_btn"
              >
                shop now <i className="fas fa-long-arrow-right"></i>
              </Link>

              </div>
            </div>
          </div>

          {/* ---------- PRODUCT SLIDER ---------- */}
          <div className="col-xl-9 col-md-6 col-lg-8">
            {loading ? (
              <p className="text-center">Loading...</p>
            ) : (
              <Swiper
                modules={[Navigation, Autoplay]}
                slidesPerView={4}
                spaceBetween={10}
                navigation
                autoplay={{ delay: 3500 }}
                loop
                breakpoints={{
                  0: { slidesPerView: 1 },
                  576: { slidesPerView: 2 },
                  768: { slidesPerView: 3 },
                  1200: { slidesPerView: 4 },
                }}
                className="best_sell_slider"
              >
                {products.map((p, index) => (
                  <SwiperSlide key={p.id}>
                    <div className="single_product">

                      <div className="single_product_img">
                        <img
                          src={STATIC_IMAGES[index % STATIC_IMAGES.length]}
                          alt={p.name}
                          className="img-fluid w-100"
                        />

                        <ul>
                          <li>
                            <button
                              className="icon_btn"
                              onClick={() => addToCart(p)}
                            >
                              <i className="fa fa-shopping-basket"></i>
                            </button>
                          </li>
                          <li>
                            <button
                              className="icon_btn"
                              onClick={() => viewProduct(p.id)}
                            >
                              <i className="fa fa-eye"></i>
                            </button>
                          </li>
                        </ul>
                      </div>

                      <div className="single_product_text">
                        <span className="rating">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <i
                              key={i}
                              className={
                                i < p.rating
                                  ? "fas fa-star"
                                  : "far fa-star"
                              }
                            ></i>
                          ))}
                        </span>

                        <Link
                            to={`/restaurantdashboard/shopdetails/${p.id}`}
                            className="title"
                          >

                          {p.name}
                        </Link>

                            
                        <p>{p.price}</p>
                      </div>

                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};

export default BestSellProducts;
