import React from "react";

const MahalCategoryRow = ({ title, products = [] }) => {
  return (
    <section className="mahal-product-section mt-5">
      <div className="container">

        <div className="mahal-section-header">
          <h2>{title}</h2>
          <span className="mahal-see-all">see all</span>
        </div>

        <div className="mahal-product-row">

          {products.length > 0 ? (
            products.map((item, index) => (
              <div className="mahal-product-card" key={index}>

                {/* 🔥 SVG BADGE */}
                {item?.off && (
                  <div className="mahal-off-badge">
                    <svg
                      width="39"
                      height="38"
                      viewBox="0 0 29 28"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <linearGradient
                          id={`orangeGradient-${title}-${index}`}
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#FF8C00" />
                          <stop offset="100%" stopColor="#FF3D00" />
                        </linearGradient>
                      </defs>

                      <path
                        d="M28.9499 0C28.3999 0 27.9361 1.44696 27.9361 2.60412V27.9718L24.5708 25.9718L21.2055 27.9718L17.8402 25.9718L14.4749 27.9718L11.1096 25.9718L7.74436 27.9718L4.37907 25.9718L1.01378 27.9718V2.6037C1.01378 1.44655 0.549931 0 0 0H28.9499Z"
                        fill={`url(#orangeGradient-${title}-${index})`}
                      />
                    </svg>

                    <span>{item.off}</span>
                  </div>
                )}

                <div className="mahal-img-box"></div>

                <h5>{item?.name}</h5>
                <p className="mahal-weight">{item?.weight}</p>

                <div className="mahal-price-row">
                  <div>
                    <span className="mahal-price">
                      QAR {item?.price}
                    </span>

                    {item?.oldPrice && (
                      <span className="mahal-old">
                        QAR {item.oldPrice}
                      </span>
                    )}
                  </div>

                  <button className="mahal-add-btn">
                    ADD
                  </button>
                </div>

              </div>
            ))
          ) : (
            <p style={{ padding: "20px 0" }}>
              No products available
            </p>
          )}

        </div>

      </div>
    </section>
  );
};

export default MahalCategoryRow;
