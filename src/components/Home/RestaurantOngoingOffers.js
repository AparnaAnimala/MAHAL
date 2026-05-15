// import React from "react";

// const RestaurantOffers = () => {
//   return (
//     <section className="mahal-restaurant-offers">
//       <div className="container">

//         {/* HEADING */}
//         <div className="row mb-5">
//           <div className="col-lg-6 m-auto text-center">
//             <h6 className="mahal-subtitle">RESTAURANT OFFERS</h6>
//             <h2 className="mahal-title">
//               Ongoing <span>Restaurant Deals</span>
//             </h2>
//             <p className="mahal-desc">
//               Take advantage of exclusive supplier offers and special pricing
//               available for restaurants on MAHAL.
//             </p>
//           </div>
//         </div>

//         {/* OFFERS */}
//         <div className="row">

//           {/* OFFER 1 */}
//           <div className="col-lg-4 col-md-6 mb-4">
//             <div className="mahal-offer-card">
//               <span className="offer-badge">Limited Time</span>
//               <h4>Fresh Vegetables Combo</h4>
//               <p>
//                 Get special pricing on daily fresh vegetables from verified
//                 local suppliers.
//               </p>
//               <ul>
//                 <li>✔ Bulk order discounts</li>
//                 <li>✔ Same-day delivery</li>
//                 <li>✔ Transparent pricing</li>
//               </ul>
//               <a href="/restaurantoffers" className="mahal-btn-secondary">
//                 View Offer
//               </a>
//             </div>
//           </div>

//           {/* OFFER 2 */}
//           <div className="col-lg-4 col-md-6 mb-4">
//             <div className="mahal-offer-card featured">
//               <span className="offer-badge">Popular</span>
//               <h4>Monthly Essentials Deal</h4>
//               <p>
//                 Save more with bulk monthly orders on rice, oil, and kitchen
//                 essentials.
//               </p>
//               <ul>
//                 <li>✔ Better bulk rates</li>
//                 <li>✔ Scheduled delivery</li>
//                 <li>✔ Priority support</li>
//               </ul>
//               <a href="/Registration" className="mahal-btn-primary">
//                 Grab This Deal
//               </a>
//             </div>
//           </div>

//           {/* OFFER 3 */}
//           <div className="col-lg-4 col-md-6 mb-4">
//             <div className="mahal-offer-card">
//               <span className="offer-badge">New</span>
//               <h4>New Restaurant Offer</h4>
//               <p>
//                 Newly onboarded restaurants get exclusive introductory pricing
//                 on first orders.
//               </p>
//               <ul>
//                 <li>✔ Special onboarding price</li>
//                 <li>✔ Verified suppliers</li>
//                 <li>✔ Easy ordering</li>
//               </ul>
//               <a href="/RestaurantLogIn" className="mahal-btn-secondary">
//                 Get Started
//               </a>
//             </div>
//           </div>

//         </div>

        
// <br></br>
//         <hr></hr>

//       </div>
//     </section>
//   );
// };

// export default RestaurantOffers;


import React from "react";
import { useTranslation } from "react-i18next";

const RestaurantOffers = () => {
  const { t } = useTranslation();

  return (
    <section className="mahal-restaurant-offers">
      <div className="container">

        {/* HEADING */}
        <div className="row mb-5">
          <div className="col-lg-6 m-auto text-center">
            <h6 className="mahal-subtitle">
              {t("restaurantoffers.subtitle")}
            </h6>

            <h2 className="mahal-title">
              {t("restaurantoffers.title1")}{" "}
              <span>{t("restaurantoffers.title2")}</span>
            </h2>

            <p className="mahal-desc">
              {t("restaurantoffers.desc")}
            </p>
          </div>
        </div>

        {/* OFFERS */}
        <div className="row">

          {/* OFFER 1 */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="mahal-offer-card">
              <span className="offer-badge">
                {t("restaurantoffers.offer1.badge")}
              </span>

              <h4>{t("restaurantoffers.offer1.title")}</h4>

              <p>{t("restaurantoffers.offer1.desc")}</p>

              <ul>
                <li>✔ {t("restaurantoffers.offer1.li1")}</li>
                <li>✔ {t("restaurantoffers.offer1.li2")}</li>
                <li>✔ {t("restaurantoffers.offer1.li3")}</li>
              </ul>

              <a href="/restaurantoffers" className="mahal-btn-secondary">
                {t("restaurantoffers.offer1.btn")}
              </a>
            </div>
          </div>

          {/* OFFER 2 */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="mahal-offer-card featured">
              <span className="offer-badge">
                {t("restaurantoffers.offer2.badge")}
              </span>

              <h4>{t("restaurantoffers.offer2.title")}</h4>

              <p>{t("restaurantoffers.offer2.desc")}</p>

              <ul>
                <li>✔ {t("restaurantoffers.offer2.li1")}</li>
                <li>✔ {t("restaurantoffers.offer2.li2")}</li>
                <li>✔ {t("restaurantoffers.offer2.li3")}</li>
              </ul>

              <a href="/Registration" className="mahal-btn-primary">
                {t("restaurantoffers.offer2.btn")}
              </a>
            </div>
          </div>

          {/* OFFER 3 */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="mahal-offer-card">
              <span className="offer-badge">
                {t("restaurantoffers.offer3.badge")}
              </span>

              <h4>{t("restaurantoffers.offer3.title")}</h4>

              <p>{t("restaurantoffers.offer3.desc")}</p>

              <ul>
                <li>✔ {t("restaurantoffers.offer3.li1")}</li>
                <li>✔ {t("restaurantoffers.offer3.li2")}</li>
                <li>✔ {t("restaurantoffers.offer3.li3")}</li>
              </ul>

              <a href="/RestaurantLogIn" className="mahal-btn-secondary">
                {t("restaurantoffers.offer3.btn")}
              </a>
            </div>
          </div>

        </div>

        <br />
        <hr />

      </div>
    </section>
  );
};

export default RestaurantOffers;