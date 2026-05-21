


import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const API_BASE = "http://192.168.2.22:5000/api";

const MahalStealDeals = () => {
  const scrollRef = useRef(null);

  const [pause, setPause] = useState(false);
  const [cart, setCart] = useState({});
  const [deals, setDeals] = useState([]);
  const [startIndex, setStartIndex] = useState(0);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await axios.get(`${API_BASE}/gridlist`);

        const products = res.data.products || [];

        // ✅ FILTER OFFERS
        const offers = products.filter(
          (p) =>
            p.offer_type &&
            (
              p.discount_percentage > 0 ||
              p.flat_amount > 0 ||
              p.buy_quantity > 0
            )
        );

        // ✅ MAP TO YOUR OLD UI FORMAT
        const formatted = offers.map((item) => ({
          id: item.id, // ✅ product_id already
          dealTitle: item.label, // same as old UI
          name: item.name,
          qty: item.unit_of_measure || "",
          price: item.price_numeric, // new price
          oldPrice: item.price_numeric, // keep same (or change if needed)
          img: item.img1, // ✅ IMPORTANT (fix UI)
        }));

        setDeals(formatted);

      } catch (err) {
        console.error("❌ FETCH ERROR:", err);
      }
    };

    fetchDeals();
  }, []);

  /* ================= AUTO ================= */
  useEffect(() => {
    if (deals.length === 0) return;

    const interval = setInterval(() => {
      if (pause) return;

      setStartIndex((prev) =>
        prev + 1 >= deals.length ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [deals, pause]);

  /* ================= SLICE ================= */
  let visibleDeals = deals.slice(startIndex, startIndex + 6);

  if (visibleDeals.length < 6 && deals.length > 0) {
    visibleDeals = [
      ...visibleDeals,
      ...deals.slice(0, 6 - visibleDeals.length),
    ];
  }


/* ================= ADD TO CART ================= */
const addToCart = async (item) => {

  try {

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login required");
      return;
    }

    const res = await axios.post(
      `${API_BASE}/cart/add`,
      {
        product_id: item.id,
        quantity: 1,
        price: item.price,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // ✅ Already exists in cart
    if (res.data.status === "exists") {

      alert(
        "Product already in cart 🛒\n\nQuantity updated"
      );

    }

    // ✅ New product added
    else {

      alert("Added to cart 🛒");

    }

    console.log("✅ Added");

  } catch (err) {

    console.error(
      "❌ CART ERROR:",
      err.response?.data
    );

    alert(
      err.response?.data?.error ||
      "Error"
    );

  }

};

  /* ================= CART ================= */
const addItem = async (item) => {

  await addToCart(item);

  setCart((prev) => ({

    ...prev,

    [item.id]: (prev[item.id] || 0) + 1,

  }));

};

const removeItem = async (item) => {

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
    // REMOVE ITEM COMPLETELY
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

  /* ================= UI ================= */
  return (
    <div className="container mt-5">
      <h3 className="mm-steal-title">Steal deals for you</h3>

      <div
        className="mm-steal-row"
        ref={scrollRef}
        onMouseEnter={() => setPause(true)}
        onMouseLeave={() => setPause(false)}
      >
        {visibleDeals.map((d) => (
          <div className="mm-deal-card" key={d.id}>
            
            <div className="mm-deal-title-badge">
              {d.dealTitle}
            </div>

            <div className="mm-deal-body">
              <span className="mm-deal-qty">{d.qty}</span>

              <div className="mm-deal-img">
                <img
                  src={
                    d.img && d.img.trim() !== ""
                      ? d.img.startsWith("http")
                        ? d.img
                        : `${API_BASE}/${d.img}`
                      : null
                  }
                  alt={d.name}
                  onError={(e) => {
                    console.log("Image failed:", d.img);
                    e.target.style.display = "none";
                  }}
                />
              </div>

              <h4 className="mm-deal-title">{d.name}</h4>

              <div className="mm-deal-price">
                <span className="mm-old-price">
                  QAR {d.oldPrice}
                </span>
                <span className="mm-new-price">
                  QAR {d.price}
                </span>
              </div>

              {!cart[d.id] ? (
                <button
                  className="mm-add-btn"
                  onClick={() => addItem(d)}
                >
                  Add
                </button>
              ) : (
                <div className="mm-stepper">
                  <button onClick={() => removeItem(d)}>-</button>
                  <span>{cart[d.id]}</span>
                  <button onClick={() => addItem(d)}>+</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MahalStealDeals;