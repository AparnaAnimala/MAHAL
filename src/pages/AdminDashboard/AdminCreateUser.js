import React, { useState, useEffect } from "react";
import signImg from "../../images/sign_in_img_1.jpg";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://192.168.2.22:5000/api/suppliers";

export default function AdminCreateUser() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [masterData, setMasterData] = useState({
    country: [],
    city: [],
  });

  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    email: "",
    country: "",
    city: "",
    countryCode: "+971",
    phoneNumber: "",
    businessType: "Restaurant",
  });

  /* ================= MASTER DATA ================= */
  useEffect(() => {
    async function load() {
      try {
        const c = await fetch(`${API_BASE_URL}/master/country`);
        const ci = await fetch(`${API_BASE_URL}/master/city`);
        setMasterData({
          country: (await c.json()).data || [],
          city: (await ci.json()).data || [],
        });
      } catch (err) {
        console.error("Master data error", err);
      }
    }
    load();
  }, []);

  const handleFormChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    // 🔥 Admin metadata
    fd.append("registration_source", "admin_created");
    const adminId = localStorage.getItem("admin_id");

    if (adminId && adminId !== "null") {
      fd.append("created_by_admin_id", adminId);
    }


    const endpoint =
      form.businessType === "Supplier"
        ? `${API_BASE_URL}/register-supplier`
        : `${API_BASE_URL}/register-restaurant`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Creation failed");
        setIsSubmitting(false);
        return;
      }

      alert("User created successfully (Pending Approval)");
      navigate("/admin/dashboard");

    } catch (err) {
      alert("Server error");
    }

    setIsSubmitting(false);
  };

  return (
    <section className="sign_in pt_100 xs_pt_80">
      <div className="container">
        <div className="row justify-content-center align-items-center">

          <div className="col-xxl-3 col-lg-4 d-none d-lg-block">
            <div className="sign_in_img">
              <img src={signImg} alt="Create User" className="img-fluid w-100" />
            </div>
          </div>

          <div className="col-xxl-7 col-md-10 col-lg-7 col-xl-6">
            <div className="sign_in_form">
              <h3>Create User</h3>

              <form className="register_form" onSubmit={handleSubmit}>
                <input
                  name="fullName"
                  placeholder="Full Name"
                  value={form.fullName}
                  onChange={handleFormChange}
                  required
                />

                <input
                  name="companyName"
                  placeholder="Company Name"
                  value={form.companyName}
                  onChange={handleFormChange}
                  required
                />

                <div className="form_row">
                  <select
                    name="country"
                    value={form.country}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">- Select Country -</option>
                    {masterData.country.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>

                  <select
                    name="city"
                    value={form.city}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">- Select City -</option>
                    {masterData.city.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>

                  <select
                    name="businessType"
                    value={form.businessType}
                    onChange={handleFormChange}
                  >
                    <option>Restaurant</option>
                    <option>Supplier</option>
                  </select>
                </div>

                <input
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleFormChange}
                  required
                />

                <div className="form_row">
                  <select
                    className="code"
                    name="countryCode"
                    value={form.countryCode}
                    onChange={handleFormChange}
                  >
                    <option value="+971">UAE +971</option>
                    <option value="+91">India +91</option>
                  </select>

                  <input
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={form.phoneNumber}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form_row">
                  <button
                    className="register_btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create User"}
                  </button>
                </div>

              </form>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
