// import React, { useEffect, useState } from "react";
// import axios from "axios";
// // import "../css/coupons.css";

// const API_BASE_URL = "http://192.168.2.22:5000/api";

// const CouponPopup = ({
//   onClose,
//   onApply,
//   subtotal,
//   appliedCoupon,
//   onRemove,
//   productCoupons,
//   cartItems
// }) => {

//   const [offers, setOffers] = useState([]);

//   useEffect(() => {
//     axios
//       .get(`${API_BASE_URL}/coupons/active`, {
//         params: { cart_total: subtotal }
//       })
//       .then((res) => {
//         setOffers(res.data.offers || []);
//       })
//       .catch((err) => {
//         console.error("Coupon fetch error", err);
//       });
//   }, [subtotal]);

//   return (
//     <div className="swiggy_overlay">
//       <div className="swiggy_modal">

//         <div className="swiggy_header">
//           <h3>Available Offers</h3>
//           <button onClick={onClose}>✕</button>
//         </div>

//         <div className="swiggy_body">

//           {offers.map((offer) => {

//             // check if cart coupon applied
//             const cartCouponApplied = appliedCoupon === offer.code;

//             // check if product coupon applied
//             const productCouponApplied =
//               Object.values(productCoupons || {}).some(
//                 (c) => c.coupon_id === offer.coupon_id
//               );

//             const isApplied = cartCouponApplied || productCouponApplied;

// // ===============================
// // PRODUCT / CATEGORY eligibility
// // ===============================
// let productEligible = true;

// if (offer.scope_type === "PRODUCT") {

//   productEligible = cartItems.some(item =>
//     (offer.product_ids || []).includes(item.product_id)
//   );

// }

// if (offer.scope_type === "CATEGORY") {

//   const couponCategories = (offer.category_ids || []).map(Number);

//   let categorySubtotal = 0;

//   cartItems.forEach(item => {

//     const cartCategory = Number(item.category_id);

//     if (couponCategories.includes(cartCategory)) {
//       categorySubtotal += Number(item.price) * Number(item.quantity);
//     }

//   });

//   productEligible = categorySubtotal >= Number(offer.min_order_value);

//   offer.amount_needed = Math.max(
//     0,
//     Number(offer.min_order_value) - categorySubtotal
//   );

// }

// const eligible =
//   offer.scope_type === "PRODUCT" || offer.scope_type === "CATEGORY"
//     ? productEligible
//     : offer.eligible;
//             return (
//               <div
//   key={offer.coupon_id}
//   className="swiggy_card"
//   style={{
//     opacity: eligible ? 1 : 0.45
//   }}
// >

//                 <div className="left_strip"></div>

//                 <div className="coupon_content">

//                   <div className="coupon_top">

//                     <h4>{offer.code}</h4>

//                     {isApplied ? (

//                       <button
//                         className="apply_active"
//                         style={{
//                           background: "#fff",
//                           color: "#ff7a00",
//                           border: "1px solid #ff7a00"
//                         }}
//                         onClick={() => onRemove(offer)}
//                       >
//                         REMOVE
//                       </button>

//                     ) : eligible ? (

//                       <button
//                         className="apply_active"
//                         onClick={() => onApply(offer.code)}
//                       >
//                         APPLY
//                       </button>

//                     ) : (

// <button className="apply_disabled">
//   {offer.amount_needed > 0
//     ? `ADD QAR ${offer.amount_needed.toFixed(0)}`
//     : "ADD"}
// </button>

//                     )}

//                   </div>

//                  <p className="coupon_title">{offer.title}</p>

// {offer.products?.length > 0 && (
//   <p style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
//     Valid on products: {offer.products.join(", ")}
//   </p>
// )}

// {offer.categories?.length > 0 && (
//   <p style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
//     Valid on categories: {offer.categories.join(", ")}
//   </p>
// )}
//                   <p className="coupon_discount">
//                     {offer.discount_type === "PERCENTAGE"
//                       ? `Get ${offer.discount_value}% off`
//                       : `Flat QAR ${offer.discount_value} off`}
//                   </p>

//                   <p className="coupon_min">
//                     Min order QAR {offer.min_order_value}
//                   </p>

//                   {offer.max_discount && (
//                     <p className="coupon_max">
//                       Max discount QAR {offer.max_discount}
//                     </p>
//                   )}

//                   <p className="coupon_expiry">
//                     Valid till {new Date(offer.end_date).toLocaleDateString()}
//                   </p>

//                 </div>
//               </div>
//             );
//           })}

//           {offers.length === 0 && (
//             <p style={{ textAlign: "center" }}>
//               No offers available
//             </p>
//           )}

//         </div>

//       </div>
//     </div>
//   );
// };

// export default CouponPopup;


import React, { useEffect, useState } from "react";
import axios from "axios";
// import "../styles/couponPopup.css";

const API_BASE_URL = "http://192.168.2.22:5000/api";

const CouponPopup = ({
  onClose,
  onApply,
  subtotal,
  appliedCoupon,
  onRemove,
  productCoupons,
  cartItems
}) => {

  const [offers, setOffers] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/coupons/active`, {
        params: { cart_total: subtotal }
      })
      .then((res) => {
        setOffers(res.data.offers || []);
      })
      .catch((err) => {
        console.error("Coupon fetch error", err);
      });
  }, [subtotal]);

  return (
    <div className="cp_overlay">

      <div className="cp_modal">

        {/* HEADER */}
        <div className="cp_header">

          <h3>Available Offers</h3>

          <button
            className="cp_close"
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        {/* BODY */}
        <div className="cp_body">

          {offers.map((offer) => {

            // CART COUPON
            const cartCouponApplied =
              appliedCoupon === offer.code;

            // PRODUCT COUPON
            const productCouponApplied =
              Object.values(productCoupons || {}).some(
                (c) => c.coupon_id === offer.coupon_id
              );

            const isApplied =
              cartCouponApplied || productCouponApplied;

            // =========================
            // ELIGIBILITY
            // =========================

            let productEligible = true;

            // PRODUCT COUPON
            if (offer.scope_type === "PRODUCT") {

              productEligible = cartItems.some(
                (item) =>
                  (offer.product_ids || []).includes(
                    item.product_id
                  )
              );

            }

            // CATEGORY COUPON
            if (offer.scope_type === "CATEGORY") {

              const couponCategories =
                (offer.category_ids || []).map(Number);

              let categorySubtotal = 0;

              cartItems.forEach((item) => {

                const cartCategory =
                  Number(item.category_id);

                if (
                  couponCategories.includes(cartCategory)
                ) {

                  categorySubtotal +=
                    Number(item.price) *
                    Number(item.quantity);

                }

              });

              productEligible =
                categorySubtotal >=
                Number(offer.min_order_value);

              offer.amount_needed = Math.max(
                0,
                Number(offer.min_order_value) -
                  categorySubtotal
              );

            }

            const eligible =
              offer.scope_type === "PRODUCT" ||
              offer.scope_type === "CATEGORY"
                ? productEligible
                : offer.eligible;

            return (

              <div
                key={offer.coupon_id}
                className="cp_card"
                style={{
                  opacity: eligible ? 1 : 0.45
                }}
              >

                {/* LEFT STRIP */}
                <div className="cp_strip"></div>

                {/* CONTENT */}
                <div className="cp_content">

                  {/* TOP */}
                  <div className="cp_top">

                    <h4>{offer.code}</h4>

                    {isApplied ? (

                      <button
                        className="cp_remove_btn"
                        onClick={() => onRemove(offer)}
                      >
                        REMOVE
                      </button>

                    ) : eligible ? (

                      <button
                        className="cp_apply_btn"
                        onClick={() =>
                          onApply(offer.code)
                        }
                      >
                        APPLY
                      </button>

                    ) : (

                      <button className="cp_disabled_btn">

                        {offer.amount_needed > 0
                          ? `ADD QAR ${offer.amount_needed.toFixed(0)}`
                          : "ADD"}

                      </button>

                    )}

                  </div>

                  {/* TITLE */}
                  <p className="cp_title">
                    {offer.title}
                  </p>

                  {/* PRODUCTS */}
                  {offer.products?.length > 0 && (

                    <p className="cp_subtext">

                      Valid on products:
                      {" "}
                      {offer.products.join(", ")}

                    </p>

                  )}

                  {/* CATEGORIES */}
                  {offer.categories?.length > 0 && (

                    <p className="cp_subtext">

                      Valid on categories:
                      {" "}
                      {offer.categories.join(", ")}

                    </p>

                  )}

                  {/* DISCOUNT */}
                  <p className="cp_discount">

                    {offer.discount_type === "PERCENTAGE"
                      ? `Get ${offer.discount_value}% off`
                      : `Flat QAR ${offer.discount_value} off`}

                  </p>

                  {/* MIN */}
                  <p className="cp_min">

                    Min order QAR
                    {" "}
                    {offer.min_order_value}

                  </p>

                  {/* MAX */}
                  {offer.max_discount && (

                    <p className="cp_max">

                      Max discount QAR
                      {" "}
                      {offer.max_discount}

                    </p>

                  )}

                  {/* EXPIRY */}
                  <p className="cp_expiry">

                    Valid till
                    {" "}
                    {new Date(
                      offer.end_date
                    ).toLocaleDateString()}

                  </p>

                </div>

              </div>

            );

          })}

          {/* EMPTY */}
          {offers.length === 0 && (

            <p className="cp_empty">

              No offers available

            </p>

          )}

        </div>

      </div>

    </div>
  );
};

export default CouponPopup;