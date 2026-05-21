import React, { useEffect, useState, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const API_PROFILE = "http://192.168.2.22:5000/api/profile";

export default function Address() {

  const { role, id, adminMode = false, masterData, setMasterData } = useOutletContext();
  const isAdmin = adminMode || localStorage.getItem("admin_token");
  const navigate = useNavigate();
  const dirtyRef = useRef({});
  const { t, i18n } = useTranslation();

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [translatedAddress, setTranslatedAddress] = useState("");
  const [translatedCity, setTranslatedCity] = useState("");
  const [translatedCountry, setTranslatedCountry] = useState("");

  const [form, setForm] = useState({
    address: "",
    street: "",
    zone: "",
    area: "",
    city: "",
    country: ""
  });

  const [translatedMaster, setTranslatedMaster] = useState({
    street: [],
    zone: [],
    area: [],
    city: [],
    country: []
  });

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

  useEffect(() => {
    const translateMasters = async () => {
      if (i18n.language !== "ar") {
        setTranslatedMaster(masterData);
        return;
      }

      const mapList = async (list) =>
        Promise.all(list.map(item => translateText(item)));

      setTranslatedMaster({
        street: await mapList(masterData.street || []),
        zone: await mapList(masterData.zone || []),
        area: await mapList(masterData.area || []),
        city: await mapList(masterData.city || []),
        country: await mapList(masterData.country || [])
      });
    };

    translateMasters();
  }, [masterData, i18n.language]);

  useEffect(() => {
    const translateAddress = async () => {
      if (i18n.language !== "ar") {
        setTranslatedAddress(form.address);
        return;
      }

      if (form.address) {
        const result = await translateText(form.address);
        setTranslatedAddress(result);
      }
    };

    translateAddress();
  }, [form.address, i18n.language]);

  useEffect(() => {
    const translateFormValues = async () => {
      if (i18n.language !== "ar") {
        setTranslatedCity(form.city);
        setTranslatedCountry(form.country);
        return;
      }

      if (form.city) {
        const city = await translateText(form.city);
        setTranslatedCity(city);
      }

      if (form.country) {
        const country = await translateText(form.country);
        setTranslatedCountry(country);
      }
    };

    translateFormValues();
  }, [form.city, form.country, i18n.language]);
  
  const ro = (!isAdmin && !editMode)
    ? { readOnly: true, disabled: true } : {};

  useEffect(() => {
    const userId = id || localStorage.getItem("linked_id");
    if (!role || !userId) return;
    const loadAddress = async () => {
      try {
        const res = await fetch(
          `${API_PROFILE}/${role}/address/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${
                isAdmin
                  ? localStorage.getItem("admin_token")
                  : localStorage.getItem("token")
              }`
            }
          }
        );
        if (!res.ok) return;
        const json = await res.json();

        setForm({
          address: json.address ?? "",
          street: json.street ?? "",
          zone: json.zone ?? "",
          area: json.area ?? "",
          city: json.city ?? "",
          country: json.country ?? ""
        });
      } catch (err) {
        console.error("Address fetch error:", err);
      }
    };
    loadAddress();
  }, [role, id, isAdmin]);

  const validate = () => {
    let err = {};

    if (!form.address) {
      alert(t("validation.required"));
      return;
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleChangeLocal = (field) => (e) => {
    dirtyRef.current.address = true;

    const value = e.target.value;
    setForm((prev) => {
      let updated = { ...prev, [field]: value };

      // if (field === "area") {
      //   updated.city = "Banglore";
      //   updated.country = "India";
      // }
      if (field === "area") {
        const selectedIndex = masterData.area.indexOf(value);

        updated.city = masterData.city[selectedIndex] || "";
        updated.country = masterData.country[selectedIndex] || "";
      }
      return updated;
    });
  };

  const handleSave = async () => {

    if (!isAdmin && !editMode) {
      navigate(`/profile/${role}/${id}/bank`);
      return;
    }

    if (!isAdmin && editMode) {
      if (!dirtyRef.current.address) {
        // alert("No changes detected in Address");
        alert(t("alerts.no_changes_address"));
        navigate(`/profile/${role}/${id}/bank`);
        return;
      }
    }

    if (!validate()) return;

    if (Object.values(form).every(v => !v)) {
      // alert("No data to save ❌");
      alert(t("alerts.no_data"));
      return;
    }

    try {
      setLoading(true);
      const success = await submitData("address", form);
      // alert(isAdmin ? "Saved ✅" : "Sent for approval ✅");
      alert(isAdmin ? t("alerts.saved") : t("alerts.sent_for_approval"));
      setLoading(false);

      if (!isAdmin) setEditMode(false);

      if (success) {
        navigate(`/profile/${role}/${id}/bank`); }
    } catch (err) {
      console.error("Save error:", err);
      // alert("Update failed ❌");
      alert(t("alerts.update_failed"));
    }
  };
  
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

  useEffect(() => {
    const fetchMaster = async (category) => {
      try {
        const res = await fetch(
          `${API_PROFILE}/master/${category}`,
          {
            headers: {
              Authorization: `Bearer ${
                isAdmin
                  ? localStorage.getItem("admin_token")
                  : localStorage.getItem("token")
              }`
            }
          }
        );
        const json = await res.json();
        return Array.isArray(json?.data) ? json.data : [];
      } catch (err) {
        console.error(`Master ${category} error:`, err);
        return [];
      }
    };

    const loadMasters = async () => {
      const [street, zone, area, city, country] = await Promise.all([
        fetchMaster("street"),
        fetchMaster("zone"),
        fetchMaster("area"),
        fetchMaster("city"),
        fetchMaster("country")
      ]);

      setMasterData((prev) => ({
        ...prev,
        street,
        zone,
        area,
        city,
        country
      }));
    };
    loadMasters();
  }, [setMasterData, isAdmin]);

  return (
    <div className="profile-card">
      <h3 className="profile-title">{t("address.title")}</h3>

      {!isAdmin && !editMode && (
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setEditMode(true)}
        >
          {t("buttons.edit")} ✏️
        </button>
      )}

      <form className="profile-form">

        <div className="form-row three-col">

          <div className="form-group">
            {/* <label>Address</label> */}
            <label>{t("address.address")}</label>
            <input
              // value={form.address || ""}
              value={i18n.language === "ar" ? translatedAddress : form.address}
              onChange={handleChangeLocal("address")}
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>{t("address.street")}</label>
            <select
              value={form.street || ""}
              onChange={handleChangeLocal("street")}
              {...ro}
            >
              {/* <option value="">-- Select --</option> */}
              <option value="">-- {t("address.select")} --</option>
              {/* {(masterData?.street || []).map((s, i) => (
                <option key={i} value={s}> {s} </option>
              ))} */}
              {(i18n.language === "ar"
                ? translatedMaster.street
                : masterData.street
              ).map((s, i) => (
                <option key={i} value={masterData.street[i]}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{t("address.zone")}</label>
            <select
              value={form.zone || ""}
              onChange={handleChangeLocal("zone")}
              {...ro}
            >
              <option value="">-- {t("address.select")} --</option>
              {/* {(masterData?.zone || []).map((z, i) => (
                <option key={i} value={z}> {z} </option>
              ))} */}
              {(i18n.language === "ar"
                ? translatedMaster.zone
                : masterData.zone
              ).map((s, i) => (
                <option key={i} value={masterData.zone[i]}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row three-col">

          <div className="form-group">
            <label>{t("address.area")}</label>
            <select
              value={form.area || ""}
              onChange={handleChangeLocal("area")}
              {...ro}
            >
              <option value="">-- {t("address.select")} --</option>
              {/* {(masterData?.area || []).map((a, i) => (
                <option key={i} value={a}> {a} </option>
              ))} */}
              {(i18n.language === "ar"
                ? translatedMaster.area
                : masterData.area
              ).map((s, i) => (
                <option key={i} value={masterData.area[i]}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{t("address.city")}</label>
            <input
              className="readonly-field"
              // value={form.city || ""}
              value={i18n.language === "ar" ? translatedCity : form.city}
              onChange={handleChangeLocal("city")}
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>{t("address.country")}</label>
            <input
              className="readonly-field"
              // value={form.country || ""}
              value={i18n.language === "ar" ? translatedCountry : form.country}
              onChange={handleChangeLocal("country")}
              {...ro}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button" className="btn-primary"
            onClick={handleSave}
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
}