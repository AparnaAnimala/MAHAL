// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
 
// const campaigns = [
//   {
//     id: 1,
//     tag: "SAVE UP TO QAR 5,000",
//     title: "PRICE DROP",
//     theme: "orange",
//     cta: "Shop Now",
//     route: "/restaurantoffers?type=pricedrop",
//     endsIn: 7200,
//     icon: "fa-solid fa-arrow-down",
//   },
//   {
//     id: 2,
//     tag: "72-HOUR",
//     title: "BEST SELLERS",
//     theme: "green",
//     cta: "Shop Now",
//     route: "/restaurantoffers?type=bestsellers",
//     endsIn: 3600,
//     icon: "fa-solid fa-fire",
//   },
//   {
//     id: 3,
//     tag: "HOME SALE",
//     title: "DOWN TO QAR 1,299",
//     theme: "purple",
//     cta: "Shop Now",
//     route: "/restaurantoffers?type=homesale",
//     endsIn: 5400,
//     icon: "fa-solid fa-house",
//   },
// ];

// const MahalCampaignTiles = () => {
//   const navigate = useNavigate();
//   const sliderRef = useRef(null);
//   const [timers, setTimers] = useState({});

//   /* COUNTDOWN */
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setTimers((prev) => {
//         const updated = {};
//         campaigns.forEach((c) => {
//           const v = prev[c.id] ?? c.endsIn;
//           updated[c.id] = v > 0 ? v - 1 : 0;
//         });
//         return updated;
//       });
//     }, 1000);
//     return () => clearInterval(interval);
//   }, []);

//   /* AUTO SLIDE – MOBILE ONLY */
//   useEffect(() => {
//     const el = sliderRef.current;
//     if (!el) return;

//     let index = 0;
//     const slide = setInterval(() => {
//       if (window.innerWidth > 768) return;
//       index = (index + 1) % campaigns.length;
//       el.scrollTo({
//         left: index * el.clientWidth,
//         behavior: "smooth",
//       });
//     }, 3500);

//     return () => clearInterval(slide);
//   }, []);

//   const format = (s) => {
//     const h = Math.floor(s / 3600);
//     const m = Math.floor((s % 3600) / 60);
//     const sec = s % 60;
//     return `${h}h ${m}m ${sec}s`;
//   };

//   return (
//     <section className="mm-campaign-wrap">
//       <div className="container">
//         <div className="mm-campaign-slider" ref={sliderRef}>
//           {campaigns.map((c) => (
//             <div
//               key={c.id}
//               className={`mm-campaign-card ${c.theme}`}
//               onClick={() => navigate(c.route)}
//             >
//               {/* TOP BADGES */}
//               <div className="mm-campaign-top">
//                 <span className="mm-ai-highlight">
                   
//                   Recommended by Mahal
//                 </span>

//                 <span className="mm-countdown-highlight">
//                   <i className="fa-regular fa-clock"></i>
//                   Ends in {format(timers[c.id] ?? c.endsIn)}
//                 </span>
//               </div>

//               {/* MAIN ICON */}
//               <div className="mm-campaign-icon">
//                 <i className={c.icon}></i>
//               </div>

//               {/* TAG */}
//               <span className="mm-campaign-tag">{c.tag}</span>

//               {/* TITLE */}
//               <h3>{c.title}</h3>

//               {/* CTA */}
//               <button>{c.cta} →</button>

//               {/* DECOR */}
//               <span className="mm-campaign-deco left" />
//               <span className="mm-campaign-deco right" />
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default MahalCampaignTiles;







import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const API = "http://192.168.2.9:5000/api";

const RestaurantOffers = () => {
  const [products, setProducts] = useState([]);
  const location = useLocation();

  // 🔥 GET QUERY PARAM
  const params = new URLSearchParams(location.search);
  const type = params.get("type");

  useEffect(() => {
    if (!type) return;

    fetch(`${API}/offers?type=${type}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("🔥 OFFERS DATA:", data);
        setProducts(data);
      })
      .catch((err) => console.error("❌ ERROR:", err));
  }, [type]);

  return (
    <div className="container mt-4">
      <h2>{type?.toUpperCase()} Offers</h2>

      <div className="row">
        {products.map((p) => (
          <div key={p.product_id} className="col-md-3 mb-3">
            <div className="card p-3 text-center">
              <img
                src={`${API}/image/${p.product_id}/0`}
                alt=""
                style={{ height: "150px", objectFit: "cover" }}
              />
              <h6>{p.product_name_english}</h6>
              <p>QAR  {p.price_per_unit}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantOffers;