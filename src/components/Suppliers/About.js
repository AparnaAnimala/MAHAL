// import React from "react";
// import serviceImg from "../../images/11.jpg";

// const AboutService = () => {
//   return (
//     <div className="ltn__about-us-area pb-115 mb-80">
//       <div className="container">
//         <div className="row">

//           {/* LEFT IMAGE */}
//           <div className="col-lg-5 align-self-center">
//             <div className="about-us-img-wrap ltn__img-shape-left about-img-left">
//               <img src={serviceImg} alt="Service" />
//             </div>
//           </div>

//           {/* RIGHT CONTENT */}
//           <div className="col-lg-7 align-self-center">
//             <div className="about-us-info-wrap">

//               <div className="section-title-area ltn__section-title-2">
//                 <h6 className="section-subtitle ltn__secondary-color">
//                   // ORDER SMARTER, SPEND LESS FOR
//                 </h6>
//                 <h1 className="section-title">
//                   Restaurants
//                 </h1>
//                 <p>
//                   Buy smarter and operate better. Communicate with suppliers, place and track orders, explore an all-in-one marketplace, and generate LPOs with ease — all inside the Mahal platform. One system. Total control.
//                 </p>
//               </div>

//               <div className="about-us-info-wrap-inner about-us-info-devide">
//                 <p>
//                   Order Smarter, Spend Less Chat With Suppliers, Place And Track Every  Order, Explore A Full Marketplace, And Generate Lpos — All In One Unified Mahal Platform. Efficiency That Truly Feels Effortless. 
//                 </p>

//               </div>
//               <div className="mt-3">
//                 <a className="common_btn" href="/shop-details">
//                     Restaurant Portal {" "}
//                     <i className="fas fa-long-arrow-right" aria-hidden="true"></i>
//                     <span></span>
//                   </a>

//               </div>

//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default AboutService;




import React from "react";
import { useTranslation } from "react-i18next";
import serviceImg from "../../images/sup_about.jpg";

const AboutService = () => {
  const { t, i18n } = useTranslation();

  return (
    <div
      className="ltn__about-us-area pb-115 mb-80"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <div className="container">
        <div className="row">

          {/* LEFT IMAGE */}
          <div className="col-lg-5 align-self-center">
            <div className="about-us-img-wrap ltn__img-shape-left about-img-left">
              <img src={serviceImg} alt="Service" />
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="col-lg-7 align-self-center">
            <div className="about-us-info-wrap">

              <div className="section-title-area ltn__section-title-2">

                <h6 className="section-subtitle ltn__secondary-color">
                  {t("aboutservice.subtitle")}
                </h6>

                <h1 className="section-title">
                  {t("aboutservice.title")}
                </h1>

                <p>
                  {t("aboutservice.desc")}
                </p>

              </div>

              <div className="about-us-info-wrap-inner about-us-info-devide">
                <p>
                  {t("aboutservice.text")}
                </p>
              </div>

              <div className="mt-3">
                <a className="common_btn" href="/shop-details">
                  {t("aboutservice.cta")}{" "}
                  <i className="fas fa-long-arrow-right"></i>
                  <span></span>
                </a>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AboutService;