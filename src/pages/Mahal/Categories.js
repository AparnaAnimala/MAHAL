// import React from "react";
// import { FaArrowRight } from "react-icons/fa";

// /* IMAGES */
// import cat1 from "../../images/product_img_1.jpg";
// import cat2 from "../../images/product_img_2.jpg";
// import cat3 from "../../images/product_img_3.jpg";
// import cat4 from "../../images/product_img_4.jpg";
// import cat5 from "../../images/product_img_5.jpg";
// import cat6 from "../../images/product_img_6.jpg";

// const CATEGORIES = [
//   { id: 1, name: "Fruits", image: cat1, items: 24 },
//   { id: 2, name: "Meat", image: cat2, items: 18 },
//   { id: 3, name: "Dairy", image: cat3, items: 12 },
//   { id: 4, name: "Vegetables", image: cat4, items: 30 },
//   { id: 5, name: "Bakery", image: cat5, items: 10 },
//   { id: 6, name: "Sea Food", image: cat6, items: 15 },
// ];

// const Categories = () => {
//   return (
//     <section className="mm-category-section pt-5 pb-5">
//       <div className="container">

//         {/* HEADING */}
//         <div className="text-center mb-5">
//           <span className="mm-section-badge">Shop by Category</span>
//           <h2 className="mm-section-title">
//             Explore What Your Kitchen Needs
//           </h2>
//         </div>

//         {/* AUTO MARQUEE ROW */}
//         <div className="mm-category-wrapper">
//           <div className="mm-category-track">

//             {[...CATEGORIES, ...CATEGORIES].map((cat, index) => (
//               <div className="mm-category-card" key={index}>

//                 <div className="mm-category-img">
//                   <img src={cat.image} alt={cat.name} />
//                 </div>

//                 <div className="mm-category-content">
//                   <h4>{cat.name}</h4>
//                   <span>{cat.items} Items</span>
//                 </div>

//                 <FaArrowRight className="mm-category-arrow" />

//               </div>
//             ))}

//           </div>
//         </div>

//       </div>
//     </section>
//   );
// };

// export default Categories;







import React, { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";

const API_BASE = "http://192.168.2.22:5000";

const Categories = () => {
  const [categories, setCategories] = useState([]);

  /* ================= FETCH FROM BACKEND ================= */
 useEffect(() => {
  fetch(`${API_BASE}/api/categories`)
    .then((res) => res.json())
    .then((data) => {
      console.log("CATEGORIES:", data);

      const mapped = (data.categories || []).map((cat) => ({
        id: cat.id,
        name: cat.name,
        image:
          cat.image && cat.image.trim() !== ""
            ? cat.image.startsWith("http")
              ? cat.image
              : `${API_BASE}/${cat.image}`
            : null,
        items: cat.items || 0,
      }));

      setCategories(mapped);
    })
    .catch((err) => {
      console.error("CATEGORY API ERROR:", err);
    });
}, []);
  return (
    <section className="mm-category-section pt-5 pb-5">
      <div className="container">

        {/* HEADING */}
        <div className="text-center mb-5">
          <span className="mm-section-badge">Shop by Category</span>
          <h2 className="mm-section-title">
            Explore What Your Kitchen Needs
          </h2>
        </div>

        {/* AUTO MARQUEE */}
        <div className="mm-category-wrapper">
          <div className="mm-category-track">

            {[...categories, ...categories].map((cat, index) => (
              <div className="mm-category-card" key={index}>

                <div className="mm-category-img">
                <img
                src={
                  cat.image && cat.image.trim() !== ""
                    ? cat.image.startsWith("http")
                      ? cat.image
                      : `${API_BASE}/${cat.image}`
                    : null
                }
                alt={cat.name}
                onError={(e) => {
                  console.log("Category image failed:", cat.image);
                  e.target.style.display = "none";
                }}
              />
                </div>

                <div className="mm-category-content">
                  <h4>{cat.name}</h4>
                  <span>{cat.items} Items</span>
                </div>

                <FaArrowRight className="mm-category-arrow" />

              </div>
            ))}

          </div>
        </div>

      </div>
    </section>
  );
};

export default Categories;