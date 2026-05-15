import React, { useState } from "react";
import {
  FaTruck,
  FaShieldAlt,
  FaBolt,
  FaMobileAlt,
  FaChevronDown,
} from "react-icons/fa";
 

const Topbar = () => {
  const [languageOpen, setLanguageOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  return (
    <div className="mahal-topbar">
      <div className="container">
        <div className="topbar-flex">

          {/* LEFT SIDE */}
          <div className="left">
            <div className="left-item">
              <FaTruck className="icon" />
              Free Delivery Across Qatar
            </div>

            <div className="left-item">
              <FaShieldAlt className="icon" />
              100% Verified Suppliers
            </div>

            <div className="left-item">
              <FaBolt className="icon" />
              Fast Order Processing
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="right">

            {/* DOWNLOAD APP */}
           <a href="#" className="download-link highlight-app">
  <FaMobileAlt className="icon app-icon" />
  Download Mahal Mobile App
</a>


           {/* LANGUAGE */}
<div className="dropdown">
  <div
    className="dropdown-btn"
    onClick={() => {
      setLanguageOpen(!languageOpen);
      setCurrencyOpen(false);
    }}
  >
    English <FaChevronDown size={10} />
  </div>

  <div className={`dropdown-content ${languageOpen ? "show" : ""}`}>
    <div onClick={() => setLanguageOpen(false)}>English</div>
    <div onClick={() => setLanguageOpen(false)}>العربية</div>
  </div>
</div>


            {/* CURRENCY */}
            <div className="dropdown">
              <div
                className="dropdown-btn"
                onClick={() => {
                  setCurrencyOpen(!currencyOpen);
                  setLanguageOpen(false);
                }}
              >
                QAR  <FaChevronDown size={10} />
              </div>

              {currencyOpen && (
               <div className={`dropdown-content ${currencyOpen ? "show" : ""}`}>
                  <div onClick={() => setCurrencyOpen(false)}>QAR </div>
                  <div onClick={() => setCurrencyOpen(false)}>USD</div>
                  <div onClick={() => setCurrencyOpen(false)}>EUR</div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
