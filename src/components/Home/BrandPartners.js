// import React from "react";

// import brand1 from "../../images/Logo/1.png";
// import brand2 from "../../images/Logo/2.png";
// import brand3 from "../../images/Logo/3.png";
// import brand4 from "../../images/Logo/4.png";
// import brand5 from "../../images/Logo/5.png";
// import brand6 from "../../images/Logo/6.png";
// import brand7 from "../../images/Logo/7.png";
// import brand8 from "../../images/Logo/8.png";

// const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://mahalcloud.azurewebsites.net';

// const brands = [
//   brand1,
//   brand2,
//   brand3,
//   brand4,
//   brand5,
//   brand6,
//    brand7,
//   brand8,
//    brand1,
//   brand2,
//   brand3,
//   brand4,
//   brand5,
//   brand6,
//    brand7,
//   brand8,
//    brand1,
//   brand2,
//   brand3,
//   brand4,
//   brand5,
//   brand6,
//    brand7,
//   brand8,
// ];

// const BrandPartners = () => {
//   return (
//     <section className="mahal-brand-section mb-5">
//       <div className="container">

//         {/* HEADING */}
//         <div className="row  ">
//           <div className="col-lg-6 m-auto text-center">
//             <span className="mahal-pill">OUR PARTNERS</span>
//             <h2 className="mahal-title">
//               Trusted by <span>Leading Food Brands</span>
//             </h2>
//             <p className="mahal-desc">
//               We collaborate with trusted suppliers and brands to ensure
//               consistent quality and reliable sourcing.
//             </p>
//           </div>
//         </div>

//         {/* BRAND MARQUEE */}
//         <div className="mahal-brand-marquee">
//           <ul className="brand-track">
//             {brands.concat(brands).map((img, index) => (
//               <li key={index} className="brand-item">
//                 <img src={img} alt="Partner Brand" />
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* CTA */}
//         <div className="text-center  ">
//           <a href="/Registration" className="mahal-btn-primary">
//             Become a Partner
//           </a>
//         </div>

//       </div>
//     </section>
//   );
// };

// export default BrandPartners;



import React from "react";
import { useTranslation } from "react-i18next";

import brand1 from "../../images/Logo/1.png";
import brand2 from "../../images/Logo/2.png";
import brand3 from "../../images/Logo/3.png";
import brand4 from "../../images/Logo/4.png";
import brand5 from "../../images/Logo/5.png";
import brand6 from "../../images/Logo/6.png";
import brand7 from "../../images/Logo/7.png";
import brand8 from "../../images/Logo/8.png";

const brands = [
  brand1, brand2, brand3, brand4, brand5, brand6, brand7, brand8,
  brand1, brand2, brand3, brand4, brand5, brand6, brand7, brand8,
  brand1, brand2, brand3, brand4, brand5, brand6, brand7, brand8,
];

const BrandPartners = () => {
  const { t } = useTranslation();

  return (
    <section className="mahal-brand-section mb-5">
      <div className="container">

        {/* HEADING */}
        <div className="row">
          <div className="col-lg-6 m-auto text-center">

            <span className="mahal-pill">
              {t("brandpartners.subtitle")}
            </span>

            <h2 className="mahal-title">
              {t("brandpartners.title1")}{" "}
              <span>{t("brandpartners.title2")}</span>
            </h2>

            <p className="mahal-desc">
              {t("brandpartners.desc")}
            </p>

          </div>
        </div>

        {/* LOGOS */}
        <div className="mahal-brand-marquee">
          <ul className="brand-track">
            {brands.concat(brands).map((img, index) => (
              <li key={index} className="brand-item">
                <img src={img} alt="Partner Brand" />
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a href="/Registration" className="mahal-btn-primary">
            {t("brandpartners.cta")}
          </a>
        </div>

      </div>
    </section>
  );
};

export default BrandPartners;