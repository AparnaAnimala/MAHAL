

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/* FALLBACK IMAGES */
import veg from "../../images/product_img_1.jpg";
import rice from "../../images/product_img_2.jpg";
import meat from "../../images/product_img_3.jpg";
import spices from "../../images/product_img_4.jpg";
import dairy from "../../images/product_img_5.jpg";
import bulk from "../../images/product_img_6.jpg";

const API_BASE_URL = "http://192.168.2.22:5000/api";

const COLORS = [
  "#2ecc71", "#f1c40f", "#e74c3c",
  "#e67e22", "#3498db", "#9b59b6"
];

const FALLBACK_IMAGES = [veg, rice, meat, spices, dairy, bulk];

const MahalIntentSection = () => {
  const [intents, setIntents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/category`);

        if (!res.data || res.data.length === 0) return;

        const dynamic = res.data.map((cat, index) => {
          let imgUrl;

          if (cat.image && cat.image !== "null") {
            imgUrl = cat.image.startsWith("http")
              ? cat.image
              : `http://192.168.2.22:5000${cat.image}`;
          } else {
            imgUrl = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
          }

          return {
            title: cat.name,
            category: cat.name,
            color: COLORS[index % COLORS.length],
            img: imgUrl
          };
        });

        setIntents(dynamic);

      } catch (err) {
        console.error("API ERROR:", err);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="container mt-5">

      {/* HEADING */}
      <div className="text-center mb-5">
        <h4 className="premium_badge text-white">
          What Are You Ordering Today?
        </h4>
        <h2 className="premium_title">
          Choose what your kitchen needs right now
        </h2>
      </div>

      {/* MARQUEE */}
      <div className="mm-category-wrapper">
        
        <div
          className="mm-category-track"
        >
          {[...intents, ...intents].map((item, index) => (
            <div
              key={index}
              onClick={() =>
                navigate(
                  `/categorieList?category=${encodeURIComponent(item.title)}`
                )
              }
              id="categoty"
              style={{
                textAlign: "center",
                cursor: "pointer",
                minWidth: "120px"
              }}
            >
              {/* CIRCLE */}
              <div
              id="categoty1"
              
              >
                <img
                  src={item.img}
                  alt={item.title}
                  onError={(e) => (e.target.src = veg)}
                />
              </div>

              <p style={{ marginTop: "10px", fontWeight: "500" }}>
                {item.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ANIMATION */}
      <style>
        {`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>

    </div>
  );
};

export default MahalIntentSection;