import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";

const API = "http://192.168.2.22:5000/api/profile";
const API_PROFILE = "http://192.168.2.22:5000/api/profile";

export const getProfileConfig = (role) => {
  const r = role?.toLowerCase();

  if (r === "supplier") {
    return {
      title: "Supplier Details",
      companyLabel: "Supplier Company Name",

      extraFields: true,
      steps: ["basic", "company", "address", "bank", "documents"]
    };
  }

  return {
    title: "Restaurant Details",
    companyLabel: "Restaurant Name",
    extraFields: false,
    steps: ["basic", "company", "address", "bank", "documents"]
  };
};

const CompanyInfo = () => {

  const navigate = useNavigate();
  const dirtyRef = useRef({});
  const { role, id, adminMode = false } = useOutletContext();
  const isAdmin = adminMode || !!localStorage.getItem("admin_token");
  const { i18n, t } = useTranslation();

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

  const [basicData, setBasicData] = useState({});
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const finalId = id || localStorage.getItem("linked_id");
  const finalRole = role || localStorage.getItem("role");

  const config = getProfileConfig(finalRole);

  const ro = (!isAdmin && !editMode)
    ? { readOnly: true, disabled: true } : {};

  const token = isAdmin
    ? localStorage.getItem("admin_token")
    : localStorage.getItem("token");

  const [form, setForm] = useState({
    companyName: localStorage.getItem("companyName") || "", 
    org_companyEmail: "",
    crNumber: "",
    crExpiry: "",
    compCardNumber: "",
    compCardExpiry: "",
    signingAuthority: "",
    sponsorName: "",
    tradeLicenseName: "",
    vatNumber: "",
    category: "",
    brandName: "",
  });

  const [errors, setErrors] = useState({});
  const [translatedCompany, setTranslatedCompany] = useState("");
  const [translatedCategory, setTranslatedCategory] = useState("");
  const [translatedBrand, setTranslatedBrand] = useState("");
  const [translatedSigning, setTranslatedSigning] = useState("");
  const [translatedSponsor, setTranslatedSponsor] = useState("");
  const [translatedTrade, setTranslatedTrade] = useState("");

  useEffect(() => {
    if (i18n.language === "ar") {
      if (form.companyName) translateText(form.companyName).then(setTranslatedCompany);
      if (form.category) translateText(form.category).then(setTranslatedCategory);
      if (form.brandName) translateText(form.brandName).then(setTranslatedBrand);

      if (form.signingAuthority) translateText(form.signingAuthority).then(setTranslatedSigning);
      if (form.sponsorName) translateText(form.sponsorName).then(setTranslatedSponsor);
      if (form.tradeLicenseName) translateText(form.tradeLicenseName).then(setTranslatedTrade);

    } else {
      setTranslatedCompany(form.companyName);
      setTranslatedCategory(form.category);
      setTranslatedBrand(form.brandName);

      setTranslatedSigning(form.signingAuthority);
      setTranslatedSponsor(form.sponsorName);
      setTranslatedTrade(form.tradeLicenseName);
    }
  }, [i18n.language, form]);

  const handleChange = (field) => (e) => {
    dirtyRef.current.company = true;
    const value = e?.target?.value ?? e;

    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // const formatDate = (date, lang) => {
  //   if (!date) return "";

  //   return new Date(date).toLocaleDateString(
  //     lang === "ar" ? "ar-EG" : "en-US",
  //     {
  //       year: "numeric",
  //       month: "2-digit",
  //       day: "2-digit"
  //     }
  //     // value={
  //     //   i18n.language === "ar"
  //     //     ? formatDate(form.crExpiry, "ar")
  //     //     : form.crExpiry
  //     // }
  //   );
  // };

  const submitData = async (section, data) => {
    const token = isAdmin
      ? localStorage.getItem("admin_token")
      : localStorage.getItem("token");

    if (!token) {
      // alert("Session expired");
      alert(t("alerts.session_expired"));
      return false;
    }

    const payload = {
      ...form,
      ...(finalRole === "restaurant"
        ? { restaurant_email_address: form.org_companyEmail }
        : { contact_person_email: form.org_companyEmail })
    };

    let res;

    if (isAdmin) {
      res = await fetch(
        `${API_PROFILE}/${finalRole}/update/${section}/${finalId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );
    } else {
      res = await fetch(
        `${API_PROFILE}/request-change-${finalRole}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            role: finalRole,
            entity_id: finalId,
            section,
            new_data: payload
          })
        }
      );
    }

    const text = await res.text();

    try {
      const json = JSON.parse(text);
      return json.status;
    } catch {
      console.error("RAW RESPONSE:", text);
      return false;
    }
  };

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      companyName: basicData.companyName || prev.companyName,
      org_companyEmail: basicData.email || prev.org_companyEmail,
    }));
  }, [basicData]);

  useEffect(() => {
    if (!finalId || !finalRole) return;

    const loadBasic = async () => {
      try {
        const res = await fetch(
          `${API}/${finalRole}/basic/${finalId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const json = await res.json();

        if (!json.status) return;
        setBasicData(json);
      } catch (err) {
        console.error("Basic fetch error:", err);
      }
    };
    loadBasic();
  }, [finalId, finalRole, token]);

  useEffect(() => {
    if (!finalId || !finalRole) return;

    const loadData = async () => {
      try {
        const res = await fetch(
          `${API}/${finalRole}/org/${finalId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const json = await res.json();
        if (!json.status) return;
        const d = json.data || {};

        const mappedData = {
          companyName: basicData.companyName || "",
          org_companyEmail: basicData.email || "",
          crNumber: d.cr_number || d.crNumber || "",
          crExpiry: d.cr_expiry_date || d.crExpiry || "",
          compCardNumber: d.computer_card_number || d.compCardNumber || "",
          compCardExpiry: d.computer_card_expiry_date || d.compCardExpiry || "",
          signingAuthority: d.signing_authority_name || "",
          sponsorName: d.sponsor_name || "",
          tradeLicenseName: d.trade_license_name || "",
          vatNumber: d.vat_tax_number || "",
          category: d.category || "",
          brandName: d.brand_name || ""
        };

        setForm(mappedData);

      } catch (err) {
        console.error("Org fetch error:", err);
      }
    };
    loadData();
  }, [finalId, finalRole, basicData, token]);

  const validate = () => {
    let err = {};

    if (!form.crNumber || form.crNumber.length < 6) {
      err.crNumber = t("validation.cr_number");
    }

    if (form.vatNumber && form.vatNumber.length !== 15) {
      err.vatNumber = t("validation.vat_number");
    }

    if (!form.signingAuthority) err.signingAuthority = t("validation.required");
    if (!form.sponsorName) err.sponsorName = t("validation.required");
    if (!form.tradeLicenseName) err.tradeLicenseName = t("validation.required");

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin && !editMode) {
      navigate(`/profile/${finalRole}/${finalId}/address`);
      return;
    }

    if (!isAdmin && editMode) {
      if (!dirtyRef.current.company) {
        // alert("No changes detected in Supplier Details");
        alert(t("alerts.no_changes"));
        navigate(`/profile/${finalRole}/${finalId}/address`);
        return;
      }
    }

    if (!validate()) return;

    if (!/\S+@\S+\.\S+/.test(form.org_companyEmail)) {
      // alert("Invalid email ❌");
      alert(t("alerts.invalid_email"));
      return;
    }

    if (Object.values(form).every(v => !v)) {
      // alert("No data to save ❌");
      alert(t("alerts.no_data"));
      return;
    }

    setLoading(true);
    const success = await submitData("org", form);
    // alert(isAdmin ? "Saved ✅" : "Sent for approval ✅");
    alert(isAdmin ? t("alerts.saved") : t("alerts.sent_for_approval"));
    setLoading(false);

    if (!isAdmin) setEditMode(false);

    if (success) {
      navigate(`/profile/${finalRole}/${finalId}/address`);
    }
  };

  return (
    <div className="profile-card">
      {/* <h3 className="profile-title">{config.title}</h3> */}
      <h3 className="profile-title">
        {finalRole === "supplier"
          ? t("companyinfo.title_supplier")
          : t("companyinfo.title_restaurant")} </h3>

      {!isAdmin && !editMode && (
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setEditMode(true)}
        >
          {t("buttons.edit")} ✏️
        </button>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-row three-col">
          
          <div className="form-group">
            {/* <label>{config.companyLabel}</label> */}
            <label>
              {finalRole === "supplier"
                ? t("companyinfo.company_name_supplier")
                : t("companyinfo.company_name_restaurant")}
            </label>
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
            <label>{t("companyinfo.email")}</label>
            <input
              type="email"
              className="readonly-field"
              value={form.org_companyEmail}
              onChange={handleChange("org_companyEmail")}
              // placeholder="Company email"
              placeholder={t("companyinfo.email_placeholder")}
              readOnly
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>{t("companyinfo.cr_number")}</label>
            <input
              type="text"
              value={form.crNumber || ""}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                handleChange("crNumber")(v);
              }}
              maxLength={10}
              {...ro}
            />
            {errors.crNumber && <small style={{color:"red"}}>{errors.crNumber}</small>}
            {/* <small>Digits only (6–10 numbers)</small> */}
            <small>{t("companyinfo.digits_6_10")}</small>
          </div>
        </div>

        <div className="form-row three-col">

          <div className="form-group">
            <label>{t("companyinfo.cr_expiry")}</label>
            <input
              type="date"
              value={form.crExpiry || ""}
              onChange={handleChange("crExpiry")}
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>{t("companyinfo.comp_card_number")}</label>
            <input
              type="text"
              value={form.compCardNumber || ""}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                handleChange("compCardNumber")(v);
              }}
              maxLength={12}
              {...ro}
            />
            {/* <small>Digits only (7–12 numbers)</small> */}
            <small>{t("companyinfo.digits_7_12")}</small>
          </div>

          <div className="form-group">
            <label>{t("companyinfo.comp_card_expiry")}</label>
            <input
              type="date"
              value={form.compCardExpiry || ""}
              onChange={handleChange("compCardExpiry")}
              {...ro}
            />
          </div>
        </div>

        <div className="form-row three-col">

          <div className="form-group">
            <label>{t("companyinfo.signing_authority")}</label>
            <input
              type="text"
              // value={form.signingAuthority || ""}
              value={i18n.language === "ar" ? translatedSigning : form.signingAuthority}
              onChange={handleChange("signingAuthority")}
              {...ro}
            />
            {errors.signingAuthority && <small style={{color:"red"}}>{errors.signingAuthority}</small>}
          </div>

          <div className="form-group">
            <label>{t("companyinfo.sponsor_name")}</label>
            <input
              type="text"
              // value={form.sponsorName || ""}
              value={i18n.language === "ar" ? translatedSponsor : form.sponsorName}
              onChange={handleChange("sponsorName")}
              {...ro}
            />
            {errors.sponsorName && <small style={{color:"red"}}>{errors.sponsorName}</small>}
          </div>

          <div className="form-group">
            <label>{t("companyinfo.trade_license")}</label>
            <input
              type="text"
              // value={form.tradeLicenseName || ""}
              value={i18n.language === "ar" ? translatedTrade : form.tradeLicenseName}
              onChange={handleChange("tradeLicenseName")}
              {...ro}
            />
            {errors.tradeLicenseName && <small style={{color:"red"}}>{errors.tradeLicenseName}</small>}
            {/* <small>Must match trade license exactly</small> */}
            <small>{t("companyinfo.trade_license_hint")}</small>
          </div>
        </div>

        <div className="form-row three-col">

          <div className="form-group">
            <label>{t("companyinfo.vat_number")}</label>
            <input
              type="text"
              value={form.vatNumber || ""}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                handleChange("vatNumber")(v);
              }}
              maxLength={15}
              {...ro}
            />
            {errors.vatNumber && (
              <small style={{ color: "red" }}>{errors.vatNumber}</small>
            )}
            {/* <small>15-digit VAT number</small> */}
            <small>{t("companyinfo.vat_hint")}</small>
          </div>

          {config.extraFields && (
            <div className="form-group">
              <label>{t("companyinfo.category")}</label>
              <input
                type="text"
                // value={form.category || ""}
                value={i18n.language === "ar" ? translatedCategory : form.category}
                onChange={handleChange("category")}
                {...ro}
              />
            </div>
          )}

          {config.extraFields && (
            <div className="form-group">
              <label>{t("companyinfo.brand_name")}</label>
              <input
                type="text"
                // value={form.brandName || ""}
                value={i18n.language === "ar" ? translatedBrand : form.brandName}
                onChange={handleChange("brandName")}
                {...ro}
              />
            </div>
          )}
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

export default CompanyInfo;