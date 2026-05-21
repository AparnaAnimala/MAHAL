

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE = "http://192.168.2.22:5000/api";

const MahalDealsOfDay = () => {
  const [deals, setDeals] = useState([]);
  const [timers, setTimers] = useState({});
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);

  /* ================= FETCH DEALS ================= */

  const fetchDeals = async () => {
    try {
      const res = await axios.get(
        "http://192.168.2.22:5000/api/deals-of-the-day"
      );

      let apiData = [];

      if (Array.isArray(res.data)) {
        apiData = res.data;
      } else if (res.data.products) {
        apiData = res.data.products;
      }

      const shuffled = [...apiData].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 6);

      const formatted = selected.map((d) => ({
        id: d.id || d.product_id,
        title: d.name || d.product_name_english || "No Name",
        img:
          d.img1 ||
          (d.product_id
            ? `http://192.168.2.22:5000/api/image/${d.product_id}/0`
            : "/fallback.png"),
        oldPrice: d.old_price || 0,
        price: d.price || d.price_per_unit || 0,
        endsIn: 5 * 60 * 60,
      }));

      setDeals(formatted);

      const t = {};
      formatted.forEach((d) => (t[d.id] = d.endsIn));
      setTimers(t);

    } catch (err) {
      console.error("❌ Deals fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDeals();
    }, 5 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((id) => {
          if (next[id] > 0) next[id] -= 1;
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const format = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}h ${m}m ${sec}s`;
  };

  /* ================= ADD TO CART ================= */

const addToCartAPI = (product) => {

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login");
    return;
  }

  axios
    .post(
      `${API_BASE}/cart/add`,
      {
        product_id: Number(product.id),
        quantity: 1,
        price: product.price,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    .then((res) => {

      // ✅ Product already exists
      if (res.data.status === "exists") {

        alert(
          "Product already in cart 🛒\n\nQuantity updated"
        );

      }

      // ✅ New product added
      else {

        alert("Added to cart 🛒");

      }

      console.log("Added to cart");

    })

    .catch((err) => {

      console.error(
        "ADD TO CART ERROR",
        err
      );

      alert(
        err.response?.data?.error ||
        "Backend error"
      );

    });

};

  /* ================= UI CART ================= */

  const add = (d) => {
    addToCartAPI(d);
    setCart((p) => ({ ...p, [d.id]: (p[d.id] || 0) + 1 }));
  };

/* ================= REMOVE FROM CART API ================= */

/* ================= REMOVE ITEM ================= */

const removeFromCartAPI = async (item) => {

  try {

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login required");
      return;
    }

    const currentQty = cart[item.id] || 1;

    const newQty = currentQty - 1;

    // =====================================
    // GET USER CART
    // =====================================

    const cartRes = await axios.get(
      `${API_BASE}/cart/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const cartItem = cartRes.data.items.find(
      (i) => i.product_id === item.id
    );

    if (!cartItem) {
      return;
    }

    // =====================================
    // REMOVE COMPLETELY
    // =====================================

    if (newQty <= 0) {

      await axios.delete(
        `${API_BASE}/cart/remove/${cartItem.cart_item_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCart((prev) => {

        const updated = { ...prev };

        delete updated[item.id];

        return updated;

      });

    }

    // =====================================
    // UPDATE QUANTITY
    // =====================================

    else {

      await axios.put(
        `${API_BASE}/cart/update`,
        {
          cart_item_id: cartItem.cart_item_id,
          quantity: newQty,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCart((prev) => ({
        ...prev,
        [item.id]: newQty,
      }));

    }

  } catch (err) {

    console.error(
      "❌ REMOVE ERROR:",
      err.response?.data || err
    );

    alert(
      err.response?.data?.error ||
      "Failed to update cart"
    );

  }

};

  if (loading) return <p>Loading deals...</p>;

  return (
    <div className="container mt-5">
      <div className="mm-deals-title">
        <h2>Deals of the Day</h2>
        <p>Limited-time offers from verified suppliers</p>
      </div>

      <div className="mm-deals-row">
        {deals.map((d) => (
          <div className="mm-deal-card" key={d.id}>

            {/* TIMER */}
            <div className="mm-timer">
              ⏰ Ends in {format(timers[d.id] || 0)}
            </div>

            {/* IMAGE + EYE */}
            <div>
              <img
                src={d.img}
                alt={d.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/fallback.png";
                }}
              />

              <Link to={`/shopdetails/${d.id}`}>
                <i className="fa fa-eye"></i>
              </Link>
            </div>

            <h4>{d.title}</h4>

            {/* PRICE */}
            <div className="mm-price">
              <span className="old">QAR {d.oldPrice}</span>
              <span className="new">QAR {d.price}</span>
            </div>

            {/* CART */}
            {!cart[d.id] ? (
              <button
                className="mm-add"
                disabled={timers[d.id] === 0}
                onClick={() => add(d)}
              >
                Add to Cart
              </button>
            ) : (
              <div className="mm-stepper">
                <button onClick={() => removeFromCartAPI(d)}>-</button>
                <span>{cart[d.id]}</span>
                <button onClick={() => add(d)}>+</button>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
};

export default MahalDealsOfDay;