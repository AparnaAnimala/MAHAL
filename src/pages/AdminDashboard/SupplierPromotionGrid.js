// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const API = "http://192.168.2.22:5000/api/admin/promotions";

// export default function SupplierPromotionGrid() {

//   const [grids, setGrids] = useState([null, null, null, null, null, null]);
//   const navigate = useNavigate();

//   const city = localStorage.getItem("selected_city") || "Doha";

//   const loadGrid = async (position, index) => {
//     try {
//       const res = await axios.get(`${API}/grid/${city}/${position}`);

//       const banner = res.data.length > 0 ? res.data[0] : null;

//       setGrids(prev => {
//         const updated = [...prev];
//         updated[index] = banner;
//         return updated;
//       });

//     } catch {
//       setGrids(prev => {
//         const updated = [...prev];
//         updated[index] = null;
//         return updated;
//       });
//     }
//   };

//   useEffect(() => {

//     const positions = [
//       "LEFT_SLIDER_1",
//       "LEFT_SLIDER_2",
//       "LEFT_SLIDER_3",
//       "RIGHT_SLIDER_1",
//       "RIGHT_SLIDER_2",
//       "RIGHT_SLIDER_3"
//     ];

//     positions.forEach((pos, i) => loadGrid(pos, i));

//     const interval = setInterval(() => {
//       positions.forEach((pos, i) => loadGrid(pos, i));
//     }, 15000);

//     return () => clearInterval(interval);

//   }, [city]);

//   return null; // optional (if only using Banner.jsx)
// }

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://192.168.2.22:5000/api/admin/promotions";

export default function SupplierPromotionGrid() {

  const [grids, setGrids] = useState([null, null, null, null, null, null]);
  const navigate = useNavigate();

  const city = localStorage.getItem("selected_city") || "Doha";

  const loadGrid = async (position, index) => {
    try {
      const res = await axios.get(`${API}/grid/${city}/${position}`);

      const banner = res.data.length > 0 ? res.data[0] : null;

      setGrids(prev => {
        const updated = [...prev];
        updated[index] = banner;
        return updated;
      });

    } catch {
      setGrids(prev => {
        const updated = [...prev];
        updated[index] = null;
        return updated;
      });
    }
  };

  useEffect(() => {

    const positions = [
      "LEFT_SLIDER_1",
      "LEFT_SLIDER_2",
      "LEFT_SLIDER_3",
      "RIGHT_SLIDER_1",
      "RIGHT_SLIDER_2",
      "RIGHT_SLIDER_3"
    ];

    positions.forEach((pos, i) => loadGrid(pos, i));

    const interval = setInterval(() => {
      positions.forEach((pos, i) => loadGrid(pos, i));
    }, 15000);

    return () => clearInterval(interval);

  }, [city]);

  return null; // optional (if only using Banner.jsx)
}