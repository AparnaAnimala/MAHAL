// import React from "react";

// const Counter = () => {
//   return (
//     <section className="b2b-counter-section">
//       <div className="container">
        
//         {/* Heading */}
//         <div className="row mb-5">
//           <div className="col-12 text-center">
//             <h6 className="b2b-subtitle">OUR IMPACT</h6>
//             <h2 className="b2b-title">
//               Trusted by <span>Growing Businesses</span>
//             </h2>
//           </div>
//         </div>

//         {/* Counters */}
//         <div className="row">
//           <div className="col-12">
//             <div className="b2b-counter-grid">

//               <div className="b2b-counter-card">
//                 <div className="icon">
//                   <i className="fas fa-smile-beam"></i>
//                 </div>
//                 <h3><span className="counter">950</span>+</h3>
//                 <p>Happy Restaurants</p>
//               </div>

//               <div className="b2b-counter-card">
//                 <div className="icon">
//                   <i className="fas fa-seedling"></i>
//                 </div>
//                 <h3><span className="counter">350</span>+</h3>
//                 <p>Verified Suppliers</p>
//               </div>

//               <div className="b2b-counter-card">
//                 <div className="icon">
//                   <i className="fas fa-award"></i>
//                 </div>
//                 <h3><span className="counter">35</span>+</h3>
//                 <p>Industry Awards</p>
//               </div>

//               <div className="b2b-counter-card">
//                 <div className="icon">
//                   <i className="fas fa-star"></i>
//                 </div>
//                 <h3><span className="counter">4.9</span></h3>
//                 <p>Average Rating</p>
//               </div>

//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Counter;



import React from "react";
import { useTranslation } from "react-i18next";

const Counter = () => {
  const { t } = useTranslation();

  return (
    <section className="b2b-counter-section">
      <div className="container">
        
        {/* Heading */}
        <div className="row mb-5">
          <div className="col-12 text-center">
            <h6 className="b2b-subtitle">
              {t("counter.our_impact")}
            </h6>

            <h2 className="b2b-title">
              {t("counter.trusted_by")}{" "}
              <span>{t("counter.growing_businesses")}</span>
            </h2>
          </div>
        </div>

        {/* Counters */}
        <div className="row">
          <div className="col-12">
            <div className="b2b-counter-grid">

              <div className="b2b-counter-card">
                <div className="icon">
                  <i className="fas fa-smile-beam"></i>
                </div>
                <h3><span className="counter">950</span>+</h3>
                <p>{t("counter.happy_restaurants")}</p>
              </div>

              <div className="b2b-counter-card">
                <div className="icon">
                  <i className="fas fa-seedling"></i>
                </div>
                <h3><span className="counter">350</span>+</h3>
                <p>{t("counter.verified_suppliers")}</p>
              </div>

              <div className="b2b-counter-card">
                <div className="icon">
                  <i className="fas fa-award"></i>
                </div>
                <h3><span className="counter">35</span>+</h3>
                <p>{t("counter.industry_awards")}</p>
              </div>

              <div className="b2b-counter-card">
                <div className="icon">
                  <i className="fas fa-star"></i>
                </div>
                <h3><span className="counter">4.9</span></h3>
                <p>{t("counter.average_rating")}</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Counter;