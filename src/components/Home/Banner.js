// import React, { useEffect, useState } from "react";
// import heroVideo from "../../images/slider_Video.mp4";

// const Banner = () => {

//   const words = [
//     "Trusted Suppliers",
//     "Fresh Ingredients",
//     "Competitive Prices",
//     "Reliable Delivery"
//   ];

//   const [text, setText] = useState("");
//   const [wordIndex, setWordIndex] = useState(0);
//   const [isDeleting, setIsDeleting] = useState(false);

//   useEffect(() => {
//     const currentWord = words[wordIndex];
//     let timeout;

//     if (!isDeleting) {
//       // Typing
//       timeout = setTimeout(() => {
//         setText(currentWord.substring(0, text.length + 1));
//       }, 80);

//       if (text === currentWord) {
//         setTimeout(() => setIsDeleting(true), 1200);
//       }

//     } else {
//       // Deleting
//       timeout = setTimeout(() => {
//         setText(currentWord.substring(0, text.length - 1));
//       }, 40);

//       if (text === "") {
//         setIsDeleting(false);
//         setWordIndex((prev) => (prev + 1) % words.length);
//       }
//     }

//     return () => clearTimeout(timeout);
//   }, [text, isDeleting, wordIndex, words]);

//   return (
//     <section className="mahal-hero-video">

//       {/* VIDEO BACKGROUND */}
//       <video
//         className="hero-video"
//         src={heroVideo}
//         autoPlay
//         loop
//         muted
//         playsInline
//       />

//       {/* DARK OVERLAY */}
//       <div className="hero-overlay"></div>

//       {/* CONTENT */}
//       <div className="container hero-content">
//         <div className="row">
//           <div className="col-lg-10">

//             <h3 className="hero-subtitle">
//               MAHAL – B2B Food Supply Platform
//             </h3>

//             <h1 className="hero-title">
//               Connecting Restaurants <br />
//               with{" "}
//               <span className="highlight typing-text">
//                 {text}
//               </span>
//               <span className="cursor">|</span>
//             </h1>

//             <p className="hero-text mt-3">
//               Simplify procurement, manage orders efficiently,
//               and build long-term partnerships — all in one platform.
//             </p>

//             <a className="mahal-btn-primary mt-5 big_btn" href="/Registration">
//             <i className="fas fa-arrow-right ms-2"></i>
//               Get Started with MAHAL
              
//             </a>

//           </div>
//         </div>
//       </div>

//     </section>
//   );
// };

// // export default Banner;

// import React, { useEffect, useState } from "react";
// import heroVideo from "../../images/slider_Video.mp4";

// // SAFE IMPORT (won’t crash app if config missing)
// let API_BASE = "http://192.168.2.9:5000";

// try {
//   const config = require("../../config/api");
//   API_BASE = config.API_BASE;
// } catch (err) {
//   console.warn("API config not found, using default:", API_BASE);
// }

// const Banner = () => {
//   const words = [
//     "Trusted Suppliers",
//     "Fresh Ingredients",
//     "Competitive Prices",
//     "Reliable Delivery",
//   ];

//   const [text, setText] = useState("");
//   const [wordIndex, setWordIndex] = useState(0);
//   const [isDeleting, setIsDeleting] = useState(false);

//   useEffect(() => {
//     const currentWord = words[wordIndex];
//     let timeout;

//     if (!isDeleting) {
//       timeout = setTimeout(() => {
//         setText(currentWord.substring(0, text.length + 1));
//       }, 80);

//       if (text === currentWord) {
//         timeout = setTimeout(() => {
//           setIsDeleting(true);
//         }, 1200);
//       }
//     } else {
//       timeout = setTimeout(() => {
//         setText(currentWord.substring(0, text.length - 1));
//       }, 40);

//       if (text === "") {
//         setIsDeleting(false);
//         setWordIndex((prev) => (prev + 1) % words.length);
//       }
//     }

//     return () => clearTimeout(timeout);
//   }, [text, isDeleting, wordIndex]);

//   return (
//     <section className="mahal-hero-video">
//       <video
//         className="hero-video"
//         src={heroVideo}
//         autoPlay
//         loop
//         muted
//         playsInline
//       />

//       <div className="hero-overlay"></div>

//       <div className="container hero-content">
//         <div className="row justify-content-center">
//           <div className="col-lg-10 text-center">
//             <h3 className="hero-subtitle">
//               MAHAL – B2B Food Supply Platform
//             </h3>

//             <h1 className="hero-title" id="hero-title">
//               Connecting Restaurants <br />
//               with{" "}
//               <span className="highlight typing-text">{text}</span>
//               <span className="cursor">|</span>
//             </h1>

//             <p className="hero-text mt-3 mx-auto">
//               Simplify procurement, manage orders efficiently, and build
//               long-term partnerships — all in one platform.
//             </p>

//             <a
//               className="mahal-btn-primary hero-cta-btn mt-4"
//               href="/Registration"
//             >
//               Get Started with MAHAL
//               <i className="fas fa-arrow-right ms-2"></i>
//             </a>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Banner;
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import heroVideo from "../../images/slider_Video.mp4";

const Banner = () => {
   const { t, i18n } = useTranslation();

  const words = [
    t("word1"),
    t("word2"),
    t("word3"),
    t("word4"),
  ];

  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    let timeout;

    if (!isDeleting) {
      timeout = setTimeout(() => {
        setText(currentWord.substring(0, text.length + 1));
      }, 80);

      if (text === currentWord) {
        timeout = setTimeout(() => setIsDeleting(true), 1200);
      }
    } else {
      timeout = setTimeout(() => {
        setText(currentWord.substring(0, text.length - 1));
      }, 40);

      if (text === "") {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words]);

  return (
    <section className="mahal-hero-video">
      <video className="hero-video" src={heroVideo} autoPlay loop muted />

      <div className="hero-overlay"></div>

      <div className="container hero-content">
        <div className="row justify-content-center">
          <div className="col-lg-10 text-center">
            
            <h3 className="hero-subtitle">{t("hero_subtitle")}</h3>

            <h1 className="hero-title">
            <span id="hero_title_1">{t("hero_title_1")}</span> <br />
              {t("hero_title_2")}{" "}
              <span className="highlight typing-text">{text}</span>
              <span className="cursor">|</span>
            </h1>

            <p className="hero-text mt-3 mx-auto">
              {t("hero_desc")}
            </p>

            <a className="mahal-btn-primary mt-4" href="/Registration">
              {t("get_started")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;