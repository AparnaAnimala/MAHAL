import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

/* ---------- STATIC IMAGES ---------- */
import img1 from "../../images/product_img_1.jpg";
import img2 from "../../images/product_img_2.jpg";
import img3 from "../../images/product_img_3.jpg";
import img4 from "../../images/product_img_4.jpg";
import img5 from "../../images/product_img_5.jpg";
import img6 from "../../images/product_img_6.jpg";
import img7 from "../../images/product_img_7.jpg";
import img8 from "../../images/product_img_8.jpg";

const STATIC_IMAGES = [img1, img2, img3, img4, img5, img6, img7, img8];

/* ---------- IMAGE OFFSET PER TAB ---------- */
const TAB_IMAGE_OFFSET = {
  tab111: 0,
  tab222: 2,
  tab333: 4,
  tab444: 6,
  tab555: 1,
};

/* ---------- SAME STRUCTURE ---------- */
const products = {
  tab111: [],
  tab222: [],
  tab333: [],
  tab444: [],
  tab555: [],
};

const FreshProducts = () => {
  const [activeTab, setActiveTab] = useState("tab111");
  const [data, setData] = useState(products);
  const navigate = useNavigate();

  const restaurantId = 1;

  /* ---------- BACKEND DATA ---------- */
  useEffect(() => {
    fetch("http://192.168.2.9:5000/api/tab-products")
      .then((res) => res.json())
      .then((res) => {
        setData({
          tab111: res.new || [],
          tab222: res.special || [],
          tab333: res.bestseller || [],
          tab444: res.new || [],
          tab555: res.special || [],
        });
      })
      .catch((err) => console.error("TAB API ERROR:", err));
  }, []);

  /* ---------- ADD TO CART ---------- */
  const addToCart = async (item) => {
    try {
      const res = await fetch("http://192.168.2.9:5000/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          product_id: item.id,
          quantity: 1,
          price: item.price_numeric,
        }),
      });

      if (res.ok) {
        const go = window.confirm("Added to cart 🛒\n\nGo to cart?");
        if (go) navigate("/restaurantdashboard/cartview");
      }
    } catch (err) {
      console.error("ADD TO CART ERROR:", err);
    }
  };

  /* ---------- VIEW PRODUCT ---------- */
  const viewProduct = (id) => {
  navigate(`/restaurantdashboard/shopdetails/${id}`);
};


  /* ---------- WISHLIST (LOCAL) ---------- */
const toggleWishlist = (item) => {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  const exists = wishlist.find((p) => p.id === item.id);

  if (exists) {
    wishlist = wishlist.filter((p) => p.id !== item.id);
    alert("Removed from wishlist ❤️");
  } else {
    wishlist.push({
      id: item.id,
      name: item.name,
      price: item.price,
    });

    const go = window.confirm("Added to wishlist ❤️\n\nGo to wishlist?");
   if (go) navigate("/restaurantdashboard/wishlist");
  }

  localStorage.setItem("wishlist", JSON.stringify(wishlist));
};


  return (
    <section className="fresh_products pt_95 xs_pt_75 mb-5">
      <div className="container">

        <div className="row wow fadeInUp mb-3">
          <div className="col-xl-5 m-auto">
            <div className="section_heading mb_35">
              <h4>Our Products</h4>
              <h2>Our Fresh Products</h2>
            </div>
          </div>
        </div>

        <div className="row wow fadeInUp">
          <div className="col-12">

            <div className="pws_tabs_container pws_tabs_horizontal pws_tabs_horizontal_top pws_slidedown">

              {/* ---------- TABS ---------- */}
              <ul className="pws_tabs_controll">
                <li><a className={activeTab === "tab111" ? "pws_tab_active" : ""} onClick={() => setActiveTab("tab111")}>Vegetables</a></li>
                <li><a className={activeTab === "tab222" ? "pws_tab_active" : ""} onClick={() => setActiveTab("tab222")}>Nuts</a></li>
                <li><a className={activeTab === "tab333" ? "pws_tab_active" : ""} onClick={() => setActiveTab("tab333")}>Drinks</a></li>
                <li><a className={activeTab === "tab444" ? "pws_tab_active" : ""} onClick={() => setActiveTab("tab444")}>Root</a></li>
                <li><a className={activeTab === "tab555" ? "pws_tab_active" : ""} onClick={() => setActiveTab("tab555")}>Fruits</a></li>
              </ul>

              {/* ---------- PRODUCTS ---------- */}
              <div className="product_tabs pws_tabs_list">
                <div className="pws_tab_single">
                  <div className="row g-3">

                    {data[activeTab]?.slice(0, 6).map((item, index) => {
                      const offset = TAB_IMAGE_OFFSET[activeTab] || 0;
                      const image =
                        STATIC_IMAGES[(index + offset) % STATIC_IMAGES.length];

                      return (
                        <div className="col-xl-2 col-sm-6 col-lg-4" key={item.id}>
                          <div className="single_product">

                            <div className="single_product_img">
                              <img
                                src={image}
                                alt="Product"
                                className="img-fluid w-100"
                              />
                              <ul>
                                <li>
                                  <a onClick={() => viewProduct(item.id)}>
                                    <i className="far fa-eye"></i>
                                  </a>
                                </li>
                                <li>
                                  <a onClick={() => toggleWishlist(item)}>
                                    <i className="far fa-heart"></i>
                                  </a>
                                </li>
                              </ul>
                            </div>

                            <div className="single_product_text">
                              <Link className="title" to="/restaurantdashboard/categorielist">
                                {item.name}
                              </Link>
                              <p>{item.price}</p>
                              <a
                                className="cart_btn"
                                onClick={() => addToCart(item)}
                              >
                                <i className="fa fa-shopping-basket"></i>
                                Add To Cart
                                <span></span>
                              </a>
                            </div>

                          </div>
                        </div>
                      );
                    })}

                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default FreshProducts;



















// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";

// const FreshProducts = () => {
//   const [activeTab, setActiveTab] = useState("tab111");
//   const [data, setData] = useState({
//     tab111: [],
//     tab222: [],
//     tab333: [],
//     tab444: [],
//     tab555: [],
//   });

//   const navigate = useNavigate();
//   const restaurantId = 1;

//   /* ---------- FETCH BACKEND DATA ---------- */
//   useEffect(() => {
//     fetch("http://192.168.2.9:5000/api/tab-products")
//       .then((res) => res.json())
//       .then((res) => {
//         setData({
//           tab111: res.new || [],
//           tab222: res.special || [],
//           tab333: res.bestseller || [],
//           tab444: res.new || [],
//           tab555: res.special || [],
//         });
//       })
//       .catch((err) => console.error("TAB API ERROR:", err));
//   }, []);

//   /* ---------- ADD TO CART ---------- */
//   const addToCart = async (item) => {
//     try {
//       const res = await fetch("http://192.168.2.9:5000/api/cart/add", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           restaurant_id: restaurantId,
//           product_id: item.id,
//           quantity: 1,
//           price: item.price_numeric,
//         }),
//       });

//       if (res.ok) {
//         const go = window.confirm("Added to cart 🛒\n\nGo to cart?");
//         if (go) navigate("/CartView");
//       }
//     } catch (err) {
//       console.error("ADD TO CART ERROR:", err);
//     }
//   };

//   /* ---------- VIEW PRODUCT ---------- */
//   const viewProduct = (id) => {
//     navigate(`/ShopDetails/${id}`);
//   };

//   /* ---------- WISHLIST (LOCAL) ---------- */
//   const toggleWishlist = (item) => {
//     let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

//     const exists = wishlist.find((p) => p.id === item.id);

//     if (exists) {
//       wishlist = wishlist.filter((p) => p.id !== item.id);
//       alert("Removed from wishlist ❤️");
//     } else {
//       wishlist.push({
//         id: item.id,
//         name: item.name,
//         price: item.price,
//         image: item.img1,
//       });
//       alert("Added to wishlist ❤️");
//     }

//     localStorage.setItem("wishlist", JSON.stringify(wishlist));
//   };

//   return (
//     <section className="fresh_products pt_95 xs_pt_75 mb-5">
//       <div className="container">

//         {/* ---------- HEADING ---------- */}
//         <div className="row mb-3">
//           <div className="col-xl-5 m-auto">
//             <div className="section_heading mb_35">
//               <h4>Our Products</h4>
//               <h2>Our Fresh Products</h2>
//             </div>
//           </div>
//         </div>

//         <div className="row">
//           <div className="col-12">

//             <div className="pws_tabs_container pws_tabs_horizontal pws_tabs_horizontal_top">

//               {/* ---------- TABS ---------- */}
//               <ul className="pws_tabs_controll">
//                 <li><a className={activeTab === "tab111" ? "pws_tab_active" : ""} onClick={() => setActiveTab("tab111")}>Vegetables</a></li>
//                 <li><a className={activeTab === "tab222" ? "pws_tab_active" : ""} onClick={() => setActiveTab("tab222")}>Nuts</a></li>
//                 <li><a className={activeTab === "tab333" ? "pws_tab_active" : ""} onClick={() => setActiveTab("tab333")}>Drinks</a></li>
//                 <li><a className={activeTab === "tab444" ? "pws_tab_active" : ""} onClick={() => setActiveTab("tab444")}>Root</a></li>
//                 <li><a className={activeTab === "tab555" ? "pws_tab_active" : ""} onClick={() => setActiveTab("tab555")}>Fruits</a></li>
//               </ul>

//               {/* ---------- PRODUCTS ---------- */}
//               <div className="product_tabs pws_tabs_list">
//                 <div className="pws_tab_single">
//                   <div className="row g-3">

//                     {data[activeTab]?.slice(0, 6).map((item) => (
//                       <div className="col-xl-2 col-sm-6 col-lg-4" key={item.id}>
//                         <div className="single_product">

//                           <div className="single_product_img">
//                             <img
//                               src={item.img1}
//                               alt={item.name}
//                               className="img-fluid w-100"
//                             />
//                             <ul>
//                               <li>
//                                 <a onClick={() => viewProduct(item.id)}>
//                                   <i className="far fa-eye"></i>
//                                 </a>
//                               </li>
//                               <li>
//                                 <a onClick={() => toggleWishlist(item)}>
//                                   <i className="far fa-heart"></i>
//                                 </a>
//                               </li>
//                             </ul>
//                           </div>

//                           <div className="single_product_text">
//                             <Link className="title" to={`/ShopDetails/${item.id}`}>
//                               {item.name}
//                             </Link>
//                             <p>{item.price}</p>
//                             <a
//                               className="cart_btn"
//                               onClick={() => addToCart(item)}
//                             >
//                               <i className="fa fa-shopping-basket"></i>
//                               Add To Cart
//                               <span></span>
//                             </a>
//                           </div>

//                         </div>
//                       </div>
//                     ))}

//                   </div>
//                 </div>
//               </div>

//             </div>

//           </div>
//         </div>

//       </div>
//     </section>
//   );
// };

// export default FreshProducts;
