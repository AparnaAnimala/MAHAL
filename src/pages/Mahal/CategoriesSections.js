// import React, { useRef } from "react";
// import dummyImg from "../../images/product_img_1.jpg";

// /* ================= CATEGORY LIST ================= */

// const CATEGORY_LIST = [
//   "Fresh Vegetables",
//   "Fruits",
//   "Dairy Products",
//   "Rice & Grains",
//   "Cleaning & Hygiene",
//   "Meat & Seafood",
// ];

// /* ================= PRODUCT GENERATOR ================= */

// const createProducts = (count) =>
//   Array.from({ length: count }, (_, i) => ({
//     name: `Product ${i + 1}`,
//     weight: "1 unit",
//     price: 50 + i * 15,
//     oldPrice: 70 + i * 15,
//     off: i % 2 === 0 ? "20% OFF" : null,
//   }));

// const DATA = {
//   "Fresh Vegetables": createProducts(10),
//   Fruits: createProducts(9),
//   "Dairy Products": createProducts(10),
//   "Rice & Grains": createProducts(10),
//   "Cleaning & Hygiene": createProducts(9),
//   "Meat & Seafood": createProducts(10),
// };

// const MahalHomeSections = () => {
//   const sectionRefs = useRef({});

//   const scrollToSection = (category) => {
//     sectionRefs.current[category]?.scrollIntoView({
//       behavior: "smooth",
//       block: "start",
//     });
//   };

//   return (
//     <>
      

//       {/* ================= PRODUCT SECTIONS ================= */}
//       {Object.entries(DATA).map(([category, products]) => (
//         <ProductSection
//           key={category}
//           category={category}
//           products={products}
//           dummyImg={dummyImg}
//           ref={(el) => (sectionRefs.current[category] = el)}
//         />
//       ))}
//     </>
//   );
// };

// /* ================= PRODUCT SECTION COMPONENT ================= */

// const ProductSection = React.forwardRef(
//   ({ category, products, dummyImg }, ref) => {
//     const scrollRef = useRef(null);

//     const scroll = (dir) => {
//       if (!scrollRef.current) return;
//       const amount = 300;

//       if (dir === "left") {
//         scrollRef.current.scrollLeft -= amount;
//       } else {
//         scrollRef.current.scrollLeft += amount;
//       }
//     };

//     return (
//       <section ref={ref} className="mahal-product-section mt-5">
//         <div className="container">

//           <div className="mahal-section-header">
//             <h2>{category}</h2>

//             <div className="mahal-nav-arrows">
//               <button onClick={() => scroll("left")}>‹</button>
//               <button onClick={() => scroll("right")}>›</button>
//             </div>
//           </div>

//           <div className="mahal-product-row" ref={scrollRef}>
//             {products.map((item, index) => (
//               <div className="mahal-product-card" key={index}>

//   {/* 🔥 SVG ORANGE DISCOUNT BADGE */}
//   {item.off && (
//   <div className="mahal-off-badge">
//     <svg
//       viewBox="0 0 29 28"
//       className="mahal-svg"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <defs>
//         <linearGradient
//           id={`orangeGradient-${index}`}
//           x1="0"
//           y1="0"
//           x2="1"
//           y2="1"
//         >
//           <stop offset="0%" stopColor="#FF8C00" />
//           <stop offset="100%" stopColor="#FF3D00" />
//         </linearGradient>
//       </defs>

//       <path
//         d="M28.9499 0C28.3999 0 27.9361 1.44696 27.9361 2.60412V27.9718L24.5708 25.9718L21.2055 27.9718L17.8402 25.9718L14.4749 27.9718L11.1096 25.9718L7.74436 27.9718L4.37907 25.9718L1.01378 27.9718V2.6037C1.01378 1.44655 0.549931 0 0 0H28.9499Z"
//         fill={`url(#orangeGradient-${index})`}
//       />
//     </svg>

//     <span className="mahal-badge-text">
//       {item.off}
//     </span>
//   </div>
// )}


//   {/* IMAGE */}
//   <img
//     src={dummyImg}
//     alt="product"
//     className="mahal-dummy-img"
//   />

//   {/* TITLE */}
//   <h5>{item.name}</h5>
//   <p className="mahal-weight">{item.weight}</p>

//   {/* PRICE + ADD */}
//   <div className="mahal-price-row">
//     <div>
//       <span className="mahal-price">QAR {item.price}</span>
//       {item.oldPrice && (
//         <span className="mahal-old">QAR {item.oldPrice}</span>
//       )}
//     </div>

//     <button className="mahal-add-btn">
//       ADD
//     </button>
//   </div>

// </div>

//             ))}
//           </div>

//         </div>
//       </section>
//     );
//   }
// );

// export default MahalHomeSections;









import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const API_BASE = "http://192.168.2.9:5000/api";

const MahalHomeSections = () => {
  const sectionRefs = useRef({});
  const [groupedData, setGroupedData] = useState({});
  const [loading, setLoading] = useState(true);

  /* ================= FETCH PRODUCTS ================= */

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/gridlist`);
        const json = await res.json();

        const products = json.products || [];

        const grouped = {};

        products.forEach((item) => {
          const category = item.category || "Others";

          if (!grouped[category]) {
            grouped[category] = [];
          }

          grouped[category].push({
            id: item.id, // ✅ FIX
            name: item.name,
            weight: item.unit_of_measure || "1 unit",
            price: item.price_numeric || 0,
            oldPrice: null,
            off: null,
            img: item.img1,
            stock: item.stock || 1, // ✅ FIX
          });
        });

        setGroupedData(grouped);
        setLoading(false);
      } catch (err) {
        console.error("Error loading products:", err);
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  /* ================= ADD TO CART ================= */

const addToCart = (product) => {
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
      // ✅ ONLY SUCCESS MESSAGE (NO NAVIGATION)
      console.log("Added to cart");
      alert("Added to cart ✅"); // optional
    })
    .catch((err) => {
      console.error("ADD TO CART ERROR", err);
      alert("Backend error");
    });
};
  /* ================= SCROLL ================= */

  const scrollToSection = (category) => {
    sectionRefs.current[category]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading products...</p>;
  }

  return (
    <>
      {Object.entries(groupedData).map(([category, products]) => (
        <ProductSection
          key={category}
          category={category}
          products={products}
          addToCart={addToCart} // ✅ FIX
          ref={(el) => (sectionRefs.current[category] = el)}
        />
      ))}
    </>
  );
};

/* ================= PRODUCT SECTION ================= */

const ProductSection = React.forwardRef(
  ({ category, products, addToCart }, ref) => {
    const scrollRef = useRef(null);

    const scroll = (dir) => {
      if (!scrollRef.current) return;

      const amount = 300;

      if (dir === "left") {
        scrollRef.current.scrollLeft -= amount;
      } else {
        scrollRef.current.scrollLeft += amount;
      }
    };

    return (
      <section ref={ref} className="mahal-product-section mt-5">
        <div className="container">

          {/* HEADER */}
          <div className="mahal-section-header">
            <h2>{category}</h2>

            <div className="mahal-nav-arrows">
              <button onClick={() => scroll("left")}>‹</button>
              <button onClick={() => scroll("right")}>›</button>
            </div>
          </div>

          {/* PRODUCTS */}
          <div className="mahal-product-row" ref={scrollRef}>
            {products.map((item, index) => (
              <div className="mahal-product-card" key={index}>

                {/* IMAGE */}
                <img
                  src={item.img || "/fallback.png"}
                  alt="product"
                  className="mahal-dummy-img"
                />

                {/* TITLE */}
                <h5>{item.name}</h5>
                <p className="mahal-weight">{item.weight}</p>

                {/* PRICE */}
                <div className="mahal-price-row">
                  <div>
                    <span className="mahal-price">QAR  {item.price}</span>
                    {item.oldPrice && (
                      <span className="mahal-old">QAR  {item.oldPrice}</span>
                    )}
                  </div>

                  {/* BUTTON */}
                  <button
                    type="button"
                    className="mahal-add-btn"
                    disabled={!item.stock || item.stock === 0} // ✅ FIX
                    onClick={() => addToCart(item)} // ✅ FIX
                  >
                    Add
                    <span></span>
                  </button>

                </div>

              </div>
            ))}
          </div>

        </div>
      </section>
    );
  }
);

export default MahalHomeSections;