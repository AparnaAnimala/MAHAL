import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const API_PROFILE = "http://192.168.2.22:5000/api/profile";

const BasicInfo = () => {

  const { role, id, adminMode = false } = useOutletContext();
  const isAdmin = adminMode || !!localStorage.getItem("admin_token");
  const navigate = useNavigate();
  const dirtyRef = useRef({});

  const getToken = useCallback(() => {
    return isAdmin
      ? localStorage.getItem("admin_token")
      : localStorage.getItem("token");
  }, [isAdmin]);

  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    profileType: "",
    city: "",
    country: "",
  });

  const { i18n, t } = useTranslation();

  const PROFILE_TYPE_MAP = {
    supplier: { en: "Supplier", ar: "مورد" },
    restaurant: { en: "Restaurant", ar: "مطعم" }
  };

  const translateText = async (text, targetLang = "ar") => {
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      );
      const data = await res.json();
      return data[0][0][0];
    } catch {
      return text;
    }
  };
      
  const normalizeRole = (r) => (r ? r.toLowerCase().trim() : "");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [translatedName, setTranslatedName] = useState("");
  const [translatedCompany, setTranslatedCompany] = useState("");
  const [translatedCity, setTranslatedCity] = useState("");
  const [translatedCountry, setTranslatedCountry] = useState("");
  const [translatedProfileType, setTranslatedProfileType] = useState("");

  useEffect(() => {
    if (!form.profileType) return;

    const key = form.profileType.toLowerCase();

    if (i18n.language === "ar") {
      setTranslatedProfileType(PROFILE_TYPE_MAP[key]?.ar || form.profileType);
    } else {
      setTranslatedProfileType(PROFILE_TYPE_MAP[key]?.en || form.profileType);
    }
  }, [form.profileType, i18n.language]);

  useEffect(() => {
  if (i18n.language === "ar") {
    if (form.fullName) translateText(form.fullName).then(setTranslatedName);
    if (form.companyName) translateText(form.companyName).then(setTranslatedCompany);
    if (form.city) translateText(form.city).then(setTranslatedCity);
    if (form.country) translateText(form.country).then(setTranslatedCountry);
  } else {
    setTranslatedName(form.fullName);
    setTranslatedCompany(form.companyName);
    setTranslatedCity(form.city);
    setTranslatedCountry(form.country);
  }
}, [i18n.language, form]);

  const ro = (!isAdmin && !editMode) 
    ? { readOnly: true, disabled: true } : {};

  const handleChange = (field) => (e) => {
    dirtyRef.current.basic = true;
    const value = e?.target?.value ?? e;

    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  useEffect(() => {
    const userId = id || localStorage.getItem("linked_id");

    if (!role || !userId) return;
    const normalizedRole = normalizeRole(role);

    const token = getToken();

    if (!token) {
      console.error("❌ No token found");
      return;
    }

    const fetchBasic = async () => {
      try {
        setLoading(true);
        const BASE_URL = "http://192.168.2.22:5000/api/profile";

        const res = await fetch(
          `${BASE_URL}/${normalizedRole}/basic/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${
                isAdmin
                  ? localStorage.getItem("admin_token")
                  : localStorage.getItem("token")
              }`
            },
          }
        );

        const json = await res.json();
        if (!json.status) {
          setLoading(false);
          return;
        }

        const mappedData = {
          fullName: json.fullName || "",
          companyName: json.companyName || "",
          email: json.email || "",
          phone: json.phone || "",
          profileType: role,
          city: json.city || "",
          country: json.country || "",
        };

        setForm(mappedData);

      } catch (err) {
        console.error("❌ Basic info fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBasic();
  }, [role, id, isAdmin, getToken]);

  const submitData = async (section, data) => {
    const token = isAdmin
      ? localStorage.getItem("admin_token")
      : localStorage.getItem("token");

    const url = isAdmin
      ? `${API_PROFILE}/${role}/update/${section}/${id}`
      : `${API_PROFILE}/request-change-${role}`;

    const payload = isAdmin
      ? data
      : {
          role,
          entity_id: id,
          section,
          new_data: data
        };

    const res = await fetch(url, {
      method: isAdmin ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    return json.status;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin && !editMode) {
      navigate(`/profile/${role}/${id}/company`);
      return;
    }

    if (!isAdmin && editMode) {

      if (!dirtyRef.current.basic) {
        // alert("Basic Info cannot be edited");
        alert(t("alerts.no_edit"));
        // toast.error(t("alerts.invalid_email"));
        navigate(`/profile/${role}/${id}/company`);
        return;
      }
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      // alert("Invalid email ❌");
      alert(t("alerts.invalid_email"));
      return;
    }

    if (form.phone.length < 10) {
      // alert("Invalid phone ❌");
      alert(t("alerts.invalid_phone"));
      return;
    }

    if (Object.values(form).every(v => !v)) {
      // alert("No data to save ❌");
      alert(t("alerts.no_data"));
      return;
    }

    setLoading(true);
    const success = await submitData("basic", form);
    // alert(isAdmin ? "Saved ✅" : "Sent for approval ✅");
    alert(isAdmin ? t("alerts.saved") : t("alerts.sent_for_approval"));
    setLoading(false);

    if (!isAdmin) setEditMode(false);

    if(success) {
      navigate(`/profile/${role}/${id}/company`); }
  };

  return (
    <div className="profile-card">
      {/* <h3 className="profile-title">Basic Info</h3> */}
      <h3 className="profile-title">{t("basicinfo.title")}</h3>

      {!isAdmin && !editMode && (
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setEditMode(true)}
        >
          {/* Edit ✏️ */}
          {t("buttons.edit")} ✏️
        </button>
      )}

      <form onSubmit={handleSubmit} className="profile-form">

        <div className="form-row">
          <div className="form-group">
            {/* <label>Full Name</label> */}
            <label>{t("basicinfo.full_name")}</label>
            <input
              type="text"
              className="readonly-field"
              // value={form.fullName}
              value={i18n.language === "ar" ? translatedName : form.fullName}
              onChange={handleChange("fullName")}
              readOnly
              {...ro}
            />
          </div>

          <div className="form-group">
            {/* <label>Company Name</label> */}
            <label>{t("basicinfo.company_name")}</label>
            <input
              type="text"
              className="readonly-field"
              // value={form.companyName}
              value={i18n.language === "ar" ? translatedCompany : form.companyName}
              onChange={handleChange("companyName")}
              readOnly
              {...ro}
            />
          </div>

          <div className="form-group">
            {/* <label>Email</label> */}
            <label>{t("basicinfo.email")}</label>
            <input
              type="email"
              className="readonly-field"
              value={form.email}
              onChange={handleChange("email")}
              readOnly
              {...ro}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            {/* <label>Phone</label> */}
            <label>{t("basicinfo.phone")}</label>
            <input
              type="tel"
              className="readonly-field"
              value={form.phone}
              onChange={handleChange("phone")}
              readOnly
              {...ro}
            />
          </div>

          <div className="form-group">
            {/* <label>Profile Type</label> */}
            <label>{t("basicinfo.profile_type")}</label>
            <input
              className="readonly-field"
              // value={capitalize(form.profileType)}
              value={i18n.language === "ar"
                ? translatedProfileType
                : capitalize(form.profileType)}
              readOnly
              {...ro}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {/* {loading ? "Saving..." : (!editMode ? "Next →" : "Save & Next →")} */}
            {loading
              ? t("buttons.saving")
              : !editMode
              ? i18n.language === "ar"
                  ? `${t("buttons.next")} ←`
                  : `${t("buttons.next")} →`
              : i18n.language === "ar"
                  ? `${t("buttons.save_next")} ←`
                  : `${t("buttons.save_next")} →` }
          </button>
        </div>
      </form>
    </div>
  );
};

export default BasicInfo;