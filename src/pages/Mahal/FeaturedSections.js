


import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API = "http://192.168.2.22:5000/api/products";

const FeaturedSections = () => {
  const [sections, setSections] = useState([]);
  const navigate = useNavigate();

  /* 🔥 FETCH GRID DATA */
  const fetchGrid = async () => {
    try {
      const res = await axios.get(`${API}/featured-grid`);
      setSections(res.data || []);
    } catch (err) {
      console.error("Error fetching grid:", err);
    }
  };

  /* 🚀 INITIAL LOAD + AUTO REFRESH */
  useEffect(() => {
    fetchGrid();

    const interval = setInterval(() => {
      fetchGrid();
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mt-5">
      <div className="mm-featured-grid">
        {sections.map((sec, i) => (
          <div className="mm-featured-card" key={i}>
            <h4>{sec.title}</h4>

            <div className="mm-featured-items">
              {(sec.items?.length ? sec.items : Array(4).fill(null)).map(
                (p, idx) =>
                  p ? (
                    /* 🔥 FULL CARD CLICKABLE USING LINK */
                    <Link
                      to={`/shopdetails/${p.id}`} // ✅ SAME AS YOUR CATEGORIES PAGE
                      className="mm-featured-item"
                      key={idx}
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                        cursor: "pointer",
                      }}
                    >
                      <div className="mm-featured-img">
                        <img
  src={p.image || "https://via.placeholder.com/150"}
  alt={p.name}
  onError={(e) => {
    e.target.src = "https://via.placeholder.com/150";
  }}
/>
                      </div>

                      <span>{p.name}</span>
                    </Link>
                  ) : (
                    /* 🧊 PLACEHOLDER */
                    <div className="mm-featured-item" key={idx}>
                      <div className="mm-featured-img">
                        <img src="https://via.placeholder.com/150" />
                      </div>
                      <span>Loading...</span>
                    </div>
                  )
              )}
            </div>

            <span
              className="mm-featured-link"
              onClick={() => navigate("/categorieList")}
              style={{ cursor: "pointer" }}
            >
              View all
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedSections;