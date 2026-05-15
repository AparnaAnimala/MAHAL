// import React from "react";
 

// /* IMAGES */
// import rice from "../../images/product_img_1.jpg";
// import spices from "../../images/product_img_2.jpg";
// import meat from "../../images/product_img_3.jpg";
// import dairy from "../../images/product_img_3.jpg";
// import kitchen from "../../images/product_img_4.jpg";
// import packaging from "../../images/product_img_5.jpg";
// import bulk from "../../images/product_img_6.jpg";
// import supplier from "../../images/product_img_7.jpg";

// const sections = [
//   {
//     title: "Continue Bulk Shopping",
//     items: [
//       { img: rice, label: "Rice & Grains", category: "Rice" },
//       { img: spices, label: "Spices", category: "Spices" },
//       { img: meat, label: "Meat", category: "Meat" },
//       { img: dairy, label: "Dairy", category: "Dairy" },
//     ],
//     link: "See more deals",
//   },
//   {
//     title: "Upgrade Your Kitchen",
//     items: [
//       { img: kitchen, label: "Kitchen Tools", category: "Kitchen" },
//       { img: packaging, label: "Packaging", category: "Packaging" },
//       { img: bulk, label: "Bulk Storage", category: "Bulk" },
//       { img: supplier, label: "Utilities", category: "Utilities" },
//     ],
//     link: "Explore all",
//   },
//   {
//     title: "Business Savings & GST Benefits",
//     items: [
//       { img: bulk, label: "Bulk Discounts", category: "Offers" },
//       { img: supplier, label: "Verified Suppliers", category: "Suppliers" },
//       { img: kitchen, label: "Restaurant Needs", category: "Restaurant" },
//       { img: packaging, label: "Business Orders", category: "Business" },
//     ],
//     link: "Create free account",
//   },
// ];

// const FeaturedSections = ({ onCategorySelect }) => {
//   return (
//     <div className="container mt-5">
//       <div className="mm-featured-grid">
//         {sections.map((sec, i) => (
//           <div className="mm-featured-card" key={i}>
//             <h4>{sec.title}</h4>

//             <div className="mm-featured-items">
//               {sec.items.map((it, idx) => (
//                 <div
//                   className="mm-featured-item"
//                   key={idx}
//                   onClick={() => onCategorySelect?.(it.category)}
//                 >
//                   <div className="mm-featured-img">
//                     <img src={it.img} alt={it.label} />
//                   </div>
//                   <span>{it.label}</span>
//                 </div>
//               ))}
//             </div>

//             {sec.link && (
//               <span className="mm-featured-link">
//                 {sec.link}
//               </span>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default FeaturedSections;




import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API = "http://192.168.2.9:5000/api/products";

const FeaturedSections = () => {
  const [sections, setSections] = useState([]);
  const navigate = useNavigate();

  /* 🔥 FETCH GRID DATA */
  const fetchGrid = async () => {
    try {
      const res = await axios.get(`${API}/featured-grid`);
      setSections(res.data || []);
    } catch (err) {
      console.error("Error fetching grid:", err);
    }
  };

  /* 🚀 INITIAL LOAD + AUTO REFRESH */
  useEffect(() => {
    fetchGrid();

    const interval = setInterval(() => {
      fetchGrid();
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mt-5">
      <div className="mm-featured-grid">
        {sections.map((sec, i) => (
          <div className="mm-featured-card" key={i}>
            <h4>{sec.title}</h4>

            <div className="mm-featured-items">
              {(sec.items?.length ? sec.items : Array(4).fill(null)).map(
                (p, idx) =>
                  p ? (
                    /* 🔥 FULL CARD CLICKABLE USING LINK */
                    <Link
                      to={`/shopdetails/${p.id}`} // ✅ SAME AS YOUR CATEGORIES PAGE
                      className="mm-featured-item"
                      key={idx}
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                        cursor: "pointer",
                      }}
                    >
                      <div className="mm-featured-img">
                        <img
  src={p.image || "https://via.placeholder.com/150"}
  alt={p.name}
  onError={(e) => {
    e.target.src = "https://via.placeholder.com/150";
  }}
/>
                      </div>

                      <span>{p.name}</span>
                    </Link>
                  ) : (
                    /* 🧊 PLACEHOLDER */
                    <div className="mm-featured-item" key={idx}>
                      <div className="mm-featured-img">
                        <img src="https://via.placeholder.com/150" />
                      </div>
                      <span>Loading...</span>
                    </div>
                  )
              )}
            </div>

            <span
              className="mm-featured-link"
              onClick={() => navigate("/products")}
              style={{ cursor: "pointer" }}
            >
              View all
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedSections;