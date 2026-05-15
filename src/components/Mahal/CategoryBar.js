// const CategoryBar = ({ activeCategory, onCategoryChange, onAllClick }) => {
//   const categories = [
//     "Fresh",
//     "Vegetables",
//     "Rice",
//     "Meat",
//     "Dairy",
//     "Offers",
//   ];

//   return (
//     <div className="mm-catbar">
//       <div className="mm-catbar-all" onClick={onAllClick}>
//         <i className="fas fa-bars"></i>
//         <span>All</span>
//       </div>

//       <ul className="mm-catbar-menu">
//         {categories.map(cat => (
//           <li
//             key={cat}
//             className={activeCategory === cat ? "active" : ""}
//             onClick={() => onCategoryChange(cat)}
//           >
//             {cat}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default CategoryBar;

import { useNavigate } from "react-router-dom";

const CategoryBar = ({ activeCategory, onCategoryChange, onAllClick }) => {
  const navigate = useNavigate();

  const categories = [
    "Fresh",
    "Vegetables",
    "Rice",
    "Meat",
    "Dairy",
    "Offers",
  ];

  return (
    <div className="mm-catbar">
      <div
        className="mm-catbar-all"
        onClick={() => navigate("/categorieList")}
      >
        <i className="fas fa-bars"></i>
        <span>All</span>
      </div>

      <ul className="mm-catbar-menu">
        {categories.map(cat => (
          <li
            key={cat}
            className={activeCategory === cat ? "active" : ""}
            onClick={() => {
              onCategoryChange(cat);

              // 🔥 SPECIAL CASE: OFFERS
              if (cat === "Offers") {
                navigate(`/categorieList?offerType=all`);
              } else {
                navigate(`/categorieList?category=${cat}`);
              }
            }}
          >
            {cat}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryBar;