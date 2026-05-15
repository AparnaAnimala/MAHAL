// import React from "react";
// import { useNavigate } from "react-router-dom";
// import Slider from "react-slick";

// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// // CENTER IMAGES
// import main1 from "../../images/slider_1.jpg";
// import main2 from "../../images/slider_2.jpg";
// import main3 from "../../images/slider_3.jpg";

// // LEFT SIDE IMAGES
// import left1 from "../../images/side_slider1.jpg";
// import left2 from "../../images/side_slider2.jpg";
// import left3 from "../../images/side_slider1.jpg";

// // RIGHT SIDE IMAGES
// import right1 from "../../images/side_slider3.jpg";
// import right2 from "../../images/side_slider4.jpg";
// import right3 from "../../images/side_slider5.jpg";

// const Banner2 = () => {

//   const navigate = useNavigate();

//   // CENTER SLIDER
//   const mainSettings = {
//     dots: true,
//     infinite: true,
//     speed: 800,
//     slidesToShow: 1,
//     slidesToScroll: 1,
//     autoplay: true,
//     autoplaySpeed: 4000,
//     arrows: false
//   };

//   // LEFT SIDE (Normal Vertical)
//  const leftSettings = {
//   dots: false,
//   infinite: true,
//   speed: 800,
//   slidesToShow: 1,
//   slidesToScroll: 1,
//   autoplay: true,
//   autoplaySpeed: 4000,
//   arrows: false,
//   vertical: true,
//   verticalSwiping: true
// };


//   // RIGHT SIDE (Opposite Direction)
// const rightSettings = {
//   dots: false,
//   infinite: true,
//   speed: 800,
//   slidesToShow: 1,
//   slidesToScroll: 1,
//   autoplay: true,
//   autoplaySpeed: 4000,
//   arrows: false,
//   vertical: true,
//   verticalSwiping: true,
//   rtl: true   // 🔥 only this makes reverse
// };




//   const mainSlides = [
//     { image: main1, link: "/vegetables" },
//     { image: main2, link: "/meat" },
//     { image: main3, link: "/dairy" }
//   ];

//   const leftSlides = [
//     { image: left1, link: "/offers" },
//     { image: left2, link: "/fresh" },
//     { image: left3, link: "/organic" }
//   ];

//   const rightSlides = [
//     { image: right1, link: "/discount" },
//     { image: right2, link: "/combo" },
//     { image: right3, link: "/trending" }
//   ];

//   return (
//     <section className="banner_2 py-4">
//       <div className="container-fluid">
//         <div className="row">

//           {/* LEFT VERTICAL (UP) */}
//           <div className="col-lg-3 d-none d-lg-block">
//             <Slider {...leftSettings}>
//               {leftSlides.map((slide, index) => (
//                 <div key={index}>
//                   <div
//                     onClick={() => navigate(slide.link)}
//                     style={{
//                       backgroundImage: `url(${slide.image})`,
//                       height: "400px",
//                       backgroundSize: "cover",
//                       backgroundPosition: "center",
//                       cursor: "pointer",
//                       borderRadius: "15px"
//                     }}
//                   ></div>
//                 </div>
//               ))}
//             </Slider>
//           </div>

//           {/* CENTER MAIN */}
//           <div className="col-lg-6">
//             <Slider {...mainSettings}>
//               {mainSlides.map((slide, index) => (
//                 <div key={index}>
//                   <div
//                     onClick={() => navigate(slide.link)}
//                     style={{
//                       backgroundImage: `url(${slide.image})`,
//                       height: "400px",
//                       backgroundSize: "cover",
//                       backgroundPosition: "center",
//                       cursor: "pointer",
//                       borderRadius: "20px"
//                     }}
//                   ></div>
//                 </div>
//               ))}
//             </Slider>
//           </div>

//           {/* RIGHT VERTICAL (DOWN) */}
//           <div className="col-lg-3 d-none d-lg-block">
//             <Slider {...rightSettings}>
//               {rightSlides.map((slide, index) => (
//                 <div key={index}>
//                   <div
//                     onClick={() => navigate(slide.link)}
//                     style={{
//                       backgroundImage: `url(${slide.image})`,
//                       height: "400px",
//                       backgroundSize: "cover",
//                       backgroundPosition: "center",
//                       cursor: "pointer",
//                       borderRadius: "15px"
//                     }}
//                   ></div>
//                 </div>
//               ))}
//             </Slider>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// };

// export default Banner2;


import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Slider from "react-slick";

const Banner2 = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const mainSlides = [
    { image: main1, link: "/vegetables", title: "banner2.title1" },
    { image: main2, link: "/meat", title: "banner2.title2" },
    { image: main3, link: "/dairy", title: "banner2.title3" }
  ];

  return (
    <Slider>
      {mainSlides.map((slide, index) => (
        <div key={index}>
          <div
            onClick={() => navigate(slide.link)}
            style={{
              backgroundImage: `url(${slide.image})`,
              height: "400px",
              backgroundSize: "cover",
              borderRadius: "20px"
            }}
          >
            {/* OPTIONAL TEXT */}
            <h2 style={{ color: "#fff" }}>
              {t(slide.title)}
            </h2>
          </div>
        </div>
      ))}
    </Slider>
  );
};