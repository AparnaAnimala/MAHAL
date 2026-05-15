

// import React, { useEffect, useState } from "react";
// import axios from "axios";

// /* IMAGE PLACEHOLDER */
// import p1 from "../images/product_img_1.jpg";

// const API_BASE_URL = "http://192.168.2.9:5000/api";

// const Wishlist = () => {
//   const [wishlist, setWishlist] = useState([]);

//   // ✅ ALWAYS READ TOKEN DYNAMICALLY
//   const getToken = () => localStorage.getItem("token");

//   // ================= FETCH FROM BACKEND (JWT BASED) =================
//   useEffect(() => {
//     const token = getToken();
//     if (!token) return;

//     axios
//       .get(`${API_BASE_URL}/wishlist`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       })
//       .then((res) => {
//         setWishlist(res.data || []);
//       })
//       .catch((err) => {
//         console.error("Wishlist fetch error", err);
//       });
//   }, []);

//   // ================= REMOVE (JWT BASED) =================
//   const removeWishlist = (wishlistId) => {
//     const token = getToken();
//     if (!token) return;

//     axios
//       .delete(`${API_BASE_URL}/wishlist/remove/${wishlistId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       })
//       .then(() => {
//         setWishlist((prev) =>
//           prev.filter((item) => item.wishlist_id !== wishlistId)
//         );
//       })
//       .catch((err) => {
//         console.error("REMOVE WISHLIST ERROR", err);
//       });
//   };

//   // ================= ADD TO CART (JWT SAFE) =================
//   const addToCart = (item) => {
//     const token = getToken();
//     if (!token) {
//       alert("Session expired. Please login again.");
//       return;
//     }

//     axios
//       .post(
//         `${API_BASE_URL}/cart/add`,
//         {
//           product_id: item.product_id,
//           quantity: 1,
//           price: item.price_per_unit,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       )
//       .then(() => {
//         removeWishlist(item.wishlist_id);
//         window.location.href = "/CartView";
//       })
//       .catch((err) => {
//         console.error("ADD TO CART ERROR", err);
//         alert("Backend error");
//       });
//   };

//   return (
//     <section className="wishlist_page pt_100 pb_100 pt-80 pb-80">
//       <div className="container">

//         <div className="section_heading text-center mb_50">
//           <h2 className="mb-3">My Wishlist</h2>
//           <p>Your favorite items saved for later</p>
//         </div>

//         <div className="row mt-5">
//           {wishlist.map((item) => (
//             <div className="col-xl-3 col-lg-4 col-sm-6" key={item.wishlist_id}>
//               <div className="wishlist_card">

//                 <div className="wishlist_img">
//                   <img
//                     src={p1}
//                     alt={item.product_name_english}
//                   />

//                   <button
//                     className="remove_btn"
//                     onClick={() => removeWishlist(item.wishlist_id)}
//                   >
//                     <i className="fa fa-heart-broken"></i>
//                   </button>
//                 </div>

//                 <div className="wishlist_body">
//                   <h4>{item.product_name_english}</h4>
//                   <h5>QAR  {item.price_per_unit}</h5>

//                   <button
//                     type="button"
//                     className="wishlist_cart_btn"
//                     onClick={() => addToCart(item)}
//                   >
//                     <i className="fa fa-shopping-basket"></i>
//                     Add To Cart
//                     <span></span>
//                   </button>
//                 </div>

//               </div>
//             </div>
//           ))}

//           {wishlist.length === 0 && (
//             <div className="col-12 text-center">
//               <p>No items in wishlist</p>
//             </div>
//           )}
//         </div>

//       </div>
//     </section>
//   );
// };

// export default Wishlist;







import React, { useEffect, useState } from "react";
import axios from "axios";

/* IMAGE PLACEHOLDER */
import p1 from "../images/product_img_1.jpg";

const API_BASE_URL = "http://192.168.2.9:5000/api";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);

  // ✅ ALWAYS READ TOKEN DYNAMICALLY
  const getToken = () => localStorage.getItem("token");

  // ================= FETCH FROM BACKEND (JWT BASED) =================
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    axios
      .get(`${API_BASE_URL}/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setWishlist(res.data || []);
      })
      .catch((err) => {
        console.error("Wishlist fetch error", err);
      });
  }, []);

  // ================= REMOVE (JWT BASED) =================
  const removeWishlist = (wishlistId) => {
    const token = getToken();
    if (!token) return;

    axios
      .delete(`${API_BASE_URL}/wishlist/remove/${wishlistId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        setWishlist((prev) =>
          prev.filter((item) => item.wishlist_id !== wishlistId)
        );
      })
      .catch((err) => {
        console.error("REMOVE WISHLIST ERROR", err);
      });
  };

  // ================= ADD TO CART (JWT SAFE) =================
  const addToCart = (item) => {
    const token = getToken();
    if (!token) {
      alert("Session expired. Please login again.");
      return;
    }

    axios
      .post(
        `${API_BASE_URL}/cart/add`,
        {
          product_id: item.product_id,
          quantity: 1,
          price: item.price_per_unit,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        removeWishlist(item.wishlist_id);
        window.location.href = "/restaurantdashboard/CartView";
      })
      .catch((err) => {
        console.error("ADD TO CART ERROR", err);
        alert("Backend error");
      });
  };

  return (
    <section className="wishlist_page pt_100 pb_100 pt-80 pb-80">
      <div className="container">

        <div className="section_heading text-center mb_50">
          <h2 className="mb-3">My Wishlist</h2>
          <p>Your favorite items saved for later</p>
        </div>

        <div className="row mt-5">
          {wishlist.map((item) => (
            <div className="col-xl-3 col-lg-4 col-sm-6" key={item.wishlist_id}>
              <div className="wishlist_card">

                <div className="wishlist_img">
                  <img
                    src={`http://192.168.2.9:5000/api/image/${item.product_id}/0`}
                    alt={item.product_name_english}
                    onError={(e) => {
                      e.target.src = p1;
                    }}
                  />
                  <button
                    className="remove_btn"
                    onClick={() => removeWishlist(item.wishlist_id)}
                  >
                    <i className="fa fa-heart-broken"></i>
                  </button>
                </div>

                <div className="wishlist_body">
                  <h4>{item.product_name_english}</h4>
                  <h5>QAR  {item.price_per_unit}</h5>

                  <button
                    type="button"
                    className="wishlist_cart_btn"
                    onClick={() => addToCart(item)}
                  >
                    <i className="fa fa-shopping-basket"></i>
                    Add To Cart
                    <span></span>
                  </button>
                </div>

              </div>
            </div>
          ))}

          {wishlist.length === 0 && (
            <div className="col-12 text-center">
              <p>No items in wishlist</p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default Wishlist;
