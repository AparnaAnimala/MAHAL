// import React from "react";

// /* IMAGES */
// import veg from "../../images/product_img_1.jpg";
// import rice from "../../images/product_img_2.jpg";
// import meat from "../../images/product_img_3.jpg";
// import spices from "../../images/product_img_4.jpg";
// import dairy from "../../images/product_img_5.jpg";
// import bulk from "../../images/product_img_6.jpg";

// const intents = [
//   {
//     title: "Fresh Vegetables",
//     img: veg,
//     category: "Vegetables",
//     color: "#2ecc71",
//   },
//   {
//     title: "Rice & Grains",
//     img: rice,
//     category: "Rice",
//     color: "#f1c40f",
//   },
//   {
//     title: "Meat & Seafood",
//     img: meat,
//     category: "Meat",
//     color: "#e74c3c",
//   },
//   {
//     title: "Spices & Masalas",
//     img: spices,
//     category: "Spices",
//     color: "#e67e22",
//   },
//   {
//     title: "Dairy Essentials",
//     img: dairy,
//     category: "Dairy",
//     color: "#3498db",
//   },
//   {
//     title: "Bulk Orders",
//     img: bulk,
//     category: "Bulk",
//     color: "#9b59b6",
//   },
// ];

// const MahalIntentSection = ({ onCategorySelect }) => {
//   return (
//     <div className="container mt-5">

//           {/* HEADING */}
//         <div className="row mb-5">
//           <div className="col-xl-6 m-auto text-center">
//             <div className="section_heading text-center heading_left mb_25 m-auto mb-3">
//               <h4 className="premium_badge text-white">
// What Are You Ordering Today?
//               </h4>
//               <h2 className="premium_title">Choose what your kitchen needs right now</h2>
//             </div>
//           </div>
//         </div>

 

//       {/* INTENT ITEMS */}
//       <div className="mm-intent-row">
//         {intents.map((item) => (
//           <div
//             key={item.title}
//             className="mm-intent-item"
//             onClick={() => onCategorySelect?.(item.category)}
//           >
//             <div
//               className="mm-intent-circle"
//               style={{ backgroundColor: item.color }}
//             >
//               <img src={item.img} alt={item.title} />
//             </div>
//             <span>{item.title}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default MahalIntentSection;


// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// /* IMAGES (fallback if API fails) */
// import veg from "../../images/product_img_1.jpg";
// import rice from "../../images/product_img_2.jpg";
// import meat from "../../images/product_img_3.jpg";
// import spices from "../../images/product_img_4.jpg";
// import dairy from "../../images/product_img_5.jpg";
// // import bulk from "../../images/product_img_6.jpg";

// const API_BASE_URL = "http://192.168.2.9:5000/api";

// /* COLORS */
// const COLORS = [
//   "#2ecc71", "#f1c40f", "#e74c3c",
//   "#e67e22", "#3498db", "#9b59b6"
// ];

// /* fallback */
// const fallbackIntents = [
//   { title: "Vegetables", img: veg, category: 1, color: COLORS[0] },
//   { title: "Rice", img: rice, category: 2, color: COLORS[1] },
//   { title: "Meat", img: meat, category: 3, color: COLORS[2] },
//   { title: "Spices", img: spices, category: 4, color: COLORS[3] },
//   { title: "Dairy", img: dairy, category: 5, color: COLORS[4] },
//   // { title: "Bulk", img: bulk, category: 6, color: COLORS[5] }
// ];

// const MahalIntentSection = () => {
//   const [intents, setIntents] = useState([]);
//   const [showAll, setShowAll] = useState(false); // 🔥 NEW
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const res = await axios.get(`${API_BASE_URL}/categories`);

//         if (!res.data || res.data.length === 0) {
//           setIntents(fallbackIntents);
//           return;
//         }

//         const dynamicIntents = res.data.map((cat, index) => ({
//           title: cat.name,
//           category: cat.id,
//           color: COLORS[index % COLORS.length],

//           // ✅ USE BACKEND IMAGE (IMPORTANT)
//           img: cat.image
//         }));

//         setIntents(dynamicIntents);

//       } catch (err) {
//         console.error("❌ Category fetch error:", err);
//         setIntents(fallbackIntents);
//       }
//     };

//     fetchCategories();
//   }, []);

//   // 🔥 SHOW ONLY 5 OR ALL
//   const visibleIntents = showAll ? intents : intents.slice(0, 5);

//   return (
//     <div className="container mt-5">

//       {/* HEADING */}
//       <div className="row mb-5">
//         <div className="col-xl-6 m-auto text-center">
//           <div className="section_heading text-center heading_left mb_25 m-auto mb-3">
//             <h4 className="premium_badge text-white">
//               What Are You Ordering Today?
//             </h4>
//             <h2 className="premium_title">
//               Choose what your kitchen needs right now
//             </h2>
//           </div>
//         </div>
//       </div>

//       {/* CATEGORY ITEMS */}
//       <div className="mm-intent-row">
//         {visibleIntents.map((item) => (
//           <div
//             key={item.title}
//             className="mm-intent-item"
//             onClick={() => {
//               navigate(`/categorieList?category=${encodeURIComponent(item.title)}`);
//             }}
//           >
//             <div
//               className="mm-intent-circle"
//               style={{ backgroundColor: item.color }}
//             >
//               <img src={item.img} alt={item.title} />
//             </div>
//             <span>{item.title}</span>
//           </div>
//         ))}
//       </div>

//       {/* 🔥 VIEW MORE BUTTON */}
//       {/* {intents.length > 5 && (
//         <div className="text-center mt-4">
//           <button
//             className="btn btn-outline-primary"
//             onClick={() => setShowAll(!showAll)}
//           >
//             {showAll ? "View Less" : "View More"}
//           </button>
//         </div>
//       )} */}

//     </div>
//   );
// };

// export default MahalIntentSection;




import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/* FALLBACK IMAGES */
import veg from "../../images/product_img_1.jpg";
import rice from "../../images/product_img_2.jpg";
import meat from "../../images/product_img_3.jpg";
import spices from "../../images/product_img_4.jpg";
import dairy from "../../images/product_img_5.jpg";
import bulk from "../../images/product_img_6.jpg";

const API_BASE_URL = "http://192.168.2.9:5000/api";

const COLORS = [
  "#2ecc71", "#f1c40f", "#e74c3c",
  "#e67e22", "#3498db", "#9b59b6"
];

const FALLBACK_IMAGES = [veg, rice, meat, spices, dairy, bulk];

const MahalIntentSection = () => {
  const [intents, setIntents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/category`);

        if (!res.data || res.data.length === 0) return;

        const dynamic = res.data.map((cat, index) => {
          let imgUrl;

          if (cat.image && cat.image !== "null") {
            imgUrl = cat.image.startsWith("http")
              ? cat.image
              : `http://192.168.2.9:5000${cat.image}`;
          } else {
            imgUrl = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
          }

          return {
            title: cat.name,
            category: cat.name,
            color: COLORS[index % COLORS.length],
            img: imgUrl
          };
        });

        setIntents(dynamic);

      } catch (err) {
        console.error("API ERROR:", err);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="container mt-5">

      {/* HEADING */}
      <div className="text-center mb-5">
        <h4 className="premium_badge text-white">
          What Are You Ordering Today?
        </h4>
        <h2 className="premium_title">
          Choose what your kitchen needs right now
        </h2>
      </div>

      {/* MARQUEE */}
      <div className="mm-category-wrapper">
        
        <div
          className="mm-category-track"
        >
          {[...intents, ...intents].map((item, index) => (
            <div
              key={index}
              onClick={() =>
                navigate(
                  `/categorieList?category=${encodeURIComponent(item.title)}`
                )
              }
              id="categoty"
              style={{
                textAlign: "center",
                cursor: "pointer",
                minWidth: "120px"
              }}
            >
              {/* CIRCLE */}
              <div
              id="categoty1"
              
              >
                <img
                  src={item.img}
                  alt={item.title}
                  onError={(e) => (e.target.src = veg)}
                />
              </div>

              <p style={{ marginTop: "10px", fontWeight: "500" }}>
                {item.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ANIMATION */}
      <style>
        {`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>

    </div>
  );
};

export default MahalIntentSection;