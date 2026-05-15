import React, { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react"; 
import { useTranslation } from "react-i18next";
const EditInventoryModal = ({ product, onClose, onSave }) => {
  // 🔥 CONTROLLED STATES (THIS WAS MISSING)
  const { t, i18n } = useTranslation();
  const [units, setUnits] = useState(product.units);
  const [price, setPrice] = useState(product.price);
  const [expiryDate, setExpiryDate] = useState("");
  const [expiryTime, setExpiryTime] = useState("");
  const [moq, setMoq] = useState(product.moq);
  const [currency, setCurrency] = useState(product.currency);
  const [uom, setUom] = useState(product.uom);
  const [countryOfOrigin, setCountryOfOrigin] = useState(product.country_of_origin || "");
const [nameEn, setNameEn] = useState(product.product_name_english || "");
const [nameAr, setNameAr] = useState(product.product_name_arabic || "");
const images = product.images || [];

const [newImages, setNewImages] = useState([]);

const [selectedImage, setSelectedImage] = useState(
  product.image || images[0] || ""
);

const [deliveryTime, setDeliveryTime] = useState(
  product.delivery_time_minutes || 30
);
// const [newImages, setNewImages] = useState([]);
const debounceRef = useRef(null);
const translateToArabic = async (text) => {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${text}&langpair=en|ar`
    );

    const data = await res.json();
    setNameAr(data.responseData.translatedText || "");
  } catch (err) {
    console.error(err);
  }
};
  // 🖼️ IMAGE LOGIC (UNCHANGED)
  // const [images] = useState(product.images || []);
  // const [newImages, setNewImages] = useState([]);

//   const [images, setImages] = useState(product.images || []);
// const [newImages, setNewImages] = useState([]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewImages((prev) => [...prev, ...previews]);
  };
  useEffect(() => {
    setExpiryDate(formatDateForInput(product.expiry_date));
    setExpiryTime(formatTimeForInput(product.expiry_time));
    setCountryOfOrigin(product.country_of_origin || "");
    setNameEn(product.product_name_english || "");
    setNameAr(product.product_name_arabic || "");
    setDeliveryTime(product.delivery_time_minutes || 30);

  }, [product]);


  return (
    <div className="modal_overlay">
      <div className="modal_box large edit_modal">

        <h3 className="modal_title">{t("product_actions")}</h3>
        {/* <p className="product_name">
          {i18n.language === "ar"
            ? product.product_name_arabic || product.product_name_english
            : product.product_name_english}
        </p> */}
        <div className="form_group">
          <label>{t("product_name_english")}</label>
          <input
            type="text"
            value={nameEn}
            onChange={(e) => {
              const value = e.target.value;
              setNameEn(value);

              if (debounceRef.current) clearTimeout(debounceRef.current);

              debounceRef.current = setTimeout(() => {
                if (value.trim()) {
                  translateToArabic(value);
                }
              }, 500);
            }}
          />
        </div>

        <div className="form_group">
          <label>{t("product_name_arabic")}</label>
          <input
            type="text"
            dir="rtl"
            style={{ textAlign: "right", background: "#f5f5f5" }}
            value={nameAr}
            readOnly
          />
        </div>

        {/* Stock */}
        <div className="form_group">
          <label>{t("stock_quantity")}</label>
          <input
            type="number"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
          />
        </div>

        {/* Price */}
        <div className="form_group">
          <label>{t("price_per_unit")}</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        {/* Expiry Date */}
        <div className="form_group">
          <label>{t("expiry_date")}</label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>

        {/* Expiry Time (UI only – backend optional) */}
        <div className="form_group">
          <label>{t("expiry_time")}</label>
          <input
            type="time"
            value={expiryTime}
            onChange={(e) => setExpiryTime(e.target.value)}
          />
        </div>

        {/* MOQ */}
        <div className="form_group">
          <label>{t("minimum_order_quantity")}</label>
          <input
            type="number"
            value={moq}
            onChange={(e) => setMoq(e.target.value)}
          />
        </div>

        {/* Delivery Time */}
        <div className="form_group">
          <label>{t("delivery_time_minutes")}</label>

          <input
            type="number"
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
          />
        </div>

        {/* Currency */}
        <div className="form_group">
          <label>{t("Supcurrency")}</label>
          <input
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          />
        </div>

        <div className="form_group">
          <label>{t("country")}</label>
          <input
            type="text"
            value={countryOfOrigin}
            onChange={(e) => setCountryOfOrigin(e.target.value)}
          />
        </div>

        {/* UOM */}
        <div className="form_group">
          <label>{t("unit_of_measure")}</label>
          <input
            value={uom}
            onChange={(e) => setUom(e.target.value)}
          />
        </div>

        {/* Existing Images */}
        <div className="form_group">
          <label>{t("existing_images")}</label>
<div className="image_row">

  {/* Existing Images */}
  {images.map((img, i) => (

    <div
      key={`old-${i}`}
      className={`selectable_image_box ${
        selectedImage === img ? "active_selected_image" : ""
      }`}
      onClick={() => setSelectedImage(img)}
    >

      <img src={img} alt="product" />

      {selectedImage === img && (
        <div className="selected_image_badge">
          Primary
        </div>
      )}

    </div>
  ))}

  {/* Newly Added Images */}
  {newImages.map((img, i) => (

    <div
      key={`new-${i}`}
      className={`selectable_image_box ${
        selectedImage === img.preview
          ? "active_selected_image"
          : ""
      }`}
      onClick={() => setSelectedImage(img.preview)}
    >

      <img src={img.preview} alt="new" />

      {selectedImage === img.preview && (
        <div className="selected_image_badge">
          Primary
        </div>
      )}

    </div>
  ))}

</div>
        </div>

        {/* Upload */}
        <div className="form_group">
          <label className="upload_btn">
            {t("choose_images")}
            <input type="file" multiple hidden onChange={handleImageUpload} />
          </label>
        </div>

        {/* Actions */}
        <div className="modal_actions">
          <button className="btn cancel" onClick={onClose}>
            {t("back")}
          </button>

          <button
            className="btn save"
            onClick={() =>
              onSave({
                product_id: product.product_id,
                product_name_english: nameEn,
                product_name_arabic: nameAr,
                units,
                price,
                expiry_date: expiryDate,
                expiry_time: expiryTime,
                moq,
                currency,
                country_of_origin: countryOfOrigin,
                uom,
                delivery_time_minutes: deliveryTime,
                primary_image: selectedImage,
                images: newImages.map(img => img.file),
              })
              // onSave({
              //   product_id: product.product_id,

              //   // ✅ ADD THIS
              //   product_name_english: nameEn,
              //   product_name_arabic: nameAr,

              //   // ✅ FIX FIELD NAMES (IMPORTANT)
              //   stock: units,
              //   price_per_unit: price,
              //   minimum_order_quantity: moq,
              //   currency,
              //   country_of_origin: countryOfOrigin,
              //   unit_of_measure: uom,
              //   expiry_date: expiryDate,
              //   expiry_time: expiryTime,

              //   images: newImages.map(img => img.file),
              // })
            }
          >
            {t("save")}
          </button>
        </div>

      </div>
    </div>
  );
};
const formatDateForInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

const formatTimeForInput = (time) => {
  if (!time) return "";
  // handles: "00:00:00", "00:00:00 GMT", "00:00"
  return time.substring(0, 5);
};

export default EditInventoryModal;