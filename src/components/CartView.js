

// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import axios from "axios";

// /* IMAGE PLACEHOLDER */
// import img1 from "../images/cart_view_img_1.png";

// const API_BASE_URL = "http://192.168.2.9:5000/api";
// const RESTAURANT_ID = 1;

// const Cart = () => {
//   const [cartItems, setCartItems] = useState([]);

//   const DELIVERY_CHARGE = 53;
//   const DISCOUNT = 12;

//   /* ================= FETCH CART ================= */
//   useEffect(() => {
//     axios
//       .get(`${API_BASE_URL}/cart/${RESTAURANT_ID}`)
//       .then((res) => {
//         setCartItems(res.data || []);
//       })
//       .catch((err) => {
//         console.error("FETCH CART ERROR", err);
//       });
//   }, []);

//   /* ➕ Increase */
//   const increaseQty = (cart_item_id, qty) => {
//     axios
//       .put(`${API_BASE_URL}/cart/update`, {
//         cart_item_id,
//         quantity: qty + 1,
//       })
//       .then(() => {
//         setCartItems((prev) =>
//           prev.map((item) =>
//             item.cart_item_id === cart_item_id
//               ? { ...item, quantity: qty + 1 }
//               : item
//           )
//         );
//       });
//   };

//   /* ➖ Decrease */
//   const decreaseQty = (cart_item_id, qty) => {
//     if (qty <= 1) return;

//     axios
//       .put(`${API_BASE_URL}/cart/update`, {
//         cart_item_id,
//         quantity: qty - 1,
//       })
//       .then(() => {
//         setCartItems((prev) =>
//           prev.map((item) =>
//             item.cart_item_id === cart_item_id
//               ? { ...item, quantity: qty - 1 }
//               : item
//           )
//         );
//       });
//   };

//   /* ❌ Remove */
//   const removeItem = (cart_item_id) => {
//     axios
//       .delete(`${API_BASE_URL}/cart/remove/${cart_item_id}`)
//       .then(() => {
//         setCartItems((prev) =>
//           prev.filter((item) => item.cart_item_id !== cart_item_id)
//         );
//       });
//   };

//   const subtotal = cartItems.reduce(
//     (sum, item) => sum + Number(item.price) * item.quantity,
//     0
//   );

//   const total = subtotal + DELIVERY_CHARGE - DISCOUNT;

//   return (
//     <section className="cart_view pt_100 xs_pt_80 pb-80">
//       <div className="container">
//         <div className="row">

//           {/* ================= LEFT CART TABLE ================= */}
//           <div className="col-lg-8">
//             <div className="cart_table_area">
//               <div className="table-responsive">
//                 <table>
//                   <thead>
//                     <tr>
//                       <th>Image</th>
//                       <th>Product</th>
//                       <th>Price</th>
//                       <th>Quantity</th>
//                       <th>Total</th>
//                       <th>Delete</th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {cartItems.map((item) => (
//                       <tr key={item.cart_item_id}>
//                         <td>
//                           <img
//                           src={item.image || img1}
//                             alt={item.name}
//                             className="img-fluid"
//                           />
//                         </td>

//                         <td>
//                           <span className="title">{item.name}</span>
//                         </td>

//                         <td>${Number(item.price).toFixed(2)}</td>

//                         <td>
//                           <div className="button_area">
//                             <button
//                               onClick={() =>
//                                 decreaseQty(item.cart_item_id, item.quantity)
//                               }
//                             >
//                               –
//                             </button>

//                             <input
//                               type="text"
//                               value={item.quantity}
//                               readOnly
//                             />

//                             <button
//                               onClick={() =>
//                                 increaseQty(item.cart_item_id, item.quantity)
//                               }
//                             >
//                               +
//                             </button>
//                           </div>
//                         </td>

//                         <td>
//                           ${(Number(item.price) * item.quantity).toFixed(2)}
//                         </td>

//                         <td>
//                           <button
//                             className="del"
//                             onClick={() => removeItem(item.cart_item_id)}
//                           >
//                             <i className="fa fa-times-circle"></i>
//                           </button>
//                         </td>
//                       </tr>
//                     ))}

//                     {cartItems.length === 0 && (
//                       <tr>
//                         <td colSpan="6" style={{ textAlign: "center" }}>
//                           Cart is empty
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>

//               {/* COUPON */}
//               <form className="coupon_form">
//                 <input type="text" placeholder="Coupon Code" />
//                 <button className="common_btn">
//                   Apply Coupon <span></span>
//                 </button>
//               </form>
//             </div>
//           </div>

//           {/* ================= RIGHT SUMMARY ================= */}
//           <div className="col-lg-4 col-md-8">
//             <div className="cart_sidebar">
//               <h3>Total Cart ({cartItems.length})</h3>

//               <div className="cart_sidebar_info">
//                 <h4>
//                   Subtotal : <span>${subtotal.toFixed(2)}</span>
//                 </h4>

//                 <p>
//                   Delivery : <span>${DELIVERY_CHARGE.toFixed(2)}</span>
//                 </p>

//                 <p>
//                   Discount : <span>-${DISCOUNT.toFixed(2)}</span>
//                 </p>

//                 <h5>
//                   Total : <span>${total.toFixed(2)}</span>
//                 </h5>

//                 <Link to="/Checkout" className="common_btn">
//                   Checkout <i className="fa fa-long-arrow-right"></i>
//                   <span></span>
//                 </Link>

//               </div>
//             </div>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// };

// export default Cart;







import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import CouponPopup from "../pages/RestaurantDashboard/CouponPopup";
import "../pages/css/cart.css";

/* IMAGE PLACEHOLDER */
import img1 from "../images/cart_view_img_1.png";

const API_BASE_URL = "http://192.168.2.9:5000/api";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);


  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
const [couponMessage, setCouponMessage] = useState("");
const [appliedCoupon, setAppliedCoupon] = useState(null);
const [showCouponPopup, setShowCouponPopup] = useState(false);
const [productCoupons, setProductCoupons] = useState({});
const [cartCoupon, setCartCoupon] = useState(null);
const [productOffers, setProductOffers] = useState({});

  // ✅ FIX: READ CORRECT TOKEN KEY
  const getToken = () => localStorage.getItem("token");
const handleCheckout = () => {
  localStorage.setItem("cart", JSON.stringify(cartItems));

  localStorage.setItem(
    "cart_summary",
    JSON.stringify({
      subtotal,
      delivery: DELIVERY_CHARGE,
      discount:
        (productCouponTotal || 0) +
        (cartCoupon?.discount || 0),
      total,
      coupon_id: cartCoupon?.coupon_id || null   // ✅ NEW
    })
  );
};

// const applyCoupon = async () => {

//   if (!couponCode) {
//     setCouponMessage("Enter coupon code");
//     return;
//   }

//   try {

//     const res = await axios.post(
//       `${API_BASE_URL}/coupons/apply`,
//       {
//         code: couponCode,
//         cart_total: subtotal,
//         restaurant_id: localStorage.getItem("restaurant_id")
//       }
//     );

//     const discountAmount = Number(res.data.discount || 0);

//     const safeDiscount = Math.min(discountAmount, subtotal);
//     setDiscount(safeDiscount);

//     setAppliedCoupon(res.data.coupon_id);

//     setCouponMessage(`Coupon Applied - Saved QAR ${discountAmount}`);

//   } catch (err) {

//     setCouponMessage(
//       err.response?.data?.error || "Invalid coupon"
//     );

//     setDiscount(0);
//   }
// };

useEffect(() => {

  if (!cartItems.length) return;

  const fetchOffers = async () => {

    const offersMap = {};

    await Promise.all(
      cartItems.map(async (item) => {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/offers/by-product/${item.product_id}`
          );

          if (res.data && res.data.offer_status === "ACTIVE") {
            offersMap[item.product_id] = res.data;
          }

        } catch (err) {
          console.log("No offer for product", item.product_id);
        }
      })
    );

    setProductOffers(offersMap);
  };

  fetchOffers();

}, [cartItems]);


const getOfferPrice = (item) => {

  const offer = productOffers[item.product_id];
  const price = Number(item.price);

  if (!offer) return price;

  if (offer.offer_type === "Percentage") {
    return price - (price * offer.discount_percentage) / 100;
  }

  if (offer.offer_type === "Flat") {
    return price - offer.flat_amount;
  }

  if (offer.offer_type === "BOGO") {
    // simple handling → no price change (handled by quantity logic if needed)
    return price;
  }

  return price;
};

const applyCoupon = async (manualCode = null) => {

  const codeToApply =
    typeof manualCode === "string" && manualCode.trim() !== ""
      ? manualCode
      : couponCode;

  if (!codeToApply) {
    setCouponMessage("Enter coupon code");
    return;
  }

  try {

    const res = await axios.post(
      `${API_BASE_URL}/coupons/apply`,
      {
        code: codeToApply,
        cart_total: subtotal,
        restaurant_id: localStorage.getItem("restaurant_id"),
        cart_items: cartItems.map(item => ({
  product_id: item.product_id,
  category_id: item.category_id,
  supplier_id: item.supplier_id,
  price: item.price,
  quantity: item.quantity
}))
      }
    );

    const scope = res.data.scope_type;
    const discountAmount = Number(res.data.discount || 0);

    // ✅ remove old coupons automatically
    setCartCoupon(null);
    setProductCoupons({});

if (scope === "PRODUCT" || scope === "CATEGORY") {

  const products = res.data.products || [];

  const updatedCoupons = {};

products.forEach((p) => {

  const cartItem = cartItems.find(
    (item) => item.product_id === p.product_id
  );

  const qty = cartItem ? cartItem.quantity : 1;

  updatedCoupons[p.product_id] = {
    coupon_id: res.data.coupon_id,
    discount: p.discount / qty   // ✅ store per-unit discount
  };

});
  setProductCoupons(updatedCoupons);

  setCouponMessage(`Product coupon applied - Saved QAR ${discountAmount}`);
} else {

      setCartCoupon({
        coupon_id: res.data.coupon_id,
        discount: discountAmount
      });

      setCouponMessage(`Cart coupon applied - Saved QAR ${discountAmount}`);
    }

    setCouponCode(codeToApply);
    

  } catch (err) {

    setCouponMessage(
      err.response?.data?.error || "Invalid coupon"
    );

  }
};

const removeCoupon = () => {

  setCartCoupon(null);
  setProductCoupons({});
  setCouponCode("");
  setCouponMessage("");

};


  /* ================= FETCH CART ================= */
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    axios
      .get(`${API_BASE_URL}/cart/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
.then((res) => {
  setCartItems(res.data.items || []);
  // setDiscount(0); // always start with 0
})
      .catch((err) => {
        console.error("FETCH CART ERROR", err);
      });
  }, []);

  /* ➕ Increase */
  const increaseQty = (cart_item_id, qty) => {
    const token = getToken();
    if (!token) return;

    axios
      .put(
        `${API_BASE_URL}/cart/update`,
        { cart_item_id, quantity: qty + 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setCartItems((prev) =>
          prev.map((item) =>
            item.cart_item_id === cart_item_id
              ? { ...item, quantity: qty + 1 }
              : item
          )
        );
      });
  };

  /* ➖ Decrease */
  const decreaseQty = (cart_item_id, qty) => {
    if (qty <= 1) return;

    const token = getToken();
    if (!token) return;

    axios
      .put(
        `${API_BASE_URL}/cart/update`,
        { cart_item_id, quantity: qty - 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setCartItems((prev) =>
          prev.map((item) =>
            item.cart_item_id === cart_item_id
              ? { ...item, quantity: qty - 1 }
              : item
          )
        );
      });
  };

  /* ❌ Remove */
  const removeItem = (cart_item_id) => {
    const token = getToken();
    if (!token) return;

    axios
      .delete(`${API_BASE_URL}/cart/remove/${cart_item_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setCartItems((prev) =>
          prev.filter((item) => item.cart_item_id !== cart_item_id)
        );
      });
  };
/* ================= SUBTOTAL ================= */
const subtotal = cartItems.reduce((sum, item) => {

  const base = getOfferPrice(item) * item.quantity;

 

  const perUnitDiscount =
    productCoupons[item.product_id]?.discount || 0;

  const totalDiscount = perUnitDiscount * item.quantity;

  return sum + (base - totalDiscount);

}, 0);


/* ================= PRODUCT COUPON TOTAL ================= */
const productCouponTotal = cartItems.reduce((sum, item) => {

  const perUnitDiscount =
    productCoupons[item.product_id]?.discount || 0;

  return sum + (perUnitDiscount * item.quantity);

}, 0);


/* ================= DYNAMIC DELIVERY (MOVE HERE) ================= */
const getDeliveryCharge = (subtotal) => {
  if (subtotal >= 500) return 0;
  if (subtotal >= 200) return 30;
  return 50;
};

const DELIVERY_CHARGE = getDeliveryCharge(subtotal);


/* ================= TOTAL ================= */
const total =
  subtotal +
  DELIVERY_CHARGE -
  (cartCoupon?.discount || 0);
  /* ================= REMOVE CATEGORY COUPON IF BELOW MIN ORDER ================= */
useEffect(() => {

  if (!Object.keys(productCoupons).length) return;

  axios
    .get(`${API_BASE_URL}/coupons/active`, {
      params: { cart_total: subtotal }
    })
    .then((res) => {

      const offers = res.data.offers || [];

      setProductCoupons((prev) => {

        const updated = { ...prev };

        Object.keys(updated).forEach(pid => {

          const couponId = updated[pid].coupon_id;

          const offer = offers.find(
            (o) => o.coupon_id === couponId
          );

          if (!offer) return;

          // only check CATEGORY coupons
          if (offer.scope_type !== "CATEGORY") return;

          const couponCategories = (offer.category_ids || []).map(Number);

          let categorySubtotal = 0;

          cartItems.forEach(item => {

            const cartCategory = Number(item.category_id);

            if (couponCategories.includes(cartCategory)) {
              categorySubtotal += Number(item.price) * Number(item.quantity);
            }

          });

          if (categorySubtotal < Number(offer.min_order_value)) {

            // remove coupon
            delete updated[pid];

            setCouponCode("");
            setCouponMessage("");

          }

        });

        return updated;

      });

    })
    .catch((err) => {
      console.error("Category coupon revalidation error", err);
    });

}, [subtotal, cartItems]);

  /* ================= REMOVE CART COUPON IF BELOW MIN ORDER ================= */
useEffect(() => {

  if (!cartCoupon) return;

  axios
    .get(`${API_BASE_URL}/coupons/active`, {
      params: { cart_total: subtotal }
    })
    .then((res) => {

      const offers = res.data.offers || [];

      const current = offers.find(
        (o) => o.coupon_id === cartCoupon.coupon_id
      );

      // if coupon exists but not eligible anymore → remove it
      if (current && !current.eligible) {

        setCartCoupon(null);
        setCouponCode("");
        setCouponMessage("");

      }

    })
    .catch((err) => {
      console.error("Coupon revalidation error", err);
    });

}, [subtotal]);

useEffect(() => {
  if (!couponCode) return;

  const reApplyCoupon = async () => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/coupons/apply`,
        {
          code: couponCode,
          cart_total: subtotal,
          restaurant_id: localStorage.getItem("restaurant_id"),
          cart_items: cartItems.map(item => ({
            product_id: item.product_id,
            category_id: item.category_id,
            supplier_id: item.supplier_id,
            price: item.price,
            quantity: item.quantity
          }))
        }
      );

      const scope = res.data.scope_type;
      const discountAmount = Number(res.data.discount || 0);

      // 🔁 RESET before reapply
      setCartCoupon(null);
      setProductCoupons({});

      if (scope === "PRODUCT" || scope === "CATEGORY") {
        const updatedCoupons = {};

        (res.data.products || []).forEach((p) => {
          const cartItem = cartItems.find(
            (item) => item.product_id === p.product_id
          );

          const qty = cartItem ? cartItem.quantity : 1;

          updatedCoupons[p.product_id] = {
            coupon_id: res.data.coupon_id,
            discount: p.discount / qty
          };
        });

        setProductCoupons(updatedCoupons);

      } else {
        setCartCoupon({
          coupon_id: res.data.coupon_id,
          discount: discountAmount
        });
      }

    } catch (err) {
      console.log("Auto coupon refresh failed");
    }
  };

  reApplyCoupon();

}, [cartItems, subtotal]); // 🔥 IMPORTANT

  return (
    <section className="cart_view pt_100 xs_pt_80 pb-80">
      <div className="container">
        <div className="row">

          <div className="col-lg-8">
            {/* {cartCoupon && (
  <div
    style={{
      background: "#f8f8f8",
      borderRadius: "10px",
      padding: "12px 16px",
      marginBottom: "15px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}
  >

    <div>
      <strong>
        Saved QAR {cartCoupon.discount.toFixed(2)} with {couponCode}
      </strong>
      <div style={{ fontSize: "13px", color: "#666" }}>
        View all payment offers
      </div>
    </div>

    <button
      onClick={removeCoupon}
      style={{
        border: "1px solid #ccc",
        background: "#fff",
        borderRadius: "8px",
        padding: "6px 14px",
        cursor: "pointer"
      }}
    >
      Remove
    </button>

  </div>
)} */}
            <div className="cart_table_area">
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th>Delete</th>
                    </tr>
                  </thead>

                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.cart_item_id}>
                        <td>
                          <img
                            src={item.image || img1}
                            alt={item.name}
                            className="img-fluid"
                            id="cart"
                          />
                        </td>

                        <td>
                          <span className="title">{item.name}</span>
                        </td>

                          <td>
  {(() => {

    const original = Number(item.original_price || item.price);

    const offerPrice = getOfferPrice(item);

    const couponDiscount =
      productCoupons[item.product_id]?.discount || 0;

    const final = offerPrice - couponDiscount;

    return (
      <>
        {/* ✅ NEW PRICE */}
        <span className="price_new">
          QAR {final.toFixed(2)}
        </span>

        {/* ✅ OLD PRICE (SHOW WHEN DISCOUNT EXISTS) */}
        {(couponDiscount > 0 || offerPrice < original) && (
          <span className="price_old">
             {original.toFixed(2)}
          </span>
        )}
      </>
    );

  })()}
</td>
                        <td>
                          <div className="button_area">
                            <button onClick={() => decreaseQty(item.cart_item_id, item.quantity)}>
                              –
                            </button>
                            <input type="text" value={item.quantity} readOnly />
                            <button onClick={() => increaseQty(item.cart_item_id, item.quantity)}>
                              +
                            </button>
                          </div>
                        </td>

                        <td>
  QAR {(
(
  getOfferPrice(item) -
  (productCoupons[item.product_id]?.discount || 0)
) * item.quantity
  ).toFixed(2)}
</td>

                        <td>
                          <button className="del" onClick={() => removeItem(item.cart_item_id)}>
                            <i className="fa fa-times-circle"></i>
                          </button>
                        </td>
                      </tr>
                    ))}

                    {cartItems.length === 0 && (
                      <tr>
                        <td colSpan="6" className="coupon_box">
                          Cart is empty
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="coupon_container">

                <div className="coupon_input_group">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />

                  <button
                    type="button"
                    className="apply_btn"
                    onClick={() => applyCoupon()}
                  >
                    Apply
                  </button>
                </div>

                <button
                  type="button"
                  className="view_offer_btn"
                  onClick={() => setShowCouponPopup(true)}
                >
                  View Offers
                </button>
                

{!showCouponPopup &&
Object.entries(productCoupons).map(([pid, coupon]) => {

  const product = cartItems.find(
    (p) => String(p.product_id) === String(pid)
  );

  const productName = product ? product.name : "Product";

  return (
    <div
      key={pid}
  className="coupon_box"
    >
      <div>
        <strong>
          Saved QAR {(coupon.discount * (product?.quantity || 1)).toFixed(2)} on {productName}
        </strong>

        <div className="coupon_text">
          View all payment offers
        </div>
      </div>

      <button className="remove_btn"
        onClick={() => {
          setProductCoupons((prev) => {
            const updated = { ...prev };
            delete updated[pid];
            return updated;
          });
          setCouponMessage("");
        }}
      >
        Remove
      </button>
    </div>
  );
})}
{/* CART COUPON */}
{cartCoupon && (

  <div
   className="coupon_box"
  >

    <div>
      <strong>
        Saved QAR {cartCoupon.discount.toFixed(2)} with {couponCode}
      </strong>

      <div style={{ fontSize: "13px", color: "#666" }}>
        View all payment offers
      </div>
    </div>

  <button
  onClick={() => {
    setCartCoupon(null);
    setCouponCode("");      // clear input
    setCouponMessage("");
  }}
    >
      Remove
    </button>

  </div>

)}
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-8">
            <div className="cart_sidebar">
              <h3>Total Cart ({cartItems.length})</h3>

              <div className="cart_sidebar_info">
                <h4>Subtotal : <span>QAR {subtotal.toFixed(2)}</span></h4>
                <p>Delivery : <span>QAR {DELIVERY_CHARGE.toFixed(2)}</span></p>
                <p>
                Coupon Discount :
                <span>
                -QAR 
                {(
                (productCouponTotal || 0) +
                (cartCoupon?.discount || 0)
                ).toFixed(2)}
                </span>
                </p>
                <h5>Total : <span>QAR {total.toFixed(2)}</span></h5>

                {/* <Link to="/restaurantdashboard/Checkout" className="common_btn">
                  Checkout <i className="fa fa-long-arrow-right"></i>
                  <span></span>
                </Link> */}
                      <Link
                    to="/Checkout"
                    className="common_btn"
                    onClick={handleCheckout}
                  >
                    Checkout<i className="fa fa-long-arrow-right"></i>
                    <span></span>
                  </Link>

              </div>
            </div>
          </div>

        </div>
      </div>
{showCouponPopup && (
<CouponPopup
  subtotal={subtotal}
  appliedCoupon={couponCode}
  productCoupons={productCoupons}
  cartItems={cartItems}
onRemove={(offer) => {

  // remove cart coupon
  if (cartCoupon && offer.code === couponCode) {
    setCartCoupon(null);
  }

  // remove product coupon
  setProductCoupons(prev => {

    const updated = { ...prev };

    Object.keys(updated).forEach(pid => {
      if (updated[pid].coupon_id === offer.coupon_id) {
        delete updated[pid];
      }
    });

    return updated;

  });

  // refresh coupon input like remove button
  setCouponCode("");
  setCouponMessage("");

}}
onClose={() => setShowCouponPopup(false)}
onApply={(code) => {
  setShowCouponPopup(false);
  setCouponCode(code);     // store applied coupon
  setAppliedCoupon(code);  // mark coupon active
  applyCoupon(code);       // apply coupon
}}
/>
)}
      
    </section>
  );
};

export default Cart;