// import React from "react";
// import { Link } from "react-router-dom";
 

// import footerLogo from "../images/Logo.png";
// import pay1 from "../images/footer_payment_icon_1.jpg";
// import pay2 from "../images/footer_payment_icon_2.jpg";
// import pay3 from "../images/footer_payment_icon_3.jpg";

// const Footer = () => {
//   return (
//     <footer className="footer_2 mt_175 xs_mt_135 mt-80">
//       <div className="container">

//         {/* SUPPORT / HIGHLIGHTS */}
//         <div className="support">
//           <div className="container">
//             <div className="row">
//               <div className="col-12">
//                 <div className="support_content">
//                   <ul>

//                     <li>
//                       <div className="icon">
//                         <i className="fa-solid fa-shield"></i>
//                       </div>
//                       <div className="text">
//                         <h3 className="text-white">Verified Network</h3>
//                         <p className="text-white">Trusted restaurants & suppliers</p>
//                       </div>
//                     </li>

//                     <li>
//                       <div className="icon">
//                         <i className="fas fa-layer-group"></i>
//                       </div>
//                       <div className="text">
//                         <h3 className="text-white">All-in-One Platform</h3>
//                         <p className="text-white">Orders, pricing & tracking</p>
//                       </div>
//                     </li>

//                     <li>
//                       <div className="icon">
//                         <i className="fas fa-headset"></i>
//                       </div>
//                       <div className="text">
//                         <h3 className="text-white">Dedicated Support</h3>
//                         <p className="text-white">We’re here when you need us</p>
//                       </div>
//                     </li>

//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* FOOTER MAIN */}
//         <div className="row justify-content-between">

//           {/* ABOUT */}
//           <div className="col-xl-3 col-md-6 col-lg-4">
//             <div className="footer_logo_area">
//               <Link to="/" className="footer_logo">
//                 <img src={footerLogo} alt="Mahal" />
//               </Link>
//               <p className="mt-3">
//                 <b>MAHAL</b> is a B2B marketplace that connects restaurants
//                 with verified suppliers for efficient, transparent, and
//                 reliable food sourcing.
//               </p>
//             </div>
//           </div>

//           {/* COMPANY */}
//           <div className="col-xl-2 col-sm-6 col-lg-2">
//             <div className="footer_link">
//               <h3>Company</h3>
//               <ul>
//                 <li><a href="/about">About MAHAL</a></li>
//                 <li><a href="/how-it-works">How It Works</a></li>
//                 <li><a href="/careers">Careers</a></li>
//                 <li><a href="/contact">Contact Us</a></li>
//               </ul>
//             </div>
//           </div>

//           {/* PLATFORM */}
//           <div className="col-xl-2 col-sm-6 col-lg-2">
//             <div className="footer_link">
//               <h3>Platform</h3>
//               <ul>
//                 <li><a href="/restaurants">For Restaurants</a></li>
//                 <li><a href="/suppliers">For Suppliers</a></li>
//                 <li><a href="/marketplace">Marketplace</a></li>
//                 <li><a href="/pricing">Pricing</a></li>
//               </ul>
//             </div>
//           </div>

//           {/* RESOURCES */}
//           <div className="col-xl-2 col-sm-6 col-lg-2">
//             <div className="footer_link">
//               <h3>Resources</h3>
//               <ul>
//                 <li><a href="/blog">Blog</a></li>
//                 <li><a href="/faq">FAQs</a></li>
//                 <li><a href="/support">Help Center</a></li>
//                 <li><a href="/terms">Terms & Privacy</a></li>
//               </ul>
//             </div>
//           </div>

//           {/* NEWSLETTER */}
//           <div className="col-xl-3 col-md-6 col-lg-4">
//             <div className="footer_subscribe footer_link">
//               <h3>Stay Updated</h3>
//               <p>
//                 Get product updates, platform news, and industry insights
//                 delivered to your inbox.
//               </p>
//               <form>
//                 <input
//                   type="email"
//                   className="footer_Email"
//                   placeholder="Email address"
//                 />
//                 <button type="submit">
//                   <i className="fas fa-long-arrow-right"></i>
//                 </button>
//               </form>
//             </div>
//           </div>

//         </div>

//         {/* COPYRIGHT */}
//         <div className="row">
//           <div className="col-12">
//             <div className="footer_copyright mt_70">
//               <p>
//                 © 2026 MAHAL. All rights reserved.
//               </p>
//               <ul>
//                 <li>Secure Payments :</li>
//                 <li><img src={pay1} alt="Payment" /></li>
//                 <li><img src={pay2} alt="Payment" /></li>
//                 <li><img src={pay3} alt="Payment" /></li>
//               </ul>
//             </div>
//           </div>
//         </div>

//       </div>
//     </footer>
//   );
// };

// export default Footer;




import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import footerLogo from "../images/Logo.png";
import pay1 from "../images/footer_payment_icon_1.jpg";
import pay2 from "../images/footer_payment_icon_2.jpg";
import pay3 from "../images/footer_payment_icon_3.jpg";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer_2 mt_175 xs_mt_135 mt-80">
      <div className="container">

        {/* SUPPORT */}
        <div className="support">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="support_content">
                  <ul>

                    <li>
                      <div className="icon">
                        <i className="fa-solid fa-shield"></i>
                      </div>
                      <div className="text">
                        <h3 className="text-white">{t("footer.support1.title")}</h3>
                        <p className="text-white">{t("footer.support1.desc")}</p>
                      </div>
                    </li>

                    <li>
                      <div className="icon">
                        <i className="fas fa-layer-group"></i>
                      </div>
                      <div className="text">
                        <h3 className="text-white">{t("footer.support2.title")}</h3>
                        <p className="text-white">{t("footer.support2.desc")}</p>
                      </div>
                    </li>

                    <li>
                      <div className="icon">
                        <i className="fas fa-headset"></i>
                      </div>
                      <div className="text">
                        <h3 className="text-white">{t("footer.support3.title")}</h3>
                        <p className="text-white">{t("footer.support3.desc")}</p>
                      </div>
                    </li>

                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ABOUT */}
        <div className="row justify-content-between">

          <div className="col-xl-3 col-md-6 col-lg-4">
            <div className="footer_logo_area">
              <Link to="/" className="footer_logo">
                <img src={footerLogo} alt="Mahal" />
              </Link>
              <p className="mt-3">{t("footer.about")}</p>
            </div>
          </div>

          {/* COMPANY */}
          <div className="col-xl-2 col-sm-6 col-lg-2">
            <div className="footer_link">
              <h3>{t("footer.company")}</h3>
              <ul>
                <li><a href="/about">{t("footer.about_link")}</a></li>
                <li><a href="/how-it-works">{t("footer.how")}</a></li>
                <li><a href="/careers">{t("footer.careers")}</a></li>
                <li><a href="/contact">{t("footer.contact")}</a></li>
              </ul>
            </div>
          </div>

          {/* PLATFORM */}
          <div className="col-xl-2 col-sm-6 col-lg-2">
            <div className="footer_link">
              <h3>{t("footer.platform")}</h3>
              <ul>
                <li><a href="/restaurants">{t("footer.restaurants")}</a></li>
                <li><a href="/suppliers">{t("footer.suppliers")}</a></li>
                <li><a href="/marketplace">{t("footer.marketplace")}</a></li>
                <li><a href="/pricing">{t("footer.pricing")}</a></li>
              </ul>
            </div>
          </div>

          {/* RESOURCES */}
          <div className="col-xl-2 col-sm-6 col-lg-2">
            <div className="footer_link">
              <h3>{t("footer.resources")}</h3>
              <ul>
                <li><a href="/blog">{t("footer.blog")}</a></li>
                <li><a href="/faq">{t("footer.faq")}</a></li>
                <li><a href="/support">{t("footer.support")}</a></li>
                <li><a href="/terms">{t("footer.terms")}</a></li>
              </ul>
            </div>
          </div>

          {/* NEWSLETTER */}
          <div className="col-xl-3 col-md-6 col-lg-4">
            <div className="footer_subscribe footer_link">
              <h3>{t("footer.news")}</h3>
              <p>{t("footer.news_desc")}</p>
              <form>
                <input
                  type="email"
                  className="footer_Email"
                  placeholder={t("footer.email")}
                />
                <button type="submit">
                  <i className="fas fa-long-arrow-right"></i>
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="footer_copyright mt_70">
          <p>{t("footer.copy")}</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;