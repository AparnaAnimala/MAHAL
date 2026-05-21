import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

const API = "http://192.168.2.22:5000/api/profile";
const API_PROFILE = "http://192.168.2.22:5000/api/profile";

const RestaurantStore = () => {

  const navigate = useNavigate();
  const { role: ctxRole, id: ctxId, adminMode = false } = useOutletContext();
  const { branchList = [] } = useOutletContext();
  const { t, i18n } = useTranslation();

  const finalRole = ctxRole || localStorage.getItem("role");
  const finalId = ctxId || localStorage.getItem("linked_id");

  const isAdmin = adminMode || localStorage.getItem("admin_token");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [translatedBranches, setTranslatedBranches] = useState({});
  // const [translatedStore, setTranslatedStore] = useState({});

  const [translatedStore, setTranslatedStore] = useState({
    storeNameEnglish: "",
    contactPersonName: "",
    street: "",
    zone: "",
    city: "",
    building: "",
  });

  const ro = (!isAdmin && !editMode)
    ? { readOnly: true, disabled: true } : {};

  const dirtyRef = useRef({});

  const markDirty = (step) => {
    dirtyRef.current[step] = true;
  };

  const [branches, setBranches] = useState([]);

  const [store, setStore] = useState({
    branchName: "",
    storeNameEnglish: "",
    storeNameArabic: "",
    contactPersonName: "",
    contactPersonMobile: "",
    storeEmail: "",
    street: "",
    zone: "",
    city: "",
    country: "India",
    building: "",
    shopNo: "",
    operatingHours: "",
    storeType: "",
    deliveryPickupAvailability: "",
  });

  const validate = () => {
    let err = {};

    if (!store.branchName) {
      err.branchName = t("validation.required_field", {
        field: t("store.branch")
      });
    }

    if (!store.storeNameEnglish || !store.storeNameEnglish.trim()) {
      err.storeNameEnglish = t("validation.required_field", {
        field: t("store.name_en")
      });
    }

    if (!store.contactPersonName) {
      err.contactPersonName = t("validation.required");
    }

    if (!store.storeEmail) {
      // err.storeEmail = "Email required";
      err.storeEmail = t("validation.required_field", {
        field: t("store.email")
      });
    } else if (!/\S+@\S+\.\S+/.test(store.storeEmail)) {
      // err.storeEmail = "Invalid email";
      err.storeEmail = t("alerts.invalid_email");
    }

    if (!store.contactPersonMobile) {
      err.contactPersonMobile = "Required";
    } else if (!/^\d{10}$/.test(store.contactPersonMobile)) {
      // err.contactPersonMobile = "Must be 10 digits";
      err.contactPersonMobile = t("store.mobile_digits");
    }

    if (
      store.storeNameEnglish &&
      store.branchName &&
      store.storeNameEnglish.toLowerCase() === store.branchName.toLowerCase()
    ) {
      err.storeNameEnglish = "Store name should not match branch";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  useEffect(() => {
    const translateStore = async () => {
      if (i18n.language !== "ar") {
        setTranslatedStore(store);
        return;
      }

      const result = {
        ...store,
        storeNameEnglish: await translateToArabic(store.storeNameEnglish),
        contactPersonName: await translateToArabic(store.contactPersonName),
        street: await translateToArabic(store.street),
        zone: await translateToArabic(store.zone),
        city: await translateToArabic(store.city),
        building: await translateToArabic(store.building),
      };

      setTranslatedStore(result);
    };

    translateStore();
  }, [store, i18n.language]);

  useEffect(() => {
    const translateBranches = async () => {
      if (i18n.language !== "ar") {
        setTranslatedBranches({});
        return;
      }

      let map = {};

      for (let b of branches) {
        const name =
          typeof b === "string"
            ? b
            : b.branchNameEn ||
              b.branch_name ||
              b.branch_name_english ||
              "";

        if (name) {
          const ar = await translateToArabic(name);
          map[name] = ar;
        }
      }

      setTranslatedBranches(map);
    };

    translateBranches();
  }, [branches, i18n.language]);

  const storedBranches = JSON.parse(localStorage.getItem("branchList") || "[]");

  const finalBranchList =
    branchList !== undefined
      ? branchList
      : storedBranches;

  useEffect(() => {

    if (finalBranchList && finalBranchList.length > 0) {

      const normalized = finalBranchList.map(b => {
        if (typeof b === "string") {
          return { branchNameEn: b };
        }

        return {
          ...b,
          branchNameEn:
            b.branchNameEn ||
            b.branch_name_english ||  
            b.branchName || ""
        };
      });

      setBranches(normalized);

      return;
    }

    const loadBranches = async () => {
      try {
        const res = await axios.get(
          `${API}/${finalRole}/branch/list/${finalId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        if (res.data.status) {
          const normalized = (res.data.branches || []).map(b =>
            typeof b === "string"
              ? { branchNameEn: b }
              : b
          );

          setBranches(normalized);
        }
      } catch (err) {
        console.error("Branch load failed", err);
      }
    };

    if (finalRole && finalId) {
      loadBranches();
    }

  }, [branchList, finalRole, finalId]);

  useEffect(() => {
    const loadStore = async () => {
      try {
        const res = await axios.get(
          `${API}/${finalRole}/store/${finalId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        if (res.data.status && res.data.data) {
          const data = res.data.data;
          let arabic = data.store_name_arabic;

          if (!arabic && data.store_name_english) {
            arabic = await translateToArabic(data.store_name_english);
          }

          let email = data.email;

          if (!email) {
            email = localStorage.getItem("email");
          }

          const mappedData = {
            store_id: data.store_id || null,
            branchName:
              data.branch_name ||
              data.branchName ||
              data.branch_name_english ||
              "",
            storeNameEnglish: data.store_name_english || "",
            storeNameArabic: arabic || "",
            contactPersonName: data.contact_person_name || "",
            contactPersonMobile: data.contact_person_mobile || "",
            storeEmail: email || "",
            street: data.street || "",
            zone: data.zone || "",
            city: data.city || "",
            country: data.country || "India",
            building: data.building || "",
            shopNo: data.shop_no || "",
            operatingHours: data.operating_hours || "",
            storeType: data.store_type || "",
            deliveryPickupAvailability: data.delivery_pickup_availability || "",
          };
          // setStore(mappedData);
          setStore(prev => ({
            ...prev,
            ...mappedData
          }));
        }
      } catch (err) {
        console.error("❌ Store fetch failed", err);
      }
    };
    if (finalRole && finalId) {
      loadStore();
    }
  }, [finalRole, finalId]);

  useEffect(() => {
    if (branches.length && store.branchName) {
      const exists = branches.find(
        b =>
          (b.branchNameEn || "").toLowerCase() ===
          store.branchName.toLowerCase()
      );

      if (!exists) {
        setStore(prev => ({ ...prev, branchName: "" }));
      }
    }
  }, [branches]);

  const submitData = async (section, data) => {

    const token = isAdmin
      ? localStorage.getItem("admin_token")
      : localStorage.getItem("token");

    let url, method, payload;

    if (isAdmin) {

      url = store.store_id
        ? `${API_PROFILE}/${finalRole}/store/${store.store_id}`
        : `${API_PROFILE}/${finalRole}/store`;

      method = store.store_id ? "PUT" : "POST";

      payload = {
        [`${finalRole}_id`]: finalId,
        store: data
      };

    } else {

      url = `${API_PROFILE}/request-change-${finalRole}`;
      method = "POST";

      let actions = [];

      if (!store.store_id) {
        actions.push({ action: "add", data: store });
      } else {
        actions.push({
          action: "update",
          store_id: store.store_id,
          data: store
        });
      }

      payload = {
        role: finalRole,
        entity_id: finalId,
        section,
        new_data: {
          stores: [
            store.store_id
              ? {
                  action: "update",
                  store_id: store.store_id,
                  data: store
                }
              : {
                  action: "add",
                  data: store
                }
          ]
        }
      };
    }

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    return json.status;
  };

  const handleStoreChange = (field) => (e) => {
    const value = e?.target?.value ?? e;
    markDirty("store");
    setStore((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const translateToArabic = async (text) => {
    try {
      const res = await fetch("http://192.168.2.22:5000/api/profile/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      const json = await res.json();
      return json.arabic || "";
    } catch {
      return "";
    }
  };

  const saveStore = async () => {
    if (!validate()) return;

    if (!isAdmin && !editMode) {
      navigate(`/profile/${finalRole}/${finalId}`);
      return;
    }

    if (!isAdmin && editMode) {
      if (!dirtyRef.current.store) {
        // alert("No changes detected in Store");
        alert(t("alerts.no_changes_store"));
        navigate(`/profile/${finalRole}/${finalId}`);
        return;
      }
    }

    if (Object.values(store).every(v => !v)) {
      // alert("No data to save ❌");
      alert(t("alerts.no_data"));
      return;
    }

    try {
      setLoading(true);
      const status = await submitData("store", store);
      // alert(isAdmin ? "Saved ✅" : "Sent for approval ✅");
      alert(isAdmin ? t("alerts.saved") : t("alerts.sent_for_approval"));

      if (!isAdmin) setEditMode(false);

      if (status) {
        navigate(`/profile/${finalRole}/${finalId}`);
      }
    } catch (e) {
      console.error(e);
      // alert("Error saving store ❌");
      alert(t("alerts.error_saving_store"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveStore();
  };

  if (branchList === undefined) {
    return <div>Loading branches...</div>;
  }

  return (
    <div className="profile-card">
      <h3 className="profile-title">
        {finalRole === "supplier"
          ? t("store.title_supplier")
          : t("store.title_restaurant")} </h3>

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

        <div className="form-row">

          <div className="form-group">
            <label>{t("store.branch")}</label>
            <select
              value={store.branchName || ""}
              onChange={handleStoreChange("branchName")}
              required
              // disabled={!isAdmin && !editMode} 
              {...ro}
            >
              {/* <option value="">Select branch</option> */}
              <option value="">{t("store.select_branch")}</option>

              {branches.map((b, i) => {
                const name =
                  typeof b === "string"
                    ? b
                    : b.branchNameEn ||
                      b.branch_name ||
                      b.branch_name_english ||
                      "";

                return (
                  <option key={i} value={name}>
                    {/* {name} */}
                    {i18n.language === "ar"
                      ? translatedBranches[name] || name
                      : name}
                  </option>
                );
              })}

            </select>
          </div>

          <div className="form-group">
            <label>{t("store.name_en")}</label>
            <input
              // value={store.storeNameEnglish}
              value={
                i18n.language === "ar"
                  ? translatedStore.storeNameEnglish || ""
                  : store.storeNameEnglish || ""
              }
              // placeholder="Store name"
              placeholder={t("store.store_placeholder")}
              onChange={async (e) => {
                const en = e.target.value;
                handleStoreChange("storeNameEnglish")(e);
                if (en.trim()) {
                  const ar = await translateToArabic(en);
                  handleStoreChange("storeNameArabic")({
                    target: { value: ar },
                  });
                } else {
                  handleStoreChange("storeNameArabic")({
                    target: { value: "" },
                  });
                }
              }}
              {...ro}
            />
            {errors.storeNameEnglish && (
              <small style={{ color: "red" }}>{errors.storeNameEnglish}</small>
            )}
          </div>

          <div className="form-group">
            <label>{t("store.name_ar")}</label>
            <input
              className="readonly-field"
              value={store.storeNameArabic || ""}
              dir="rtl"
              readOnly
              {...ro}
            />
          </div>
        </div>

        <div className="form-row">

          <div className="form-group">
            <label>{t("store.contact_name")}</label>
            <input
              // value={store.contactPersonName}
              value={
                i18n.language === "ar"
                  ? translatedStore.contactPersonName || ""
                  : store.contactPersonName || ""
              }
              onChange={handleStoreChange("contactPersonName")}
              required
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>{t("store.contact_mobile")}</label>
            <input
              value={store.contactPersonMobile || ""}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, "");
                handleStoreChange("contactPersonMobile")({
                  target: { value: cleaned }
                });
              }}
              required
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>{t("store.email")}</label>
            <input
              type="email"
              value={store.storeEmail || ""}
              onChange={handleStoreChange("storeEmail")}
              required
              {...ro}
            />
          </div>
        </div>

        <div className="form-row">

          <div className="form-group">
            <label>{t("store.street")}</label>
            <input
              // value={store.street}
              value={
                i18n.language === "ar"
                  ? translatedStore.street || ""
                  : store.street || ""
              }
              onChange={handleStoreChange("street")}
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>{t("store.zone")}</label>
            <input
              // value={store.zone}
              value={
                i18n.language === "ar"
                  ? translatedStore.zone || ""
                  : store.zone || ""
              }
              onChange={handleStoreChange("zone")}
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>{t("store.city")}</label>
            <input
              // value={store.city}
              value={
                i18n.language === "ar"
                  ? translatedStore.city || ""
                  : store.city || ""
              }
              onChange={handleStoreChange("city")}
              {...ro}
            />
          </div>
        </div>

        <div className="form-row">

          <div className="form-group">
            <label>{t("store.building")}</label>
            <input
              // value={store.building}
              value={
                i18n.language === "ar"
                  ? translatedStore.building || ""
                  : store.building || ""
              }
              onChange={handleStoreChange("building")}
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>{t("store.shop")}</label>
            <input
              value={store.shopNo || ""}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, "");
                handleStoreChange("shopNo")({
                  target: { value: cleaned }
                });
              }}
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>{t("store.hours")}</label>
            <input
              value={store.operatingHours || ""}
              onChange={handleStoreChange("operatingHours")}
              // placeholder="9:00 AM - 6:00 PM"
              placeholder={t("store.hours_placeholder")}
              {...ro}
            />
          </div>
        </div>
        
        <div className="form-row">

          {finalRole === "supplier" && (
            <div className="form-group">
              <label>{t("store.store_type")}</label>
              <select
                value={store.storeType || ""}
                onChange={handleStoreChange("storeType")}
                {...ro}
              >
                <option value="">--- {t("common.select")} ---</option>
                <option value="Retail">{t("store.retail")}</option>
                <option value="Warehouse">{t("store.warehouse")}</option>
              </select>
            </div>
          )}

          {finalRole === "supplier" && (
            <div className="form-group">
              <label>{t("store.delivery_pickup")}</label>
              <select
                value={store.deliveryPickupAvailability || ""}
                onChange={handleStoreChange("deliveryPickupAvailability")}
                {...ro}
              >
                <option value="">--- {t("common.select")} ---</option>
                <option value="Delivery">{t("store.delivery")}</option>
                <option value="Pickup">{t("store.pickup")}</option>
                <option value="Both">{t("store.both")}</option>
              </select>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary btn"
            onClick={() => navigate(`/profile/${finalRole}/${finalId}/branches`)}
          >
            {i18n.language === "ar"
              ? `→ ${t("buttons.back")}`
              : `← ${t("buttons.back")}`}
          </button>

          <button 
            type="submit" className="btn-primary" 
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
                : `${t("buttons.save_next")} →`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RestaurantStore;