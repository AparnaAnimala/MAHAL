import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const calculateStepCompletion = (data, step) => {
  if (!data) return 0;

  const fieldsMap = {
    basic: ["fullName", "email", "phone"],
    company: ["cr_number", "signing_authority_name", "sponsor_name"],
    address: ["address", "city", "country"],
    bank: ["bank_name", "iban"],
    branch: ["branchNameEn", "branchManager"],
    store: ["storeNameEnglish", "contactPersonName"]
  };

  const fields = fieldsMap[step] || [];
  const filled = fields.filter((f) => data[f]);

  return fields.length
    ? Math.round((filled.length / fields.length) * 100)
    : 0;
};

const translateText = async (text, targetLang = "ar") => {
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    );

    const data = await res.json();
    return data[0][0][0];
  } catch (err) {
    console.error("Translation error", err);
    return text;
  }
};

const getLinks = (role, t) => {
  const r = role?.toLowerCase();
  const isSupplier = r === "supplier";

  return [
    { path: "", label: t("sidebar.overview"), icon: "fa-chart-pie" },
    { path: "basic", label: t("sidebar.basic_info"), icon: "fa-user" },
    {
      path: "company",
      label: isSupplier
        ? t("sidebar.supplier_info")
        : t("sidebar.restaurant_info"),
      icon: "fa-building"
    },
    { path: "address", label: t("sidebar.address"), icon: "fa-location-dot" },
    { path: "bank", label: t("sidebar.bank"), icon: "fa-building-columns" },
    { path: "documents", label: t("sidebar.documents"), icon: "fa-file-lines" },
    {
      path: "branches",
      label: isSupplier 
        ? t("sidebar.supplier_branch")
        : t("sidebar.restaurant_branch"),
      icon: "fa-code-branch"
    },
    {
      path: "store",
      label: isSupplier 
        ? t("sidebar.supplier_store")
        : t("sidebar.restaurant_store"),
      icon: "fa-store"
    },
    { path: "settings", label: t("sidebar.settings"), icon: "fa-gear" },
  ];
};

const ProfileSidebar = ({ role: propRole, id: propId, adminMode }) => {
  const navigate = useNavigate();

  const id =
    propId ||
    localStorage.getItem("linked_id") ||
    localStorage.getItem("entityId");

  const { i18n } = useTranslation();

  const role = (propRole || localStorage.getItem("role") || "restaurant").toLowerCase();
  const isSupplier = role === "supplier";
  // const links = getLinks(role);
  const { t } = useTranslation();
  const links = getLinks(role, t);
  
  const [showModal, setShowModal] = useState(false);

  const DEFAULT_IMG = "https://i.pravatar.cc/150?img=12";
  const [profilePic, setProfilePic] = useState(DEFAULT_IMG);

  const [profileName, setProfileName] = useState("Restaurant");
  const [profileId, setProfileId] = useState("ID-0001");
  const [completion, setCompletion] = useState(0);
  const [approvalStatus, setApprovalStatus] = useState("Pending");
  const [translatedName, setTranslatedName] = useState("");
  const [translatedStatus, setTranslatedStatus] = useState("");

  useEffect(() => {
    if (i18n.language === "ar" && profileName) {
      translateText(profileName).then(setTranslatedName);
    } else {
      setTranslatedName(profileName);
    }
  }, [i18n.language, profileName]);

  useEffect(() => {
    if (!approvalStatus) return;

    if (i18n.language === "ar" && approvalStatus) {
      translateText(approvalStatus).then(setTranslatedStatus);
    } else {
      setTranslatedStatus(approvalStatus);
    }
  }, [approvalStatus, i18n.language]);

  const STATUS_MAP = {
    Pending: { en: "Pending", ar: "قيد الانتظار" },
    Assigned: { en: "Assigned", ar: "تم التعيين" },
    "Profile Completed": { en: "Profile Completed", ar: "تم إكمال الملف الشخصي" },
    "Under Review": { en: "Under Review", ar: "قيد المراجعة" },
    Approved: { en: "Approved", ar: "تمت الموافقة" },
    Rejected: { en: "Rejected", ar: "مرفوض" },
    Resubmit: { en: "Resubmit", ar: "إعادة الإرسال" }
  };
  
  const getStatusLabel = (status, lang) => {
    if (!status) return "-";
    return STATUS_MAP[status]?.[lang] || status;
  };

  useEffect(() => {
    if (!approvalStatus) return;

    const normalized =
      Object.keys(STATUS_MAP).find(
        (key) => key.toLowerCase() === approvalStatus.toLowerCase()
      ) || approvalStatus;

    if (i18n.language === "ar") {
      setTranslatedStatus(STATUS_MAP[normalized]?.ar || approvalStatus);
    } else {
      setTranslatedStatus(STATUS_MAP[normalized]?.en || approvalStatus);
    }
  }, [approvalStatus, i18n.language]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/profile/${role}/profile-summary/${id}`,
          {
            headers: {
              Authorization: `Bearer ${
                adminMode
                  ? localStorage.getItem("admin_token")
                  : localStorage.getItem("token")
              }`
            }
          }
        );

        if (!res.ok) {
          console.error("API failed:", res.status);
          return;
        }

        const json = await res.json();

        if (json.status) {
          setProfileName(
            `${json.data.companyName} (${isSupplier ? "Supplier" : "Restaurant"})`
          );
          // setProfilePic(json.data.profileImage || DEFAULT_IMG);
          const image = json.data.profileImage;

          if (image?.preview) {
            setProfilePic(image.preview);
          } else {
            setProfilePic(DEFAULT_IMG);
          }

          setProfileId(id);
          setApprovalStatus(json.data.approval_status || "Pending");
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    if (id) fetchProfile();
  }, [role, id, isSupplier]);
  
  useEffect(() => {
    const loadAll = async () => {
      const BASE = "http://localhost:5000/api/profile";

      const [basic, org, addr, bank, branch, store] = await Promise.all([
        fetch(`${BASE}/${role}/basic/${id}`).then(r => r.json()),
        fetch(`${BASE}/${role}/org/${id}`).then(r => r.json()),
        fetch(`${BASE}/${role}/address/${id}`).then(r => r.json()),
        fetch(`${BASE}/${role}/bank/${id}`).then(r => r.json()),
        fetch(`${BASE}/${role}/branch/${id}`).then(r => r.json()),
        fetch(`${BASE}/${role}/store/${id}`).then(r => r.json()),
      ]);

      const basicProgress = calculateStepCompletion(basic, "basic");

      const companyData = org?.data || org || {};
      const bankData = bank?.data || bank || {};
      const storeData = store?.data || store || {};

      const companyProgress = calculateStepCompletion(companyData, "company");
      const addressProgress = calculateStepCompletion(addr, "address");
      const bankProgress = calculateStepCompletion(bankData, "bank");

      const branchProgress = branch.branches?.length > 0 ? 100 : 0;
      const storeProgress = storeData?.store_name_english ? 100 : 0;

      const percent = Math.round(
        (basicProgress +
          companyProgress +
          addressProgress +
          bankProgress +
          branchProgress +
          storeProgress) / 6
      );

      setCompletion(percent);
    };

    if (id) loadAll();
  }, [role, id]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp", "application/pdf"];

    if (!allowed.includes(file.type)) {
      alert("Only JPG, PNG, WEBP, PDF allowed");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64 = reader.result;
      setProfilePic(base64);

      try {
        const res = await fetch(
          `http://localhost:5000/api/profile/${role}/profile-image/${id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64 })
          }
        );

        const json = await res.json();

        if (json.status) {
          alert("✅ Profile image updated");
          setShowModal(false);
        } else {
          alert("❌ Upload failed");
        }
      } catch (err) {
        console.error(err);
        alert("❌ Server error");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <style>
        {`
          .role-badge {
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }

          .role-badge.verified {
            background: #d4edda;
            color: #155724;
          }

          .role-badge.pending {
            background: #fff3cd;
            color: #856404;
          }

          .role-badge.rejected {
            background: #f8d7da;
            color: #721c24;
          }
        `}
      </style>

      <aside className="profile-sidebar">

        <button
          className="back-btn"
          onClick={() => {
            if (adminMode) {
              navigate("/admin/dashboard");
              return;
            }

            const role = (propRole || localStorage.getItem("role") || "").toLowerCase();

            if (role === "supplier") {
              navigate("/Dashboard");
            } else {
              navigate("/restaurantdashboard");
            }
          }}
        >
          <i className="fa-solid fa-arrow-left" />
          {t("sidebar.back_to_dashboard")}
        </button>

        <div className="profile-header">
          <div
            className="profile-pic-wrapper"
            onClick={() => setShowModal(true)}
          >
            <img src={profilePic} alt="Restaurant" className="profile-pic" />
            <span className="edit-overlay">
              <i className="fa-solid fa-camera" />
            </span>
          </div>

          {/* <h4 className="profile-name">{profileName}</h4> */}
          <h4 className="profile-name">{i18n.language === "ar" ? translatedName : profileName}</h4>
          <p className="profile-id">
            {isSupplier ? t("sidebar.supplier") : t("sidebar.restaurant")} • ID: {profileId || "—"}
          </p>

          <span
            className={`role-badge ${
              approvalStatus?.toLowerCase() === "approved"
                ? "verified"
                : approvalStatus?.toLowerCase() === "rejected"
                ? "rejected"
                : "pending"
            }`}
          >
            {/* {approvalStatus} */}
            {i18n.language === "ar" ? translatedStatus : approvalStatus}
            {/* {getStatusLabel(approvalStatus, i18n.language)} */}
            {/* {translatedStatus} */}
          </span>

          <div className="progress-wrapper">
            <div className="progress-label">
              {completion}% {t("sidebar.complete")}
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {links.map((l) => (
            <NavLink
              key={l.label}
              to={l.path}
              end
              className={({ isActive }) =>
                isActive ? "side-link active" : "side-link"
              }
            >
              <i className={`fa-solid ${l.icon}`} />
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {showModal && (
        <div className="modal-backdrop">
          <div className="upload-modal">
            <h4>Update Profile Picture</h4>

            <label className="upload-box">
              <i className="fa-solid fa-cloud-arrow-up" />
              <span>Click to upload</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>

            <button
              className="cancel-btn"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileSidebar;