import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

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

const Overview = () => {

  const navigate = useNavigate();
  const BASE = "/my-profile/Profile";

  const { id: ctxId, role: ctxRole, adminMode } = useOutletContext();

  const id = ctxId || localStorage.getItem("linked_id");
  const role = ctxRole || localStorage.getItem("role");
  const roleLower = role?.toLowerCase();

  const [basic, setBasic] = useState({});
  const [org, setOrg] = useState({});
  const [address, setAddress] = useState({});
  const [bank, setBank] = useState({});
  const [branches, setBranches] = useState([]);
  const [store, setStore] = useState({});
  const [approvalStatus, setApprovalStatus] = useState("Pending");

  const basicProgress = calculateStepCompletion(basic, "basic");
  const companyProgress = calculateStepCompletion(org, "company");
  const addressProgress = calculateStepCompletion(address, "address");
  const bankProgress = calculateStepCompletion(bank, "bank");
  const branchProgress = branches.length > 0 ? 100 : 0;
  const storeProgress = store.store_name_english ? 100 : 0;

  const totalProgress = Math.round(
    (basicProgress + companyProgress + addressProgress + bankProgress + branchProgress + storeProgress) / 6
  );

  const { i18n, t } = useTranslation();

  // const bankMap = {


  //   "Al Rajhi Bank": "مصرف الراجحي",
  //   "Saudi National Bank": "البنك الأهلي السعودي",
  //   "Riyad Bank": "بنك الرياض"
  // };

  // const translateWithFallback = async (text, map) => {
  //   if (!text) return "";



  //   // ✅ Step 1: Check map
  //   if (map && map[text]) return map[text];

  //   // ✅ Step 2: fallback to API
  //   return await translateText(text);
  // };

  // useEffect(() => {
  //   if (i18n.language === "ar" && bank.bank_name) {
  //     translateWithFallback(bank.bank_name, bankMap)
  //       .then(setTranslatedBank);
  //   } else {
  //     setTranslatedBank(bank.bank_name);
  //   }
  // }, [i18n.language, bank.bank_name]);
  
  const [translatedName, setTranslatedName] = useState("");
  const [translatedCompany, setTranslatedCompany] = useState("");
  const [translatedAddress, setTranslatedAddress] = useState("");
  const [translatedCity, setTranslatedCity] = useState("");
  const [translatedCountry, setTranslatedCountry] = useState("");
  const [translatedBank, setTranslatedBank] = useState("");
  const [translatedBranches, setTranslatedBranches] = useState([]);
  const [translatedStore, setTranslatedStore] = useState("");

  useEffect(() => {
    if (i18n.language === "ar" && basic.fullName) {
      translateText(basic.fullName).then(setTranslatedName);
    } else {
      setTranslatedName(basic.fullName);
    }
  }, [i18n.language, basic.fullName]);

  useEffect(() => {
    if (i18n.language === "ar" && basic.companyName) {
      translateText(basic.companyName).then(setTranslatedCompany);
    } else {
      setTranslatedCompany(basic.companyName);
    }
  }, [i18n.language, basic.companyName]);

  useEffect(() => {
    if (i18n.language === "ar" && address.address) {
      translateText(address.address).then(setTranslatedAddress);
    } else {
      setTranslatedAddress(address.address);
    }
  }, [i18n.language, address.address]);

  useEffect(() => {
    if (i18n.language === "ar" && address.city) {
      translateText(address.city).then(setTranslatedCity);
    } else {
      setTranslatedCity(address.city);
    }
  }, [i18n.language, address.city]);

  useEffect(() => {
    if (i18n.language === "ar" && address.country) {
      translateText(address.country).then(setTranslatedCountry);
    } else {
      setTranslatedCountry(address.country);
    }
  }, [i18n.language, address.country]);

  useEffect(() => {
    if (i18n.language === "ar" && bank.bank_name) {
      translateText(bank.bank_name).then(setTranslatedBank);
    } else {
      setTranslatedBank(bank.bank_name);
    }
  }, [i18n.language, bank.bank_name]);

  // useEffect(() => {
  //   if (i18n.language === "ar" && branches.length > 0) {
  //     Promise.all(
  //       branches.map(b => translateText(b.branchNameEn))
  //     ).then(setTranslatedBranches);
  //   } else {
  //     setTranslatedBranches(branches.map(b => b.branchNameEn));
  //   }
  // }, [i18n.language, branches]);

  useEffect(() => {
    if (i18n.language === "ar" && branches.length > 0) {
      Promise.all(
        branches.map(b => translateText(b.branchNameEn))
      ).then(res => setTranslatedBranches(res));
    }
  }, [i18n.language, branches]);

  useEffect(() => {
    if (i18n.language === "ar" && store.store_name_english) {
      translateText(store.store_name_english).then(setTranslatedStore);
    } else {
      setTranslatedStore(store.store_name_english);
    }
  }, [i18n.language, store.store_name_english]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(
          `http://192.168.2.22:5000/api/profile/${roleLower}/profile-summary/${id}`
        );

        const json = await res.json();

        if (json.status) {
          setApprovalStatus(json.data.approval_status || "Pending");
        }
      } catch (err) {
        console.error("Status fetch error:", err);
      }
    };

    if (id) fetchStatus();
  }, [id, roleLower]);

  useEffect(() => {

    if (!id) {
      console.warn("User ID missing");
      return;
    }

    const loadData = async () => {
      try {

        const token = adminMode
          ? localStorage.getItem("admin_token")
          : localStorage.getItem("token");

        const headers = {
          Authorization: `Bearer ${token}`
        };

        const BASE_URL = "http://192.168.2.22:5000/api/profile";

        const requests = [
          axios.get(`${BASE_URL}/${roleLower}/basic/${id}`, { headers }),
          axios.get(`${BASE_URL}/${roleLower}/org/${id}`, { headers }),
          axios.get(`${BASE_URL}/${roleLower}/address/${id}`, { headers }),
          axios.get(`${BASE_URL}/${roleLower}/bank/${id}`, { headers }),
          axios.get(`${BASE_URL}/${roleLower}/branch/${id}`, { headers }),
          axios.get(`${BASE_URL}/${roleLower}/store/${id}`, { headers }),
        ];

        const results = await Promise.allSettled(requests);

        const [basicRes, orgRes, addrRes, bankRes, branchRes, storeRes] = results;

        if (basicRes.status === "fulfilled" && basicRes.value.data?.status) {
          setBasic(basicRes.value.data);
        }

        if (orgRes.status === "fulfilled" && orgRes.value.data?.status) {
          setOrg(orgRes.value.data.data || {});
        }

        if (addrRes.status === "fulfilled" && addrRes.value.data?.status) {
          setAddress(addrRes.value.data);
        }

        if (bankRes.status === "fulfilled" && bankRes.value.data?.status) {
          setBank(bankRes.value.data.data || {});
        }

        if (branchRes.status === "fulfilled" && branchRes.value.data?.status) {
          setBranches(branchRes.value.data.branches || []);
        }

        if (storeRes.status === "fulfilled" && storeRes.value.data?.status) {
          setStore(storeRes.value.data.data || {});
        }

      } catch (err) {
        console.error("Overview load failed", err);
      }
    };
    loadData();
  }, [id, role, adminMode, roleLower]);

  return (
    <div className="profile-overview-page">

      <>
      <style>
        {`
          .progress-bar {
            height: 10px;
            background: #eee;
            border-radius: 10px;
            overflow: hidden;
          }

          .progress-fill {
            height: 100%;
            background: #4caf50;
            transition: width 0.3s ease;
          }

          .status-chip {
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 8px;
            margin-left: 10px;
            background: #eee;
          }
          
          .verification-chip.approved {
            background: #d4edda;
            color: #155724;
          }

          .verification-chip.rejected {
            background: #f8d7da;
            color: #721c24;
          }

          .verification-chip.pending {
            background: #fff3cd;
            color: #856404;
          }
        `}
      </style>
    </>

      {/* <div className="progress-section">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
        <p>{totalProgress}% Profile Completed</p>
        <p>{totalProgress}% {t("overview.profile_completed")}</p>
      </div> */}

      <div className="overview-header">

        <div>

          <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{ order: 1, direction: "ltr", unicodeBidi: "embed",
                fontSize: "22px", fontWeight: "700", color: "#111" }}>
              {/* {basic.fullName || "—"} */}
              {i18n.language === "ar" ? translatedName : basic.fullName}
            </span>

            <span
              className="profile-type" 
              style={{ order: 2, fontSize: "14px", fontWeight: "500", color: "#ff8a00" }}
            >
              {/* {role === "supplier" ? "Supplier Profile" : "Restaurant Profile"} */}
              {role === "supplier"
                ? t("overview.supplier_profile")
                : t("overview.restaurant_profile")}
            </span>
          </h2>

          <p className="company-name">
            {/* {basic.companyName || "—"} */}
            {i18n.language === "ar" ? translatedCompany : basic.companyName}
          </p>
        </div>

        <span
          className={`verification-chip ${
            approvalStatus?.toLowerCase() === "approved"
              ? "approved"
              : approvalStatus?.toLowerCase() === "rejected"
              ? "rejected"
              : "pending"
          }`}
        >
          {approvalStatus?.toLowerCase() === "approved"
            // ? "✅ Verified"
            // : approvalStatus?.toLowerCase() === "rejected"
            // ? "❌ Rejected"
            // : "⏳ Verification Pending"}
            ? `✅ ${t("overview.verified")}`
            : approvalStatus?.toLowerCase() === "rejected"
            ? `❌ ${t("overview.rejected")}`
            : `⏳ ${t("overview.pending_verification")}`}
        </span>
      </div>

      <div className="overview-grid">

        <div className="overview-card">
          <div className="card-header">
            {/* <h4>Basic Info</h4> */}
            <h4>{t("overview.basic_info")}</h4>

            <span className="status-chip">
              {/* {basicProgress === 100 ? "✅ Completed" : "⚠️ Incomplete"} */}
              {basicProgress === 100
                ? `✅ ${t("overview.completed")}`
                : `⚠️ ${t("overview.incomplete")}`}
            </span>

            {!adminMode && (
              <button onClick={() => navigate(`${BASE}/basic`)}>
                ✏️ Edit
              </button>
            )}
          </div>

          {/* <p><strong>Name:</strong> {basic.fullName || "-"}</p>
          <p><strong>Email:</strong> {basic.email || "-"}</p>
          <p><strong>Phone:</strong> {basic.phone || "-"}</p> */}

          <p> <strong>{t("overview.name")}:</strong>{" "}
            {i18n.language === "ar" ? translatedName : basic.fullName} </p>
          <p><strong>{t("overview.email")}:</strong>{" "} {basic.email || "-"}</p>
          <p><strong>{t("overview.phone")}:</strong>{" "} {basic.phone || "-"}</p>

        </div>

        <div className="overview-card">
          <div className="card-header">
            {/* <h4>Company</h4> */}
            <h4>{t("overview.company")}</h4>

            <span className="status-chip">
              {/* {companyProgress === 100 ? "✅ Completed" : "⚠️ Incomplete"} */}
              {companyProgress === 100
                ? `✅ ${t("overview.completed")}`
                : `⚠️ ${t("overview.incomplete")}`}
            </span>
          </div>

          {/* <p><strong>Name:</strong> {basic.companyName || "-"}</p>
          <p><strong>CR Number:</strong> {org.cr_number || "-"}</p>
          <p><strong>VAT:</strong> {org.vat_tax_number || "-"}</p> */}

          <p> <strong>{t("overview.name")}:</strong>{" "}
            {i18n.language === "ar" ? translatedCompany : basic.companyName} </p>
          <p> <strong>{t("overview.cr_number")}:</strong>{" "} {org.cr_number || "-"}</p>
          <p> <strong>{t("overview.vat_number")}:</strong>{" "} {org.vat_tax_number || "-"}</p>

        </div>

        <div className="overview-card">
          <div className="card-header">
            {/* <h4>Address</h4> */}
            <h4>{t("overview.address")}</h4>

            <span className="status-chip">
              {/* {addressProgress === 100 ? "✅ Completed" : "⚠️ Incomplete"} */}
              {addressProgress === 100
                ? `✅ ${t("overview.completed")}`
                : `⚠️ ${t("overview.incomplete")}`}
            </span>
          </div>

          {/* <p><strong>Address:</strong>{address.address || "-"}</p>
          <p><strong>City:</strong>{address.city || "-"}, {address.country || "-"}</p> */}

          <p><strong>{t("overview.address")}:</strong>{" "} 
            {i18n.language === "ar" ? translatedAddress : address.address} </p>
          <p><strong>{t("overview.city")}:</strong>{" "} 
            {i18n.language === "ar" ? translatedCity : address.city}, 
            {i18n.language === "ar" ? translatedCountry : address.country} </p>

        </div>

        <div className="overview-card">
          <div className="card-header">
            {/* <h4>Bank</h4> */}
            <h4>{t("overview.bank")}</h4>

            <span className="status-chip">
              {/* {bankProgress === 100 ? "✅ Completed" : "⚠️ Incomplete"} */}
              {bankProgress === 100
                ? `✅ ${t("overview.completed")}`
                : `⚠️ ${t("overview.incomplete")}`}
            </span>
          </div>

          <p> <strong>{t("overview.bank")}:</strong>{" "}
            {i18n.language === "ar" ? translatedBank : bank.bank_name} </p>
          <p> <strong>{t("overview.iban")}:</strong>{" "}
            {bank.iban
              ? `**** **** **** ${bank.iban.slice(-4)}`
              : "-"} </p>

        </div>

        <div className="overview-card">
          <div className="card-header">
            {/* <h4>Branches</h4> */}
            <h4>{t("overview.branches")}</h4>

            <span className="status-chip">
              {/* {branchProgress === 100 ? "✅ Completed" : "⚠️ Incomplete"} */}
              {branchProgress === 100
                ? `✅ ${t("overview.completed")}`
                : `⚠️ ${t("overview.incomplete")}`}
            </span>
          </div>

          {/* <p><strong>Total Branches:</strong> {branches.length || 0}</p> */}
          <p><strong>{t("overview.total_branches")}:</strong>{" "} {branches.length || 0}</p>
          {i18n.language === "ar"
            ? translatedBranches.map((name, i) => (
                <div key={i}>• {name}</div>
              ))
            : branches.map((b, i) => (
                <div key={i}>• {b.branchNameEn}</div>
              ))
          }

        </div>

        <div className="overview-card">
          <div className="card-header">
            {/* <h4>Store</h4> */}
            <h4>{t("overview.store")}</h4>

            <span className="status-chip">
              {/* {storeProgress === 100 ? "✅ Completed" : "⚠️ Incomplete"} */}
              {storeProgress === 100
                ? `✅ ${t("overview.completed")}`
                : `⚠️ ${t("overview.incomplete")}`}
            </span>
          </div>

          {/* <p><strong>Name:</strong> {store.store_name_english || "-"}</p> */}
          <p> <strong>{t("overview.name")}:</strong>{" "}
            {i18n.language === "ar" ? translatedStore : store.store_name_english}</p>

        </div>
      </div>
    </div>
  );
};

export default Overview;