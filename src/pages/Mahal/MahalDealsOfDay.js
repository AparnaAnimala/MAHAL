// import React, { useEffect, useState } from "react";
 

// /* SAMPLE IMAGES */
// import rice from "../../images/product_img_1.jpg";
// import oil from "../../images/product_img_2.jpg";
// import chicken from "../../images/product_img_3.jpg";
// import spices from "../../images/product_img_4.jpg";

// const DEALS = [
//   {
//     id: 1,
//     title: "Premium Rice – Bulk Pack",
//     img: rice,
//     oldPrice: 4200,
//     price: 3499,
//     endsIn: 7200, // seconds
//   },
//   {
//     id: 2,
//     title: "Refined Cooking Oil",
//     img: oil,
//     oldPrice: 2100,
//     price: 1799,
//     endsIn: 5400,
//   },
//   {
//     id: 3,
//     title: "Frozen Chicken – Export Grade",
//     img: chicken,
//     oldPrice: 520,
//     price: 449,
//     endsIn: 3600,
//   },
//   {
//     id: 4,
//     title: "Whole Spices Combo",
//     img: spices,
//     oldPrice: 980,
//     price: 799,
//     endsIn: 6000,
//   },
//    {
//     id: 5,
//     title: "Premium Rice – Bulk Pack",
//     img: rice,
//     oldPrice: 4200,
//     price: 3499,
//     endsIn: 7200, // seconds
//   },
   
//   {
//     id: 8,
//     title: "Whole Spices Combo",
//     img: spices,
//     oldPrice: 980,
//     price: 799,
//     endsIn: 6000,
//   },
// ];

// const MahalDealsOfDay = () => {
//   const [timers, setTimers] = useState({});
//   const [cart, setCart] = useState({});

//   /* INIT TIMERS */
//   useEffect(() => {
//     const t = {};
//     DEALS.forEach((d) => (t[d.id] = d.endsIn));
//     setTimers(t);
//   }, []);

//   /* COUNTDOWN */
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setTimers((prev) => {
//         const next = { ...prev };
//         Object.keys(next).forEach((id) => {
//           if (next[id] > 0) next[id] -= 1;
//         });
//         return next;
//       });
//     }, 1000);

//     return () => clearInterval(interval);
//   }, []);

//   const format = (s) => {
//     const h = Math.floor(s / 3600);
//     const m = Math.floor((s % 3600) / 60);
//     const sec = s % 60;
//     return `${h}h ${m}m ${sec}s`;
//   };

//   const add = (d) =>
//     setCart((p) => ({ ...p, [d.id]: (p[d.id] || 0) + 1 }));
//   const remove = (d) =>
//     setCart((p) => {
//       const n = { ...p };
//       if (n[d.id] === 1) delete n[d.id];
//       else n[d.id] -= 1;
//       return n;
//     });

//   return (
//     <div className="container mt-5  ">
//       <div className="mm-deals-title">
//         <h2>Deals of the Day</h2>
//         <p>Limited-time offers from verified suppliers</p>
//       </div>

//       <div className="mm-deals-row">
//         {DEALS.map((d) => (
//           <div className="mm-deal-card" key={d.id}>
//             {/* TIMER – ALWAYS VISIBLE */}
//             <div className="mm-timer">
//               ⏰ Ends in {format(timers[d.id] || 0)}
//             </div>

//             <img src={d.img} alt={d.title} />

//             <h4>{d.title}</h4>

//             <div className="mm-price">
//               <span className="old">QAR {d.oldPrice}</span>
//               <span className="new">QAR {d.price}</span>
//             </div>

//             {!cart[d.id] ? (
//               <button
//                 className="mm-add"
//                 disabled={timers[d.id] === 0}
//                 onClick={() => add(d)}
//               >
//                 Add to Cart
//               </button>
//             ) : (
//               <div className="mm-stepper">
//                 <button onClick={() => remove(d)}>-</button>
//                 <span>{cart[d.id]}</span>
//                 <button onClick={() => add(d)}>+</button>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default MahalDealsOfDay;




// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const MahalDealsOfDay = () => {
//   const [deals, setDeals] = useState([]);
//   const [timers, setTimers] = useState({});
//   const [cart, setCart] = useState({});
//   const [loading, setLoading] = useState(true);

//   const fetchDeals = async () => {
//     try {
//       const res = await axios.get(
//         "http://192.168.2.9:5000/api/deals-of-the-day"
//       );

//       let apiData = [];

//       if (Array.isArray(res.data)) {
//         apiData = res.data;
//       } else if (res.data.products) {
//         apiData = res.data.products;
//       }

//       // 🔥 RANDOMIZE + TAKE 6 ONLY
//       const shuffled = [...apiData].sort(() => 0.5 - Math.random());
//       const selected = shuffled.slice(0, 6);

//       const formatted = selected.map((d, i) => ({
//         id: d.id || d.product_id,
//         title: d.name || d.product_name_english || "No Name",

//         img:
//           d.img1 ||
//           (d.product_id
//             ? `http://192.168.2.9:5000/api/image/${d.product_id}/0`
//             : "/fallback.png"),

//         oldPrice: d.old_price || 0,
//         price: d.price || d.price_per_unit || 0,

//         // 🔥 5 HOURS TIMER (same for all)
//         endsIn: 5 * 60 * 60,
//       }));

//       setDeals(formatted);

//       const t = {};
//       formatted.forEach((d) => (t[d.id] = d.endsIn));
//       setTimers(t);

//     } catch (err) {
//       console.error("❌ Deals fetch error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* 🔥 FIRST LOAD */
//   useEffect(() => {
//     fetchDeals();
//   }, []);

//   /* 🔥 AUTO REFRESH EVERY 5 HOURS */
//   useEffect(() => {
//     const interval = setInterval(() => {
//       fetchDeals(); // 🔥 reload new products
//     }, 5 * 60 * 60 * 1000); // 5 hours

//     return () => clearInterval(interval);
//   }, []);

//   /* 🔥 COUNTDOWN */
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setTimers((prev) => {
//         const next = { ...prev };
//         Object.keys(next).forEach((id) => {
//           if (next[id] > 0) next[id] -= 1;
//         });
//         return next;
//       });
//     }, 1000);

//     return () => clearInterval(interval);
//   }, []);

//   const format = (s) => {
//     const h = Math.floor(s / 3600);
//     const m = Math.floor((s % 3600) / 60);
//     const sec = s % 60;
//     return `${h}h ${m}m ${sec}s`;
//   };

//   const add = (d) =>
//     setCart((p) => ({ ...p, [d.id]: (p[d.id] || 0) + 1 }));

//   const remove = (d) =>
//     setCart((p) => {
//       const n = { ...p };
//       if (n[d.id] === 1) delete n[d.id];
//       else n[d.id] -= 1;
//       return n;
//     });

//   if (loading) return <p>Loading deals...</p>;

//   return (
//     <div className="container mt-5">
//       <div className="mm-deals-title">
//         <h2>Deals of the Day</h2>
//         <p>Limited-time offers from verified suppliers</p>
//       </div>

//       <div className="mm-deals-row">
//         {deals.map((d) => (
//           <div className="mm-deal-card" key={d.id}>
            
//             {/* 🔥 TIMER */}
//             <div className="mm-timer">
//               ⏰ Ends in {format(timers[d.id] || 0)}
//             </div>

//             {/* 🔥 IMAGE */}
//             <img
//               src={d.img}
//               alt={d.title}
//               onError={(e) => {
//                 e.target.onerror = null;
//                 e.target.src = "/fallback.png";
//               }}
//             />

//             <h4>{d.title}</h4>

//             {/* 🔥 PRICE */}
//             <div className="mm-price">
//               <span className="old">QAR {d.oldPrice}</span>
//               <span className="new">QAR {d.price}</span>
//             </div>

//             {/* 🔥 CART */}
//             {!cart[d.id] ? (
//               <button
//                 className="mm-add"
//                 disabled={timers[d.id] === 0}
//                 onClick={() => add(d)}
//               >
//                 Add to Cart
//               </button>
//             ) : (
//               <div className="mm-stepper">
//                 <button onClick={() => remove(d)}>-</button>
//                 <span>{cart[d.id]}</span>
//                 <button onClick={() => add(d)}>+</button>
//               </div>
//             )}

//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default MahalDealsOfDay;



import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE = "http://192.168.2.9:5000/api";

const MahalDealsOfDay = () => {
  const [deals, setDeals] = useState([]);
  const [timers, setTimers] = useState({});
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);

  /* ================= FETCH DEALS ================= */

  const fetchDeals = async () => {
    try {
      const res = await axios.get(
        "http://192.168.2.9:5000/api/deals-of-the-day"
      );

      let apiData = [];

      if (Array.isArray(res.data)) {
        apiData = res.data;
      } else if (res.data.products) {
        apiData = res.data.products;
      }

      const shuffled = [...apiData].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 6);

      const formatted = selected.map((d) => ({
        id: d.id || d.product_id,
        title: d.name || d.product_name_english || "No Name",
        img:
          d.img1 ||
          (d.product_id
            ? `http://192.168.2.9:5000/api/image/${d.product_id}/0`
            : "/fallback.png"),
        oldPrice: d.old_price || 0,
        price: d.price || d.price_per_unit || 0,
        endsIn: 5 * 60 * 60,
      }));

      setDeals(formatted);

      const t = {};
      formatted.forEach((d) => (t[d.id] = d.endsIn));
      setTimers(t);

    } catch (err) {
      console.error("❌ Deals fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDeals();
    }, 5 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((id) => {
          if (next[id] > 0) next[id] -= 1;
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const format = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}h ${m}m ${sec}s`;
  };

  /* ================= ADD TO CART ================= */

  const addToCartAPI = (product) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login");
      return;
    }

    axios
      .post(
        `${API_BASE}/cart/add`,
        {
          product_id: Number(product.id),
          quantity: 1,
          price: product.price,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        console.log("Added to cart");
      })
      .catch((err) => {
        console.error("ADD TO CART ERROR", err);
        alert("Backend error");
      });
  };

  /* ================= UI CART ================= */

  const add = (d) => {
    addToCartAPI(d);
    setCart((p) => ({ ...p, [d.id]: (p[d.id] || 0) + 1 }));
  };

  const remove = (d) =>
    setCart((p) => {
      const n = { ...p };
      if (n[d.id] === 1) delete n[d.id];
      else n[d.id] -= 1;
      return n;
    });

  if (loading) return <p>Loading deals...</p>;

  return (
    <div className="container mt-5">
      <div className="mm-deals-title">
        <h2>Deals of the Day</h2>
        <p>Limited-time offers from verified suppliers</p>
      </div>

      <div className="mm-deals-row">
        {deals.map((d) => (
          <div className="mm-deal-card" key={d.id}>

            {/* TIMER */}
            <div className="mm-timer">
              ⏰ Ends in {format(timers[d.id] || 0)}
            </div>

            {/* IMAGE + EYE */}
            <div>
              <img
                src={d.img}
                alt={d.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/fallback.png";
                }}
              />

              <Link to={`/shopdetails/${d.id}`}>
                <i className="fa fa-eye"></i>
              </Link>
            </div>

            <h4>{d.title}</h4>

            {/* PRICE */}
            <div className="mm-price">
              <span className="old">QAR {d.oldPrice}</span>
              <span className="new">QAR {d.price}</span>
            </div>

            {/* CART */}
            {!cart[d.id] ? (
              <button
                className="mm-add"
                disabled={timers[d.id] === 0}
                onClick={() => add(d)}
              >
                Add to Cart
              </button>
            ) : (
              <div className="mm-stepper">
                <button onClick={() => remove(d)}>-</button>
                <span>{cart[d.id]}</span>
                <button onClick={() => add(d)}>+</button>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
};

export default MahalDealsOfDay;