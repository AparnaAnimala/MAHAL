


// import React, { useEffect, useState } from "react";
// import axios from "axios";

// // ---------- Swiper ----------
// import { Swiper, SwiperSlide } from "swiper/react";
// import SwiperCore, { Navigation, Autoplay } from "swiper";

// import "swiper/css";
// import "swiper/css/navigation";

// // SwiperCore.use([Navigation, Autoplay]);

// const API_BASE_URL = "http://192.168.2.9:5000/api";
// const RESTAURANT_ID = 1;

// const RelatedProducts = ({ productId, onProductClick }) => {
//   const [products, setProducts] = useState([]);

//   /* ================= FETCH RELATED PRODUCTS ================= */
//   useEffect(() => {
//     if (!productId) return;

//     axios
//       .get(`${API_BASE_URL}/related?product_id=${productId}`)
//       .then((res) => {
//         setProducts(res.data.products || []);
//       })
//       .catch((err) => {
//         console.error("RELATED PRODUCTS ERROR", err);
//         setProducts([]);
//       });
//   }, [productId]);

//   /* ================= ADD TO CART ================= */
//   const addToCart = (e, item) => {
//     e.stopPropagation();

//     axios
//       .post(`${API_BASE_URL}/cart/add`, {
//         restaurant_id: RESTAURANT_ID,
//         product_id: item.id,
//         quantity: 1,
//         price: item.price_numeric,
//       })
//       .then(() => {
//         window.location.href = "/CartView";
//       })
//       .catch(() => {
//         alert("Add to cart failed");
//       });
//   };

//   /* ================= ADD TO WISHLIST ================= */
//   const addToWishlist = (e, item) => {
//     e.stopPropagation();

//     axios
//       .post(`${API_BASE_URL}/wishlist/add`, {
//         product_id: item.id,
//       })
//       .then(() => {
//         alert("Added to wishlist ❤️");
//       })
//       .catch(() => {
//         alert("Wishlist failed");
//       });
//   };

//   /* ================= QUICK VIEW (EYE) ================= */
//   const quickView = (e, item) => {
//     e.stopPropagation();
//     onProductClick(item.id); // same page update
//   };

//   if (!products.length) return null;

//   return (
//     <section className="related_product pt_95 xs_pt_75 pb-80">
//       <div className="container">

//         <Swiper
//           navigation
//           autoplay={{ delay: 3000, disableOnInteraction: false }}
//           spaceBetween={30}
//           slidesPerView={4}
//           breakpoints={{
//             0: { slidesPerView: 1 },
//             576: { slidesPerView: 2 },
//             992: { slidesPerView: 3 },
//             1200: { slidesPerView: 4 },
//           }}
//         >
//           {products.map((item) => (
//             <SwiperSlide key={item.id}>
//               <div
//                 className="single_product"
//                 style={{ cursor: "pointer" }}
//                 onClick={() => onProductClick(item.id)}
//               >
//                 {/* IMAGE */}
//                 <div className="single_product_img">
//                   <img
//                     src={item.img1}
//                     alt={item.name}
//                     className="img-fluid w-100"
//                   />

//                   <ul>
//                     <li>
//                       <a href="#">
//                         <i className="far fa-eye"></i>
//                       </a>
//                     </li>
//                     <li>
//                       <a href="#">
//                         <i className="far fa-heart"></i>
//                       </a>
//                     </li>
//                   </ul>
//                 </div>

//                 {/* TEXT */}
//                 <div className="single_product_text">
//                   <h5 className="title">{item.name}</h5>
//                   <p>{item.price}</p>

//                   <button
//                     className="cart_btn"
//                     disabled={item.stock === 0}
//                     onClick={(e) => addToCart(e, item)}
//                   >
//                     <i className="far fa-shopping-basket"></i>
//                     {item.stock === 0 ? " Out of Stock" : " Add To Cart"}
//                   </button>
//                 </div>
//               </div>
//             </SwiperSlide>
//           ))}
//         </Swiper>

//       </div>
//     </section>
//   );
// };

// export default RelatedProducts;





import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ---------- Swiper ----------
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const API_BASE_URL = "http://192.168.2.9:5000/api";
const RESTAURANT_ID = 1;

const RelatedProducts = ({ productId, onProductClick }) => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  /* ================= FETCH RELATED PRODUCTS ================= */
  useEffect(() => {
    if (!productId) return;

    axios
      .get(`${API_BASE_URL}/related?product_id=${productId}`)
      .then((res) => {
        setProducts(res.data.products || []);
      })
      .catch((err) => {
        console.error("RELATED PRODUCTS ERROR", err);
        setProducts([]);
      });
  }, [productId]);

  /* ================= ADD TO CART ================= */
const addToCart = (e, item) => {
  e.stopPropagation();

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login");
    return;
  }

  axios.post(
    `${API_BASE_URL}/cart/add`,
    {
      product_id: item.id,
      quantity: 1,
      price: item.price_numeric,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  .then(() => {
    const go = window.confirm("Added to cart 🛒\n\nGo to cart?");
    if (go) {
      navigate("/cartview");
    }
  })
  .catch((err) => {
    console.error("ADD TO CART ERROR", err);
    alert("Add to cart failed");
  });
};


  /* ================= ADD TO WISHLIST ================= */

const addToWishlist = (e, item) => {
  e.stopPropagation();

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login");
    return;
  }

  axios.post(
    `${API_BASE_URL}/wishlist/add`,
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
    const go = window.confirm("Added to wishlist ❤️\n\nGo to wishlist?");
    if (go) {
      navigate("/wishlist");
    }
  })
  .catch((err) => {
    if (err.response?.status === 409) {
      alert("Already in wishlist ❤️");
    } else {
      console.error("WISHLIST ERROR", err);
      alert("Wishlist failed");
    }
  });
};

  /* ================= QUICK VIEW (EYE ICON) ================= */
  const quickView = (e, item) => {
    e.stopPropagation();

    // update product above
    if (onProductClick) {
      onProductClick(item.id);
    }

    // 🔥 scroll page to TOP smoothly
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <section className="related_product pt_95 xs_pt_75 pb-80">
      <div className="container">

        <Swiper
          modules={[Navigation, Autoplay]}
          navigation
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          spaceBetween={30}
          slidesPerView={4}
          breakpoints={{
            0: { slidesPerView: 1 },
            576: { slidesPerView: 2 },
            992: { slidesPerView: 3 },
            1200: { slidesPerView: 4 },
          }}
        >
          {products.map((item) => (
            <SwiperSlide key={item.id}>
              <div
                className="single_product"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  navigate(`/shopdetails/${item.id}`)
                }
              >
                {/* IMAGE */}
                <div className="single_product_img">
                  <img
                    src={item.img1}
                    alt={item.name}
                    className="img-fluid w-100"
                  />

                  <ul>
                    <li>
                      <button
                        type="button"
                        className="icon_btn"
                        onClick={(e) => quickView(e, item)}
                      >
                        <i className="far fa-eye"></i>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="icon_btn"
                        onClick={(e) => addToWishlist(e, item)}
                      >
                        <i className="far fa-heart"></i>
                      </button>
                    </li>
                  </ul>
                </div>

                {/* TEXT */}
                <div className="single_product_text">
                  <h5 className="title">{item.name}</h5>
                  <p>{item.price}</p>

                  <button
                    className="cart_btn"
                    disabled={item.stock === 0}
                    onClick={(e) => addToCart(e, item)}
                  >
                    <i className="far fa-shopping-basket"></i>
                    {item.stock === 0 ? " Out of Stock" : " Add To Cart"}
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

      </div>
    </section>
  );
};

export default RelatedProducts;