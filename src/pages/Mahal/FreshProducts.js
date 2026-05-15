// import React, { useState } from "react";
// import { FaStar, FaShoppingCart, FaHeart, FaEye } from "react-icons/fa";


// /* ---------- IMAGE IMPORTS ---------- */
// import img1 from "../../images/product_img_1.jpg";
// import img2 from "../../images/product_img_2.jpg";
// import img3 from "../../images/product_img_3.jpg";
// import img4 from "../../images/product_img_4.jpg";
// import img5 from "../../images/product_img_5.jpg";
// import img6 from "../../images/product_img_6.jpg";
// import img7 from "../../images/product_img_7.jpg";
// import img8 from "../../images/product_img_8.jpg";


// const products = {
//   tab111: [
//     { img: img1, name: "Lemon Meat Bone", price: "20.00", old: "25.00" },
//     { img: img2, name: "Fresh Red Seedless", price: "12.00", old: "10.00" },
//     { img: img3, name: "Carrot Vegetables", price: "33.00", old: "28.00" },
//     { img: img4, name: "Bengal Beef Bone", price: "12.00", old: "10.00" },
//      { img: img1, name: "Lemon Meat Bone", price: "20.00", old: "25.00" },
//     { img: img2, name: "Fresh Red Seedless", price: "12.00", old: "10.00" },
    
//   ],
//   tab222: [
//     { img: img5, name: "Almond Nuts", price: "45.00", old: "50.00" },
//     { img: img6, name: "Cashew Nuts", price: "40.00", old: "46.00" },
//      { img: img5, name: "Almond Nuts", price: "45.00", old: "50.00" },
//     { img: img6, name: "Cashew Nuts", price: "40.00", old: "46.00" },
//   ],
//   tab333: [
//     { img: img7, name: "Orange Juice", price: "29.00", old: "35.00" },
//     { img: img8, name: "Apple Juice", price: "25.00", old: "30.00" },
//      { img: img7, name: "Orange Juice", price: "29.00", old: "35.00" },
//     { img: img8, name: "Apple Juice", price: "25.00", old: "30.00" },
//      { img: img7, name: "Orange Juice", price: "29.00", old: "35.00" },
//     { img: img8, name: "Apple Juice", price: "25.00", old: "30.00" },
//   ],
//   tab444: [
//     { img: img3, name: "Fresh Carrot", price: "18.00", old: "22.00" },
//     { img: img4, name: "Beet Root", price: "20.00", old: "24.00" },
//   ],
//   tab555: [
//     { img: img8, name: "Fresh Mango", price: "22.00", old: "26.00" },
//     { img: img2, name: "Red Apple", price: "24.00", old: "28.00" },
//      { img: img8, name: "Fresh Mango", price: "22.00", old: "26.00" },
//     { img: img2, name: "Red Apple", price: "24.00", old: "28.00" },
//      { img: img8, name: "Fresh Mango", price: "22.00", old: "26.00" },
//     { img: img2, name: "Red Apple", price: "24.00", old: "28.00" },
//   ],
// };

//     const FreshProducts = () => {
//     const [activeTab, setActiveTab] = useState("tab111");

//   return (
//     <section className="fresh_products pt_95 xs_pt_75   mb-5">-
//       <div className="container">

//         <div className="row wow fadeInUp mb-3">
//           <div className="col-xl-5 m-auto">
//             <div className="section_heading mb_35">
//               <h4>Our Products</h4>
//               <h2>Our Fresh Products</h2>
//             </div>
//           </div>
//         </div>

//         <div className="row wow fadeInUp">
//           <div className="col-12">

//             <div className="pws_tabs_container pws_tabs_horizontal pws_tabs_horizontal_top pws_slidedown">

//               {/* TABS */}
//              <div className="mm-tabs">
//   {[
//     { key: "tab111", label: "Vegetables" },
//     { key: "tab222", label: "Nuts" },
//     { key: "tab333", label: "Drinks" },
//     { key: "tab444", label: "Root" },
//     { key: "tab555", label: "Fruits" },
//   ].map((tab) => (
//     <button
//       key={tab.key}
//       className={`mm-tab-btn ${activeTab === tab.key ? "active" : ""}`}
//       onClick={() => setActiveTab(tab.key)}
//     >
//       {tab.label}
//     </button>
//   ))}
// </div>


//            <div className="product_tabs pws_tabs_list">
//   <div className="pws_tab_single">
//     <div className="row g-3">

//       {products[activeTab]?.map((item, index) => (
//         <div className="col-xl-2 col-sm-6 col-lg-4" key={index}>

//          <div className="mm-product-card">

//   <div className="mm-product-img">
//     <img src={item.img} alt={item.name} />
//   </div>

//   <div className="mm-product-info">
//     <h4>{item.name}</h4>

//     <div className="mm-price">
//       <span className="mm-new">${item.price}</span>
//       <span className="mm-old">${item.old}</span>
//     </div>

//     <div className="mm-actions">
//       <button><FaShoppingCart /></button>
//       <button><FaHeart /></button>
//       <button><FaEye /></button>
//     </div>
//   </div>

// </div>


//         </div>
//       ))}

//     </div>
//   </div>
// </div>

//             </div>

//           </div>
//         </div>

//       </div>
//     </section>
//   );
// };

// export default FreshProducts;

import React, { useEffect, useState } from "react";
import { FaShoppingCart, FaHeart, FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://192.168.2.9:5000";

const TABS = [
  "Vegetables",
  "Fruits",
  "Dairy Products",
  "Meat & Poultry",
  "Grains",
];

const FreshProducts = () => {
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetch(`${API_BASE}/api/gridlist`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("ERROR:", err);
        setLoading(false);
      });
  }, []);

  /* ================= FILTER ================= */
  const filteredProducts = products
    .filter((p) => p.category === activeTab)
    .slice(0, 6);

  /* ================= ADD TO CART ================= */
  const addToCart = (item) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login");
      return;
    }

    axios.post(
      `${API_BASE}/api/cart/add`,
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
      alert("Added to cart 🛒");
    })
    .catch((err) => {
      console.error("CART ERROR", err);
      alert("Backend error");
    });
  };

  /* ================= ADD TO WISHLIST ================= */
  const addToWishlist = (item) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login");
      return;
    }

    axios.post(
      `${API_BASE}/api/wishlist/add`,
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
      alert("Added to wishlist ❤️");
    })
    .catch((err) => {
      if (err.response?.status === 409) {
        alert("Already in wishlist");
      } else {
        console.error("WISHLIST ERROR", err);
        alert("Wishlist backend error");
      }
    });
  };

  return (
    <section className="fresh_products pt_95 mb-5">
      <div className="container">

        <div className="text-center mb-4">
          <h2>Our Fresh Products</h2>
        </div>

        {/* TABS */}
        <div className="mm-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`mm-tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="row mt-4">

          {loading && <p className="text-center">Loading...</p>}

          {!loading && filteredProducts.length === 0 && (
            <p className="text-center">No products found</p>
          )}

          {!loading &&
            filteredProducts.map((item) => (
              <div key={item.id} className="col-xl-2 col-lg-3 col-sm-6 mb-4">
                <div className="mm-product-card">

                  <div className="mm-product-img">
                    <img
                    src={
                      item.img1 && item.img1.trim() !== ""
                        ? item.img1.startsWith("http")
                          ? item.img1
                          : `${API_BASE}/${item.img1}`
                        : null
                    }
                    alt={item.name}
                    onError={(e) => {
                      console.log("Image failed:", item.img1);
                      e.target.style.display = "none";
                    }}
                  />
                  </div>

                  <div className="mm-product-info">
                    <h4>{item.name}</h4>

                    <div className="mm-price">
                      QAR {item.price_numeric}
                    </div>

                    <div className="mm-actions">

                      {/* ✅ ADD TO CART */}
                      <button onClick={() => addToCart(item)}>
                        <FaShoppingCart />
                      </button>

                      {/* ✅ WISHLIST */}
                      <button onClick={() => addToWishlist(item)}>
                        <FaHeart />
                      </button>

                      {/* ✅ EYE ICON → SHOPDETAILS */}
                      <Link to={`/shopdetails/${item.id}`}>
                        <FaEye />
                      </Link>

                    </div>

                  </div>

                </div>
              </div>
            ))}

        </div>

      </div>
    </section>
  );
};

export default FreshProducts;