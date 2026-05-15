// import React from "react";
// import bannerBg from "../../images/Suppliers_banner.jpg";
// import { Link } from "react-router-dom";

// const Banner = () => {
//   return (
//     <section
//       className="mahal-banner-section"
//       style={{ backgroundImage: `url(${bannerBg})` }}
//     >
//       <div className="container">
//         <div className="row align-items-center">
//           <div className="col-lg-7">

//             <div className="mahal-banner-content">

//               <h6 className="mahal-subtitle">FOR SUPPLIERS</h6>

//               <h1 className="mahal-banner-title">
//                 Grow Your Sales. <br />
//                 <span>Manage Orders Easily.</span>
//               </h1>

//               <p className="mahal-banner-desc">
//                 MAHAL helps suppliers connect with verified restaurants,
//                 manage orders efficiently, and scale their business through
//                 a powerful B2B marketplace.
//               </p>

//               <div className="mahal-btn-group mt-4">
//                 <Link to="/Registration" className="mahal-btn-primary">
//                   Join as Supplier
//                 </Link>

//                 {/* <a
//                   href="/SupplierLogIn"
//                   className="mahal-btn-outline ms-3 mahal-btn-secondary"
//                 >
//                   Access Your Account
//                 </a> */}
//               </div>

//             </div>

//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Banner;



import React from "react";
import { useTranslation } from "react-i18next";
import bannerBg from "../../images/Suppliers_banner.jpg";
import { Link } from "react-router-dom";

const Banner = () => {
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === "ar";

  return (
    <section
      className={`mahal-banner-section ${isArabic ? "arabic-banner" : ""}`}
      style={{ backgroundImage: `url(${bannerBg})` }}
    >
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-7">

            <div className="mahal-banner-content">

              <h6 className="mahal-subtitle">
                {t("supplierbanner.subtitle")}
              </h6>

              <h1 className="mahal-banner-title">
                {t("supplierbanner.title1")} <br />
                <span>{t("supplierbanner.title2")}</span>
              </h1>

              <p className="mahal-banner-desc">
                {t("supplierbanner.desc")}
              </p>

              <div className="mahal-btn-group mt-4">
                <Link to="/Registration" className="mahal-btn-primary">
                  {t("supplierbanner.cta")}
                </Link>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;