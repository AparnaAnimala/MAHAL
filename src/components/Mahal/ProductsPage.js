import React from "react";
 

const ProductsPage = ({ selectedCategory }) => {
  const products = [
    { id: 1, name: "Tomatoes", category: "Vegetables", price: 40 },
    { id: 2, name: "Onions", category: "Vegetables", price: 30 },
    { id: 3, name: "Basmati Rice", category: "Rice", price: 120 },
    { id: 4, name: "Chicken", category: "Meat", price: 220 },
    { id: 5, name: "Milk", category: "Dairy", price: 60 },
  ];

  const filteredProducts =
    !selectedCategory || selectedCategory === "All"
      ? products
      : products.filter(p => p.category === selectedCategory);

  return (
    <div className="mm-products-page">
      <h3>{selectedCategory || "All"} Products</h3>

      <div className="mm-product-grid">
        {filteredProducts.map(item => (
          <div className="mm-product-card" key={item.id}>
            <img src="https://via.placeholder.com/150" alt={item.name} />
            <h5>{item.name}</h5>
            <p>QAR {item.price}</p>
            <button>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;
