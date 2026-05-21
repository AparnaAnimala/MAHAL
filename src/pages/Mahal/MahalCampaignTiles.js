

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const API = "http://192.168.2.22:5000/api";

const RestaurantOffers = () => {
  const [products, setProducts] = useState([]);
  const location = useLocation();

  // 🔥 GET QUERY PARAM
  const params = new URLSearchParams(location.search);
  const type = params.get("type");

  useEffect(() => {
    if (!type) return;

    fetch(`${API}/offers?type=${type}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("🔥 OFFERS DATA:", data);
        setProducts(data);
      })
      .catch((err) => console.error("❌ ERROR:", err));
  }, [type]);

  return (
    <div className="container mt-4">
      <h2>{type?.toUpperCase()} Offers</h2>

      <div className="row">
        {products.map((p) => (
          <div key={p.product_id} className="col-md-3 mb-3">
            <div className="card p-3 text-center">
              <img
                src={`${API}/image/${p.product_id}/0`}
                alt=""
                style={{ height: "150px", objectFit: "cover" }}
              />
              <h6>{p.product_name_english}</h6>
              <p>QAR  {p.price_per_unit}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantOffers;