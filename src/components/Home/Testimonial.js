

// import React from "react";
// import { useTranslation } from "react-i18next";
// import Slider from "react-slick";

// import user1 from "../../images/testimonial_img_1.jpg";
// import user2 from "../../images/testimonial_img_2.jpg";
// import user3 from "../../images/testimonial_img_3.jpg";

// /* ---------- ARROWS ---------- */
// const NextArrow = ({ onClick }) => (
//   <div className="mahal-testi-arrow next" onClick={onClick}>
//     <i className="fas fa-chevron-right"></i>
//   </div>
// );

// const PrevArrow = ({ onClick }) => (
//   <div className="mahal-testi-arrow prev" onClick={onClick}>
//     <i className="fas fa-chevron-left"></i>
//   </div>
// );

// /* ---------- DATA ---------- */
// const testimonials = [
//   { name: "Bartholomew", rating: 5, img: user1 },
//   { name: "Nigel Nigel", rating: 4.5, img: user2 },
//   { name: "Robert Deni", rating: 3.5, img: user3 },
// ];

// const Testimonial = () => {
//   const { t } = useTranslation();

//   const settings = {
//     dots: true,
//     arrows: true,
//     infinite: true,
//     speed: 700,
//     slidesToShow: 3,
//     slidesToScroll: 1,
//     autoplay: true,
//     autoplaySpeed: 3000,
//     pauseOnHover: true,
//     swipe: false,
//     draggable: false,
//     touchMove: false,
//     nextArrow: <NextArrow />,
//     prevArrow: <PrevArrow />,
//     responsive: [
//       { breakpoint: 992, settings: { slidesToShow: 2 } },
//       { breakpoint: 576, settings: { slidesToShow: 1 } },
//     ],
//   };

//   return (
//     <section className="mahal-testimonial-section">
//       <div className="container">

//         {/* HEADING */}
//         <div className="row mb-5">
//           <div className="col-lg-10 m-auto text-center">

//             <h6 className="mahal-subtitle">
//               {t("testimonial.subtitle")}
//             </h6>

//             <h2 className="mahal-title white">
//               {t("testimonial.title1")}{" "}
//               <span>{t("testimonial.title2")}</span>
//             </h2>

//           </div>
//         </div>

//         {/* SLIDER */}
//         <Slider {...settings}>
//           {testimonials.map((item, index) => (
//             <div key={index}>
//               <div className="mahal-testimonial-card">

//                 <div className="rating">
//                   {[...Array(Math.floor(item.rating))].map((_, i) => (
//                     <i key={i} className="fas fa-star"></i>
//                   ))}
//                   {item.rating % 1 !== 0 && (
//                     <i className="fas fa-star-half-alt"></i>
//                   )}
//                   <span>{item.rating}</span>
//                 </div>

//                 <p className="review">
//                   {t("testimonial.review")}
//                 </p>

//                 <div className="user">
//                   <img src={item.img} alt={item.name} />
//                   <div>
//                     <h4>{item.name}</h4>
//                     <span>{t("testimonial.role")}</span>
//                   </div>
//                 </div>

//               </div>
//             </div>
//           ))}
//         </Slider>

//       </div>
//     </section>
//   );
// };

// export default Testimonial;


import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Slider from "react-slick";
import axios from "axios";

/* ---------- FALLBACK IMAGES ---------- */
import user1 from "../../images/testimonial_img_1.jpg";
import user2 from "../../images/testimonial_img_2.jpg";
import user3 from "../../images/testimonial_img_3.jpg";

const API = "http://localhost:5000/api";

/* ---------- ARROWS ---------- */
const NextArrow = ({ onClick }) => (
  <div className="mahal-testi-arrow next" onClick={onClick}>
    <i className="fas fa-chevron-right"></i>
  </div>
);

const PrevArrow = ({ onClick }) => (
  <div className="mahal-testi-arrow prev" onClick={onClick}>
    <i className="fas fa-chevron-left"></i>
  </div>
);

/* ---------- FALLBACK DATA ---------- */
const fallbackTestimonials = [
  { name: "Bartholomew", rating: 5, img: user1 },
  { name: "Nigel Nigel", rating: 4.5, img: user2 },
  { name: "Robert Deni", rating: 3.5, img: user3 },
];

const Testimonial = () => {
  const { t, i18n } = useTranslation();

  const [testimonials, setTestimonials] = useState([]);

  // ===============================
  // FETCH REVIEWS
  // ===============================
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API}/reviews/all`);

      if (Array.isArray(res.data) && res.data.length > 0) {
        setTestimonials(res.data);
      } else {
        setTestimonials(fallbackTestimonials);
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
      setTestimonials(fallbackTestimonials);
    }
  };

  const settings = {
    dots: true,
    arrows: true,
    infinite: true,
    speed: 700,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    swipe: false,
    draggable: false,
    touchMove: false,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: 2 } },
      { breakpoint: 576, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <section className="mahal-testimonial-section">
      <div className="container">

        {/* HEADING */}
        <div className="row mb-5">
          <div className="col-lg-10 m-auto text-center">

            <h6 className="mahal-subtitle">
              {t("testimonial.subtitle")}
            </h6>

            <h2 className="mahal-title white">
              {t("testimonial.title1")}{" "}
              <span>{t("testimonial.title2")}</span>
            </h2>

          </div>
        </div>

        {/* SLIDER */}
        <Slider {...settings}>
          {testimonials.map((item, index) => (
            <div key={index}>
              <div className="mahal-testimonial-card">

                {/* RATING */}
                <div className="rating">
                  {[...Array(Math.floor(Number(item.rating || 0)))].map((_, i) => (
                    <i key={i} className="fas fa-star"></i>
                  ))}

                  {Number(item.rating || 0) % 1 !== 0 && (
                    <i className="fas fa-star-half-alt"></i>
                  )}

                  <span>{item.rating}</span>
                </div>

                {/* REVIEW */}
                <p className="review">
                  {item.review_text ||
                    t("testimonial.review")}
                </p>

                {/* USER */}
                <div className="user">

                  {/* REVIEW IMAGE / FALLBACK IMAGE */}
                  <img
                    src={
                      item.review_id
                        ? `${API}/reviews/image/${item.review_id}`
                        : item.img
                    }
                    alt={item.product_name || item.name}
                    onError={(e) => {
                      e.target.src = user1;
                    }}
                  />

                  <div>
                    <h4>
                      {item.product_name ||
                        item.name ||
                        "Customer"}
                    </h4>

                    <span>
                      {i18n.language === "ar"
                        ? "عميل أعمال"
                        : t("testimonial.role")}
                    </span>
                  </div>

                </div>

              </div>
            </div>
          ))}
        </Slider>

      </div>
    </section>
  );
};

export default Testimonial;