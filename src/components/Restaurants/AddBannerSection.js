// import React from "react";
// import { Link } from "react-router-dom";
// import { motion } from "framer-motion";
// import { useEffect, useRef } from "react";


// /* ================= IMAGES ================= */
// import banner1 from "../../images/banner_bg_7.jpg";
// import banner2 from "../../images/banner_bg_8.jpg";
// import banner3 from "../../images/banner_bg_9.jpg";

// /* ================= DATA ================= */
// const ADD_BANNERS = [
//   {
//     id: 1,
//     title: "Up to 50% off on Special Item",
//     desc: "Shop our selection of organic fresh vegetables in a discounted price. 50% off",
//     image: banner1,
//   },
//   {
//     id: 2,
//     title: "Get 10% off on Fruits Item",
//     desc: "Shop our selection of organic fresh vegetables in a discounted price. 10% off",
//     image: banner2,
//   },
//   {
//     id: 3,
//     title: "Get 75% Organic Vegetable",
//     desc: "Shop our selection of organic fresh vegetables in a discounted price. 75% off",
//     image: banner3,
//   },
// ];



// /* ================= COMPONENT ================= */
// const AddBannerSection = () => {
//   return (

//     <section className="add_banner_3   xs_pt_55">
//       <div className="container">
//         <div className="row">

//           {ADD_BANNERS.map((item) => (
//             <div className="col-xl-4 col-md-6 mb-4" key={item.id}>
//              <div className="add_banner_item highlight_banner"
//   style={{
//     backgroundImage: `url(${item.image})`,
//   }}
// >
//   <div className="overlay"></div>

//   <div className="add_banner_item_text">
//     <span className="badge">Limited Offer</span>
//     <h2>{item.title}</h2>
//     <p>{item.desc}</p>

//     <Link to="/CategorieList" className="common_btn premium_btn">
//       Shop Now <span></span>
//     </Link>
//   </div>
// </div>

//             </div>
//           ))}

//         </div>
//       </div>
//     </section>

//   );
// };

// export default AddBannerSection;



import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/* IMAGES */
import banner1 from "../../images/banner_bg_7.jpg";
import banner2 from "../../images/banner_bg_8.jpg";
import banner3 from "../../images/banner_bg_9.jpg";

/* DATA → use KEYS instead of text */
const ADD_BANNERS = [
  { id: 1, title: "addbanner.title1", desc: "addbanner.desc1", image: banner1 },
  { id: 2, title: "addbanner.title2", desc: "addbanner.desc2", image: banner2 },
  { id: 3, title: "addbanner.title3", desc: "addbanner.desc3", image: banner3 },
];

const AddBannerSection = () => {
  const { t } = useTranslation();

  return (
    <section className="add_banner_3 xs_pt_55">
      <div className="container">
        <div className="row">

          {ADD_BANNERS.map((item) => (
            <div className="col-xl-4 col-md-6 mb-4" key={item.id}>
              
              <div
                className="add_banner_item highlight_banner"
                style={{ backgroundImage: `url(${item.image})` }}
              >
                <div className="overlay"></div>

                <div className="add_banner_item_text">
                  <span className="badge">
                    {t("addbanner.badge")}
                  </span>

                  <h2>{t(item.title)}</h2>
                  <p>{t(item.desc)}</p>

                  <Link to="/CategorieList" className="common_btn premium_btn">
                    {t("addbanner.cta")} <span></span>
                  </Link>
                </div>

              </div>

            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default AddBannerSection;