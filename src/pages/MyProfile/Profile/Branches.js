import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";

const emptyBranch = {
  branchNameEn: "",
  branchNameAr: "",
  branchManager: "",
  contactNumber: "",
  email: "",
  street: "",
  zone: "",
  building: "",
  officeNo: "",
  city: "",
  country: "",
  branchLicense: "",
};

const API_PROFILE = "http://192.168.2.9:5000/api/profile";

const Branches = () => {

  const navigate = useNavigate();
  const { role: finalRole, id: finalId, adminMode = false } = useOutletContext();
  const { setBranchList } = useOutletContext();
  const isAdmin = adminMode || localStorage.getItem("admin_token");
  const { t, i18n } = useTranslation();
  
  const dirtyRef = useRef({});
  const markDirty = () => {
    dirtyRef.current.branch = true;
  };

  const [multiBranch, setMultiBranch] = useState("No");
  const [totalBranches, setTotalBranches] = useState(1);
  const [branchCount, setBranchCount] = useState(1);
  const [branches, setBranches] = useState([{ ...emptyBranch }]);
  const currentBranch = branches[branchCount - 1];

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [translatedBranches, setTranslatedBranches] = useState([]);

  const ro = (!isAdmin && !editMode)
    ? { readOnly: true, disabled: true } : {};

  const translateToArabic = async (text) => {
    try {
      const res = await fetch("http://192.168.2.9:5000/api/profile/translate", {
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

  useEffect(() => {
    const translateAll = async () => {
      if (i18n.language !== "ar") {
        setTranslatedBranches(branches);
        return;
      }

      const result = await Promise.all(
        branches.map(async (b) => ({
          ...b,
          branchNameEn: await translateToArabic(b.branchNameEn),
          branchManager: await translateToArabic(b.branchManager),
          city: await translateToArabic(b.city),
          country: await translateToArabic(b.country),
          street: await translateToArabic(b.street),
          zone: await translateToArabic(b.zone),
          building: await translateToArabic(b.building),
        }))
      );

      // setTranslatedBranches(result);
      setTranslatedBranches(result || []);
    };

    translateAll();
  }, [branches, i18n.language]);

  const updateBranchCount = (count) => {
    const safeCount = Math.max(1, count);

    setBranches(prev => {
      let updated = [...prev];

      if (updated.length > safeCount) {
        for (let i = safeCount; i < updated.length; i++) {
          if (updated[i].branch_id) {
            updated[i] = { ...updated[i], isDeleted: true };
          }
        }
      }

      while (updated.length < safeCount) {
        updated.push({ ...emptyBranch });
      }
      return updated.slice(0, safeCount);
    });

    setTotalBranches(safeCount);
    setBranchCount(1);
  };

  const handleBranchChange = (index, key, value) => {
    markDirty();
    setBranches((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const submitData = async (section, data) => {
    const token = isAdmin
      ? localStorage.getItem("admin_token")
      : localStorage.getItem("token");

    let url, method, payload;

    let actions = branches.map(b => {
      if (!b.branch_id) {
        return { action: "add", data: b };
      } else if (b.isDeleted) {
        return { action: "delete", branch_id: b.branch_id, data: b };
      } else {
        return { action: "update", data: b, branch_id: b.branch_id };
      }
    });

    if (isAdmin) {
      url = `${API_PROFILE}/${finalRole}/update/${section}/${finalId}`;
      method = "PUT";
      payload = data;
    } else {
      url = `${API_PROFILE}/request-change-${finalRole}`;
      method = "POST";

      payload = {
        role: finalRole,
        entity_id: finalId,
        section,
        new_data: {
          branches: actions
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

  useEffect(() => {
    if (!finalRole || !finalId) return;
    const fetchBranches = async () => {
      try {
        const res = await fetch(
          `http://192.168.2.9:5000/api/profile/${finalRole}/branch/${finalId}`,
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
        if (json.status && json.branches?.length) {

          const mapped = await Promise.all(
            json.branches.map(async (b) => {
              let arabic = b.branchNameAr;

              if (!arabic && b.branchNameEn) {
                arabic = await translateToArabic(b.branchNameEn);
              }

              return {
                branch_id: b.branch_id,
                branchNameEn: b.branchNameEn || "",
                branchNameAr: arabic || "",
                branchManager: b.branchManager || "",
                contactNumber: b.contactNumber || "",
                email: b.email || "",
                street: b.street || "",
                zone: b.zone || "",
                building: b.building || "",
                officeNo: b.officeNo || "",
                city: b.city || "",
                country: b.country || "India",
                branchLicense: b.branchLicense || "",
              };
            })
          );
          setBranches(mapped);
          setTotalBranches(mapped.length);
          setBranchCount(1);
          setMultiBranch(mapped.length > 1 ? "Yes" : "No");
        }
      } catch (err) {
        console.error("Branch fetch error:", err);
      }
    };
    fetchBranches();
  }, [finalRole, finalId, isAdmin]);

  const handleSaveNext = async (e) => {
    e.preventDefault();

    if (!isAdmin && !editMode) {

      if (branchCount < totalBranches) {
        setBranchCount(prev => prev + 1);
        return;
      }

      navigate(`/profile/${finalRole}/${finalId}/store`);
      return;
    }

    if (!isAdmin && editMode) {

      if (!dirtyRef.current.branch) {

        // alert("No changes detected in Branches ❌");
        alert(t("alerts.no_changes_branch"));

        if (branchCount < totalBranches) {
          setBranchCount(prev => prev + 1);
          return;
        }

        navigate(`/profile/${finalRole}/${finalId}/store`);
        return;
      }
    }

    // const current = branches[branchCount - 1];
    const currentBranch = branches[branchCount - 1] || emptyBranch;

    const requiredFields = [
      "branchNameEn", "branchManager", "contactNumber",
      "email", "street", "zone", "building",
      "officeNo", "city", "country"
    ];

    for (let field of requiredFields) {
      if (!current[field]) {
        // alert(`${field} is required ❌`);

        const fieldLabelMap = {
          branchNameEn: t("branch.branch_name_en"),
          branchManager: t("branch.manager"),
          contactNumber: t("branch.contact"),
          email: t("branch.email"),
          street: t("branch.street"),
          zone: t("branch.zone"),
          building: t("branch.building"),
          officeNo: t("branch.office"),
          city: t("branch.city"),
          country: t("branch.country"),
        };

        const label = fieldLabelMap[field] || field;
        alert(t("validation.required_field", { field: label }));
        return;
      }
    }

    if (branchCount < totalBranches) {
      setBranchCount(prev => prev + 1);
      return;
    }

    try {
      setLoading(true);

      const success = await submitData("branch", branches);

      // alert(isAdmin ? "Saved ✅" : "Sent for approval ✅");
      alert(isAdmin ? t("alerts.saved") : t("alerts.sent_for_approval"));

      setLoading(false);

      if (success) {
        dirtyRef.current.branch = false;
        const activeBranches = branches.filter(b => !b.isDeleted);

        localStorage.setItem("branchList", JSON.stringify(activeBranches));

        setBranchList(activeBranches);
        navigate(`/profile/${finalRole}/${finalId}/store`);
      }

    } catch (err) {
      setLoading(false);
      console.error(err);
      // alert("Save failed ❌");
      alert(t("alerts.save_failed"));
    }
  };

  const handleBranchBackStep = () => {
    if (branchCount > 1) {
      setBranchCount((c) => c - 1);
    }
  };

  return (
    <div className="profile-card">
      <h3 className="profile-title">
        {finalRole === "supplier"
          ? t("branch.title_supplier")
          : t("branch.title_restaurant")} </h3>

      {!isAdmin && !editMode && (
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setEditMode(true)}
        >
          {t("buttons.edit")} ✏️
        </button>
      )}

      <div className="form-row">
        <div className="form-group">
          {/* <label>Multiple Branches?</label> */}
          <label>{t("branch.multiple")}</label>

          <select
            value={multiBranch}
            onChange={(e) => {
              const val = e.target.value;
              setMultiBranch(val);

              if (val === "No") {
                updateBranchCount(1);
              }
            }}
            {...ro}
          >
            <option value="No">{t("common.no")}</option>
            <option value="Yes">{t("common.yes")}</option>
          </select>
        </div>

        {multiBranch === "Yes" && (
          <div className="form-group">
            <label>{t("branch.total")}</label>
            <input
              type="number"
              min="1"
              value={totalBranches}
              onChange={(e) =>
                updateBranchCount(parseInt(e.target.value, 10) || 1)
              }
              {...ro}
            />
          </div>
        )}
      </div>

      {/* <div className="branch-progress">
        Branch {branchCount} of {totalBranches}
      </div> */}

      <div className="branch-progress">
        {t("branch.branch_progress", {
          current: branchCount,
          total: totalBranches
        })}
      </div>

      <form className="profile-form" onSubmit={handleSaveNext}>

        <div className="form-row">

          <div className="form-group">
            {/* <label>Branch Name (EN)</label> */}
            <label>{t("branch.branch_name_en")}</label>
            <input
              // value={currentBranch.branchNameEn}
              value={
                i18n.language === "ar"
                  ? translatedBranches[branchCount - 1]?.branchNameEn || ""
                  : currentBranch.branchNameEn || ""
              }
              onChange={async (e) => {
                const val = e.target.value;
                handleBranchChange(branchCount - 1, "branchNameEn", val);
                if (val.trim()) {
                  const ar = await translateToArabic(val);
                  handleBranchChange(branchCount - 1, "branchNameAr", ar);
                }
              }}
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>{t("branch.branch_name_ar")}</label>
            <input
              className="readonly-field"
              value={currentBranch.branchNameAr || ""}
              dir="rtl"
              readOnly
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>{t("branch.manager")}</label>
            <input
              // value={currentBranch.branchManager}
              value={
                i18n.language === "ar"
                  ? translatedBranches[branchCount - 1]?.branchManager || ""
                  : currentBranch.branchManager || ""
              }
              onChange={(e) =>
                handleBranchChange(branchCount - 1, "branchManager", e.target.value)
              }
              {...ro}
            />
          </div>
        </div>

        <div className="form-row">

          <div className="form-group">
            <label>{t("branch.contact")}</label>
            <input
              value={currentBranch.contactNumber || ""}
              onChange={(e) =>
                handleBranchChange(branchCount - 1, "contactNumber", e.target.value)
              }
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>{t("branch.email")}</label>
            <input
              value={currentBranch.email || ""}
              onChange={(e) =>
                handleBranchChange(branchCount - 1, "email", e.target.value)
              }
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>{t("branch.street")}</label>
            <input
              // value={currentBranch.street}
              value={
                i18n.language === "ar"
                  ? translatedBranches[branchCount - 1]?.street || ""
                  : currentBranch.street || ""
              }
              onChange={(e) =>
                handleBranchChange(branchCount - 1, "street", e.target.value)
              }
              {...ro}
            />
          </div>
        </div>

        <div className="form-row">

          <div className="form-group">
            <label>{t("branch.zone")}</label>
            <input
              // value={currentBranch.zone}
              value={
                i18n.language === "ar"
                  ? translatedBranches[branchCount - 1]?.zone || ""
                  : currentBranch.zone || ""
              }
              onChange={(e) =>
                handleBranchChange(branchCount - 1, "zone", e.target.value)
              }
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>{t("branch.building")}</label>
            <input
              // value={currentBranch.building}
              value={
                i18n.language === "ar"
                  ? translatedBranches[branchCount - 1]?.building || ""
                  : currentBranch.building || ""
              }
              onChange={(e) =>
                handleBranchChange(branchCount - 1, "building", e.target.value)
              }
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>{t("branch.office")}</label>
            <input
              value={currentBranch.officeNo || ""}
              onChange={(e) =>
                handleBranchChange(branchCount - 1, "officeNo", e.target.value)
              }
              {...ro}
            />
          </div>
        </div>

        <div className="form-row">

          <div className="form-group">
            <label>{t("branch.city")}</label>
            <input
              // value={currentBranch.city}
              value={
                i18n.language === "ar"
                  ? translatedBranches[branchCount - 1]?.city || ""
                  : currentBranch.city || ""
              }
              onChange={(e) =>
                handleBranchChange(branchCount - 1, "city", e.target.value)
              }
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>{t("branch.country")}</label>
            <input
              // value={currentBranch.country}
              value={
                i18n.language === "ar"
                  ? translatedBranches[branchCount - 1]?.country || ""
                  : currentBranch.country || ""
              }
              onChange={(e) =>
                handleBranchChange(branchCount - 1, "country", e.target.value)
              }
              {...ro}
            />
          </div>

          {finalRole === "supplier" && (
            <div className="form-group">
              <label>{t("branch.license")}</label>
              <input
                value={currentBranch.branchLicense || ""}
                onChange={(e) =>
                  handleBranchChange(branchCount - 1, "branchLicense", e.target.value)
                }
                {...ro}
              />
            </div>
          )}
        </div>

        <div className="form-actions">

          {branchCount > 1 && (
            <button
              type="button"
              className="btn-secondary btn"
              onClick={handleBranchBackStep}
            >
              {t("buttons.previous")}
            </button>
          )}

          <button 
            // disabled={loading}
            type="submit" className="btn-primary">
            {loading
              ? t("buttons.saving")
              : !editMode
              ? i18n.language === "ar"
                ? `${t("buttons.next")} ←`
                : `${t("buttons.next")} →`
              : branchCount < totalBranches
              ? i18n.language === "ar"
                ? `${t("buttons.next_branch")} ←`
                : `${t("buttons.next_branch")} →`
              : i18n.language === "ar"
                ? `${t("buttons.finish")} ←`
                : `${t("buttons.finish")} →`}
          </button>

        </div>
      </form>
    </div>
  );
};

export default Branches;