import React from "react";

const Topbar = () => {
  return (
    <>
      
      <section className="topbar topbar_2 ">
        <div className="container">
          <div className="row">

            {/* LEFT SIDE */}
            <div className="col-lg-7 d-none d-lg-block">
              <ul className="topbar_info d-flex flex-wrap">
                <li><a href="#"><i className="fab fa-facebook-f"></i></a></li>
                <li><a href="#"><i className="fab fa-linkedin-in"></i></a></li>
                <li><a href="#"><i className="fab fa-twitter"></i></a></li>
                <li><a href="#"><i className="fab fa-behance"></i></a></li>
              </ul>
            </div>

            {/* RIGHT SIDE */}
            <div className="col-lg-5">
              <div className="topbar_right d-flex flex-wrap align-items-center justify-content-end">

                <select className="select_js language">
                  <option>English</option>
                  <option>Arabic</option>
                  <option>Hindi</option>
                  <option>Chinese</option>
                </select>

                <select className="select_js">
                  <option>$USD</option>
                  <option>€EUR</option>
                  <option>¥JPY</option>
                  <option>£GBP</option>
                  <option>QAR INR</option>
                </select>

              </div>
            </div>
<hr></hr>
          </div>
        </div>
      </section>
       
    </>
  );
};

export default Topbar;
