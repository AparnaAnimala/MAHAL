// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Slider from "react-slick";
// import axios from "axios";

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

// const API = "http://192.168.2.22:5000/api/admin/promotions";

// const Banner = () => {
//   const navigate = useNavigate();

//   const selectedCity =
//     localStorage.getItem("selected_city") || "Doha";

//   // ===============================
//   // STATE FOR 6 GRID BANNERS
//   // ===============================
//   const [leftBanners, setLeftBanners] = useState([null, null, null]);
//   const [rightBanners, setRightBanners] = useState([null, null, null]);

//   // ===============================
//   // LOAD ALL 6 BANNERS
//   // ===============================
//   const loadBanner = async (position, setter, index) => {
//     try {
//       const res = await axios.get(
//         `${API}/grid/${selectedCity}/${position}`
//       );

//       const banner = res.data.length > 0 ? res.data[0] : null;

//       setter((prev) => {
//         const updated = [...prev];
//         updated[index] = banner;
//         return updated;
//       });

//     } catch {
//       setter((prev) => {
//         const updated = [...prev];
//         updated[index] = null;
//         return updated;
//       });
//     }
//   };

//   useEffect(() => {

//     // LEFT
//     loadBanner("LEFT_SLIDER_1", setLeftBanners, 0);
//     loadBanner("LEFT_SLIDER_2", setLeftBanners, 1);
//     loadBanner("LEFT_SLIDER_3", setLeftBanners, 2);

//     // RIGHT
//     loadBanner("RIGHT_SLIDER_1", setRightBanners, 0);
//     loadBanner("RIGHT_SLIDER_2", setRightBanners, 1);
//     loadBanner("RIGHT_SLIDER_3", setRightBanners, 2);

//     const interval = setInterval(() => {
//       loadBanner("LEFT_SLIDER_1", setLeftBanners, 0);
//       loadBanner("LEFT_SLIDER_2", setLeftBanners, 1);
//       loadBanner("LEFT_SLIDER_3", setLeftBanners, 2);

//       loadBanner("RIGHT_SLIDER_1", setRightBanners, 0);
//       loadBanner("RIGHT_SLIDER_2", setRightBanners, 1);
//       loadBanner("RIGHT_SLIDER_3", setRightBanners, 2);
//     }, 15000);

//     return () => clearInterval(interval);

//   }, [selectedCity]);

//   // ===============================
//   // SLIDER SETTINGS
//   // ===============================
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

//   const leftSettings = {
//     dots: false,
//     infinite: true,
//     speed: 800,
//     slidesToShow: 1,
//     slidesToScroll: 1,
//     autoplay: true,
//     autoplaySpeed: 4000,
//     arrows: false,
//     vertical: true,
//     verticalSwiping: true
//   };

//   const rightSettings = {
//     dots: false,
//     infinite: true,
//     speed: 800,
//     slidesToShow: 1,
//     slidesToScroll: 1,
//     autoplay: true,
//     autoplaySpeed: 4000,
//     arrows: false,
//     vertical: true,
//     verticalSwiping: true,
//     rtl: true
//   };

//   // ===============================
//   // STATIC FALLBACK DATA
//   // ===============================
//   const mainSlides = [
//     { image: main1, link: "/offers/vegetables" },
//     { image: main2, link: "/offers/meat" },
//     { image: main3, link: "/offers/dairy" }
//   ];

//   const leftSlides = [
//     { image: left1, link: "/offers/seasonal" },
//     { image: left2, link: "/offers/fresh" },
//     { image: left3, link: "/offers/organic" }
//   ];

//   const rightSlides = [
//     { image: right1, link: "/offers/discount" },
//     { image: right2, link: "/offers/combo" },
//     { image: right3, link: "/offers/trending" }
//   ];

//   // ===============================
//   // RENDER
//   // ===============================
//   return (
//     <section className="banner_2 py-4">
//       <div className="container-fluid">
//         <div className="row">

//           {/* LEFT */}
//           <div className="col-lg-3 d-none d-lg-block">
//             <Slider {...leftSettings}>
//               {leftSlides.map((slide, index) => {

//                 const banner = leftBanners[index];

//                 const image = banner?.processed_image_url
//                   ? `${banner.processed_image_url}?v=${banner.banner_id}`
//                   : slide.image;

//                 const link = banner
//                   ? `/supplier-promotions/${banner.promotion_id}`
//                   : slide.link;

//                 return (
//                   <div key={index}>
//                     <div
//                       onClick={() => navigate(link, { state: { city: selectedCity } })}
//                       style={{
//                         backgroundImage: `url(${image})`,
//                         height: "400px",
//                         backgroundSize: "cover",
//                         backgroundPosition: "center",
//                         cursor: "pointer",
//                         borderRadius: "5px"
//                       }}
//                     ></div>
//                   </div>
//                 );
//               })}
//             </Slider>
//           </div>

//           {/* CENTER */}
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
//                       borderRadius: "5px"
//                     }}
//                   ></div>
//                 </div>
//               ))}
//             </Slider>
//           </div>

//           {/* RIGHT */}
//           <div className="col-lg-3 d-none d-lg-block">
//             <Slider {...rightSettings}>
//               {rightSlides.map((slide, index) => {

//                 const banner = rightBanners[index];

//                 const image = banner?.processed_image_url
//                   ? `${banner.processed_image_url}?v=${banner.banner_id}`
//                   : slide.image;

//                 const link = banner
//                   ? `/supplier-promotions/${banner.promotion_id}`
//                   : slide.link;

//                 return (
//                   <div key={index}>
//                     <div
//                       onClick={() => navigate(link, { state: { city: selectedCity } })}
//                       style={{
//                         backgroundImage: `url(${image})`,
//                         height: "400px",
//                         backgroundSize: "cover",
//                         backgroundPosition: "center",
//                         cursor: "pointer",
//                         borderRadius: "5px"
//                       }}
//                     ></div>
//                   </div>
//                 );
//               })}
//             </Slider>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// };

// export default Banner;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import axios from "axios";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// CENTER IMAGES
import main1 from "../../images/slider_1.jpg";
import main2 from "../../images/slider_2.jpg";
import main3 from "../../images/slider_3.jpg";

// LEFT SIDE IMAGES
import left1 from "../../images/side_slider1.jpg";
import left2 from "../../images/side_slider2.jpg";
import left3 from "../../images/side_slider1.jpg";

// RIGHT SIDE IMAGES
import right1 from "../../images/side_slider3.jpg";
import right2 from "../../images/side_slider4.jpg";
import right3 from "../../images/side_slider5.jpg";

const API = "http://192.168.2.22:5000/api/admin/promotions";

const Banner = () => {
  const navigate = useNavigate();

  const selectedCity =
    localStorage.getItem("selected_city") || "Doha";

  const [leftBanners, setLeftBanners] = useState([null, null, null]);
  const [rightBanners, setRightBanners] = useState([null, null, null]);

  const loadBanner = async (position, setter, index) => {
    try {
      const res = await axios.get(
        `${API}/grid/${selectedCity}/${position}`
      );

      const banner = res.data.length > 0 ? res.data[0] : null;

      setter((prev) => {
        const updated = [...prev];
        updated[index] = banner;
        return updated;
      });

    } catch {
      setter((prev) => {
        const updated = [...prev];
        updated[index] = null;
        return updated;
      });
    }
  };

  useEffect(() => {

    loadBanner("LEFT_SLIDER_1", setLeftBanners, 0);
    loadBanner("LEFT_SLIDER_2", setLeftBanners, 1);
    loadBanner("LEFT_SLIDER_3", setLeftBanners, 2);

    loadBanner("RIGHT_SLIDER_1", setRightBanners, 0);
    loadBanner("RIGHT_SLIDER_2", setRightBanners, 1);
    loadBanner("RIGHT_SLIDER_3", setRightBanners, 2);

    const interval = setInterval(() => {
      loadBanner("LEFT_SLIDER_1", setLeftBanners, 0);
      loadBanner("LEFT_SLIDER_2", setLeftBanners, 1);
      loadBanner("LEFT_SLIDER_3", setLeftBanners, 2);

      loadBanner("RIGHT_SLIDER_1", setRightBanners, 0);
      loadBanner("RIGHT_SLIDER_2", setRightBanners, 1);
      loadBanner("RIGHT_SLIDER_3", setRightBanners, 2);
    }, 15000);

    return () => clearInterval(interval);

  }, [selectedCity]);

  const mainSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false
  };

  const leftSettings = {
    dots: false,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    vertical: true,
    verticalSwiping: true
  };

  const rightSettings = {
    dots: false,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    vertical: true,
    verticalSwiping: true,
    rtl: true
  };

  const mainSlides = [
    { image: main1 },
    { image: main2 },
    { image: main3 }
  ];

  const leftSlides = [
    { image: left1 },
    { image: left2 },
    { image: left3 }
  ];

  const rightSlides = [
    { image: right1 },
    { image: right2 },
    { image: right3 }
  ];

  return (
    <section className="banner_2 py-4">
      <div className="container-fluid">
        <div className="row">

          {/* LEFT */}
          <div className="col-lg-3 d-none d-lg-block">
            <Slider {...leftSettings}>
              {leftSlides.map((slide, index) => {

                const banner = leftBanners[index];

                const image = banner?.processed_image_url
                  ? `${banner.processed_image_url}?v=${banner.banner_id}`
                  : slide.image;

                const handleClick = () => {
                  if (!banner) return;
                  navigate(`/supplier-promotions/${banner.promotion_id}`, {
                    state: { city: selectedCity }
                  });
                };

                return (
                  <div key={index}>
                    <div
                      onClick={handleClick}
                      style={{
                        backgroundImage: `url(${image})`,
                        height: "400px",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        cursor: banner ? "pointer" : "default",
                        borderRadius: "5px"
                      }}
                    ></div>
                  </div>
                );
              })}
            </Slider>
          </div>

          {/* CENTER */}
          <div className="col-lg-6">
            <Slider {...mainSettings}>
              {mainSlides.map((slide, index) => (
                <div key={index}>
                  <div
                    style={{
                      backgroundImage: `url(${slide.image})`,
                      height: "400px",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      cursor: "default",
                      borderRadius: "5px"
                    }}
                  ></div>
                </div>
              ))}
            </Slider>
          </div>

          {/* RIGHT */}
          <div className="col-lg-3 d-none d-lg-block">
            <Slider {...rightSettings}>
              {rightSlides.map((slide, index) => {

                const banner = rightBanners[index];

                const image = banner?.processed_image_url
                  ? `${banner.processed_image_url}?v=${banner.banner_id}`
                  : slide.image;

                const handleClick = () => {
                  if (!banner) return;
                  navigate(`/supplier-promotions/${banner.promotion_id}`, {
                    state: { city: selectedCity }
                  });
                };

                return (
                  <div key={index}>
                    <div
                      onClick={handleClick}
                      style={{
                        backgroundImage: `url(${image})`,
                        height: "400px",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        cursor: banner ? "pointer" : "default",
                        borderRadius: "5px"
                      }}
                    ></div>
                  </div>
                );
              })}
            </Slider>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Banner;