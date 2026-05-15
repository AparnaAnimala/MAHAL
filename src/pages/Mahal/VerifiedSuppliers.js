



import React, { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const VerifiedSuppliersCarousel = () => {
  const [suppliers, setSuppliers] = useState([]);
 const [supplierRatings, setSupplierRatings] = useState({});// ✅ NEW
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await axios.get(
          "http://192.168.2.9:5000/api/suppliers"
        );

        console.log("🔥 SUPPLIERS:", res.data);

        const supplierList = res.data.suppliers || [];
        setSuppliers(supplierList);

        fetchSupplierRatings(supplierList); // ✅ NEW
      } catch (err) {
        console.error("❌ Supplier fetch error:", err);
      }
    };

    fetchSuppliers();
  }, []);

  /* ================= FETCH SUPPLIER RATINGS ================= */
  const fetchSupplierRatings = async (suppliers) => {
    try {
      const ratingMap = {};

      await Promise.all(
        suppliers.map(async (supplier) => {
          try {
            // 1️⃣ Get supplier products
            const productRes = await axios.get(
              `http://192.168.2.9:5000/api/products?supplier_id=${supplier.id}`
            );

            const products = productRes.data.products || [];

            let totalRating = 0;
            let totalReviews = 0;

            // 2️⃣ Get reviews for each product
            await Promise.all(
              products.map(async (p) => {
                try {
                    const productId =
                      p.product_id ??
                      p.id ??
                      p.productId;

                          // ✅ ADD LOGS HERE
                    console.log("PRODUCT:", p);
                    console.log("USING ID:", productId);

                    if (!productId) return;

                    const reviewRes = await axios.get(
                      `http://192.168.2.9:5000/api/reviews/product/${productId}`
                    );

                  const reviews = reviewRes.data || [];

                  reviews.forEach((r) => {
                    totalRating += r.rating;
                    totalReviews += 1;
                  });
                } catch {}
              })
            );

            // 3️⃣ Calculate average
            ratingMap[supplier.id] =
              totalReviews > 0 ? totalRating / totalReviews : 0;

          } catch {
            ratingMap[supplier.id] = 0;
          }
        })
      );

      setSupplierRatings(ratingMap);
    } catch (err) {
      console.error("Supplier rating error:", err);
    }
  };

  return (
    <section className="supplier-section">
      <div className="container">

        {/* HEADER */}
        <div className="supplier-header">
          <h2>Verified Suppliers</h2>
          <p>Trusted partners powering restaurant procurement</p>
        </div>

        <Swiper
          spaceBetween={25}
          autoplay={{ delay: 2500 }}
          loop={suppliers.length > 5}
          modules={[Autoplay]}
          breakpoints={{
            320: { slidesPerView: 1.2 },
            480: { slidesPerView: 2 },
            576: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            992: { slidesPerView: 5 },
            1400: { slidesPerView: 6 },
          }}
        >
          {suppliers.map((supplier, index) => {
            const ratingValue = supplierRatings[supplier.id] || 0; // ✅ FIXED

            return (
              <SwiperSlide key={supplier.id || index}>
                <div className="supplier-card">

                  {/* VERIFIED */}
                  <div className="verified-ribbon">
                    ✔ Verified
                  </div>

                  {/* IMAGE */}
                  <div className="supplier-logo">
                    <img
                  src={
                    supplier.image && supplier.image.trim() !== ""
                      ? supplier.image.startsWith("http")
                        ? supplier.image
                        : `http://192.168.2.9:5000/${supplier.image}`
                      : null
                  }
                  alt={supplier.name}
                  onError={(e) => {
                    console.log("Image failed:", supplier.image);
                    e.target.style.display = "none";
                  }}
                />
                  </div>

                  {/* NAME */}
                  <h6 className="supplier-name">
                    {supplier.name}
                  </h6>

                  {/* ✅ UPDATED RATING */}
                  <div className="supplier-rating">
                    <FaStar className="star-icon" />
                    {ratingValue.toFixed(1)}
                  </div>

                  {/* META */}
                  <div className="supplier-meta">
                    <p>{supplier.delivery || "Fast Delivery"}</p>
                    <p>{supplier.minOrder || "Min Order ₹5000"}</p>
                  </div>

                  {/* BUTTON */}
                  <button
                    className="view-btn"
                    onClick={() =>
                      navigate(
                        `/categorieList?supplier=${supplier.id}&name=${encodeURIComponent(
                          supplier.name
                        )}`
                      )
                    }
                  >
                    View Supplier
                  </button>

                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

      </div>
    </section>
  );
};

export default VerifiedSuppliersCarousel;