

import React, { useState, useMemo, useEffect, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { LocationContext } from "../pages/LocationContext";
import { useParams,useSearchParams } from "react-router-dom";
import axios from "axios";




/* ---------- STATIC FRONTEND IMAGES (fallback only) ---------- */
import img1 from "../images/product_img_1.jpg";
import img2 from "../images/product_img_2.jpg";
import img4 from "../images/product_img_4.jpg";
import img6 from "../images/product_img_6.jpg";
import img8 from "../images/product_img_8.jpg";

const STATIC_IMAGES = [img1, img2, img4, img6, img8];

const PRICE_MIN = 0;
const ITEMS_PER_PAGE = 12;
const API_BASE_URL = "http://192.168.2.22:5000/api";

const Categories = () => {
  const location = useLocation();
  const { locationName } = useContext(LocationContext);

  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const params = new URLSearchParams(location.search);

  const [searchParams] = useSearchParams();
const offerType = searchParams.get("offerType");
const offerValue = searchParams.get("value");
  const supplierId = params.get("supplier");
  const lock = params.get("lock");
  const editOrderId = params.get("addToOrder");


  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [vendors, setVendors] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sizes, setSizes] = useState([]);
  const [vendorFilters, setVendorFilters] = useState([]);

  const [minPrice, setMinPrice] = useState(PRICE_MIN);
  const [maxPrice, setMaxPrice] = useState(0);
  const [priceLimit, setPriceLimit] = useState(0);

  const [sortBy, setSortBy] = useState("default");
  const [sameDayOnly, setSameDayOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const { promotionId } = useParams();
  //  const [offersMap, setOffersMap] = useState({});
  const selectedCity =
  location.state?.city ||
  localStorage.getItem("selected_city") ||
  "Doha";
  const [currentPage, setCurrentPage] = useState(1);
  const getPrice = (p) => {
    return Number(
      String(p.price_numeric || p.price || 0).replace(/[^\d.]/g, "")
    );
  };
    const getDiscountedPrice = (price, offer) => {
  if (!offer) return price;

  const numericPrice = Number(price || 0);

  if (offer.offer_type === "Percentage") {
    return numericPrice - (numericPrice * offer.discount_percentage) / 100;
  }

  if (offer.offer_type === "Flat") {
    return numericPrice - offer.flat_amount;
  }

  // BOGO → no price change
  return numericPrice;
};
const getFlag = (country) => {
  const flags = {
    India: "🇮🇳",
    Qatar: "🇶🇦",
    Turkey: "🇹🇷",
    Brazil: "🇧🇷",
  };
  return flags[country] || "🌍";
};
  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {

    const TOKEN = localStorage.getItem("token");

    // ===============================
    // PROMOTION MODE
    // ===============================
    if (promotionId) {

      axios
        .get(`${API_BASE_URL}/admin/promotions/promotion-products/${promotionId}`)
        .then((res) => {

          const promoProducts = res.data || [];

          setProducts(promoProducts);

          // keep UI intact but minimal filters
          setCategories(["All"]);
          setVendors([]);

          setMinPrice(PRICE_MIN);
          setMaxPrice(1000);
          setPriceLimit(1000);

        })
        .catch((err) => console.error("Promotion API Error:", err));

      return; // 🚨 IMPORTANT: stop normal flow
    }

    // ===============================
    // NORMAL GRIDLIST (UNCHANGED)
    // ===============================

    axios.get(`${API_BASE_URL}/gridlist`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      params: {
        store_id: selectedStore || undefined,
        category_name: category !== "All" ? category : undefined
      }
    })
      .then((res) => {

        const data = res.data || {};
        const productList = data.products || [];
        const suppliersList = data.suppliers || [];

        setVendors(suppliersList);

        const userCity = selectedStore || locationName || "";

        const updatedProducts = productList.map((p) => {

          const supplier = suppliersList.find(
            (s) => String(s.supplier_id) === String(p.supplier_id)
          );

          const supplierCity = supplier?.city || "";

          const isNearby =
            supplierCity.toLowerCase().trim() ===
            userCity.toLowerCase().trim();

          // const deliveryTime = isNearby
          //   ? Math.floor(Math.random() * 40) + 10
          //   : null;
          const deliveryTime = p.delivery_time;

          return {
            ...p,
            verified: supplier?.verified ?? true,
            deliveryTime: p.delivery_time,
            sameDay: p.delivery_time && p.delivery_time <= 120,
          };

        });

        setProducts(updatedProducts);
        setCategories(["All", ...(data.categories || [])]);

        if (updatedProducts.length > 0) {

          const prices = updatedProducts.map((p) =>
            Number(p.price_numeric || p.price || 0)
          );

          const min = Math.min(...prices);
          const max = Math.max(...prices);

          setMinPrice(min);
          setMaxPrice(max);
          setPriceLimit(max);
        }

      })
      .catch((err) => console.error("Gridlist API Error:", err));

  }, [selectedStore, locationName, promotionId]);
//   useEffect(() => {
//   if (!products.length) return;

//   const fetchOffers = async () => {
//     const map = {};

//     await Promise.all(
//       products.map(async (p) => {
//         try {
//           const res = await axios.get(
//             `${API_BASE_URL}/offers/by-product/${p.product_id || p.id}`
//           );

//           if (res.data && res.data.offer_status === "ACTIVE") {
//             map[p.product_id || p.id] = res.data;
//           }
//         } catch (err) {
//           // no offer
//         }
//       })
//     );

//     setOffersMap(map);
//   };

//   fetchOffers();
// }, [products]);

 useEffect(() => {
    const TOKEN = localStorage.getItem("token");

    // TEMP: using static restaurant_id
    const restaurantId = localStorage.getItem("linked_id");

    axios
      .get(
        `http://192.168.2.22:5000/api/restaurant/stores?restaurant_id=${restaurantId}`,
        {
          headers: { Authorization: `Bearer ${TOKEN}` },
        }
      )
      .then((res) => {
        setStores(res.data || []);
      })
      .catch((err) => console.log("Store fetch error", err));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const supplierQuery = params.get("supplier");

    if (supplierQuery && vendors.length > 0) {
      const match = vendors.find(
        (v) => String(v.supplier_id) === String(supplierQuery)
      );

      if (match) {
        setVendorFilters([String(match.supplier_id)]);
      }
    }
  }, [location.search, vendors]);
  /* ================= URL SUPPORT ================= */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("search");
    const categoryQuery = params.get("category");

    if (searchQuery) setSearch(searchQuery);
    if (categoryQuery) setCategory(categoryQuery);
  }, [location.search]);

  useEffect(() => {
    if (lock === "1" && supplierId) {
      setVendorFilters([Number(supplierId)]);
    }
  }, [lock, supplierId]);

  /* ================= DYNAMIC SIZES ================= */
  const SIZES = useMemo(() => {
    const unique = new Set();
    products.forEach((p) => {
      if (p.unit_of_measure) {
        unique.add(p.unit_of_measure.trim());
      }
    });
    return Array.from(unique);
  }, [products]);

  /* ================= FILTER LOGIC ================= */

  
  const filteredProducts = useMemo(() => {
  let data = [...products];

  // ✅ FIX 1: SAFE STORE FILTER (only if fields exist)
  if (selectedStore) {
    data = data.filter((p) => {
      // fallback safe check
      if (p.store_id !== undefined) {
        return String(p.store_id) === String(selectedStore);
      }
      if (p.city !== undefined) {
        return String(p.city).toLowerCase() === String(selectedStore).toLowerCase();
      }
      return true; // 🚀 DO NOT BLOCK PRODUCTS if fields missing
    });
  }

  if (search)
    data = data.filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase())
    );

  if (category !== "All") {

    if (category === "Fresh") {
      // 🔥 CUSTOM LOGIC
      data = data.filter((p) =>
        ["vegetables", "meat", "fruits", "dairy"].includes(
          (p.category || "").toLowerCase()
        )
      );
    } else {
      data = data.filter((p) =>
        (p.category || "")
          .toLowerCase()
          .includes(category.toLowerCase())
      );
    }
  }

  if (sizes.length > 0)
    data = data.filter((p) =>
      sizes.includes(p.unit_of_measure)
    );

  // ✅ FIX 2: LOCK FILTER TYPE FIX
  if (lock === "1" && supplierId) {
    data = data.filter(
      (p) => Number(p.supplier_id) === Number(supplierId)
    );
  }

  // ✅ FIX 3: VENDOR FILTER TYPE FIX
  if (vendorFilters.length > 0)
    data = data.filter((p) =>
      vendorFilters.map(Number).includes(Number(p.supplier_id))
    );

  if (sameDayOnly)
    data = data.filter((p) => Boolean(p.sameDay));

  if (verifiedOnly)
    data = data.filter((p) => Boolean(p.verified));

  // ✅ FIX 4: SAFE PRICE PARSE
  data = data.filter((p) => {
    const price = Number(p.price_numeric || 0); // fallback safe
    return price >= minPrice && price <= maxPrice;
  });

  // ✅ SORT FIX (safe numeric)
  if (sortBy === "price_low")
    data.sort(
      (a, b) =>
        Number(a.price_numeric || 0) -
        Number(b.price_numeric || 0)
    );

  if (sortBy === "price_high")
    data.sort(
      (a, b) =>
        Number(b.price_numeric || 0) -
        Number(a.price_numeric || 0)
    );

  if (sortBy === "rating")
    data.sort(
      (a, b) =>
        Number(b.rating || 0) -
        Number(a.rating || 0)
    );

     // ✅ UNIVERSAL OFFER FILTER
  if (offerType) {
  const filterType = (offerType || "").toLowerCase();

  data = data.filter((p) => {
    const offer = p.offer_type ? {
      offer_type: p.offer_type,
      discount_percentage: p.discount_percentage,
      flat_amount: p.flat_amount,
      buy_quantity: p.buy_quantity,
      get_quantity: p.get_quantity
    } : null;
     // 🔥 NEW: SHOW ALL OFFERS
    if (filterType === "all") {
      return !!offer;
    }
    if (!offer) return false;

    const type = (offer.offer_type || "").toLowerCase();

    // percentage
    if (filterType === "percentage") {
      return (
        type.includes("percent") &&
        Number(offer.discount_percentage || 0) >= Number(offerValue || 0)
      );
    }

    // flat (fixed)
    if (filterType === "flat") {
      return (
        type.includes("flat") &&
        Number(offer.flat_amount || 0) === Number(offerValue || 0)
      );
    }

    // bogo
    if (filterType === "bogo") {
      return (
        type.includes("bogo") ||
        (offer.buy_quantity && offer.get_quantity)
      );
    }

    return true;
  });
}

  return data;

},  [
  products,
  // offersMap,
  offerType,
  offerValue,
  search,
  category,
  sizes,
  vendorFilters,
  minPrice,
  maxPrice,
  sortBy,
  selectedStore,
  sameDayOnly,
  verifiedOnly,
  lock,
  supplierId
]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const toggleItem = (val, list, setList) => {
    setList((prev) =>
      prev.includes(val)
        ? prev.filter((x) => x !== val)
        : [...prev, val]
    );
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("All");
    setSizes([]);
    if (lock === "1" && supplierId) {
      setVendorFilters([Number(supplierId)]);
    } else {
      setVendorFilters([]);
    }
    setSameDayOnly(false);
    setVerifiedOnly(false);
    setMinPrice(PRICE_MIN);
    setMaxPrice(priceLimit);
    setSortBy("default");
    setCurrentPage(1);
  };

  return (

    <section className="shop_page mt-5 pb-80 pb_80">

      <div className="container-fluid pl-20 pr-20">

        <div className="row">

          {/* ================= SIDEBAR ================= */}
          <div className="col-lg-2 sidebar_col">

            <div className="shop_sidebar filter_card">

              

              {/* SEARCH */}
              {/* <div className="shop_sidebar_item mb_30">
                <input
                  className="filter_input"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div> */}

              {/* SEARCH */}
              <div className="shop_sidebar_item mb_30">
                <small>Select Store Address</small>

                <select
                  className="filter_input"
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  disabled={lock === "1"} 
                >
                  <option value="">Select store</option>

                  {stores.map((s) => (
                    <option key={s.store_id} value={s.store_id}>
                      {s.store_name_english} — {s.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* CATEGORY */}
              <div className="shop_sidebar_item mb_30">
                <h4 className="filter_title">Categories</h4>
                {categories.map((c) => (
                  <label key={c} className="filter_option">
                    <input
                      type="radio"
                      checked={category === c}
                      onChange={() => setCategory(c)}
                    />
                    <span>{c}</span>
                  </label>
                ))}
              </div>

              {/* SIZE */}
              <div className="shop_sidebar_item mb_30">
                <h4 className="filter_title">Size</h4>
                {SIZES.map((s) => (
                  <label key={s} className="filter_option">
                    <input
                      type="checkbox"
                      checked={sizes.includes(s)}
                      onChange={() => toggleItem(s, sizes, setSizes)}
                    />
                    <span>{s}</span>
                  </label>
                ))}
              </div>

              {/* PRICE RANGE */}
              <div className="shop_sidebar_item mb_30">
                <h4 className="filter_title">Price Range</h4>

                <div className="price_slider_container">
                  <div className="slider_track"></div>

                  <div
                    className="slider_range"
                    style={{
                      left: `${(minPrice / priceLimit) * 100}%`,
                      width: `${((maxPrice - minPrice) / priceLimit) * 100}%`,
                    }}
                  ></div>

                  {/* MIN */}
                  <input
                    type="range"
                    min={PRICE_MIN}
                    max={priceLimit}
                    value={minPrice}
                    onChange={(e) =>
                      setMinPrice(Math.min(Number(e.target.value), maxPrice - 1))
                    }
                    className="range_input"
                  />

                  {/* MAX */}
                  <input
                    type="range"
                    min={PRICE_MIN}
                    max={priceLimit}
                    value={maxPrice}
                    onChange={(e) =>
                      setMaxPrice(Math.max(Number(e.target.value), minPrice + 1))
                    }
                    className="range_input"
                  />
                </div>

                <div className="price_display">
                  QAR {minPrice} — QAR {maxPrice}
                </div>
              </div>




              {/* VENDOR */}
              <div className="shop_sidebar_item mb_30">
                <h4 className="filter_title">Filter by Vendor</h4>
                {vendors.map((v) => (
                  <label key={v.supplier_id} className="filter_option">
                    <input
                      type="checkbox"
                      disabled={lock === "1"} 
                      checked={vendorFilters.includes(String(v.supplier_id))}
                      onChange={() =>
                        toggleItem(
                          String(v.supplier_id),
                          vendorFilters,
                          setVendorFilters
                        )
                      }
                    />
                    <span>{v.company_name_english}</span>
                  </label>
                ))}
              </div>

              {/* SAME DAY & VERIFIED */}
              <div className="shop_sidebar_item mb_30">
                <h4 className="filter_title">Delivery & Trust</h4>

                <label className="filter_option">
                  <input
                    type="checkbox"
                    checked={sameDayOnly}
                    onChange={() => setSameDayOnly(!sameDayOnly)}
                  />
                  <span>Same Day Delivery</span>
                </label>

                <label className="filter_option">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={() => setVerifiedOnly(!verifiedOnly)}
                  />
                  <span>Verified Suppliers</span>
                </label>
              </div>

              <button className="reset_btn" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          </div>

          {/* ================= PRODUCTS ================= */}
          <div className="col-lg-10">

            {lock === "1" && supplierId && (
              <div className="alert alert-info mb-3">
                You are modifying Order {editOrderId}.  
                Only products from this supplier are shown.
                Supplier and Store are locked.
              </div>
            )}
<div className="row g-4">
  {filteredProducts
    .map((p, i) => {

      const offer = p.offer_type
        ? {
            offer_type: p.offer_type,
            discount_percentage: p.discount_percentage,
            flat_amount: p.flat_amount,
            buy_quantity: p.buy_quantity,
            get_quantity: p.get_quantity
          }
        : null;

      return (
        <div className="col-xl-2 col-sm-6" key={`${p.id}-${i}`}>
          <div className="product_card">

            <div className="product_img">
              <img
                src={
                  (p.image && p.image.trim() !== "")
                    ? (p.image.startsWith("http")
                        ? p.image
                        : `http://192.168.2.22:5000/${p.image}`)
                    : (p.img1 && p.img1.trim() !== "")
                      ? (p.img1.startsWith("http")
                          ? p.img1
                          : `http://192.168.2.22:5000/${p.img1}`)
                      : null
                }
                alt={p.name}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />

              {/* ✅ OFFER RIBBON */}
              {offer && (
                <div className="discount-ribbon">

                  <svg width="57" height="60" viewBox="0 0 29 28">
                    <defs>
                      <linearGradient id={`grad-${p.id}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#FF8C00" />
                        <stop offset="100%" stopColor="#FF3D00" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M28.9499 0C28.3999 0 27.9361 1.44696 27.9361 2.60412V27.9718L24.5708 25.9718L21.2055 27.9718L17.8402 25.9718L14.4749 27.9718L11.1096 25.9718L7.74436 27.9718L4.37907 25.9718L1.01378 27.9718V2.6037C1.01378 1.44655 0.549931 0 0 0H28.9499Z"
                      fill={`url(#grad-${p.id})`}
                    />
                  </svg>

                  <span>
                    {(() => {
                      const t = (offer.offer_type || "").toLowerCase();

                      if (t.includes("percent")) {
                        return `${Math.round(offer.discount_percentage)}% OFF`;
                      }

                      if (t.includes("flat")) {
                        return `QAR ${offer.flat_amount} OFF`;
                      }

                      if (t.includes("bogo") || t.includes("buy")) {
                        return `BUY ${offer.buy_quantity || 1} GET ${offer.get_quantity || 1}`;
                      }

                      return "";
                    })()}
                  </span>
                </div>
              )}

              {/* COUNTRY */}
              {p.country_of_origin && (
                <div className="country_badge_new">
                  <span>{getFlag(p.country_of_origin)}</span>
                  <span>{p.country_of_origin}</span>
                </div>
              )}

              <div className="hover_icons">
                <button><i className="far fa-eye"></i></button>
                <button><i className="far fa-heart"></i></button>
              </div>
            </div>

            <div className="product_text">
              <h4 className="product_title">
                {p.name}
                <div className="unit_badge">
                  {p.unit_of_measure || "Unit"}
                </div>
              </h4>

              {/* PRICE */}
              {(() => {
                const originalPrice = Number(
                  String(p.price_numeric || p.price || 0).replace(/[^\d.]/g, "")
                );

                const finalPrice = getDiscountedPrice(originalPrice, offer);

                return (
                  <p className="product_price">
                    <span>QAR {finalPrice.toFixed(2)}</span>

                    {offer && finalPrice < originalPrice && (
                      <del style={{ marginLeft: "8px", color: "#999" }}>
                        QAR {originalPrice.toFixed(2)}
                      </del>
                    )}
                  </p>
                );
              })()}

              <div className="product_actions">

                {/* DELIVERY */}
                {p.deliveryTime > 0 && (
                  <div className="delivery_strip_label_new">
                    <i className="fas fa-shipping-fast delivery_icon"></i>
                    <span>
                      <strong
                        className={
                          p.deliveryTime <= 20
                            ? "fast"
                            : p.deliveryTime <= 35
                            ? "medium"
                            : "slow"
                        }
                      >
                        {p.deliveryTime} MIN
                      </strong>
                    </span>
                  </div>
                )}

                <Link
                  to={`/ShopDetails/${p.id}${location.search}`}
                  className="add_cart_btn"
                >
                  View Product
                </Link>

              </div>
            </div>

          </div>
        </div>
      );
    })}

  {filteredProducts.length === 0 && (
    <p className="text-center mt-5">No products found</p>
  )}
</div>
          </div>
        </div>
      </div>
    </section>
  );
};
    
export default Categories;




// import React, { useState, useMemo, useEffect, useContext } from "react";
// import { Link, useLocation } from "react-router-dom";
// import { LocationContext } from "../pages/LocationContext";
// import { useParams } from "react-router-dom";
// import axios from "axios";




// /* ---------- STATIC FRONTEND IMAGES (fallback only) ---------- */
// import img1 from "../images/product_img_1.jpg";
// import img2 from "../images/product_img_2.jpg";
// import img4 from "../images/product_img_4.jpg";
// import img6 from "../images/product_img_6.jpg";
// import img8 from "../images/product_img_8.jpg";

// const STATIC_IMAGES = [img1, img2, img4, img6, img8];

// const PRICE_MIN = 0;
// const ITEMS_PER_PAGE = 12;
// const API_BASE_URL = "http://192.168.2.22:5000/api";

// const Categories = () => {
//   const location = useLocation();
//   const { locationName } = useContext(LocationContext);

//   const [stores, setStores] = useState([]);
//   const [selectedStore, setSelectedStore] = useState("");
//   const params = new URLSearchParams(location.search);

//   const supplierId = params.get("supplier");
//   const lock = params.get("lock");
//   const editOrderId = params.get("addToOrder");


//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState(["All"]);
//   const [vendors, setVendors] = useState([]);

//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("All");
//   const [sizes, setSizes] = useState([]);
//   const [vendorFilters, setVendorFilters] = useState([]);

//   const [minPrice, setMinPrice] = useState(PRICE_MIN);
//   const [maxPrice, setMaxPrice] = useState(0);
//   const [priceLimit, setPriceLimit] = useState(0);

//   const [sortBy, setSortBy] = useState("default");
//   const [sameDayOnly, setSameDayOnly] = useState(false);
//   const [verifiedOnly, setVerifiedOnly] = useState(false);
//   const { promotionId } = useParams();
//   const [offersMap, setOffersMap] = useState({});
//   const selectedCity =
//   location.state?.city ||
//   localStorage.getItem("selected_city") ||
//   "Doha";
//   const [currentPage, setCurrentPage] = useState(1);
//   const getPrice = (p) => {
//     return Number(
//       String(p.price_numeric || p.price || 0).replace(/[^\d.]/g, "")
//     );
//   };

//   const getDiscountedPrice = (price, offer) => {
//   if (!offer) return price;

//   const numericPrice = Number(price || 0);

//   if (offer.offer_type === "Percentage") {
//     return numericPrice - (numericPrice * offer.discount_percentage) / 100;
//   }

//   if (offer.offer_type === "Flat") {
//     return numericPrice - offer.flat_amount;
//   }

//   // BOGO → no price change
//   return numericPrice;
// };
//   /* ================= FETCH PRODUCTS ================= */
//   useEffect(() => {

//     const TOKEN = localStorage.getItem("token");

//     // ===============================
//     // PROMOTION MODE
//     // ===============================
//     if (promotionId) {

//       axios
//         .get(`${API_BASE_URL}/admin/promotions/promotion-products/${promotionId}`)
//         .then((res) => {

//           const promoProducts = res.data || [];

//           setProducts(promoProducts);

//           // keep UI intact but minimal filters
//           setCategories(["All"]);
//           setVendors([]);

//           setMinPrice(PRICE_MIN);
//           setMaxPrice(1000);
//           setPriceLimit(1000);

//         })
//         .catch((err) => console.error("Promotion API Error:", err));

//       return; // 🚨 IMPORTANT: stop normal flow
//     }

//     // ===============================
//     // NORMAL GRIDLIST (UNCHANGED)
//     // ===============================

//     axios.get(`${API_BASE_URL}/gridlist`, {
//       headers: { Authorization: `Bearer ${TOKEN}` },
//       params: {
//         store_id: selectedStore || undefined
//       }
//     })
//       .then((res) => {

//         const data = res.data || {};
//         const productList = data.products || [];
//         const suppliersList = data.suppliers || [];

//         setVendors(suppliersList);

//         const userCity = selectedStore || locationName || "";

//         const updatedProducts = productList.map((p) => {

//           const supplier = suppliersList.find(
//             (s) => String(s.supplier_id) === String(p.supplier_id)
//           );

//           const supplierCity = supplier?.city || "";

//           const isNearby =
//             supplierCity.toLowerCase().trim() ===
//             userCity.toLowerCase().trim();

//           const deliveryTime = isNearby
//             ? Math.floor(Math.random() * 40) + 10
//             : null;

//           return {
//             ...p,
//             verified: supplier?.verified ?? true,
//             deliveryTime,
//             sameDay: deliveryTime && deliveryTime < 20,
//           };

//         });

//         setProducts(updatedProducts);
//         setCategories(["All", ...(data.categories || [])]);

//         if (updatedProducts.length > 0) {

//           const prices = updatedProducts.map((p) =>
//             Number(p.price_numeric || p.price || 0)
//           );

//           const min = Math.min(...prices);
//           const max = Math.max(...prices);

//           setMinPrice(min);
//           setMaxPrice(max);
//           setPriceLimit(max);
//         }

//       })
//       .catch((err) => console.error("Gridlist API Error:", err));

//   }, [selectedStore, locationName, promotionId]);

// useEffect(() => {
//   if (!products.length) return;

//   const fetchOffers = async () => {
//     const map = {};

//     await Promise.all(
//       products.map(async (p) => {
//         try {
//           const res = await axios.get(
//             `${API_BASE_URL}/offers/by-product/${p.product_id || p.id}`
//           );

//           if (res.data && res.data.offer_status === "ACTIVE") {
//             map[p.product_id || p.id] = res.data;
//           }
//         } catch (err) {
//           // no offer
//         }
//       })
//     );

//     setOffersMap(map);
//   };

//   fetchOffers();
// }, [products]);



//  useEffect(() => {
//     const TOKEN = localStorage.getItem("token");

//     // TEMP: using static restaurant_id
//     const restaurantId = localStorage.getItem("linked_id");

//     axios
//       .get(
//         `http://192.168.2.22:5000/api/restaurant/stores?restaurant_id=${restaurantId}`,
//         {
//           headers: { Authorization: `Bearer ${TOKEN}` },
//         }
//       )
//       .then((res) => {
//         setStores(res.data || []);
//       })
//       .catch((err) => console.log("Store fetch error", err));
//   }, []);

//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const supplierQuery = params.get("supplier");

//     if (supplierQuery && vendors.length > 0) {
//       const match = vendors.find(
//         (v) => String(v.supplier_id) === String(supplierQuery)
//       );

//       if (match) {
//         setVendorFilters([String(match.supplier_id)]);
//       }
//     }
//   }, [location.search, vendors]);
//   /* ================= URL SUPPORT ================= */
//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const searchQuery = params.get("search");
//     const categoryQuery = params.get("category");

//     if (searchQuery) setSearch(searchQuery);
//     if (categoryQuery) setCategory(categoryQuery);
//   }, [location.search]);

//   useEffect(() => {
//     if (lock === "1" && supplierId) {
//       setVendorFilters([Number(supplierId)]);
//     }
//   }, [lock, supplierId]);

//   /* ================= DYNAMIC SIZES ================= */
//   const SIZES = useMemo(() => {
//     const unique = new Set();
//     products.forEach((p) => {
//       if (p.unit_of_measure) {
//         unique.add(p.unit_of_measure.trim());
//       }
//     });
//     return Array.from(unique);
//   }, [products]);

//   /* ================= FILTER LOGIC ================= */
//   const filteredProducts = useMemo(() => {
//   let data = [...products];

//   // ✅ FIX 1: SAFE STORE FILTER (only if fields exist)
//   if (selectedStore) {
//     data = data.filter((p) => {
//       // fallback safe check
//       if (p.store_id !== undefined) {
//         return String(p.store_id) === String(selectedStore);
//       }
//       if (p.city !== undefined) {
//         return String(p.city).toLowerCase() === String(selectedStore).toLowerCase();
//       }
//       return true; // 🚀 DO NOT BLOCK PRODUCTS if fields missing
//     });
//   }

//   if (search)
//     data = data.filter((p) =>
//       p.name?.toLowerCase().includes(search.toLowerCase())
//     );

//   if (category !== "All") {
//     data = data.filter((p) =>
//       (p.category || "")
//         .toLowerCase()
//         .trim()
//         .includes(category.toLowerCase().trim())
//     );
//   }

//   if (sizes.length > 0)
//     data = data.filter((p) =>
//       sizes.includes(p.unit_of_measure)
//     );

//   // ✅ FIX 2: LOCK FILTER TYPE FIX
//   if (lock === "1" && supplierId) {
//     data = data.filter(
//       (p) => Number(p.supplier_id) === Number(supplierId)
//     );
//   }

//   // ✅ FIX 3: VENDOR FILTER TYPE FIX
//   if (vendorFilters.length > 0)
//     data = data.filter((p) =>
//       vendorFilters.map(Number).includes(Number(p.supplier_id))
//     );

//   if (sameDayOnly)
//     data = data.filter((p) => Boolean(p.sameDay));

//   if (verifiedOnly)
//     data = data.filter((p) => Boolean(p.verified));

//   // ✅ FIX 4: SAFE PRICE PARSE
//   data = data.filter((p) => {
//     const price = Number(p.price_numeric || 0); // fallback safe
//     return price >= minPrice && price <= maxPrice;
//   });

//   // ✅ SORT FIX (safe numeric)
//   if (sortBy === "price_low")
//     data.sort(
//       (a, b) =>
//         Number(a.price_numeric || 0) -
//         Number(b.price_numeric || 0)
//     );

//   if (sortBy === "price_high")
//     data.sort(
//       (a, b) =>
//         Number(b.price_numeric || 0) -
//         Number(a.price_numeric || 0)
//     );

//   if (sortBy === "rating")
//     data.sort(
//       (a, b) =>
//         Number(b.rating || 0) -
//         Number(a.rating || 0)
//     );

//   return data;

// }, [
//   products,
//   search,
//   category,
//   sizes,
//   vendorFilters,
//   minPrice,
//   maxPrice,
//   sortBy,
//   selectedStore,
//   sameDayOnly,
//   verifiedOnly,
//   lock,
//   supplierId
// ]);

//   const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

//   const paginatedProducts = useMemo(() => {
//     const start = (currentPage - 1) * ITEMS_PER_PAGE;
//     return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
//   }, [filteredProducts, currentPage]);

//   const toggleItem = (val, list, setList) => {
//     setList((prev) =>
//       prev.includes(val)
//         ? prev.filter((x) => x !== val)
//         : [...prev, val]
//     );
//   };

//   const resetFilters = () => {
//     setSearch("");
//     setCategory("All");
//     setSizes([]);
//     if (lock === "1" && supplierId) {
//       setVendorFilters([Number(supplierId)]);
//     } else {
//       setVendorFilters([]);
//     }
//     setSameDayOnly(false);
//     setVerifiedOnly(false);
//     setMinPrice(PRICE_MIN);
//     setMaxPrice(priceLimit);
//     setSortBy("default");
//     setCurrentPage(1);
//   };

//   return (

//     <section className="shop_page mt-5 pb-80 pb_80">

//       <div className="container-fluid pl-20 pr-20">

//         <div className="row">

//           {/* ================= SIDEBAR ================= */}
//           <div className="col-lg-2 sidebar_col">

//             <div className="shop_sidebar filter_card">

//               {/* SEARCH */}
//               {/* <div className="shop_sidebar_item mb_30">
//                 <input
//                   className="filter_input"
//                   placeholder="Search products..."
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                 />
//               </div> */}

//               {/* SEARCH */}
//               <div className="shop_sidebar_item mb_30">
//                 <small>Select Store Address</small>

//                 <select
//                   className="filter_input"
//                   value={selectedStore}
//                   onChange={(e) => setSelectedStore(e.target.value)}
//                 >
//                   <option value="">Select store</option>

//                   {stores.map((s) => (
//                     <option key={s.store_id} value={s.store_id}>
//                       {s.store_name_english} — {s.city}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* CATEGORY */}
//               <div className="shop_sidebar_item mb_30">
//                 <h4 className="filter_title">Categories</h4>
//                 {categories.map((c) => (
//                   <label key={c} className="filter_option">
//                     <input
//                       type="radio"
//                       checked={category === c}
//                       onChange={() => setCategory(c)}
//                     />
//                     <span>{c}</span>
//                   </label>
//                 ))}
//               </div>

//               {/* SIZE */}
//               <div className="shop_sidebar_item mb_30">
//                 <h4 className="filter_title">Size</h4>
//                 {SIZES.map((s) => (
//                   <label key={s} className="filter_option">
//                     <input
//                       type="checkbox"
//                       checked={sizes.includes(s)}
//                       onChange={() => toggleItem(s, sizes, setSizes)}
//                     />
//                     <span>{s}</span>
//                   </label>
//                 ))}
//               </div>

//               {/* PRICE RANGE */}
//               <div className="shop_sidebar_item mb_30">
//                 <h4 className="filter_title">Price Range</h4>

//                 <div className="price_slider_container">
//                   <div className="slider_track"></div>

//                   <div
//                     className="slider_range"
//                     style={{
//                       left: `${(minPrice / priceLimit) * 100}%`,
//                       width: `${((maxPrice - minPrice) / priceLimit) * 100}%`,
//                     }}
//                   ></div>

//                   {/* MIN */}
//                   <input
//                     type="range"
//                     min={PRICE_MIN}
//                     max={priceLimit}
//                     value={minPrice}
//                     onChange={(e) =>
//                       setMinPrice(Math.min(Number(e.target.value), maxPrice - 1))
//                     }
//                     className="range_input"
//                   />

//                   {/* MAX */}
//                   <input
//                     type="range"
//                     min={PRICE_MIN}
//                     max={priceLimit}
//                     value={maxPrice}
//                     onChange={(e) =>
//                       setMaxPrice(Math.max(Number(e.target.value), minPrice + 1))
//                     }
//                     className="range_input"
//                   />
//                 </div>

//                 <div className="price_display">
//                 QAR {minPrice} — QAR {maxPrice}
//                 </div>
//               </div>




//               {/* VENDOR */}
//               <div className="shop_sidebar_item mb_30">
//                 <h4 className="filter_title">Filter by Vendor</h4>
//                 {vendors.map((v) => (
//                   <label key={v.supplier_id} className="filter_option">
//                     <input
//                       type="checkbox"
//                       disabled={lock === "1"} 
//                       checked={vendorFilters.includes(String(v.supplier_id))}
//                       onChange={() =>
//                         toggleItem(
//                           String(v.supplier_id),
//                           vendorFilters,
//                           setVendorFilters
//                         )
//                       }
//                     />
//                     <span>{v.company_name_english}</span>
//                   </label>
//                 ))}
//               </div>

//               {/* SAME DAY & VERIFIED */}
//               <div className="shop_sidebar_item mb_30">
//                 <h4 className="filter_title">Delivery & Trust</h4>

//                 <label className="filter_option">
//                   <input
//                     type="checkbox"
//                     checked={sameDayOnly}
//                     onChange={() => setSameDayOnly(!sameDayOnly)}
//                   />
//                   <span>Same Day Delivery</span>
//                 </label>

//                 <label className="filter_option">
//                   <input
//                     type="checkbox"
//                     checked={verifiedOnly}
//                     onChange={() => setVerifiedOnly(!verifiedOnly)}
//                   />
//                   <span>Verified Suppliers</span>
//                 </label>
//               </div>

//               <button className="reset_btn" onClick={resetFilters}>
//                 Reset Filters
//               </button>
//             </div>
//           </div>

//           {/* ================= PRODUCTS ================= */}
//           <div className="col-lg-10">

//             {lock === "1" && supplierId && (
//               <div className="alert alert-info mb-3">
//                 You are modifying Order {editOrderId}.  
//                 Only products from this supplier are shown.
//               </div>
//             )}
//             <div className="row g-4">
//               {filteredProducts
//                 .flatMap((p) => {
//                   if (!p.offers || p.offers.length === 0) {
//                     return [{ ...p, singleOffer: null }];
//                   }

//                   return p.offers.map((offer) => ({
//                     ...p,
//                     singleOffer: offer
//                   }));
//                 })
//                 .map((p, i) => (
//                   <div className="col-xl-2 col-sm-6" key={`{p.id}-${i}`}>
//                     <div className="product_card">
//                       <div className="product_img">
//                         <img
//                           src={
//                             p.image
//                               ? p.image.startsWith("http")
//                                 ? p.image
//                                 : `http://192.168.2.22:5000/${p.image}`
//                               : ""
//                           }
//                           alt={p.name}
//                           onError={(e) => {
//                             e.target.style.display = "none"; // hide if broken
//                           }}
//                         />

//                         {/* {p.verified && (
//                         <span className=" verified-ribbon" >
//                           ✔ Verified
//                         </span>
//                       )} */}

//                           {offersMap[p.product_id || p.id] && (
//                             <span className="offer_badge">
//                               {offersMap[p.product_id || p.id].offer_type === "Percentage"
//                                 ? `${offersMap[p.product_id || p.id].discount_percentage}% OFF`
//                                 : offersMap[p.product_id || p.id].offer_type === "Flat"
//                                 ? `QAR ${offersMap[p.product_id || p.id].flat_amount} OFF`
//                                 : `Buy ${offersMap[p.product_id || p.id].buy_quantity} Get ${offersMap[p.product_id || p.id].get_quantity}`}
//                             </span>
//                           )}

//                         {/* SAME DAY BADGE */}
//                         {p.sameDay && p.deliveryTime && (
//                           <div className="delivery_strip_label">
//                             <i className="fas fa-shipping-fast delivery_icon"></i>
//                             <span>
//                               Delivery in{" "}
//                               <strong
//                                 className={
//                                   p.deliveryTime <= 20
//                                     ? "fast"
//                                     : p.deliveryTime <= 35
//                                       ? "medium"
//                                       : "slow"
//                                 }
//                               >
//                                 {p.deliveryTime} MIN
//                               </strong>
//                             </span>
//                           </div>
//                         )}





//                         <div className="hover_icons">
//                           <button>
//                             <i className="far fa-eye"></i>
//                           </button>
//                           <button>
//                             <i className="far fa-heart"></i>
//                           </button>
//                         </div>
//                       </div>

//                       <div className="product_text">
//                         <h4>{p.name}</h4>

//                         <p className="product_unit">{p.unit}</p>

//                             {(() => {
//                               const originalPrice = Number(
//                                 String(p.price_numeric || p.price || 0).replace(/[^\d.]/g, "")
//                               );

//                               const offer = offersMap[p.product_id || p.id];

//                               const finalPrice = getDiscountedPrice(originalPrice, offer);

//                               return (
//                                 <p className="product_price">
//                                   {/* ✅ FINAL PRICE */}
//                                   <span className="final_price">
//                                     QAR {finalPrice.toFixed(2)}
//                                   </span>

//                                   {/* ✅ ORIGINAL PRICE (only if offer exists) */}
//                                   {offer && finalPrice < originalPrice && (
//                                     <del style={{ marginLeft: "8px", color: "#999" }}>
//                                       QAR {originalPrice.toFixed(2)}
//                                     </del>
//                                   )}
//                                 </p>
//                               );
//                             })()}

//                         <Link
//                           to={`/ShopDetails/${p.id}${location.search}`}
//                           className="add_cart_btn"
//                         >
//                         View Product
//                       </Link>
//                       </div>
//                     </div>
//                   </div>
//                 ))}

//               {filteredProducts.length === 0 && (
//                 <p className="text-center mt-5">No products found</p>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Categories;