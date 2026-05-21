


import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://192.168.2.22:5000";

const MahalSponsoredCarousel = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [pause, setPause] = useState(false);
  const [products, setProducts] = useState([]);
  const [timers, setTimers] = useState({});

  /* ================= FETCH FROM BACKEND ================= */
  useEffect(() => {
    fetch(`${API_BASE}/api/sponsored`)
      .then((res) => res.json())
      .then((data) => {
        const mapped = (data || []).map((item) => ({
          id: item.id,
          img: item.image,
          price: `${item.currency} ${item.price}`,
          tag: item.tag,
          supplier: item.supplier_name || "Verified Supplier",
          offerEndsIn: item.ends_in || 0,
        }));

        setProducts(mapped);

        // init timers
        const t = {};
        mapped.forEach((p) => {
          t[p.id] = p.offerEndsIn;
        });
        setTimers(t);
      })
      .catch((err) => console.error("ERROR:", err));
  }, []);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let pos = 0;
    const interval = setInterval(() => {
      if (pause) return;

      pos += 1;
      el.scrollLeft = pos;

      if (pos >= el.scrollWidth - el.clientWidth) {
        pos = 0;
        el.scrollLeft = 0;
      }
    }, 25);

    return () => clearInterval(interval);
  }, [pause, products]);

  /* ================= COUNTDOWN ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const updated = {};
        products.forEach((item) => {
          const current = prev[item.id] ?? item.offerEndsIn;
          updated[item.id] = current > 0 ? current - 1 : 0;
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [products]);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}h ${m}m ${sec}s`;
  };

  return (
    <div className="container mt-5">

      {/* HEADER */}
      <h3 className="mm-sponsored-heading">
        Supplier Spotlight
      </h3>

      <p className="mm-sponsored-sub">
        Trusted suppliers • Limited-time offers
      </p>

      {/* CAROUSEL */}
      <div
        className="mm-sponsored-row"
        ref={scrollRef}
        onMouseEnter={() => setPause(true)}
        onMouseLeave={() => setPause(false)}
      >
        {products.map((item) => (
          <div
            className="mm-sponsored-card"
            key={item.id}
            onClick={() =>
              navigate(`/shopdetails/${item.id}`)
            }
          >
            {/* OFFER BADGE */}
            <span className="mm-ribbon">{item.tag}</span>

            {/* TIMER */}
            <span className="mm-countdown">
              ENDS IN · {formatTime(
                timers[item.id] ?? item.offerEndsIn
              )}
            </span>

            {/* IMAGE */}
            <div className="mm-sponsored-img">
              <img src={item.img} alt={item.tag} />
            </div>

            {/* CONTENT */}
            <div className="mm-sponsored-content">
              <strong>{item.price}</strong>

              <p className="mm-supplier">
                {item.supplier}
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/shopdetails/${item.id}`);
                }}
              >
                View Product
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default MahalSponsoredCarousel;