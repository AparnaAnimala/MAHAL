// import React from "react";
// import aboutImg from "../../images/about.png";

// const RestaurantAbout = () => {
//   return (
//     <section className="mahal-about-section">
//       <div className="container">
//         <div className="row align-items-center">

//           {/* LEFT CONTENT */}
//           <div className="col-lg-5 mt-4 mt-lg-0">
//             <div className="mahal-about-image">
//               <img src={aboutImg } alt="Restaurants" />
//             </div>
//           </div>
          

//           {/* RIGHT IMAGE */}
//             <div className="col-lg-7">
//             <div className="mahal-about-content">

//               <h6 className="mahal-subtitle"> <span> FOR </span> RESTAURANTS</h6>

//               <h2 className="mahal-title">
//                 Source Fresh Ingredients <br />
//                 from <span>Trusted Suppliers</span>
//               </h2>

//               <p className="mahal-desc">
//                 MAHAL helps restaurants simplify food procurement by connecting
//                 them with verified suppliers for daily and bulk sourcing.
//               </p>

//               <p class="mahal-text">From independent kitchens to multi-branch restaurant chains, MAHAL empowers restaurants with verified suppliers, transparent pricing, and streamlined bulk ordering — all in one unified platform.</p>

//               <div className="mahal-highlights">
//                 <div>✔ Verified & Reliable Suppliers</div>
//                 <div>✔ Transparent Pricing</div>
//                 <div>✔ Daily & Bulk Ordering</div>
//                 <div>✔ On-Time Delivery</div>
//               </div>

//               <div className="mahal-btn-group mt-4">
//                 <a href="/Registration" className="mahal-btn-primary">
//                   Order for Your Restaurant
//                 </a>
//               </div>

//             </div>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// };

// export default RestaurantAbout;



import React from "react";
import { useTranslation } from "react-i18next";
import aboutImg from "../../images/about.png";

const RestaurantAbout = () => {
  const { t } = useTranslation();

  return (
    <section className="mahal-about-section">
      <div className="container">
        <div className="row align-items-center">

          {/* LEFT IMAGE */}
          <div className="col-lg-5 mt-4 mt-lg-0">
            <div className="mahal-about-image">
              <img src={aboutImg} alt="Restaurants" />
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="col-lg-7">
            <div className="mahal-about-content">

              <h6 className="mahal-subtitle">
                <span>{t("restaurantabout.for")}</span> {t("restaurantabout.restaurants")}
              </h6>

              <h2 className="mahal-title">
                {t("restaurantabout.title1")} <br />
                {t("restaurantabout.title2")}{" "}
                <span>{t("restaurantabout.highlight")}</span>
              </h2>

              <p className="mahal-desc">
                {t("restaurantabout.desc")}
              </p>

              <p className="mahal-text">
                {t("restaurantabout.text")}
              </p>

              <div className="mahal-highlights">
                <div>✔ {t("restaurantabout.li1")}</div>
                <div>✔ {t("restaurantabout.li2")}</div>
                <div>✔ {t("restaurantabout.li3")}</div>
                <div>✔ {t("restaurantabout.li4")}</div>
              </div>

              <div className="mahal-btn-group mt-4">
                <a href="/Registration" className="mahal-btn-primary">
                  {t("restaurantabout.cta")}
                </a>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default RestaurantAbout;