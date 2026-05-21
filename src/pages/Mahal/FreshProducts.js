
import React, { useEffect, useState } from "react";
import { FaShoppingCart, FaHeart, FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://192.168.2.22:5000";

const TABS = [
  "Vegetables",
  "Fruits",
  "Dairy Products",
  "Meat & Poultry",
  "Grains",
];

const FreshProducts = () => {
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetch(`${API_BASE}/api/gridlist`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("ERROR:", err);
        setLoading(false);
      });
  }, []);

  /* ================= FILTER ================= */
  const filteredProducts = products
    .filter((p) => p.category === activeTab)
    .slice(0, 6);

  /* ================= ADD TO CART ================= */
const addToCart = (item) => {

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login");
    return;
  }

  axios.post(
    `${API_BASE}/api/cart/add`,
    {
      product_id: item.id,
      quantity: 1,
      price: item.price_numeric,
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

  })

  .catch((err) => {

    console.error("CART ERROR", err);

    alert(
      err.response?.data?.error ||
      "Backend error"
    );

  });

};

  /* ================= ADD TO WISHLIST ================= */
  const addToWishlist = (item) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login");
      return;
    }

    axios.post(
      `${API_BASE}/api/wishlist/add`,
      {
        product_id: item.id,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then(() => {
      alert("Added to wishlist ❤️");
    })
    .catch((err) => {
      if (err.response?.status === 409) {
        alert("Already in wishlist");
      } else {
        console.error("WISHLIST ERROR", err);
        alert("Wishlist backend error");
      }
    });
  };

  return (
    <section className="fresh_products pt_95 mb-5">
      <div className="container">

        <div className="text-center mb-4">
          <h2>Our Fresh Products</h2>
        </div>

        {/* TABS */}
        <div className="mm-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`mm-tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="row mt-4">

          {loading && <p className="text-center">Loading...</p>}

          {!loading && filteredProducts.length === 0 && (
            <p className="text-center">No products found</p>
          )}

          {!loading &&
            filteredProducts.map((item) => (
              <div key={item.id} className="col-xl-2 col-lg-3 col-sm-6 mb-4">
                <div className="mm-product-card">

                  <div className="mm-product-img">
                    <img
                    src={
                      item.img1 && item.img1.trim() !== ""
                        ? item.img1.startsWith("http")
                          ? item.img1
                          : `${API_BASE}/${item.img1}`
                        : null
                    }
                    alt={item.name}
                    onError={(e) => {
                      console.log("Image failed:", item.img1);
                      e.target.style.display = "none";
                    }}
                  />
                  </div>

                  <div className="mm-product-info">
                    <h4>{item.name}</h4>

                    <div className="mm-price">
                      QAR {item.price_numeric}
                    </div>

                    <div className="mm-actions">

                      {/* ✅ ADD TO CART */}
                      <button onClick={() => addToCart(item)}>
                        <FaShoppingCart />
                      </button>

                      {/* ✅ WISHLIST */}
                      <button onClick={() => addToWishlist(item)}>
                        <FaHeart />
                      </button>

                      {/* ✅ EYE ICON → SHOPDETAILS */}
                      <Link to={`/shopdetails/${item.id}`}>
                        <FaEye />
                      </Link>

                    </div>

                  </div>

                </div>
              </div>
            ))}

        </div>

      </div>
    </section>
  );
};

export default FreshProducts;