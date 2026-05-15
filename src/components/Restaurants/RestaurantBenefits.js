// import React from "react";

// const RestaurantBenefits = () => {
//   return (
//     <section className="mahal-restaurant-benefits">
//       <div className="container">

//         {/* HEADING */}
//         <div className="row mb-5">
//           <div className="col-lg-6 m-auto text-center">
//             <h6 className="mahal-subtitle">FOR RESTAURANTS</h6>
//             <h2 className="mahal-title">
//               Why Restaurants Choose <span>MAHAL</span>
//             </h2>
//             <p className="mahal-desc">
//               MAHAL helps restaurants manage food sourcing efficiently with
//               trusted suppliers, fair pricing, and reliable deliveries.
//             </p>
//           </div>
//         </div>

//         {/* BENEFITS */}
//         <div className="row">

//           <div className="col-lg-4 col-md-6 mb-4">
//             <div className="mahal-benefit-card">
//               <i className="fas fa-seedling"></i>
//               <h4>Fresh & Quality Ingredients</h4>
//               <p>
//                 Source vegetables, fruits, meat, and essentials from verified
//                 suppliers you can trust.
//               </p>
//             </div>
//           </div>

//           <div className="col-lg-4 col-md-6 mb-4">
//             <div className="mahal-benefit-card">
//               <i className="fas fa-tags"></i>
//               <h4>Transparent Pricing</h4>
//               <p>
//                 Compare supplier prices easily with no hidden costs or surprises.
//               </p>
//             </div>
//           </div>

//           <div className="col-lg-4 col-md-6 mb-4">
//             <div className="mahal-benefit-card">
//               <i className="fas fa-clock"></i>
//               <h4>Save Time & Effort</h4>
//               <p>
//                 Manage all daily and bulk procurement from one single platform.
//               </p>
//             </div>
//           </div>

//           <div className="col-lg-4 col-md-6 mb-4">
//             <div className="mahal-benefit-card">
//               <i className="fas fa-truck"></i>
//               <h4>Reliable Daily Delivery</h4>
//               <p>
//                 Get ingredients delivered on time to keep your kitchen running
//                 smoothly.
//               </p>
//             </div>
//           </div>

//           <div className="col-lg-4 col-md-6 mb-4">
//             <div className="mahal-benefit-card">
//               <i className="fas fa-boxes-stacked"></i>
//               <h4>Bulk & Recurring Orders</h4>
//               <p>
//                 Place bulk orders or schedule recurring supplies with ease.
//               </p>
//             </div>
//           </div>

//           <div className="col-lg-4 col-md-6 mb-4">
//             <div className="mahal-benefit-card">
//               <i className="fas fa-mobile-screen"></i>
//               <h4>Easy App Ordering</h4>
//               <p>
//                 Order anytime through MAHAL app and track your supplies in real time.
//               </p>
//             </div>
//           </div>

//         </div>

//         {/* CTA */}
//         <div className="text-center mt-4">
//           <a href="/Registration" className="mahal-btn-primary">
//             Start Ordering for Your Restaurant
//           </a>
//         </div>

//       </div>
//     </section>
//   );
// };

// export default RestaurantBenefits;




import React from "react";
import { useTranslation } from "react-i18next";

const RestaurantBenefits = () => {
  const { t } = useTranslation();

  return (
    <section className="mahal-restaurant-benefits">
      <div className="container">

        {/* HEADING */}
        <div className="row mb-5">
          <div className="col-lg-6 m-auto text-center">

            <h6 className="mahal-subtitle">
              {t("restaurantbenefits.subtitle")}
            </h6>

            <h2 className="mahal-title">
              {t("restaurantbenefits.title1")}{" "}
              <span>{t("restaurantbenefits.title2")}</span>
            </h2>

            <p className="mahal-desc">
              {t("restaurantbenefits.desc")}
            </p>

          </div>
        </div>

        {/* BENEFITS */}
        <div className="row">

          {[1,2,3,4,5,6].map((i) => (
            <div className="col-lg-4 col-md-6 mb-4" key={i}>
              <div className="mahal-benefit-card">
                <i className={t(`restaurantbenefits.items.${i}.icon`)}></i>

                <h4>{t(`restaurantbenefits.items.${i}.title`)}</h4>
                <p>{t(`restaurantbenefits.items.${i}.desc`)}</p>
              </div>
            </div>
          ))}

        </div>

        {/* CTA */}
        <div className="text-center mt-4">
          <a href="/Registration" className="mahal-btn-primary">
            {t("restaurantbenefits.cta")}
          </a>
        </div>

      </div>
    </section>
  );
};

export default RestaurantBenefits;