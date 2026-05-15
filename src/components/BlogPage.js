// import React from "react";
// import { Link } from "react-router-dom";
// import Header from "../components/Header";
// import Footer from "../components/Footer";

// // images
// import blog1 from "../images/blog_img_1.jpg";
// import blog2 from "../images/blog_img_2.jpg";
// import blog3 from "../images/blog_img_3.jpg";
// import blog4 from "../images/blog_img_4.png";
// import blog5 from "../images/blog_img_5.png";
// import blog6 from "../images/blog_img_6.png";
// import blog7 from "../images/blog_img_7.png";
// import blog8 from "../images/blog_img_8.png";
// import blog9 from "../images/blog_img_9.png";

// const blogs = [
//   {
//     img: blog1,
//     category: "Industry Insights",
//     title: "How Restaurants Can Optimize Daily Procurement",
//   },
//   {
//     img: blog2,
//     category: "Supply Chain",
//     title: "Building Reliable Supplier Networks in B2B Food",
//   },
//   {
//     img: blog3,
//     category: "Operations",
//     title: "Reducing Food Costs Without Compromising Quality",
//   },
//   {
//     img: blog4,
//     category: "Marketplace",
//     title: "Why Digital Marketplaces Are the Future of Food Supply",
//   },
//   {
//     img: blog5,
//     category: "Restaurants",
//     title: "Bulk vs Daily Ordering: What Works Best?",
//   },
//   {
//     img: blog6,
//     category: "Suppliers",
//     title: "How Suppliers Can Scale Faster Using MAHAL",
//   },
//   {
//     img: blog7,
//     category: "Logistics",
//     title: "Ensuring On-Time Delivery in High-Volume Orders",
//   },
//   {
//     img: blog8,
//     category: "Technology",
//     title: "How Data Improves Transparency in B2B Procurement",
//   },
//   {
//     img: blog9,
//     category: "Growth",
//     title: "Long-Term Partnerships Between Restaurants & Suppliers",
//   },
// ];

// const BlogPage = () => {
//   return (
//     <>
     

//       <section className="mahal-page-section">
//         <div className="container">

//           {/* TITLE */}
//           <div className="text-center mb-5">
//             <h1 className="mahal-title">
//               MAHAL <span>Insights</span>
//             </h1>
//             <p className="mahal-desc">
//               Stories, insights, and updates from the B2B food ecosystem.
//             </p>
//           </div>

//           {/* BLOG GRID */}
//           <div className="row g-4">
//             {blogs.map((blog, index) => (
//               <div className="col-lg-4 col-md-6" key={index}>
//                 <div className="mahal-blog-card">

//                   <div className="blog-img">
//                     <img
//                       src={blog.img}
//                       alt={blog.title}
//                       className="img-fluid"
//                     />
//                     <span className="blog-category">{blog.category}</span>
//                   </div>

//                   <div className="blog-content">
//                     <h4>{blog.title}</h4>

//                     <Link to="#" className="read-more">
//                       Read Article <i className="fas fa-arrow-right"></i>
//                     </Link>
//                   </div>

//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* PAGINATION */}
//           <div className="pagination mt-5 justify-content-center d-flex">
//             <Link className="page-link" to="#">
//               <i className="fas fa-angle-left"></i>
//             </Link>
//             <Link className="page-link active" to="#">1</Link>
//             <Link className="page-link" to="#">2</Link>
//             <Link className="page-link" to="#">3</Link>
//             <Link className="page-link" to="#">
//               <i className="fas fa-angle-right"></i>
//             </Link>
//           </div>

//         </div>
//       </section>

    
//     </>
//   );
// };

// export default BlogPage;


import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// images
import blog1 from "../images/blog_img_1.jpg";
import blog2 from "../images/blog_img_2.jpg";
import blog3 from "../images/blog_img_3.jpg";
import blog4 from "../images/blog_img_4.png";
import blog5 from "../images/blog_img_5.png";
import blog6 from "../images/blog_img_6.png";
import blog7 from "../images/blog_img_7.png";
import blog8 from "../images/blog_img_8.png";
import blog9 from "../images/blog_img_9.png";

const images = [
  blog1, blog2, blog3,
  blog4, blog5, blog6,
  blog7, blog8, blog9,
];

const BlogPage = () => {
  const { t, i18n } = useTranslation();

  const blogs = t("blogContent.blogs", { returnObjects: true });

  return (
    <section
      className="mahal-page-section"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <div className="container">

        {/* TITLE */}
        <div className="text-center mb-5">
          <h1 className="mahal-title">
            {t("blogContent.title1")}{" "}
            <span>{t("blogContent.title2")}</span>
          </h1>

          <p className="mahal-desc">
            {t("blogContent.desc")}
          </p>
        </div>

        {/* BLOG GRID */}
        <div className="row g-4">
          {blogs.map((blog, index) => (
            <div className="col-lg-4 col-md-6" key={index}>
              <div className="mahal-blog-card">

                <div className="blog-img">
                  <img
                    src={images[index]}
                    alt={blog.title}
                    className="img-fluid"
                  />
                  <span className="blog-category">
                    {blog.category}
                  </span>
                </div>

                <div className="blog-content">
                  <h4>{blog.title}</h4>

                  <Link to="#" className="read-more">
                    {t("blogContent.readMore")}{" "}
                    <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default BlogPage;