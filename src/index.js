import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import 'bootstrap/dist/css/bootstrap.min.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "intro.js/introjs.css";
import "leaflet/dist/leaflet.css";
import "./i18n";


import './styles/style.css';


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
