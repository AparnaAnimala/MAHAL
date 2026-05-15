// import React from "react";
// import Slider from "react-slick";

// import img1 from "../../images/testimonial_img_1.jpg";
// import img2 from "../../images/testimonial_img_2.jpg";
// import img3 from "../../images/testimonial_img_3.jpg";

// const testimonials = [
//   {
//     img: img1,
//     name: "Bartholomew",
//     role: "Restaurant Owner",
//     rating: 5,
//   },
//   {
//     img: img2,
//     name: "Sophie Dennison",
//     role: "Procurement Manager",
//     rating: 4.5,
//   },
//   {
//     img: img3,
//     name: "Israt Jahan",
//     role: "Business Partner",
//     rating: 4,
//   },
// ];

// const TestimonialTwo = () => {
//   const settings = {
//     arrows: true,
//     infinite: true,
//     speed: 600,
//     slidesToShow: 2,
//     slidesToScroll: 1,
//     autoplay: true,
//     autoplaySpeed: 3500,
//     responsive: [
//       { breakpoint: 1200, settings: { slidesToShow: 2 } },
//       { breakpoint: 768, settings: { slidesToShow: 1 } },
//     ],
//   };

//   return (
//     <section className="mahal-testimonial-split">
//       <div className="container">
//         <div className="row align-items-center">

//           {/* LEFT CONTENT */}
//           <div className="col-xl-4 col-lg-5 mb-4 mb-lg-0">
//             <div className="mahal-testimonial-left">
// <h6 class="mahal-subtitle">Testimonials</h6>
               

//               <h2 className="mahal-title">
//                 What <span>Businesses Say</span>
//               </h2>

//               <p className="mahal-desc">
//                 Restaurants and suppliers trust MAHAL to simplify sourcing,
//                 ensure transparency, and build long-term partnerships.
//               </p>

//               <a href="/Registration" className="mahal-btn-primary mt-3">
//                 Join MAHAL Today
//               </a>

//             </div>
//           </div>

//           {/* RIGHT SLIDER */}
//           <div className="col-xl-8 col-lg-7">
//             <Slider {...settings}>
//               {testimonials.map((item, index) => (
//                 <div key={index} className="px-2">
//                   <div className="mahal-testimonial-card">

//                     <div className="user">
//                       <img src={item.img} alt={item.name} />
//                       <div>
//                         <h4>{item.name}</h4>
//                         <span>{item.role}</span>
//                       </div>
//                     </div>

//                     <p className="review">
//                       MAHAL has made our procurement process faster and more
//                       transparent. The supplier network and order tracking
//                       features are extremely reliable.
//                     </p>

//                     <div className="rating">
//                       {[...Array(Math.floor(item.rating))].map((_, i) => (
//                         <i key={i} className="fas fa-star"></i>
//                       ))}
//                       {item.rating % 1 !== 0 && (
//                         <i className="fas fa-star-half-alt"></i>
//                       )}
//                       <span>{item.rating}</span>
//                     </div>

//                   </div>
//                 </div>
//               ))}
//             </Slider>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// };

// export default TestimonialTwo;




import React from "react";
import Slider from "react-slick";
import { useTranslation } from "react-i18next";

import img1 from "../../images/testimonial_img_1.jpg";
import img2 from "../../images/testimonial_img_2.jpg";
import img3 from "../../images/testimonial_img_3.jpg";

const TestimonialTwo = () => {
  const { t, i18n } = useTranslation();

  // ✅ get users array from translation
  const users = t("testimonialtwo.users", { returnObjects: true });

  const testimonials = [
    { img: img1, ...users[0], rating: 5 },
    { img: img2, ...users[1], rating: 4.5 },
    { img: img3, ...users[2], rating: 4 },
  ];

  const settings = {
    arrows: true,
    infinite: true,
    speed: 600,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    rtl: i18n.language === "ar", // ✅ RTL auto
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <section
      className="mahal-testimonial-split"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <div className="container">
        <div className="row align-items-center">

          {/* LEFT */}
          <div className="col-xl-4 col-lg-5 mb-4 mb-lg-0">
            <div className="mahal-testimonial-left">

              <h6 className="mahal-subtitle">
                {t("testimonialtwo.subtitle")}
              </h6>

              <h2 className="mahal-title">
                {t("testimonialtwo.title1")}{" "}
                <span>{t("testimonialtwo.title2")}</span>
              </h2>

              <p className="mahal-desc">
                {t("testimonialtwo.desc")}
              </p>

              <a href="/Registration" className="mahal-btn-primary mt-3">
                {t("testimonialtwo.cta")}
              </a>

            </div>
          </div>

          {/* RIGHT */}
          <div className="col-xl-8 col-lg-7">
            <Slider {...settings}>
              {testimonials.map((item, index) => (
                <div key={index} className="px-2">
                  <div className="mahal-testimonial-card">

                    <div className="user">
                      <img src={item.img} alt={item.name} />
                      <div>
                        <h4>{item.name}</h4>
                        <span>{item.role}</span>
                      </div>
                    </div>

                    <p className="review">
                      {t("testimonialtwo.review")}
                    </p>

                    <div className="rating">
                      {[...Array(Math.floor(item.rating))].map((_, i) => (
                        <i key={i} className="fas fa-star"></i>
                      ))}
                      {item.rating % 1 !== 0 && (
                        <i className="fas fa-star-half-alt"></i>
                      )}
                      <span>{item.rating}</span>
                    </div>

                  </div>
                </div>
              ))}
            </Slider>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TestimonialTwo;