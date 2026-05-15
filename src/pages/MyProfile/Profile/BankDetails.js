import React, { useEffect, useState, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const API_PROFILE = "http://192.168.2.9:5000/api/profile";

export default function BankDetails() {

  const { role, id, adminMode = false } = useOutletContext();
  const isAdmin = adminMode || localStorage.getItem("admin_token");
  const navigate = useNavigate();
  const dirtyRef = useRef({});
  const { t, i18n } = useTranslation();

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

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [translatedBank, setTranslatedBank] = useState("");
  const [translatedHolder, setTranslatedHolder] = useState("");
  const [translatedBranch, setTranslatedBranch] = useState("");

  const ro = (!isAdmin && !editMode)
    ? { readOnly: true, disabled: true } : {};

  const [form, setForm] = useState({
    bankName: "",
    accountHolder: "",
    iban: "",
    swiftCode: "",
    branch: "",
  });

  useEffect(() => {
    const translateBankData = async () => {
      if (i18n.language !== "ar") {
        setTranslatedBank(form.bankName);
        setTranslatedHolder(form.accountHolder);
        setTranslatedBranch(form.branch);
        return;
      }

      if (form.bankName) {
        setTranslatedBank(await translateText(form.bankName));
      }
      if (form.accountHolder) {
        setTranslatedHolder(await translateText(form.accountHolder));
      }
      if (form.branch) {
        setTranslatedBranch(await translateText(form.branch));
      }
    };

    translateBankData();
  }, [form, i18n.language]);

  const markDirty = () => {
    dirtyRef.current.bank = true;
  };

  const handleChange = (field) => (e) => {
    markDirty();

    const value = e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
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

  const validate = () => {
    let err = {};

    if (!form.bankName) {
      alert(t("validation.required"));
      return;
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = async () => {

    if (!isAdmin && !editMode) {
      navigate(`/profile/${role}/${id}/documents`);
      return;
    }

    if (!isAdmin && editMode) {
      if (!dirtyRef.current.bank) {
        // alert("No changes detected in Bank Details");
        alert(t("alerts.no_changes_bank"));
        navigate(`/profile/${role}/${id}/documents`);
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
      const success = await submitData("bank", form);
      // alert(isAdmin ? "Saved ✅" : "Sent for approval ✅");
      alert(isAdmin ? t("alerts.saved") : t("alerts.approval"));
      setLoading(false);

      if (!isAdmin) setEditMode(false);

      if (success) {
        navigate(`/profile/${role}/${id}/documents`); }
    } catch (err) {
      console.error(err);
      // alert("Save failed ❌");
      alert(t("alerts.update_failed"));
    }
  };

  useEffect(() => {
    if (!role || !id) return;

    const token = isAdmin
      ? localStorage.getItem("admin_token")
      : localStorage.getItem("token");

    fetch(`${API_PROFILE}/${role}/bank/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.status || !json.data) return;

        setForm({
          bankName: json.data.bank_name || "",
          accountHolder: json.data.account_holder_name || "",
          iban: json.data.iban || "",
          swiftCode: json.data.swift_code || "",
          branch: json.data.branch || "",
        });
      })
      .catch((err) => console.error("Bank fetch error:", err));

  }, [role, id, isAdmin]);

  return (
    <div className="profile-card">
      <h3 className="profile-title">{t("profilebank.title")}</h3>

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
            {/* <label>Bank Name</label> */}
            <label>{t("profilebank.bank_name")}</label>
            <input
              // value={form.bankName}
              value={i18n.language === "ar" ? translatedBank : form.bankName}
              // placeholder="e.g. HDFC Bank"
              placeholder={t("profilebank.bank_name_placeholder")}
              onChange={handleChange("bankName")}
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>{t("profilebank.account_holder")}</label>
            <input
              // value={form.accountHolder}
              value={i18n.language === "ar" ? translatedHolder : form.accountHolder}
              // placeholder="Name as per bank records"
              placeholder={t("profilebank.account_holder_placeholder")}
              onChange={handleChange("accountHolder")}
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>{t("profilebank.branch")}</label>
            <input
              // value={form.branch}
              value={i18n.language === "ar" ? translatedBranch : form.branch}
              // placeholder="Branch name"
              placeholder={t("profilebank.branch_placeholder")}
              onChange={handleChange("branch")}
              {...ro}
            />
          </div>
        </div>

        <div className="form-row three-col">

          <div className="form-group">
            <label>{t("profilebank.iban")}</label>
            <input
              value={form.iban}
              // placeholder="Country code + number"
              placeholder={t("profilebank.iban_placeholder")}
              onChange={(e) => {
                const v = e.target.value.replace(/\s/g, "").toUpperCase();

                handleChange("iban")({
                  target: { value: v }
                });
              }}
              maxLength={34}
              {...ro}
            />
            <small className="hint">{t("profilebank.iban_hint")}</small>
          </div>

          <div className="form-group">
            <label>{t("profilebank.swift")}</label>
            <input
              value={form.swiftCode}
              // placeholder="8 or 11 characters"
              placeholder={t("profilebank.swift_placeholder")}
              onChange={(e) => {
                const v = e.target.value
                  .replace(/[^A-Za-z0-9]/g, "")
                  .toUpperCase();

                handleChange("swiftCode")({
                  target: { value: v }
                });
              }}
              maxLength={11}
              {...ro}
            />
            <small className="hint">{t("profilebank.swift_hint")}</small>
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