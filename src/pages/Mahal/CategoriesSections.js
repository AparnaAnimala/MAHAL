

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const API_BASE = "http://192.168.2.22:5000/api";

const MahalHomeSections = () => {
  const sectionRefs = useRef({});
  const [groupedData, setGroupedData] = useState({});
  const [loading, setLoading] = useState(true);

  /* ================= FETCH PRODUCTS ================= */

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/gridlist`);
        const json = await res.json();

        const products = json.products || [];

        const grouped = {};

        products.forEach((item) => {
          const category = item.category || "Others";

          if (!grouped[category]) {
            grouped[category] = [];
          }

          grouped[category].push({
            id: item.id, // ✅ FIX
            name: item.name,
            weight: item.unit_of_measure || "1 unit",
            price: item.price_numeric || 0,
            oldPrice: null,
            off: null,
            img: item.img1,
            stock: item.stock || 1, // ✅ FIX
          });
        });

        setGroupedData(grouped);
        setLoading(false);
      } catch (err) {
        console.error("Error loading products:", err);
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  /* ================= ADD TO CART ================= */

const addToCart = (product) => {

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

        alert("Added to cart ✅");

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
  /* ================= SCROLL ================= */

  const scrollToSection = (category) => {
    sectionRefs.current[category]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading products...</p>;
  }

  return (
    <>
      {Object.entries(groupedData).map(([category, products]) => (
        <ProductSection
          key={category}
          category={category}
          products={products}
          addToCart={addToCart} // ✅ FIX
          ref={(el) => (sectionRefs.current[category] = el)}
        />
      ))}
    </>
  );
};

/* ================= PRODUCT SECTION ================= */

const ProductSection = React.forwardRef(
  ({ category, products, addToCart }, ref) => {
    const scrollRef = useRef(null);

    const scroll = (dir) => {
      if (!scrollRef.current) return;

      const amount = 300;

      if (dir === "left") {
        scrollRef.current.scrollLeft -= amount;
      } else {
        scrollRef.current.scrollLeft += amount;
      }
    };

    return (
      <section ref={ref} className="mahal-product-section mt-5">
        <div className="container">

          {/* HEADER */}
          <div className="mahal-section-header">
            <h2>{category}</h2>

            <div className="mahal-nav-arrows">
              <button onClick={() => scroll("left")}>‹</button>
              <button onClick={() => scroll("right")}>›</button>
            </div>
          </div>

          {/* PRODUCTS */}
          <div className="mahal-product-row" ref={scrollRef}>
            {products.map((item, index) => (
              <div className="mahal-product-card" key={index}>

                {/* IMAGE */}
                <img
                  src={item.img || "/fallback.png"}
                  alt="product"
                  className="mahal-dummy-img"
                />

                {/* TITLE */}
                <h5>{item.name}</h5>
                <p className="mahal-weight">{item.weight}</p>

                {/* PRICE */}
                <div className="mahal-price-row">
                  <div>
                    <span className="mahal-price">QAR  {item.price}</span>
                    {item.oldPrice && (
                      <span className="mahal-old">QAR  {item.oldPrice}</span>
                    )}
                  </div>

                  {/* BUTTON */}
                  <button
                    type="button"
                    className="mahal-add-btn"
                    disabled={!item.stock || item.stock === 0} // ✅ FIX
                    onClick={() => addToCart(item)} // ✅ FIX
                  >
                    Add
                    <span></span>
                  </button>

                </div>

              </div>
            ))}
          </div>

        </div>
      </section>
    );
  }
);

export default MahalHomeSections;