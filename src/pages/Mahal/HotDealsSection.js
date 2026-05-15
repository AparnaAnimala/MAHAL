// import React, { useEffect, useState } from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Autoplay } from "swiper/modules";
// import "swiper/css";

// /* IMAGES */
// import rice from "../../images/product_img_1.jpg";
// import spices from "../../images/product_img_2.jpg";
// import meat from "../../images/product_img_3.jpg";
// import dairy from "../../images/product_img_3.jpg";
// import kitchen from "../../images/product_img_4.jpg";
// import packaging from "../../images/product_img_5.jpg";
// import bulk from "../../images/product_img_6.jpg";
// import supplier from "../../images/product_img_7.jpg";

// const deals = [
//   { img: rice, name: "Basmati Rice 25kg", old: 2400, price: 1950, off: 18 },
//   { img: spices, name: "Garam Masala 5kg", old: 1200, price: 950, off: 20 },
//   { img: meat, name: "Frozen Chicken 10kg", old: 2800, price: 2250, off: 19 },
//   { img: dairy, name: "Bulk Butter 5kg", old: 1500, price: 1200, off: 15 },
//   { img: kitchen, name: "Chef Knife Set", old: 2200, price: 1800, off: 18 },
//   { img: packaging, name: "Food Containers 500pcs", old: 900, price: 720, off: 20 },
//   { img: bulk, name: "Storage Drums", old: 1800, price: 1500, off: 17 },
//   { img: supplier, name: "Cleaning Kit Combo", old: 1100, price: 850, off: 22 },
// ];

// const HotDealsCarousel = () => {
//   const [timeLeft, setTimeLeft] = useState(3600);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const formatTime = (sec) => {
//     const h = Math.floor(sec / 3600);
//     const m = Math.floor((sec % 3600) / 60);
//     const s = sec % 60;
//     return `${h}h ${m}m ${s}s`;
//   };

//   return (
//     <section className="flash-sale-section">
//       <div className="container">

//         <div className="flash-header">
//           <div>
//             <span className="flash-badge">🔥 Bulk Flash Sale</span>
//             <h2>Limited Time Procurement Deals</h2>
//           </div>
//           <div className="flash-timer">
//             ⏳ Ends in: {formatTime(timeLeft)}
//           </div>
//         </div>

//         <Swiper
//   spaceBetween={25}
//   autoplay={{ delay: 2500 }}
//   loop={true}
//   modules={[Autoplay]}
//   breakpoints={{
//     320:  { slidesPerView: 1.2 },
//     480:  { slidesPerView: 2 },
//     576:  { slidesPerView: 3 },
//     768:  { slidesPerView: 4 },
//     992:  { slidesPerView: 5 },
//     1400: { slidesPerView: 6 },   // 👈 Large desktop ki 6
//   }}
// >

//           {deals.map((item, i) => (
//           <SwiperSlide key={i}>
//   <div className="offer-card">

//     {/* SVG Discount Ribbon */}
//     <div className="discount-ribbon">
//      <svg width="39" height="38" viewBox="0 0 29 28" xmlns="http://www.w3.org/2000/svg">
//   <defs>
//     <linearGradient id="orangeGradient" x1="0" y1="0" x2="1" y2="1">
//       <stop offset="0%" stopColor="#FF8C00" />
//       <stop offset="100%" stopColor="#FF3D00" />
//     </linearGradient>
//   </defs>
//   <path
//     d="M28.9499 0C28.3999 0 27.9361 1.44696 27.9361 2.60412V27.9718L24.5708 25.9718L21.2055 27.9718L17.8402 25.9718L14.4749 27.9718L11.1096 25.9718L7.74436 27.9718L4.37907 25.9718L1.01378 27.9718V2.6037C1.01378 1.44655 0.549931 0 0 0H28.9499Z"
//     fill="url(#orangeGradient)"
//   />
// </svg>

//       <span>{item.off}%</span>
//     </div>

//     <div className="offer-image-wrapper">
//       <img src={item.img} alt={item.name} />
//     </div>

//     <h6 className="offer-title">{item.name}</h6>

//     <div className="price-section">
//       <div>
//         <span className="new-price">QAR{item.price}</span>
//         <span className="old-price">QAR{item.old}</span>
//       </div>

//       <button className="add-btn">ADD</button>
//     </div>

//   </div>
// </SwiperSlide>


//           ))}
//         </Swiper>

//       </div>
//     </section>
//   );
// };

// export default HotDealsCarousel;


















import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import axios from "axios";

const API = "http://192.168.2.9:5000/api";

const HotDealsCarousel = () => {
  const [deals, setDeals] = useState([]);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [maxDiscount, setMaxDiscount] = useState(0);

  // ⏳ TIMER
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 🔥 FETCH DEALS
  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const res = await axios.get(`${API}/gridlist`);
      const products = res.data.products || [];

      // ✅ FILTER VALID OFFERS
      const offersOnly = products.filter((p) => {
        if (!p.offer_type) return false;

        const type = p.offer_type.toLowerCase();

        if (type === "percentage" && p.discount_percentage > 0) return true;
        if (type === "flat" && p.flat_amount > 0) return true;
        if (type === "bogo" && p.buy_quantity > 0) return true;

        return false;
      });

      setDeals(offersOnly);

      // 🔥 MAX DISCOUNT
      let max = 0;
      offersOnly.forEach((item) => {
        if (item.discount_percentage) {
          max = Math.max(max, item.discount_percentage);
        }
      });

      setMaxDiscount(max);

    } catch (err) {
      console.error("❌ Deals fetch error:", err);
    }
  };

  // 💰 PRICE CALCULATION
  const getDiscountedPrice = (item) => {
    let price = item.price_numeric;
    const type = item.offer_type?.toLowerCase();

    if (type === "percentage" && item.discount_percentage > 0) {
      return Math.round(price - (price * item.discount_percentage) / 100);
    }

    if (type === "flat" && item.flat_amount > 0) {
      return Math.max(price - item.flat_amount, 0);
    }

    return price;
  };

  // 🛒 ADD TO CART
  const handleAddToCart = async (item) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Login required bro");
        return;
      }

      await axios.post(
        `${API}/cart/add`,
        {
          product_id: item.id || item.product_id,
          quantity: 1,
          price: item.price_numeric,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("✅ Added to cart");

    } catch (err) {
      console.error("❌ ERROR:", err.response?.data || err);
      alert(err?.response?.data?.error || "Add to cart failed");
    }
  };

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <section className="flash-sale-section">
      <div className="container">

        {/* HEADER */}
        <div className="flash-header">
          <div>
            <span className="flash-badge">
              🔥 Up to {maxDiscount}% OFF
            </span>
            <h2>Limited Time Procurement Deals</h2>
          </div>
          <div className="flash-timer">
            ⏳ Ends in: {formatTime(timeLeft)}
          </div>
        </div>

        {/* SWIPER */}
        <Swiper
          spaceBetween={25}
          autoplay={{ delay: 2500 }}
          loop={true}
          modules={[Autoplay]}
          breakpoints={{
            320: { slidesPerView: 1.2 },
            480: { slidesPerView: 2 },
            576: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            992: { slidesPerView: 5 },
            1400: { slidesPerView: 6 },
          }}
        >

          {deals.map((item, i) => {
            const newPrice = getDiscountedPrice(item);
            const oldPrice = item.price_numeric;
            const type = item.offer_type?.toLowerCase();

            return (
              <SwiperSlide key={i}>
                <div className="offer-card">

                    {/* 🔥 SVG RIBBON (ALL OFFERS) */}
                  <div className="discount-ribbon">
                    <svg width="39" height="38" viewBox="0 0 29 28">
                      <defs>
                        <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#FF8C00" />
                          <stop offset="100%" stopColor="#FF3D00" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M28.9499 0C28.3999 0 27.9361 1.44696 27.9361 2.60412V27.9718L24.5708 25.9718L21.2055 27.9718L17.8402 25.9718L14.4749 27.9718L11.1096 25.9718L7.74436 27.9718L4.37907 25.9718L1.01378 27.9718V2.6037C1.01378 1.44655 0.549931 0 0 0H28.9499Z"
                        fill={`url(#grad-${i})`}
                      />
                    </svg>

                    <span>
                      {type === "percentage" && `${Math.round(item.discount_percentage)}%`}
                      {type === "flat" && `QAR ${item.flat_amount}`}
                      {type === "bogo" && `BUY ${item.buy_quantity}`}
                    </span>
                  </div>

                  {/* IMAGE */}
                  <div className="offer-image-wrapper">
                    <img
                      src={item.img1 || "https://via.placeholder.com/150"}
                      alt={item.name}
                    />
                  </div>

                  {/* TITLE */}
                  <h6 className="offer-title">{item.name}</h6>

                  {/* PRICE */}
                  <div className="price-section">
                    <div>
                      <span className="new-price">
                        QAR {newPrice}
                      </span>

                      {oldPrice > newPrice && (
                        <span className="old-price">
                          QAR {oldPrice}
                        </span>
                      )}
                    </div>

                    <button
                      className="add-btn"
                      onClick={() => handleAddToCart(item)}
                    >
                      ADD
                    </button>
                  </div>

                </div>
              </SwiperSlide>
            );
          })}

        </Swiper>

      </div>
    </section>
  );
};

export default HotDealsCarousel;











// import React, { useEffect, useState } from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Autoplay } from "swiper/modules";
// import "swiper/css";
// import axios from "axios";

// const API = "http://192.168.2.9:5000/api";

// const HotDealsCarousel = () => {
//   const [deals, setDeals] = useState([]);
//   const [timeLeft, setTimeLeft] = useState(3600);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     fetchDeals();
//   }, []);

//   const fetchDeals = async () => {
//     try {
//       const res = await axios.get(`${API}/gridlist`);
//       const products = res.data.products || [];

//       // ✅ ALL OFFERS (percentage + flat + bogo)
//       const offersOnly = products.filter((p) => {
//         const type = p.offer_type?.toLowerCase();

//         return (
//           (type === "percentage" && p.discount_percentage > 0) ||
//           (type === "flat" && p.flat_amount > 0) ||
//           (type === "bogo" && p.buy_quantity > 0)
//         );
//       });

//       setDeals(offersOnly);

//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // 💰 PRICE
//   const getDiscountedPrice = (item) => {
//     let price = item.price_numeric || 0;
//     const type = item.offer_type?.toLowerCase();

//     if (type === "percentage") {
//       return Math.round(price - (price * item.discount_percentage) / 100);
//     }

//     if (type === "flat") {
//       return price - item.flat_amount;
//     }

//     return price;
//   };

//   // 🛒 CART
//   const handleAddToCart = async (item) => {
//     const token = localStorage.getItem("token");

//     await axios.post(
//       `${API}/cart/add`,
//       {
//         product_id: item.id || item.product_id,
//         quantity: 1,
//         price: item.price_numeric,
//       },
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     alert("Added");
//   };

//   const formatTime = (sec) => {
//     const h = Math.floor(sec / 3600);
//     const m = Math.floor((sec % 3600) / 60);
//     const s = sec % 60;
//     return `${h}h ${m}m ${s}s`;
//   };

//   return (
//     <section className="flash-sale-section">
//       <div className="container">

//         <div className="flash-header">
//           <h2>Limited Time Procurement Deals</h2>
//           <div>⏳ {formatTime(timeLeft)}</div>
//         </div>

//         <Swiper spaceBetween={25} autoplay={{ delay: 2500 }} loop modules={[Autoplay]}>

//           {deals.map((item, i) => {
//             const newPrice = getDiscountedPrice(item);
//             const oldPrice = item.price_numeric;
//             const type = item.offer_type?.toLowerCase();

//             return (
//               <SwiperSlide key={i}>
//                 <div className="offer-card">

                  // {/* 🔥 SVG RIBBON (ALL OFFERS) */}
                  // <div className="discount-ribbon">
                  //   <svg width="39" height="38" viewBox="0 0 29 28">
                  //     <defs>
                  //       <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="1" y2="1">
                  //         <stop offset="0%" stopColor="#FF8C00" />
                  //         <stop offset="100%" stopColor="#FF3D00" />
                  //       </linearGradient>
                  //     </defs>
                  //     <path
                  //       d="M28.9499 0C28.3999 0 27.9361 1.44696 27.9361 2.60412V27.9718L24.5708 25.9718L21.2055 27.9718L17.8402 25.9718L14.4749 27.9718L11.1096 25.9718L7.74436 27.9718L4.37907 25.9718L1.01378 27.9718V2.6037C1.01378 1.44655 0.549931 0 0 0H28.9499Z"
                  //       fill={`url(#grad-${i})`}
                  //     />
                  //   </svg>

                  //   <span>
                  //     {type === "percentage" && `${Math.round(item.discount_percentage)}%`}
                  //     {type === "flat" && `QAR ${item.flat_amount}`}
                  //     {type === "bogo" && `BUY ${item.buy_quantity}`}
                  //   </span>
                  // </div>

//                   {/* IMAGE */}
//                   <div className="offer-image-wrapper">
//                     <img src={item.img1} alt={item.name} />
//                   </div>

//                   <h6>{item.name}</h6>

//                   {/* PRICE */}
//                   <div className="price-section">
//                     <span>QAR {newPrice}</span>
//                     {oldPrice > newPrice && <span>QAR {oldPrice}</span>}
//                     <button onClick={() => handleAddToCart(item)}>ADD</button>
//                   </div>

//                 </div>
//               </SwiperSlide>
//             );
//           })}

//         </Swiper>

//       </div>
//     </section>
//   );
// };

// export default HotDealsCarousel;