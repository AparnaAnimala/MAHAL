// import React from "react";
// import aboutImg from "../../images/about1.png";

// const About = () => {
//   return (
//     <section className="mahal-about-main">
//       <div className="container">
//         <div className="row align-items-center justify-content-between">

//          {/* LEFT IMAGE */}
//           <div className="col-xl-5 col-lg-5 mb-4 mb-lg-0">
//             <div className="mahal-about-image">
//               <img src={aboutImg} alt="About MAHAL" />
//             </div>
//           </div>

//           {/* RIGHT CONTENT */}
//           <div className="col-xl-7 col-lg-7">
//             <div className="mahal-about-content mahal-service-content">

              
//               <h6 class="mahal-subtitle">About Us</h6>

//               <h2 className="mahal-title">
//                 Welcome to  
//                 <span> MAHAL Food Marketplace</span>
//               </h2>

//               <p className="mahal-desc">
//                 MAHAL is a trusted B2B food sourcing platform connecting
//                 restaurants with verified suppliers through transparency,
//                 quality, and reliability.
//               </p>

//               <p class="mahal-text">
// At MAHAL, we are redefining food supply chain management by enabling seamless ordering, transparent pricing, and long-term partnerships — all within one smart and scalable platform.
// </p>


//               <div className="mahal-feature-list mahal-highlights"  >
//                 <div><span>01</span> Verified Organic Products</div>
//                 <div><span>02</span> Healthy & Fresh Supply</div>
//                 <div><span>03</span> Locally Sourced Produce</div>
//                 <div><span>04</span> Quality You Can Trust</div>
//               </div>

//               {/* BUTTONS */}
//               <div className="mahal-btn-group mt-4">
//                 <a href="/Registration" className="mahal-btn-primary">
//                   Learn More
//                 </a>
//                 <a href="/contact" className="mahal-btn-secondary">
//                   Contact Us
//                 </a>
//               </div>

//             </div>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// };

// export default About;


import React from "react";
import { useTranslation } from "react-i18next";
import aboutImg from "../../images/about1.png";

const About = () => {
  const { t, i18n } = useTranslation();

  return (
    <section
      className="mahal-about-main"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <div className="container">
        <div className="row align-items-center justify-content-between">

          {/* LEFT IMAGE */}
          <div className="col-xl-5 col-lg-5 mb-4 mb-lg-0">
            <div className="mahal-about-image">
              <img src={aboutImg} alt="About MAHAL" />
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="col-xl-7 col-lg-7">
            <div className="mahal-about-content mahal-service-content">

              <h6 className="mahal-subtitle">
                {t("about.subtitle1")}
              </h6>

              <h2 className="mahal-title">
                {t("about.title1")}{" "}
                <span>{t("about.title2")}</span>
              </h2>

              <p className="mahal-desc">
                {t("about.desc")}
              </p>

              <p className="mahal-text">
                {t("about.text")}
              </p>

              <div className="mahal-feature-list mahal-highlights">
                <div><span>01</span> {t("about.f1")}</div>
                <div><span>02</span> {t("about.f2")}</div>
                <div><span>03</span> {t("about.f3")}</div>
                <div><span>04</span> {t("about.f4")}</div>
              </div>

              <div className="mahal-btn-group mt-4">
                <a href="/Registration" className="mahal-btn-primary">
                  {t("about.cta1")}
                </a>
                <a href="/contact" className="mahal-btn-secondary">
                  {t("about.cta2")}
                </a>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;