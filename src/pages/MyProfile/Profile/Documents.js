import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";

const API_PROFILE = "http://192.168.2.22:5000/api/profile";

const getDocFields = (role) => {
  const r = role?.toLowerCase();

  const common = [
    { key: "crCopy", label: "documents.cr_copy" },
    { key: "compCardCopy", label: "documents.comp_card" },
    { key: "tradeLicenseCopy", label: "documents.trade_license" },
    { key: "vatCertificate", label: "documents.vat_certificate" },
    { key: "companyLogo", label: "documents.company_logo" },
  ];

  if (r === "supplier") {
    return [
      ...common,
      { key: "bankLetter", label: "documents.bank_letter" },
      { key: "certificates", label: "documents.certificates" },
    ];
  }

  if (r === "restaurant") {
    return [
      ...common,
      { key: "foodSafetyCertificate", label: "documents.food_safety" },
    ];
  }
  return common;
};

const Documents = () => {

  const {
    form, setForm,
    role: ctxRole,
    id: ctxId,
    adminMode = false,
    serverFilePreview,
    setServerFilePreview,
    localFilePreview,
    setLocalFilePreview,
    fileNames,
    setFileNames
  } = useOutletContext();

  const { t, i18n } = useTranslation();

  const isAdmin = adminMode || localStorage.getItem("admin_token");
  const finalRole = ctxRole || localStorage.getItem("role");
  const finalId = ctxId || localStorage.getItem("linked_id");

  const docFields = getDocFields(finalRole);
  const navigate = useNavigate();
  const dirtyRef = useRef({});

  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [translatedFileNames, setTranslatedFileNames] = useState({});
  const cacheRef = useRef({});
  
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
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
    const translateFiles = async () => {

      if (i18n.language !== "ar") {
        setTranslatedFileNames(fileNames);
        return;
      }

      const result = {};

      const extMap = {
        jpg: "صورة",
        jpeg: "صورة",
        png: "صورة",
        webp: "صورة",
        pdf: "ملف PDF"
      };

      for (const key in fileNames) {
        const name = fileNames[key];
        if (!name) continue;

        const ext = name.split(".").pop().toLowerCase();
        const base = name.replace(`.${ext}`, "");

        const cleanBase = base.replace(/[0-9]/g, "");

        // const translatedBase = await translateText(cleanBase);

        let translatedBase;

        if (cacheRef.current[cleanBase]) {
          // ✅ already translated
          translatedBase = cacheRef.current[cleanBase];
        } else {
          // ✅ first time → API call
          translatedBase = await translateText(cleanBase);

          // ✅ store in cache
          cacheRef.current[cleanBase] = translatedBase;
        }

        const translatedExt = extMap[ext] || ext;

        result[key] = `${translatedBase} (${translatedExt})`;
      }

      setTranslatedFileNames(result);
    };

    translateFiles();
  }, [fileNames, i18n.language]);

  const handleFileChange = (key) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    dirtyRef.current.documents = true;

    setForm((f) => ({
      ...f,
      files: {
        ...(f.files || {}),
        [key]: file
      }
    }));

    setFileNames((n) => ({
      ...n,
      [key]: file.name
    }));

    const preview = URL.createObjectURL(file);
    setLocalFilePreview((p) => ({
      ...p,
      [key]: preview
    }));
  };

  useEffect(() => {
    const role = finalRole || localStorage.getItem("role");
    const id = finalId || localStorage.getItem("linked_id");

    const fetchFiles = async () => {
      try {
        const res = await fetch(
          `${API_PROFILE}/${role}/files/${id}`,
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

        if (json.status && json.files) {
          const f = json.files;

          const previews = {};
          const names = {}; 

          console.log("FILES API:", json.files);

          Object.keys(f).forEach((key) => {

            let file = f[key];

            if (!file) {
              previews[key] = "";
              names[key] = "";
              return;
            }

            try {
              if (typeof file === "string") {
                file = JSON.parse(file);
              }

              previews[key] = file?.preview || "";

              names[key] =
                file?.filename ||
                file?.name ||
                `${key}.file`;

            } catch (e) {
              console.error("File parse error:", e);
              previews[key] = "";
              names[key] = "";
            }
          });

          setServerFilePreview(previews);
          setFileNames(names);
        }
      } catch (err) {
        console.error("Fetch files error:", err);
      }
    };

    if (role && id) {
      fetchFiles();
    }
  }, [finalRole, finalId, setServerFilePreview, setFileNames, isAdmin]);

  const handleSave = async () => {

    if (!isAdmin && !editMode) {
      navigate(`/profile/${finalRole}/${finalId}/branches`);
      return;
    }

    if (!isAdmin && editMode) {
      if (!dirtyRef.current.documents) {
        // alert("No changes detected in Documents");
        alert(t("alerts.no_changes_documents"));
        navigate(`/profile/${finalRole}/${finalId}/branches`);
        return;
      }
    }

    try {
      const token = isAdmin
        ? localStorage.getItem("admin_token")
        : localStorage.getItem("token");

      const filesPayload = {};
      for (const key of docFields.map(d => d.key)) {
        if (form.files?.[key]) {
          filesPayload[key] = {
            data: await toBase64(form.files[key]),
            filename: form.files[key].name
          };
        } else if (serverFilePreview[key]) {
          filesPayload[key] = {
            data: serverFilePreview[key], 
            filename: fileNames[key]      
          };
        }
      }

      if (Object.keys(filesPayload).length === 0) {
        // alert("No files selected ❌");
        alert(t("alerts.no_files"));
        return;
      }

      const url = isAdmin
        ? `${API_PROFILE}/${finalRole}/update/files/${finalId}`
        : `${API_PROFILE}/request-change-${finalRole}`;

      const payload = isAdmin
        ? filesPayload
        : {
            role: finalRole,
            entity_id: finalId,
            section: "files",
            new_data: filesPayload
          };

      setLoading(true);
      const res = await fetch(url, {
        method: isAdmin ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      setLoading(false);

      const json = await res.json();

      if (!json.status) {
        // alert("Save failed ❌");
        alert(t("alerts.save_failed"));
        return;
      }
      // alert(isAdmin ? "Saved ✅" : "Sent for approval ✅");
      alert(isAdmin ? t("alerts.saved") : t("alerts.sent_for_approval"));

      if (!isAdmin) setEditMode(false);

      goNext();
    } catch (err) {
      console.error("SAVE ERROR:", err);
      // alert("Error saving files ❌");
      alert(t("alerts.error_saving"));
    }
  };

  const goNext = () => {
    navigate(`/profile/${finalRole}/${finalId}/branches`);
  };

  const goBack = () => {
    navigate(`/profile/${finalRole}/${finalId}/bank`);
  };

  return (
    <div className="profile-card">

      {/* <h3 className="profile-title">Attachments</h3> */}
      <h3 className="profile-title">{t("documents.title")}</h3>
      
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
        <div className="doc-grid">
          {docFields.map((doc) => {
            const rawPreview =
              localFilePreview[doc.key] ||
              serverFilePreview[doc.key];

            const previewSrc = rawPreview || "";

            return (

              <div className="doc-card" key={doc.key}>
                <label className="doc-label">{t(doc.label)}</label>
                <div className="doc-upload-box">

                  {previewSrc && previewSrc !== "null" ? (
                    typeof previewSrc === "string" &&
                    previewSrc.startsWith("data:application/pdf") ? (
                      <iframe
                        src={previewSrc}
                        title="pdf-preview"
                        className="pdf-preview"
                      />
                    ) : (
                      <img
                        src={previewSrc}
                        alt={doc.label}
                        className="doc-preview"
                      />
                    )
                  ) : (
                    <div className="doc-placeholder">
                      <i className="fa-solid fa-file-arrow-up" />
                      <span>{t("documents.upload_file")}</span>
                    </div>
                  )}
                </div> 

                {/* <input
                  type="file"
                  accept="image/*,.pdf"
                  disabled={!isAdmin && !editMode}
                  onChange={handleFileChange(doc.key)}
                  className="doc-input hidden"
                /> */}

                <label className="upload-btn">
                  {t("documents.choose_file")}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    disabled={!isAdmin && !editMode}
                    onChange={handleFileChange(doc.key)}
                    hidden
                  />
                </label>

                <p className="doc-filename">
                  {fileNames[doc.key] && fileNames[doc.key] !== "null"
                    // ? fileNames[doc.key]
                    ? translatedFileNames[doc.key] || fileNames[doc.key]
                    : serverFilePreview[doc.key]
                    // ? "Uploaded file"
                    ? t("documents.uploaded_file")
                    // : "No file selected"}
                    : t("documents.no_file") }
                </p>
              </div>
            );
          })}
        </div>

        <div className="form-actions space-between">

          <button
            type="button"
            className="btn-secondary btn"
            onClick={goBack}
          >
            {i18n.language === "ar"
              ? `${t("buttons.back")} →`
              : `← ${t("buttons.back")}`}
          </button>

          <button
            type="button"
            className="btn-primary"
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
};

export default Documents;