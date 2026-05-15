// import React from "react";

// // IMAGES
// import img1 from "../../images/mahal_eco.jpg";
 

// const PartOfMahal = () => {
//   return (
//     <section className="mahal-ecosystem-section">
//       <div className="container">
//         <div className="row align-items-center">
//           {/* LEFT CONTENT */}
//           <div className="col-lg-7 mb-5 mb-lg-0">
//             <div className="mahal-ecosystem-content">
//               <h6 className="mahal-subtitle">WHY MAHAL</h6>

//               <h2 className="mahal-title">
//                 Be a Part of the <span> MAHAL Ecosystem</span>
//               </h2>

//               <p className="mahal-desc">
//                 MAHAL is more than a marketplace — it’s an ecosystem connecting
//                 restaurants, suppliers, and professionals to grow together.
//               </p>

//               <p class="mahal-text">
//                 Be a part of a growing network of restaurants and suppliers who
//                 are transforming procurement with transparency, efficiency, and
//                 long-term partnerships — powered by one unified digital
//                 platform.
//               </p>

           

//   {/* CTA BUTTON */}
//         <div className="text-center mt-5">
//           <a href="/register" className="mahal-btn-primary">
//             Join 500+ Businesses
//           </a>
//         </div>

//             </div>
//           </div>

//           {/* RIGHT IMAGES */}
//           <div className="col-lg-5">
//             <div className="mahal-ecosystem-images">
//               <div className="img-one">
//                 <img src={img1} alt="MAHAL Ecosystem" />
//               </div>
               
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default PartOfMahal;



import React from "react";
import { useTranslation } from "react-i18next";

// IMAGES
import img1 from "../../images/mahal_eco.jpg";

const PartOfMahal = () => {
  const { t } = useTranslation();

  return (
    <section className="mahal-ecosystem-section">
      <div className="container">
        <div className="row align-items-center">

          {/* LEFT CONTENT */}
          <div className="col-lg-7 mb-5 mb-lg-0">
            <div className="mahal-ecosystem-content">

              <h6 className="mahal-subtitle">
                {t("ecosystem.subtitle")}
              </h6>

              <h2 className="mahal-title">
                {t("ecosystem.title1")}{" "}
                <span>{t("ecosystem.title2")}</span>
              </h2>

              <p className="mahal-desc">
                {t("ecosystem.desc")}
              </p>

              <p className="mahal-text">
                {t("ecosystem.text")}
              </p>

              {/* CTA */}
              <div className="text-center mt-5">
                <a href="/register" className="mahal-btn-primary">
                  {t("ecosystem.cta")}
                </a>
              </div>

            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="col-lg-5">
            <div className="mahal-ecosystem-images">
              <div className="img-one">
                <img src={img1} alt="MAHAL Ecosystem" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PartOfMahal;