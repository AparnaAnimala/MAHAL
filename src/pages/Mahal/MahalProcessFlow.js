
import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faHandshake,
  faShieldHalved,
  faTruckFast,
} from "@fortawesome/free-solid-svg-icons";

const liveMessages = [
  "12 restaurants ordered rice in last 10 mins",
  "5 suppliers confirmed bulk orders just now",
  "High demand on cooking oil today",
  "Frozen items trending across regions",
];

const MahalProcessFlow = () => {
  const cardsRef = useRef([]);
  const [tickerIndex, setTickerIndex] = useState(0);

  /* ================= SCROLL ANIMATION FIX ================= */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("mm-animate");
          }
        });
      },
      { threshold: 0.2 }
    );

    const elements = cardsRef.current;

    elements.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      elements.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  /* ================= LIVE TICKER ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % liveMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="mm-process-wrap clean">
      <div className="container">

        {/* HEADER */}
        <div className="mm-process-header">
          <h2>
            <span>How </span> Mahal <span>Works</span>
          </h2>
          <p>
            Verified, transparent procurement flow for restaurants and suppliers.
          </p>
        </div>

        <div className="mm-process-grid">

          {/* LEFT STEPS */}
          <div className="mm-process-left">

            {[
              {
                icon: faCartShopping,
                title: "Place Order Request",
                desc: "Browse verified suppliers and raise bulk or daily procurement requests.",
              },
              {
                icon: faHandshake,
                title: "Supplier Confirmation",
                desc: "Suppliers confirm pricing, availability and delivery timeline.",
              },
              {
                icon: faShieldHalved,
                title: "Quality & Compliance",
                desc: "Products are verified for quality and compliance before dispatch.",
              },
              {
                icon: faTruckFast,
                title: "Fast Delivery",
                desc: "Real-time tracked delivery directly to your restaurant.",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="mm-step-card"
                ref={(el) => (cardsRef.current[index] = el)}
              >
                <div className="mm-step-icon">
                  <FontAwesomeIcon icon={step.icon} />
                </div>

                <span className="mm-step-no">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            ))}

          </div>

          {/* RIGHT SIDE */}
          <div className="mm-process-right">
            <h3>Why Restaurants Trust Mahal</h3>

            <ul>
              <li>✔ Verified suppliers</li>
              <li>✔ Faster SLAs</li>
              <li>✔ Global sourcing</li>
              <li>✔ Bulk pricing benefits</li>
            </ul>

            {/* 🔥 FIXED TICKER (NO FREEZE ISSUE) */}
            <div className="mm-live-ticker" key={tickerIndex}>
              {liveMessages[tickerIndex]}
            </div>

            <button className="mm-primary-cta">
              Start Ordering →
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default MahalProcessFlow;