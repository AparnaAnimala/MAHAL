import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  FaCheckCircle,
  FaRegAddressBook,
  FaMoneyBill,
  FaFileUpload,
} from "react-icons/fa";
import "./css/ProfileSetup.css";
import CircleProgress from "./CircleProgress";

import { FaMapMarkerAlt } from "react-icons/fa";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import LocationMarker from "./LocationMarker.js";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

const API_PROFILE = "http://192.168.2.9:5000/api/profile";

function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

export default function ProfileSetup({ identity, role, linkedId, adminEdit = false }) {
  const navigate = useNavigate();   // ✅ MUST BE HERE (TOP)

  const dirtyRef = useRef({});

  const markDirty = (step) => {
    dirtyRef.current[step] = true;
  };

  const safeTrim = (v) =>
    v === null || v === undefined ? "" : String(v).trim();

  const params = useParams();

  const roleLower = adminEdit
    ? params?.role
    : identity?.role;

  const id = adminEdit
    ? params?.id
    : identity?.linkedId;

  const [basicLoaded, setBasicLoaded] = useState(false);

  const [stepIndex, setStepIndex] = useState(0);
  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  const steps = useMemo(
    () => ["basic", "org", "address", "bank", "attachments", "branch", "store"],
    []
  );

  // FORM STATE
  const [form, setForm] = useState({
    profileType: identity?.role || "",
    fullName: "",
    companyName: "",
    email: "",
    phone: "",

    org_companyName_auto: "",
    org_companyEmail: "",
    crNumber: "",
    crExpiry: "",
    compCardNumber: "",
    compCardExpiry: "",
    signingAuthority: "",
    sponsorName: "",
    category: "",
    brandName: "",
    tradeLicenseName: "",
    vatNumber: "",

    address: "",
    street: "",
    zone: "",
    area: "",
    city: "",
    country: "",

    bankName: "",
    iban: "",
    accountHolder: "",
    branch: "",
    swiftCode: "",

    files: {
      crCopy: null,
      compCardCopy: null,
      tradeLicenseCopy: null,
      vatCertificate: null,
      companyLogo: null,

      bankLetter: null,
      certificates: null,
      foodSafetyCertificate: null,
    },

    multiBranch: "No",
    branches: [
      {
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
        branchLicense: null,
      },
    ],

    store: {
      branchName: "",
      storeNameEnglish: "",
      storeNameArabic: "",
      contactPersonName: "",
      contactPersonMobile: "",
      storeEmail: "",
      street: "",
      zone: "",
      city: "",
      country: "",
      building: "",
      shopNo: "",
      operatingHours: "",
      storeType: "",
      deliveryPickupAvailability: "",
    },
  });

  const [editMode, setEditMode] = useState(false);

  const ro = editMode ? {} : { readOnly: true, disabled: true };

  const [errors, setErrors] = useState({});
  const [saveStatus, setSaveStatus] = useState("Saved");

  const [fileNames, setFileNames] = useState({});

  const [masterData, setMasterData] = useState({
    street: [],
    zone: [],
    area: [],
    city: [],
    country: [],
  });

  const [branchCount, setBranchCount] = useState(1);
  const [totalBranches, setTotalBranches] = useState(1);
  const [, setPendingBranches] = useState([]);
  const [branchDropdown, setBranchDropdown] = useState([]);

  const [showStoreMapModal, setShowStoreMapModal] = useState(false);
  const [storeMarkerPosition, setStoreMarkerPosition] = useState(null);
  const [storeTempAddress, setStoreTempAddress] = useState({
    street: form.store.street || "",
    zone: form.store.zone || "",
    city: form.store.city || "",
    country: form.store.country || "",
  });

  const saveTimeout = useRef(null);

  const orgFetched = useRef(false);
  const filesFetched = useRef(false);

  // REQUIRED FIELDS - PROGRESS SYSTEM
  const requiredFieldsByStep = useMemo(() => {
    const base = {
      basic: ["fullName", "companyName", "email", "phone"],
      org: [
        // "org_companyEmail",
        "crNumber",
        "crExpiry",
        "compCardNumber",
        "compCardExpiry",
        "signingAuthority",
        "sponsorName",
        "tradeLicenseName",
        "vatNumber",
      ],
      address: ["address", "street", "zone", "area", "city", "country"],
      bank: ["bankName", "iban", "accountHolder", "branch", "swiftCode"],
      attachments: [
        "crCopy",
        "compCardCopy",
        "tradeLicenseCopy",
        "vatCertificate",
        "companyLogo",
      ],
      branch: [
        "branchNameEn",
        "branchNameAr",
        "branchManager",
        "contactNumber",
        "email",
        "street",
        "zone",
        "building",
        "officeNo",
        "city",
        "country",
      ],
      store: [
        "branchName",
        "storeNameEnglish",
        "storeNameArabic",
        "contactPersonName",
        "contactPersonMobile",
        "storeEmail",
        "street",
        "zone",
        "city",
        "country",
        "building",
        "shopNo",
        "operatingHours",
      ]
    };

    if (roleLower === "supplier") {
      base.org.push("category", "brandName");
      base.attachments.push("bankLetter", "certificates");
      base.branch.push("branchLicense");
      base.store.push("storeType", "deliveryPickupAvailability");
    }

    if (roleLower === "restaurant") {
      base.attachments.push("foodSafetyCertificate");
    }

    return base;
  }, [roleLower]);

  const getOriginalPayloadFromServer = React.useCallback(
    async (section, index = 0) => {
      const base = `${API_PROFILE}/${roleLower}`;

      const urls = {
        basic: `${base}/basic/${id}`,
        org: `${base}/org/${id}`,
        address: `${base}/address/${id}`,
        bank: `${base}/bank/${id}`,
        branch: `${base}/branch/${id}`,
        store: `${base}/store/${id}`,
      };

      if (!urls[section]) return {};

      const res = await fetch(urls[section], {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`

        },
      });


      if (!res.ok) {
        const text = await res.text();
        console.error("Fetch original payload failed:", text);
        return {};
      }

      const json = await res.json();
      if (!json.status) return {};

      switch (section) {
        case "basic":
          return {
            company_name_english: json.companyName,
            contact_person_name: json.fullName,
            contact_person_email: json.email,
            contact_person_mobile: json.phone,
            city: json.city,
            country: json.country,
          };

        case "org":
          return {
            cr_number: json.data?.cr_number,
            cr_expiry_date: json.data?.cr_expiry_date,
            computer_card_number: json.data?.computer_card_number,
            computer_card_expiry_date: json.data?.computer_card_expiry_date,
            signing_authority_name: json.data?.signing_authority_name,
            sponsor_name: json.data?.sponsor_name,
            trade_license_name: json.data?.trade_license_name,
            vat_tax_number: json.data?.vat_tax_number,
            category: json.data?.category,
            brand_name: json.data?.brand_name,
            // contact_person_email: json.data?.company_email,
          };

        case "address":
          return {
            address: json.address,
            street: json.street,
            zone: json.zone,
            area: json.area,
            city: json.city,
            country: json.country,
          };

        case "bank":
          return {
            bank_name: json.data?.bank_name,
            iban: json.data?.iban,
            account_holder_name: json.data?.account_holder_name,
            bank_branch: json.data?.bank_branch,
            swift_code: json.data?.swift_code,
          };

        case "branch": {
          const b = json.branches?.[index] || {};
          return {
            branch_name_english: b.branchNameEn || "",
            branch_name_arabic: b.branchNameAr || "",
            branch_manager_name: b.branchManager || "",
            contact_number: b.contactNumber || "",
            email: b.email || "",
            street: b.street || "",
            zone: b.zone || "",
            building: b.building || "",
            office_no: b.officeNo || "",
            city: b.city || "",
            country: b.country || "",
            branch_license: b.branchLicense || "",
            office_number: b.officeNo ? Number(b.officeNo) : null,
          };
        }

        case "store": {
          const s = json.data || {};
          return {
            branch_name: s.branch_name || "",
            store_name_english: s.store_name_english || "",
            store_name_arabic: s.store_name_arabic || "",
            contact_person_name: s.contact_person_name || "",
            contact_person_mobile: s.contact_person_mobile || "",
            email: s.email || "",
            street: s.street || "",
            zone: s.zone || "",
            building: s.building || "",
            shop_no: s.shop_no || "",
            operating_hours: s.operating_hours || "",
            city: s.city || "",
            country: s.country || "",
            store_type: s.store_type || "",
            delivery_pickup_availability: s.delivery_pickup_availability || "",
          };
        }
        default:
          return {};
      }
    },
    [roleLower, id]
  );

  const originalFormRef = useRef(null);

  const [serverFilePreview, setServerFilePreview] = useState({});

  const [localFilePreview, setLocalFilePreview] = useState({});

  const normalize = (v) =>
    v === undefined || v === null ? "" : String(v).trim();

  const getDiff = (current, original = {}) => {
    const diff = {};

    Object.keys(current).forEach((key) => {
      // if (!(key in original)) return;   // 🔥 IMPORTANT

      const cur = normalize(current[key]);
      const old = normalize(original[key]);

      if (cur !== old) {
        diff[key] = current[key];
      }
    });

    return diff;
  };

  // VALIDATE A STEP
  const validateStep = (stepKey) => {
    const required = requiredFieldsByStep[stepKey] || [];
    const newErrors = {};
    let valid = true;

    // 🔥 BANK STEP SPECIAL RULE
    if (stepKey === "bank") {
      // ✅ If user did NOT touch bank step → skip validation
      if (!dirtyRef.current.bank) {
        return true;
      }

      const required = requiredFieldsByStep.bank || [];
      let valid = true;
      const newErrors = {};

      required.forEach((field) => {
        const val = form[field];
        if (!val || String(val).trim() === "") {
          newErrors[field] = "Required";
          valid = false;
        }
      });

      setErrors((p) => ({ ...p, ...newErrors }));
      return valid;
    }

    if (stepKey === "branch") {
      const curr = form.branches[branchCount - 1] || {};

      required.forEach((field) => {
        const val = curr[field];

        if (!val || String(val).trim() === "") {
          newErrors[field] = "Required";
          valid = false;
        }
      });

      setErrors((p) => ({ ...p, ...newErrors }));
      return valid;
    }

    if (stepKey === "attachments") {
      required.forEach((field) => {
        if (
          !form.files[field] &&
          !serverFilePreview[field] &&
          !localFilePreview[field]
        ) {
          newErrors[field] = "Required file";
          valid = false;
        }
      });

      setErrors((p) => ({ ...p, ...newErrors }));
      return valid;
    }

    if (stepKey === "store") {
      required.forEach((field) => {
        const val = form.store[field];
        if (!val || String(val).trim() === "") {
          newErrors[field] = "Required";
          valid = false;
        }
      });

      setErrors((p) => ({ ...p, ...newErrors }));
      return valid;
    }

    required.forEach((field) => {
      const val = form[field];
      if (!val || String(val).trim() === "") {
        newErrors[field] = "Required";
        valid = false;
      }
    });

    if (stepKey === "org" && form.vatNumber) {
      if (!/^\d{15}$/.test(form.vatNumber)) {
        newErrors.vatNumber = "VAT number must be exactly 15 digits";
        valid = false;
      }
    }

    setErrors((p) => ({ ...p, ...newErrors }));
    return valid;
  };

  const currentStepKey = steps[stepIndex];

  useEffect(() => {
    if (adminEdit) {
      setEditMode(true);
    }
  }, [adminEdit]);

  useEffect(() => {
    if (!roleLower || !id) {
      toast.error("Please complete registration first");
    }
  }, [roleLower, id]);

  // Load basic user info ONCE: fullName, email, phone, company & role
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (basicLoaded) return;

    setForm((f) => ({
      ...f,
      profileType: f.profileType || roleLower || "",
      fullName: f.fullName || localStorage.getItem("fullName") || "",
      companyName: f.companyName || localStorage.getItem("companyName") || "",
      email: f.email || localStorage.getItem("email") || "",
      phone: f.phone || localStorage.getItem("phone") || "",
    }));

    async function fetchBasic() {
      if (!roleLower || !id) return;

      const url = `${API_PROFILE}/${roleLower}/basic/${id}`;

      const token = localStorage.getItem("token");


      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (json.status) {
        const nextForm = {
          fullName: json.fullName ?? "",
          companyName: json.companyName ?? "",
          email: json.email ?? "",
          phone: json.phone ?? "",
          city: json.city ?? "",
          country: json.country ?? "",
        };

        setForm(f => ({
          ...f,
          fullName: f.fullName || nextForm.fullName,
          companyName: f.companyName || nextForm.companyName,
          email: f.email || nextForm.email,
          phone: f.phone || nextForm.phone,
          city: f.city || nextForm.city,
          country: f.country || nextForm.country,
        }));

        if (!originalFormRef.current) {
          originalFormRef.current = JSON.parse(JSON.stringify(nextForm));
          console.log("✅ BASIC ORIGINAL SNAPSHOT", originalFormRef.current);
        }
      }

      setBasicLoaded(true);
    }

    fetchBasic();
  }, [roleLower, id, basicLoaded]);

  useEffect(() => {
    if (currentStepKey !== "bank") return;

    if (!roleLower || !id) return;

    fetch(`${API_PROFILE}/${roleLower}/bank/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`

      },
    })

      .then((res) => res.json())
      .then((json) => {
        if (!json.status || !json.data) return;


        setForm((f) => ({
          ...f,
          bankName: f.bankName || json.data.bank_name || "",
          iban: f.iban || json.data.iban || "",
          accountHolder:
            f.accountHolder || json.data.account_holder_name || "",
          swiftCode: f.swiftCode || json.data.swift_code || "",
          branch: f.branch || json.data.branch || "",
        }));
      });

  }, [currentStepKey, roleLower, id]);

  useEffect(() => {
    if (!id || !roleLower) return;

    fetch(`${API_PROFILE}/${roleLower}/files/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`

      },
    })
      .then(res => res.json())
      .then(json => {
        if (!json.status || !json.files) return;

        const previews = {};
        const names = {};

        Object.entries(json.files).forEach(([key, file]) => {
          if (file?.preview) {
            previews[key] = file.preview;
            names[key] = file.filename;
          }
        });

        setServerFilePreview(previews);
        setFileNames(names);
      });

  }, [roleLower, id]);

  useEffect(() => {
    if (currentStepKey !== "address") return;

    if (!roleLower || !id) return;

    let url = null;

    if (roleLower === "supplier" && id) {
      url = `${API_PROFILE}/${roleLower}/address/${id}`;
    }

    if (roleLower === "restaurant" && id) {
      url = `${API_PROFILE}/${roleLower}/address/${id}`;
    }

    if (!url) return;

    fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`

      },
    })
      .then((r) => r.json())
      .then((json) => {
        if (!json.status) return;

        setForm((f) => ({
          ...f,
          address: json.address ?? f.address,
          street: json.street ?? f.street,
          zone: json.zone ?? f.zone,
          area: json.area ?? f.area,
          city: json.city ?? f.city,
          country: json.country ?? f.country,
        }));
      });
  }, [currentStepKey, roleLower, id]);

  useEffect(() => {
    const fetchMaster = async (category) => {
      try {
        const res = await fetch(
          `http://192.168.2.9:5000/api/profile/master/${category}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`

            },
          }
        );

        const json = await res.json();
        return json.data || [];
      } catch (err) {
        return [];
      }
    };

    const load = async () => {
      setMasterData({
        street: await fetchMaster("street"),
        zone: await fetchMaster("zone"),
        area: await fetchMaster("area"),
        city: await fetchMaster("city"),
        country: await fetchMaster("country"),
      });
    };

    load();
  }, []);

  useEffect(() => {
    if (currentStepKey !== "store") return;

    (async () => {
      const snapshot = await getOriginalPayloadFromServer("store");

      if (!snapshot || Object.keys(snapshot).length === 0) {
        originalFormRef.current = {};
      } else {
        originalFormRef.current = snapshot;
      }

      console.log("✅ STORE ORIGINAL SNAPSHOT", originalFormRef.current);
    })();
  }, [currentStepKey, getOriginalPayloadFromServer]);


  // PROGRESS BAR CALCULATION
  const computeProgress = () => {
    let filled = 0;
    let total = 0;

    Object.entries(requiredFieldsByStep).forEach(([stepKey, fields]) => {
      fields.forEach((field) => {
        total++;

        if (stepKey === "branch") {
          const curr = form.branches[branchCount - 1] || {};
          if (curr[field] && String(curr[field]).trim() !== "") filled++;
          return;
        }

        if (stepKey === "attachments") {
          if (
            form.files[field] ||
            serverFilePreview[field] ||
            localFilePreview[field]
          ) {
            filled++;
          }
          return;
        }

        if (stepKey === "store") {
          if (form.store[field] && String(form.store[field]).trim() !== "") filled++;
          return;
        }

        if (form[field] && String(form[field]).trim() !== "") filled++;
      });
    });

    return Math.round((filled / total) * 100);
  };



const submitChangeRequest = async (section, newData, extra = {}) => {
  const token = localStorage.getItem("token");   // USER TOKEN ONLY

  if (!token) {
    toast.error("Session expired — redirecting to login.");
    setTimeout(() => {
      window.location.href = adminEdit ? "/admin/login" : "/login";
    }, 1500);
    throw new Error("No auth token");
  }

  const url =
    roleLower === "restaurant"
      ? "http://192.168.2.9:5000/api/profile/request-change-restaurant"
      : "http://192.168.2.9:5000/api/profile/request-change-supplier";

  // 🔥 **CRITICAL FIX — NO `data:{}` WRAPPER**
  const payload = {
    role: roleLower,
    entity_id: id,
    section,
    new_data: newData,
    ...extra,
  };

  console.log("🚀 CHANGE REQUEST", payload);

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("Network error:", err);
    toast.error("Cannot reach server. Check backend.");
    throw new Error("Network failure");
  }

  const text = await res.text();

  if (!res.ok) {
    console.error("Backend error response:", text);
    throw new Error(text || "Change request failed");
  }

  const json = JSON.parse(text);

  if (json.status === false) {
    throw new Error(json.error || "Change request failed");
  }

  return json;
};





  const [progress, setProgress] = useState(() => computeProgress());

  useEffect(() => {
    if (currentStepKey !== "org") return;
    if (orgFetched.current) return;

    if (!roleLower || !id) return;

    const url =
      roleLower === "supplier"
        ? `${API_PROFILE}/${roleLower}/org/${id}`
        : `${API_PROFILE}/${roleLower}/org/${id}`;

    fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`

      },
    })

      .then((r) => r.json())
      .then((json) => {
        if (!json.status || !json.data) return;

        setForm((f) => ({
          ...f,
          crNumber: f.crNumber || json.data.cr_number || "",
          crExpiry: f.crExpiry || json.data.cr_expiry_date || "",
          compCardNumber:
            f.compCardNumber || json.data.computer_card_number || "",
          compCardExpiry:
            f.compCardExpiry || json.data.computer_card_expiry_date || "",
          signingAuthority:
            f.signingAuthority || json.data.signing_authority_name || "",
          sponsorName: f.sponsorName || json.data.sponsor_name || "",
          tradeLicenseName:
            f.tradeLicenseName || json.data.trade_license_name || "",
          vatNumber: f.vatNumber || json.data.vat_tax_number || "",
          category: f.category || json.data.category || "",
          brandName: f.brandName || json.data.brand_name || "",
          org_companyEmail:
            f.org_companyEmail || json.data.company_email || "",
        }));

        orgFetched.current = true;
      });
  }, [currentStepKey, roleLower, id]);

  const branchesFetched = useRef(false);

  useEffect(() => {
    if (currentStepKey !== "branch") return;
    if (branchesFetched.current) return;
    if (!roleLower || !id) return;

    const url = `${API_PROFILE}/${roleLower}/branch/${id}`;

    fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`

      },
    })

      .then((r) => r.json())
      .then((json) => {
        if (!json.status || !json.branches?.length) return;

        const normalized = json.branches.map((b) => ({
          branch_id: b.branch_id,
          branchNameEn: b.branchNameEn || "",
          branchNameAr: b.branchNameAr || "",
          branchManager: b.branchManager || "",
          contactNumber: b.contactNumber || "",
          email: b.email || "",
          street: b.street || "",
          zone: b.zone || "",
          building: b.building || "",
          officeNo: b.officeNo || "",
          city: b.city || "",
          country: b.country || "",
          branchLicense: b.branchLicense || "",
        }));

        setForm((f) => ({
          ...f,
          branches: normalized,
          multiBranch: normalized.length > 1 ? "Yes" : "No",
        }));

        setTotalBranches(normalized.length);
        setBranchCount(1);
        branchesFetched.current = true;

        // 🔥 RESET DIRTY AFTER LOAD
        dirtyRef.current.branch = false;
      });
  }, [currentStepKey, roleLower, id]);


  useEffect(() => {
    setProgress(computeProgress());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, branchCount, totalBranches, role]);


  const handleChange = (field) => (e) => {
    const value = e?.target?.value ?? e;
    setForm((f) => ({ ...f, [field]: value }));
    setSaveStatus("Saving...");

    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      setSaveStatus("Saved");
    }, 700);
  };

  const currentBranch = form.branches[branchCount - 1] || {};

  const loadBranchDropdown = useCallback(async () => {
    if (!id) return;

    try {
      if (!id) {
        setBranchDropdown([]);
        return;
      }

      const res = await fetch(
        `http://192.168.2.9:5000/api/profile/${roleLower}/branch/list/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`

          },
        }
      );

      if (!res.ok) {
        setBranchDropdown([]);
        return;
      }

      const data = await res.json();
      if (!data.status || !Array.isArray(data.branches)) {
        setBranchDropdown([]);
        return;
      }

      const branches = data.branches
        .map((b) => (typeof b === "string" ? b : b.branchNameEn || b.branch_name_english))
        .filter(Boolean);

      setBranchDropdown(branches);

      setForm((f) => {
        // if (!f.store?.branchName && branches.length > 0 && !f.store.store_id) {
        //   return { ...f, store: { ...f.store, branchName: branches[0] } };
        // }
        return f;
      });
    } catch {
      setBranchDropdown([]);
    }
  }, [id, roleLower]);

  const loadRestaurantBranchDropdown = useCallback(async () => {
    if (!id) return;

    try {
      console.log("LOAD RESTAURANT DROPDOWN: id =", id);

      if (!id) {
        setBranchDropdown([]);
        return;
      }

      const res = await fetch(
        `http://192.168.2.9:5000/api/profile/restaurant/branch/list/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`

        },

      });

      const data = await res.json();
      console.log("Restaurant branch list response:", data);

      if (!data.status || !Array.isArray(data.branches)) {
        setBranchDropdown([]);
        return;
      }

      // const branches = data.branches.filter(Boolean);
      const branches = data.branches
        .map(b => typeof b === "string" ? b : b.branchNameEn)
        .filter(Boolean);

      setBranchDropdown(branches);

      setForm((f) => {
        if (f.store.branchName || f.store.store_id) return f;

        return {
          ...f,
          store: {
            ...f.store,
            branchName: branches[0] || "",
          },
        };
      });
    } catch (err) {
      console.error("Restaurant dropdown load error:", err);
      setBranchDropdown([]);
    }
  }, [id]);

  useEffect(() => {
    const load = async () => {
      if (steps[stepIndex] !== "store") return;

      if (roleLower === "supplier") await loadBranchDropdown();
      if (roleLower === "restaurant") await loadRestaurantBranchDropdown();
    };

    load();
  }, [stepIndex, roleLower, steps, loadBranchDropdown, loadRestaurantBranchDropdown,]);

  const validateAllBranches = () => {
    let valid = true;
    let newErrors = {};

    form.branches.forEach((branch, index) => {
      requiredFieldsByStep.branch.forEach((field) => {
        const val = branch[field];
        if (!val || String(val).trim() === "") {
          valid = false;
          newErrors[`branch_${index}_${field}`] = "Required";
        }
      });
    });

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return valid;
  };

  const translateToArabic = async (text) => {
    if (!text || !text.trim()) return "";

    try {
      const res = await fetch("http://192.168.2.9:5000/api/profile/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      return data.arabic || "";
    } catch (err) {
      console.error("Translate error:", err);
      return "";
    }
  };

  const debouncedBranchTranslate = useRef(
    debounce(async (en, cb) => {
      const ar = await translateToArabic(en);
      cb(ar);
    }, 300)
  ).current;

  const debouncedStoreTranslate = useRef(
    debounce(async (en, cb) => {
      const ar = await translateToArabic(en);
      cb(ar);
    }, 300)
  ).current;

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    }
    );

  // const handleBranchChange = (index, key, value) => {
  //   markDirty("branch");

  //   setForm((f) => {
  //     const updated = [...f.branches];
  //     updated[index] = { ...updated[index], [key]: value };
  //     return { ...f, branches: updated };
  //   });
  // };

  const handleBranchChange = (index, key, value) => {
    setForm((f) => {
      const updated = [...f.branches];
      const prevValue = updated[index]?.[key] ?? "";

      // 🔥 SAME VALUE → DO NOT MARK DIRTY
      if (String(prevValue) !== String(value)) {
        markDirty("branch");
      }

      updated[index] = { ...updated[index], [key]: value };
      return { ...f, branches: updated };
    });
  };

  const handleStoreChange = (field) => (e) => {
    const value = e?.target?.value ?? e;
    setForm((f) => ({
      ...f,
      store: {
        ...f.store,
        [field]: value,
      },
    }));
    setSaveStatus("Saving...");
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => setSaveStatus("Saved"), 700);
  };

  const getStepPayload = async (stepKey) => {
    switch (stepKey) {
      case "basic":
        return {
          company_name_english: form.companyName,
          contact_person_name: form.fullName,
          contact_person_email: form.email,
          contact_person_mobile: form.phone,
          city: form.city,
          country: form.country,
        };

      case "org":
        return {
          // companyName: form.companyName, // 🔥 ADD THIS
          cr_number: form.crNumber,
          cr_expiry_date: form.crExpiry,
          computer_card_number: form.compCardNumber,
          computer_card_expiry_date: form.compCardExpiry,
          signing_authority_name: form.signingAuthority,
          vat_tax_number: form.vatNumber,
          sponsor_name: form.sponsorName,
          trade_license_name: form.tradeLicenseName,
          category: roleLower === "supplier" ? form.category : undefined,
          brand_name: roleLower === "supplier" ? form.brandName : undefined,
          // org_companyEmail: form.org_companyEmail,
        };

      case "address":
        return {
          address: form.address,
          street: form.street,
          zone: form.zone,
          area: form.area,
          city: form.city,
          country: form.country,
        };

      case "bank":
        return {
          bank_name: form.bankName,
          iban: form.iban,
          account_holder_name: form.accountHolder,
          bank_branch: form.branch,
          swift_code: form.swiftCode,
        };


      case "attachments": {
        const changed = {};

        if (form.files.crCopy) changed.crCopy = await toBase64(form.files.crCopy);
        if (form.files.compCardCopy) changed.compCardCopy = await toBase64(form.files.compCardCopy);
        if (form.files.tradeLicenseCopy) changed.tradeLicenseCopy = await toBase64(form.files.tradeLicenseCopy);
        if (form.files.vatCertificate) changed.vatCertificate = await toBase64(form.files.vatCertificate);
        if (form.files.companyLogo) changed.companyLogo = await toBase64(form.files.companyLogo);

        if (roleLower === "supplier") {
          if (form.files.bankLetter) changed.bankLetter = await toBase64(form.files.bankLetter);
          if (form.files.certificates) changed.certificates = await toBase64(form.files.certificates);
        }

        if (roleLower === "restaurant") {
          if (form.files.foodSafetyCertificate)
            changed.foodSafetyCertificate = await toBase64(form.files.foodSafetyCertificate);
        }

        return changed;
      }

      case "branch": {
        const b = form.branches[branchCount - 1];
        return {
          branchNameEn: b.branchNameEn,
          branchNameAr: b.branchNameAr,
          branchManager: b.branchManager,
          contactNumber: b.contactNumber,
          email: b.email,
          street: b.street,
          zone: b.zone,
          building: b.building,
          officeNo: b.officeNo || "",
          // officeNo: roleLower === "supplier" ? b.officeNo : undefined,
          // office_number:
          //   roleLower === "restaurant"
          //     ? b.officeNo
          //       ? Number(b.officeNo)   // 🔥 FORCE NUMBER
          //       : null
          //     : undefined,
          city: b.city,
          country: b.country,
          branchLicense: roleLower === "supplier" ? b.branchLicense : undefined,
          branch_id: b.branch_id || null
        };
      }

      case "store":
        return {
          branchName: form.store.branchName,          // 🔥 MUST
          storeNameEnglish: form.store.storeNameEnglish,
          storeNameArabic: form.store.storeNameArabic,
          contactPersonName: form.store.contactPersonName,
          contactPersonMobile: form.store.contactPersonMobile,
          storeEmail: form.store.storeEmail,
          street: form.store.street,
          zone: form.store.zone,
          building: form.store.building,
          shopNo: form.store.shopNo,
          operatingHours: form.store.operatingHours,
          city: form.store.city,
          country: form.store.country,
          storeType: roleLower === "supplier" ? form.store.storeType : undefined,
          deliveryPickupAvailability:
            roleLower === "supplier"
              ? form.store.deliveryPickupAvailability
              : undefined,
          store_id: form.store.store_id || null
        };

      default:
        return {};
    }
  };

  // const normalizeBranchForDiff = (b = {}, role) => {
  //   return {
  //     branch_name_english:
  //       (b.branchNameEn ?? b.branch_name_english ?? "").trim(),

  //     branch_name_arabic:
  //       (b.branchNameAr ?? b.branch_name_arabic ?? "").trim(),

  //     branch_manager_name:
  //       (b.branchManager ?? b.branch_manager_name ?? "").trim(),

  //     contact_number:
  //       (b.contactNumber ?? b.contact_number ?? "").trim(),

  //     email: (b.email ?? "").trim(),
  //     street: (b.street ?? "").trim(),
  //     zone: (b.zone ?? "").trim(),
  //     building: (b.building ?? "").trim(),
  //     city: (b.city ?? "").trim(),
  //     country: (b.country ?? "").trim(),

  //     // 🔥 office no unified (supplier + restaurant)
  //     office_no:
  //       role === "restaurant"
  //         ? String(b.officeNo ?? b.office_number ?? "")
  //         : String(b.officeNo ?? b.office_no ?? ""),

  //     // 🔥 only supplier has license
  //     branch_license:
  //       role === "supplier"
  //         ? String(b.branchLicense ?? b.branch_license ?? "")
  //         : "",
  //   };
  // };

  const normalizeBranchForDiff = (b = {}, role) => {
    return {
      branch_name_english: safeTrim(
        b.branchNameEn ?? b.branch_name_english
      ),

      branch_name_arabic: safeTrim(
        b.branchNameAr ?? b.branch_name_arabic
      ),

      branch_manager_name: safeTrim(
        b.branchManager ?? b.branch_manager_name
      ),

      contact_number: safeTrim(
        b.contactNumber ?? b.contact_number
      ),

      email: safeTrim(b.email),
      street: safeTrim(b.street),
      zone: safeTrim(b.zone),
      building: safeTrim(b.building),
      city: safeTrim(b.city),
      country: safeTrim(b.country),

      // 🔥 office unified (supplier + restaurant)
      office_no:
        role === "restaurant"
          ? safeTrim(b.officeNo ?? b.office_number)
          : safeTrim(b.officeNo ?? b.office_no),

      // 🔥 supplier-only
      branch_license:
        role === "supplier"
          ? safeTrim(b.branchLicense ?? b.branch_license)
          : "",
    };
  };

  const handleSaveNext = async () => {
    const stepKey = steps[stepIndex];

    const ADMIN_UPDATE_ROUTES = {
      supplier: {
        basic: null,
        org: "/supplier/update/org",
        address: "/supplier/update/address",
        bank: "/supplier/update/bank",
        attachments: "/supplier/update/files",
        branch: "/supplier/branch",
        store: "/supplier/store"
      },
      restaurant: {
        basic: null,
        org: "/restaurant/update/org",
        address: "/restaurant/update/address",
        bank: "/restaurant/update/bank",
        attachments: "/restaurant/update/files",
        branch: "/restaurant/branch",
        store: "/restaurant/store"
      }
    };

    if (!roleLower || !id) {
      toast.error("Profile not loaded yet. Please wait.");
      return;
    }

    if (!validateStep(stepKey)) {
      alert("Please fill all required fields on this step.");
      return;
    }

    // ================= ADMIN DIRECT SAVE =================
    if (adminEdit && editMode) {
      try {
        const stepKey = steps[stepIndex];
        let payload = await getStepPayload(stepKey);

        // 🔥 ADMIN ORG SAVE FIX (DO NOT AFFECT USER FLOW)
        if (stepKey === "org") {
          payload = {
            crNumber: form.crNumber,
            crExpiry: form.crExpiry,
            compCardNumber: form.compCardNumber,
            compCardExpiry: form.compCardExpiry,
            signingAuthority: form.signingAuthority,
            sponsorName: form.sponsorName,
            tradeLicenseName: form.tradeLicenseName,
            vatNumber: form.vatNumber,
            category: roleLower === "supplier" ? form.category : undefined,
            brandName: roleLower === "supplier" ? form.brandName : undefined,
          };
          // payload = {
          //   // 🔥 REQUIRED FOR UPDATE WHERE CLAUSE
          //   ...(roleLower === "supplier"
          //     ? { supplier_id: id }
          //     : { restaurant_id: id }),

          //   cr_number: form.crNumber,
          //   cr_expiry_date: form.crExpiry,
          //   computer_card_number: form.compCardNumber,
          //   computer_card_expiry_date: form.compCardExpiry,
          //   signing_authority_name: form.signingAuthority,
          //   sponsor_name: form.sponsorName,
          //   trade_license_name: form.tradeLicenseName,
          //   vat_tax_number: form.vatNumber,

          //   category: roleLower === "supplier" ? form.category : null,
          //   brand_name: roleLower === "supplier" ? form.brandName : null,

          //   // OPTIONAL – backend accepts if present
          //   company_email: form.org_companyEmail,
          // };
        }

        const baseRoute = ADMIN_UPDATE_ROUTES[roleLower]?.[stepKey];
        if (!baseRoute) {
          toast.info("Nothing to save on this step");
          setStepIndex(stepIndex + 1);
          return;
        }

        let url = `${API_PROFILE}${baseRoute}/${id}`;
        let method = "PUT";

        if (stepKey === "branch") {
          const branchId = payload.branch_id;

          if (branchId) {
            url = `${API_PROFILE}/${roleLower}/branch/${branchId}`;
            method = "PUT";
            payload = {
              ...payload,
              ...(roleLower === "supplier"
                ? {
                  supplier_id: id,
                  supplierName: form.companyName,
                  companyName: form.companyName,
                }
                : {
                  restaurant_id: id,
                  restaurant_name: form.companyName,
                }),
            };
          } else {
            url = `${API_PROFILE}/${roleLower}/branch`;
            method = "POST";

            payload = {
              ...payload,
              ...(roleLower === "supplier"
                ? {
                  supplier_id: id,
                  supplierName: form.companyName,
                  companyName: form.companyName,
                  branches: [payload],
                }
                : {
                  restaurant_id: id,
                  restaurant_name: form.companyName,
                  branches: [payload],
                }),
            };
          }
        }

        if (stepKey === "store") {
          const storeId = payload.store_id;

          if (storeId) {
            url = `${API_PROFILE}/${roleLower}/store/${storeId}`;
            method = "PUT";

            payload = {
              ...(roleLower === "supplier"
                ? {
                  supplier_id: id,
                  supplierName: form.companyName,
                  companyName: form.companyName,
                  branchName: form.store.branchName,
                }
                : {
                  restaurant_id: id,
                  restaurantName: form.companyName,
                  branchName: form.store.branchName,
                }),
              store: payload,
            };
          } else {
            url = `${API_PROFILE}/${roleLower}/store`;
            method = "POST";

            payload = {
              ...(roleLower === "supplier"
                ? {
                  supplier_id: id,
                  supplierName: form.companyName,
                  companyName: form.companyName,
                  branchName: form.store.branchName,
                }
                : {
                  restaurant_id: id,
                  restaurantName: form.companyName,
                }),
              store: payload,
            };
          }
        }

        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          },
          body: JSON.stringify(payload),
        });


        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Admin save failed");
        }

        const json = await res.json();

        if (!json.status) {
          throw new Error(json.message || "Admin save failed");
        }

        toast.success("Admin: Data saved directly");

        if (stepKey === "branch") {
          if (branchCount < totalBranches) {
            setBranchCount((c) => c + 1);
            return;
          }
          setBranchDropdown([]);
          branchesFetched.current = false;

          setStepIndex(stepIndex + 1);
          return;
        }
        return;

      } catch (err) {
        console.error("Admin save error:", err);
        toast.error(err.message);
        return;
      }
    }

    if (
      editMode &&
      !adminEdit &&
      (roleLower === "supplier" || roleLower === "restaurant")
    ) {
      const backendSection =
        stepKey === "attachments" ? "files" : stepKey;

      const payload = await getStepPayload(stepKey);

      let extra = {};
      let diffPayload = {};

      /* -------------------- ID HANDLING -------------------- */
      if (backendSection === "branch") {
        if (payload.branch_id) {
          extra.branch_id = payload.branch_id;
        } else {
          extra.branch_id = null; // 🔥 explicitly signals "NEW BRANCH"
        }
        delete payload.branch_id;
      }


      if (backendSection === "store") {
        extra.store_id = payload.store_id ?? null;
        delete payload.store_id;
      }

      if (backendSection === "basic") {
        toast.info("Basic info cannot be edited");
        setStepIndex(stepIndex + 1);
        return;
      }

      /* -------------------- DIFF CALCULATION -------------------- */
      const originalPayload =
        backendSection === "store"
          ? originalFormRef.current || {}
          : await getOriginalPayloadFromServer(
            backendSection,
            backendSection === "branch" ? branchCount - 1 : 0
          );

      if (
        (backendSection === "branch" || backendSection === "store") &&
        Object.keys(payload).length === 0
      ) {
        toast.info("No changes detected");
        return;
      }

      // if (backendSection === "org") {

      //   if (!dirtyRef.current.org) {
      //     toast.info("No changes detected");
      //     setStepIndex(stepIndex + 1);
      //     return;
      //   }

      //   diffPayload = payload;

      //   try {
      //     await submitChangeRequest(backendSection, diffPayload, extra);
      //     toast.info("Changes sent to admin for approval");
      //     dirtyRef.current.org = false;   // 🔥 RESET
      //   } catch (err) {
      //     toast.error("Failed to send changes to admin");
      //   }

      //   setStepIndex(stepIndex + 1);
      //   return;
      // }

      if (backendSection === "org") {

        // 🛑 user em edit cheyyaledu
        if (!dirtyRef.current.org) {
          toast.info("No changes detected in Org");
          setStepIndex(stepIndex + 1);
          return;
        }

        // 🔥 fetch original org data
        const originalPayload = await getOriginalPayloadFromServer("org");

        // 🔍 real change unda?
        const hasAnyChange =
          Object.keys(getDiff(payload, originalPayload)).length > 0;

        if (!hasAnyChange) {
          toast.info("No changes detected in Org");
          dirtyRef.current.org = false;
          setStepIndex(stepIndex + 1);
          return;
        }

        // 🚀 ALWAYS SEND FULL ORG PAYLOAD
        await submitChangeRequest("org", payload);
        toast.info("Changes sent to admin for approval");

        dirtyRef.current.org = false;
        setStepIndex(stepIndex + 1);
        return;
      }

      // if (backendSection === "branch") {

      //   // 🛑 HARD GUARD – user edit cheyyakapothe
      //   if (!dirtyRef.current.branch) {
      //     toast.info("No changes detected in Branch");

      //     if (branchCount < totalBranches) {
      //       setBranchCount(c => c + 1);
      //       return;
      //     }

      //     setStepIndex(stepIndex + 1);
      //     return;
      //   }

      //   // 🔥 SAME SHAPE normalization (payload + original)
      //   const currentNormalized =
      //     normalizeBranchForDiff(payload, roleLower);

      //   const originalNormalized =
      //     normalizeBranchForDiff(originalPayload, roleLower);

      //   diffPayload = getDiff(currentNormalized, originalNormalized);

      //   // 🛑 REAL NO-CHANGE CHECK
      //   if (Object.keys(diffPayload).length === 0) {
      //     toast.info("No changes detected in Branch");

      //     dirtyRef.current.branch = false;

      //     if (branchCount < totalBranches) {
      //       setBranchCount(c => c + 1);
      //       return;
      //     }

      //     setStepIndex(stepIndex + 1);
      //     return;
      //   }

      //   // 🚀 SEND ONLY WHEN REAL CHANGE
      //   await submitChangeRequest("branch", diffPayload, extra);
      //   toast.info("Changes sent to admin for approval");

      //   dirtyRef.current.branch = false;

      //   if (branchCount < totalBranches) {
      //     setBranchCount(c => c + 1);
      //     return;
      //   }

      //   setStepIndex(stepIndex + 1);
      //   return;
      // }

      if (backendSection === "branch") {

        // 🛑 USER DID NOT EDIT ANYTHING
        if (!dirtyRef.current.branch) {
          toast.info("No changes detected in Branch");

          if (branchCount < totalBranches) {
            setBranchCount(c => c + 1);
            return;
          }

          setStepIndex(stepIndex + 1);
          return;
        }

        // 🔥 FULL BRANCH PAYLOAD (ALWAYS)
        const fullBranchPayload = normalizeBranchForDiff(payload, roleLower);

        // 🔍 ONLY CHECK IF ANY REAL CHANGE
        const originalNormalized =
          normalizeBranchForDiff(originalPayload, roleLower);

        const hasAnyChange =
          Object.keys(getDiff(fullBranchPayload, originalNormalized)).length > 0;

        if (!hasAnyChange) {
          toast.info("No changes detected in Branch");

          dirtyRef.current.branch = false;

          if (branchCount < totalBranches) {
            setBranchCount(c => c + 1);
            return;
          }

          setStepIndex(stepIndex + 1);
          return;
        }

        // 🚀 SEND FULL PAYLOAD
        await submitChangeRequest("branch", fullBranchPayload, extra);
        toast.info("Changes sent to admin for approval");

        dirtyRef.current.branch = false;

        if (branchCount < totalBranches) {
          setBranchCount(c => c + 1);
          return;
        }

        setStepIndex(stepIndex + 1);
        return;
      }

      // if (backendSection === "store") {
      //   const normalizedCurrent = {
      //     store_name_english: payload.storeNameEnglish,
      //     store_name_arabic: payload.storeNameArabic,
      //     contact_person_name: payload.contactPersonName,
      //     contact_person_mobile: payload.contactPersonMobile,
      //     email: payload.storeEmail,
      //     street: payload.street,
      //     zone: payload.zone,
      //     building: payload.building,
      //     shop_no: payload.shopNo,
      //     operating_hours: payload.operatingHours,
      //     city: payload.city,
      //     country: payload.country,
      //     store_type: payload.storeType,
      //     delivery_pickup_availability: payload.deliveryPickupAvailability,
      //   };

      //   diffPayload = getDiff(normalizedCurrent, originalPayload);

      //   if (Object.keys(diffPayload).length === 0) {
      //     toast.info("No changes detected in Store");
      //     // return;
      //   }
      // }

      if (backendSection === "store") {

        const fullStorePayload = {
          store_name_english: payload.storeNameEnglish,
          store_name_arabic: payload.storeNameArabic,
          contact_person_name: payload.contactPersonName,
          contact_person_mobile: payload.contactPersonMobile,
          email: payload.storeEmail,
          street: payload.street,
          zone: payload.zone,
          building: payload.building,
          shop_no: payload.shopNo,
          operating_hours: payload.operatingHours,
          city: payload.city,
          country: payload.country,   // 🔥 ALWAYS INCLUDED
          store_type: payload.storeType,
          delivery_pickup_availability: payload.deliveryPickupAvailability,
        };

        // Optional: just for toast purpose
        const hasAnyChange =
          Object.keys(getDiff(fullStorePayload, originalPayload)).length > 0;

        if (!hasAnyChange) {
          toast.info("No changes detected in Store");
          // ⚠️ BUT STILL CONTINUE (DO NOT RETURN)
          setStepIndex(stepIndex + 1);   // 🔥 MOVE TO NEXT STEP
          return;
        }

        diffPayload = fullStorePayload;   // 🔥 FULL PAYLOAD ALWAYS
      }

      else if (backendSection === "basic") {
        if (!originalFormRef.current) {
          toast.error("Profile still loading, try again");
          return;
        }

        const originalBasic = {
          company_name_english: originalFormRef.current.companyName ?? "",
          contact_person_name: originalFormRef.current.fullName ?? "",
          contact_person_email: originalFormRef.current.email ?? "",
          contact_person_mobile: originalFormRef.current.phone ?? "",
          city: originalFormRef.current.city ?? "",
          country: originalFormRef.current.country ?? "",
        };

        diffPayload = getDiff(payload, originalBasic);
      }

      else if (backendSection === "address") {

        const fullAddressPayload = {
          address: payload.address,
          street: payload.street,
          zone: payload.zone,
          area: payload.area,
          city: payload.city,
          country: payload.country,
        };

        // Optional: real no-change guard
        const hasAnyChange = Object.keys(
          getDiff(fullAddressPayload, originalPayload)
        ).length > 0;

        if (!hasAnyChange) {
          toast.info("No changes detected in Address");
          setStepIndex(stepIndex + 1);
          return;
        }

        await submitChangeRequest("address", fullAddressPayload);
        toast.info("Changes sent to admin for approval");

        setStepIndex(stepIndex + 1);
        return;
      }

      // else if (backendSection === "bank") {

      //   // 🔥 USER BANK STEP TOUCH CHEYYALEDU
      //   if (!dirtyRef.current.bank) {
      //     toast.info("No changes detected in Bank");
      //     setStepIndex(stepIndex + 1);
      //     return;
      //   }

      //   const normalizedCurrent = {
      //     bank_name: payload.bankName,
      //     iban: payload.iban,
      //     account_holder_name: payload.accountHolder,
      //     bank_branch: payload.branch,
      //     swift_code: payload.swiftCode,
      //   };

      //   diffPayload = getDiff(normalizedCurrent, originalPayload);

      //   if (Object.keys(diffPayload).length === 0) {
      //     toast.info("No changes detected in Bank");
      //     dirtyRef.current.bank = false;
      //     setStepIndex(stepIndex + 1);
      //     return;
      //   }

      //   await submitChangeRequest("bank", diffPayload);
      //   dirtyRef.current.bank = false;
      //   setStepIndex(stepIndex + 1);
      //   return;
      // }

      else if (backendSection === "bank") {

        // 🔥 USER BANK STEP TOUCH CHEYYALEDU
        if (!dirtyRef.current.bank) {
          toast.info("No changes detected in Bank");
          setStepIndex(stepIndex + 1);
          return;
        }

        const fullBankPayload = {
          bank_name: payload.bankName,
          iban: payload.iban,
          account_holder_name: payload.accountHolder,
          bank_branch: payload.branch,
          swift_code: payload.swiftCode,
        };

        const hasAnyChange =
          Object.keys(getDiff(fullBankPayload, originalPayload)).length > 0;

        if (!hasAnyChange) {
          toast.info("No changes detected in Bank");
          dirtyRef.current.bank = false;
          setStepIndex(stepIndex + 1);
          return;
        }

        // 🔥 SEND FULL BANK PAYLOAD
        await submitChangeRequest("bank", fullBankPayload);
        dirtyRef.current.bank = false;
        setStepIndex(stepIndex + 1);
        return;
      }

      else {
        // diffPayload = getDiff(payload, originalPayload);
        diffPayload = payload;
      }

      /* -------------------- NO CHANGE GUARDS -------------------- */
      if (backendSection === "files") {
        diffPayload = payload;   // 🔥 FULL PAYLOAD
      }

      if (backendSection === "files" && Object.keys(payload).length === 0) {
        toast.info("No files selected");
        // setStepIndex(stepIndex + 1);
        return;
      }

      delete originalPayload.branch_id;

      if (backendSection === "branch" && Object.keys(diffPayload).length === 0) {
        toast.info("No changes detected in this branch");

        if (branchCount < totalBranches) {
          setBranchCount((c) => c + 1);
          return;
        }

        return;
      }

      if (Object.keys(diffPayload).length === 0) {
        toast.info(
          backendSection === "store"
            ? "No changes detected in Store"
            : "No changes detected"
        );
        return;
      }

      if (backendSection === "branch" && !extra.branch_id) {
        console.warn("Skipping empty new branch without changes");
      }

      if (
        backendSection !== "files" &&
        Object.keys(diffPayload).length === 0
      ) {
        console.warn("🛑 Blocked empty change request:", backendSection);
        return;
      }

      /* -------------------- SUBMIT -------------------- */
      try {
        await submitChangeRequest(
          backendSection,
          diffPayload,
          extra
        );
        toast.info("Changes sent to admin for approval");
      } catch (err) {
        console.error("Change request error:", err);
        toast.error("Failed to send changes to admin");
        return;
      }

      if (backendSection === "branch") {
        if (branchCount < totalBranches) {
          setBranchCount((c) => c + 1);
          return;
        }

        setStepIndex(stepIndex + 1);
        return;
      }

      setStepIndex(stepIndex + 1);
      return;
    }

    if (stepIndex === steps.length - 1) {
      handleFinalSubmit();
      return;
    }

    setStepIndex(stepIndex + 1);
  };

  const handleBack = () => setStepIndex((i) => Math.max(0, i - 1));

  const handleFinalSubmit = async () => {
    let okAll = true;

    ["basic", "org", "address", "bank", "attachments", "store"].forEach((sk) => {
      if (!validateStep(sk)) okAll = false;
    });

    if (!validateAllBranches()) okAll = false;

    if (!okAll) {
      alert("Please fill all required fields before final submission.");
      return;
    }

    try {
      setSaveStatus("Saving...");

      const filesBase64 = {};
      for (const [key, file] of Object.entries(form.files)) {
        filesBase64[key] = await toBase64(file);
      }

      /* ===================== SUPPLIER ===================== */
      if (roleLower === "supplier") {

        if (!id) {
          alert("Supplier ID missing. Complete Organization step first.");
          return;
        }

        const storeForServer = {
          storeNameEnglish: (form.store.storeNameEnglish || "").trim(),
          storeNameArabic: (form.store.storeNameArabic || "").trim(),
          contactPersonName: (form.store.contactPersonName || "").trim(),
          contactPersonMobile: String(form.store.contactPersonMobile || "").replace(/\D/g, ""),
          storeEmail: (form.store.storeEmail || "").trim(),
          street: (form.store.street || "").trim(),
          zone: (form.store.zone || "").trim(),
          building: (form.store.building || "").trim(),
          shopNo: (form.store.shopNo || "").trim(),
          operatingHours: (form.store.operatingHours || "").trim(),
          storeType: form.store.storeType || "",
          deliveryPickupAvailability: form.store.deliveryPickupAvailability || "",
          city: (form.store.city || "").trim(),
          country: (form.store.country || "").trim(),
        };

        const r = await fetch("http://192.168.2.9:5000/api/profile/supplier/store", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            supplier_id: id,
            supplierName: form.companyName,
            companyName: form.companyName,
            branchName: form.store.branchName,
            store: storeForServer,
          }),
        });


        const j = await r.json();
        if (!j.status) throw new Error(j.message || "Store save failed");

        toast.success("Supplier profile saved successfully!");
        setEditMode(false);

        if (adminEdit) {
          navigate("/Dashboard");
        } else {
          navigate("/dashboard");
        }

        return;
      }

      /* ===================== RESTAURANT ===================== */
      if (roleLower === "restaurant") {

        if (!id) {
          alert("Restaurant ID missing. Complete Organization step first.");
          return;
        }

        const restaurantStoreServer = {
          storeNameEnglish: form.store.storeNameEnglish,
          storeNameArabic: form.store.storeNameArabic,
          contactPersonName: form.store.contactPersonName,
          contactPersonMobile: String(form.store.contactPersonMobile || "").replace(/\D/g, ""),
          storeEmail: form.store.storeEmail,
          street: form.store.street,
          zone: form.store.zone,
          city: form.store.city,
          country: form.store.country,
          building: form.store.building,
          shopNo: form.store.shopNo || "",
          operatingHours: form.store.operatingHours || "",
          branchName: form.store.branchName || "",
        };

        const r = await fetch("http://192.168.2.9:5000/api/profile/restaurant/store", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            restaurant_id: id,
            restaurantName: form.companyName,
            store: restaurantStoreServer,
          }),
        });


        const j = await r.json();
        if (!j.status) throw new Error(j.message || "Store save failed");

        toast.success("Restaurant profile saved successfully!");
        setEditMode(false);

        if (adminEdit) {
          navigate("/Dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Save failed: " + err.message);
      setSaveStatus("Error");
    }
  };

  const handleBranchBackStep = () => {
    if (branchCount > 1) setBranchCount((p) => p - 1);
  };

  const handleFileChange = (key) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm((f) => ({
      ...f,
      files: {
        ...f.files,
        [key]: file,
      },
    }));

    setFileNames((n) => ({ ...n, [key]: file.name }));

    const previewUrl = URL.createObjectURL(file);

    setLocalFilePreview((p) => ({
      ...p,
      [key]: previewUrl,
    }));
  };

  const safeFetch = async (url) => {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`

        },
      });

      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error("Fetch error:", err);
      return null;
    }
  };

  const loadFullProfile = useCallback(async () => {
    if (!id || !roleLower) return;

    const base = `${API_PROFILE}/${roleLower}`;

    const endpoints = {
      basic: `${base}/basic/${id}`,
      org: `${base}/org/${id}`,
      address: `${base}/address/${id}`,
      bank: `${base}/bank/${id}`,
      files: `${base}/files/${id}`,
      branches: `${base}/branch/${id}`,
      store: `${base}/store/${id}`
    };

    const data = {};

    for (const [key, url] of Object.entries(endpoints)) {
      data[key] = await safeFetch(url);
    }

    hydrateForm(data);
  }, [roleLower, id]);

  useEffect(() => {
    if (currentStepKey !== "store") return;
    if (!branchDropdown || branchDropdown.length === 0) return;

    // 🔥 DO NOT override admin while editing
    if (adminEdit && editMode) return;

    setForm((f) => {
      if (f.store.branchName && branchDropdown.includes(f.store.branchName)) {
        return f;
      }

      return {
        ...f,
        store: {
          ...f.store,
          branchName: branchDropdown[0],
        },
      };
    });
  }, [branchDropdown, currentStepKey, adminEdit, editMode]);


  useEffect(() => {
    console.log("✅ STORE ID:", form.store.store_id);
  }, [form.store.store_id]);

  const hydrateForm = (data) => {
    setForm((f) => ({
      ...f,

      fullName: f.fullName || data.basic?.fullName || "",
      companyName: f.companyName || data.basic?.companyName || "",
      email: f.email || data.basic?.email || "",
      phone: f.phone || data.basic?.phone || "",

      org_companyName_auto:
        f.org_companyName_auto || data.basic?.companyName || "",
      crNumber: f.crNumber || data.org?.data?.cr_number || "",
      crExpiry: f.crExpiry || data.org?.data?.cr_expiry_date || "",
      compCardNumber:
        f.compCardNumber || data.org?.data?.computer_card_number || "",
      compCardExpiry:
        f.compCardExpiry || data.org?.data?.computer_card_expiry_date || "",
      signingAuthority:
        f.signingAuthority || data.org?.data?.signing_authority_name || "",
      sponsorName: f.sponsorName || data.org?.data?.sponsor_name || "",
      tradeLicenseName:
        f.tradeLicenseName || data.org?.data?.trade_license_name || "",
      vatNumber: f.vatNumber || data.org?.data?.vat_tax_number || "",
      category: f.category || data.org?.data?.category || "",
      brandName: f.brandName || data.org?.data?.brand_name || "",
      org_companyEmail:
        f.org_companyEmail || data.org?.data?.company_email || "",

      address: f.address || data.address?.address || "",
      street: f.street || data.address?.street || "",
      zone: f.zone || data.address?.zone || "",
      area: f.area || data.address?.area || "",
      city: f.city || data.address?.city || "",
      country: f.country || data.address?.country || "",

      bankName: f.bankName || data.bank?.data?.bank_name || "",
      iban: f.iban || data.bank?.data?.iban || "",
      accountHolder:
        f.accountHolder || data.bank?.data?.account_holder_name || "",
      swiftCode: f.swiftCode || data.bank?.data?.swift_code || "",
      branch: f.branch || data.bank?.data?.branch || "",

      store: {
        ...f.store,
        branchName:
          f.store.branchName ||
          data.store?.data?.branch_name ||
          "",

        store_id:
          data.store?.data?.store_id ??
          data.store?.store_id ??
          f.store.store_id ??
          null,

        storeNameEnglish:
          f.store.storeNameEnglish ||
          data.store?.data?.store_name_english ||
          "",
        storeNameArabic:
          f.store.storeNameArabic ||
          data.store?.data?.store_name_arabic ||
          "",
        contactPersonName:
          f.store.contactPersonName ||
          data.store?.data?.contact_person_name ||
          "",
        contactPersonMobile:
          f.store.contactPersonMobile ||
          data.store?.data?.contact_person_mobile ||
          "",
        storeEmail:
          f.store.storeEmail || data.store?.data?.email || "",
        street: f.store.street || data.store?.data?.street || "",
        zone: f.store.zone || data.store?.data?.zone || "",
        city: f.store.city || data.store?.data?.city || "",          // ✅ ADD
        country: f.store.country || data.store?.data?.country || "",// ✅ ADD
        building: f.store.building || data.store?.data?.building || "",
        shopNo: f.store.shopNo || data.store?.data?.shop_no || "",
        operatingHours:
          f.store.operatingHours ||
          data.store?.data?.operating_hours ||
          "",
        storeType:
          f.store.storeType || data.store?.data?.store_type || "",
        deliveryPickupAvailability:
          f.store.deliveryPickupAvailability ||
          data.store?.data?.delivery_pickup_availability ||
          "",
      },

      branches:
        f.branches?.length > 0
          ? f.branches
          : data.branches?.branches || f.branches,

      multiBranch:
        data.branches?.branches?.length > 1 ? "Yes" : f.multiBranch,
    }));

    if (data.files?.files) {
      const previews = {};
      const names = {};

      Object.entries(data.files.files).forEach(([key, file]) => {
        if (file?.preview) {
          previews[key] = file.preview;
        }

        names[key] =
          file?.filename ||
          `${key}.${file?.preview?.includes("pdf") ? "pdf" : "image"}`;
      });

      setServerFilePreview(previews);
      setFileNames(names);
    }
  };

  useEffect(() => {
    loadFullProfile();
  }, [loadFullProfile]);

  useEffect(() => {
    filesFetched.current = false;
  }, [role]);

  useEffect(() => {
    orgFetched.current = false;
    filesFetched.current = false;
    branchesFetched.current = false;
  }, [role]);

  const renderUploadField = (key, label) => {
    const previewSrc =
      localFilePreview[key] || serverFilePreview[key];

    return (
      <div className="field upload-field" key={key}>
        <label>{label}</label>

        <input
          type="file"
          id={`file-${key}`}
          className="hidden-file-input"
          accept=".pdf,image/*"
          onChange={handleFileChange(key)}
        />

        <div className="attachment-column">
          {editMode && (
            <button
              type="button"
              className="attachment-pill"
              onClick={() =>
                document.getElementById(`file-${key}`).click()
              }
            >
              Choose File
            </button>
          )}

          {fileNames[key] && (
            <div className="filename-box">{fileNames[key]}</div>
          )}

          {previewSrc && (
            <div className="image-preview-row">
              {previewSrc.includes(".pdf") ? (
                <iframe
                  src={previewSrc}
                  title="pdf-preview"
                  className="pdf-preview"
                />
              ) : (
                <img
                  src={previewSrc}
                  alt="preview"
                  className="image-preview"
                />
              )}
            </div>
          )}

          {localFilePreview[key] && (
            <small style={{ color: "orange" }}>
              Pending admin approval
            </small>
          )}
        </div>

        {errors[key] && (
          <div className="field-error">{errors[key]}</div>
        )}
      </div>
    );
  };

  return (
    <div className="profile-setup-container">

      <ToastContainer position="top-right" autoClose={3000} />

      {showStoreMapModal && (
        <div className="map-modal-overlay">
          <div className="map-modal-content">

            <p>Search and pick address — fields auto-fill automatically.</p>

            <MapContainer
              center={[
                storeMarkerPosition?.lat || 25.276987,
                storeMarkerPosition?.lng || 51.520008,
              ]}
              zoom={13}
              zoomControl={false}
              style={{ height: "400px", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              <LocationMarker
                editable={editMode}
                markerPosition={storeMarkerPosition}
                setMarkerPosition={setStoreMarkerPosition}
                tempFormData={storeTempAddress}
                setTempFormData={setStoreTempAddress}
              />
            </MapContainer>

            <button
              onClick={() => {
                if (!editMode) return;

                setForm((f) => ({
                  ...f,
                  store: { ...f.store, ...storeTempAddress },
                }));
                setShowStoreMapModal(false);
              }}
              disabled={!editMode}
              style={{
                marginTop: "10px",
                background: editMode ? "#ff8c00" : "#ccc",
                color: "#fff",
                padding: "12px 16px",
                borderRadius: 6,
                border: "none",
                width: "100%",
                cursor: editMode ? "pointer" : "not-allowed",
              }}
            >
              Done
            </button>

            <button
              onClick={() => setShowStoreMapModal(false)}
              style={{
                marginTop: "10px",
                background: "#ccc",
                padding: "12px 16px",
                borderRadius: 6,
                width: "100%",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="profile-header">
        <CircleProgress progress={progress} />
        <h2>
          {roleLower === "supplier"
            ? "Complete Your Supplier Profile"
            : roleLower === "restaurant"
              ? "Complete Your Restaurant Profile"
              : "Complete Your Profile"}
        </h2>

        {!editMode && !adminEdit && (
          <button
            className="btn btn-primary"
            style={{ marginTop: 10 }}
            onClick={() => setEditMode(true)}
          >
            ✏️ Edit Profile
          </button>
        )}

        {editMode && (
          <span style={{ color: "#ff9800", fontWeight: 600 }}>
            Editing enabled
          </span>
        )}

        <p className="save-status">{saveStatus}</p>
      </div>

      <div className="profile-body">
        {/* LEFT MENU */}
        <aside className="left-menu">
          <h3>Profile</h3>

          {steps.map((step, i) => (
            <div
              key={step}
              className={`menu-item ${currentStepKey === step ? "active" : ""}`}
              onClick={() => setStepIndex(i)}
            >
              {i === 0 && <FaCheckCircle />}
              {["org", "address", "branch"].includes(step) && <FaRegAddressBook />}
              {step === "bank" && <FaMoneyBill />}
              {step === "attachments" && <FaFileUpload />}
              {step === "store" && <FaMapMarkerAlt />}
              {step === "org"
                ? roleLower === "supplier"
                  ? "Supplier Info"
                  : "Restaurant Info"
                : step === "branch"
                  ? roleLower === "supplier"
                    ? "Supplier Branch"
                    : "Restaurant Branch"
                  : step === "store"
                    ? roleLower === "supplier"
                      ? "Supplier Store"
                      : "Restaurant Store"
                    : step.charAt(0).toUpperCase() + step.slice(1)}
            </div>
          ))}
        </aside>

        {/* RIGHT PANEL */}
        <section className="right-panel">
          {/* ---------------- BASIC STEP ---------------- */}
          {currentStepKey === "basic" && (
           <div className="profile-card">
              <h3 className="profile-title">Basic Info</h3>

              <form className="profile-form">

                {/* ROW 1 */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      value={form.fullName}
                      onChange={handleChange("fullName")}
                      readOnly
                      className="readonly-field"
                    />
                  </div>

                  <div className="form-group">
                    <label>Company Name</label>
                    <input
                      value={form.companyName}
                      onChange={handleChange("companyName")}
                      readOnly
                      className="readonly-field"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      value={form.email}
                      onChange={handleChange("email")}
                      readOnly
                      className="readonly-field"
                    />
                  </div>
                </div>

                {/* ROW 2 */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      value={form.phone}
                      onChange={handleChange("phone")}
                      readOnly
                      className="readonly-field"
                    />
                  </div>

                  <div className="form-group">
                    <label>Profile Type</label>
                    <input
                      value={capitalize(form.profileType)}
                      readOnly
                      className="readonly-field"
                    />
                  </div>
                </div>

              </form>
            </div>
          )}

          {/* ------------ ORG STEP ---------------- */}
          {currentStepKey === "org" && (
           <div className="profile-card">
            <h3 className="profile-title">
              {roleLower === "supplier" ? "Supplier Info" : "Restaurant Info"}
            </h3>

            <form className="profile-form">

              {/* ROW 1 */}
              <div className="form-row three-col">
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    value={form.org_companyName_auto}
                    onChange={handleChange("org_companyName_auto")}
                    readOnly
                    className="readonly-field"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    value={form.org_companyEmail}
                    onChange={handleChange("org_companyEmail")}
                    readOnly
                    className="readonly-field"
                  />
                </div>

                <div className="form-group">
                  <label>CR Number</label>
                  <input
                    value={form.crNumber}
                    onChange={(e) => {
                      markDirty("org");
                      const v = e.target.value.replace(/\D/g, "");
                      handleChange("crNumber")({ target: { value: v } });
                    }}
                    maxLength={10}
                    {...ro}
                  />
                  <small className="hint">Digits only (6–10 numbers)</small>
                </div>
              </div>

              {/* ROW 2 */}
              <div className="form-row three-col">
                <div className="form-group">
                  <label>CR Expiry</label>
                  <input
                    type="date"
                    value={form.crExpiry}
                    onChange={handleChange("crExpiry")}
                    {...ro}
                  />
                </div>

                <div className="form-group">
                  <label>Computer Card Number</label>
                  <input
                    value={form.compCardNumber}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      handleChange("compCardNumber")({ target: { value: v } });
                    }}
                    maxLength={12}
                    {...ro}
                  />
                  <small className="hint">Digits only (7–12 numbers)</small>
                </div>

                <div className="form-group">
                  <label>Computer Card Expiry</label>
                  <input
                    type="date"
                    value={form.compCardExpiry}
                    onChange={handleChange("compCardExpiry")}
                    {...ro}
                  />
                </div>
              </div>

              {/* ROW 3 */}
              <div className="form-row three-col">
                <div className="form-group">
                  <label>Signing Authority</label>
                  <input
                    value={form.signingAuthority}
                    onChange={handleChange("signingAuthority")}
                    {...ro}
                  />
                </div>

                <div className="form-group">
                  <label>Sponsor Name</label>
                  <input
                    value={form.sponsorName}
                    onChange={handleChange("sponsorName")}
                    {...ro}
                  />
                </div>

                <div className="form-group">
                  <label>Trade License Name</label>
                  <input
                    value={form.tradeLicenseName}
                    onChange={handleChange("tradeLicenseName")}
                    {...ro}
                  />
                  <small className="hint">Must match trade license exactly</small>
                </div>
              </div>

              {/* ROW 4 */}
              <div className="form-row three-col">
                <div className="form-group">
                  <label>VAT Number</label>
                  <input
                    value={form.vatNumber}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      handleChange("vatNumber")({ target: { value: v } });
                    }}
                    maxLength={15}
                    {...ro}
                  />
                  <small className="hint">15-digit VAT number</small>
                </div>

                {roleLower === "supplier" && (
                  <>
                    <div className="form-group">
                      <label>Category</label>
                      <input
                        value={form.category}
                        onChange={handleChange("category")}
                        {...ro}
                      />
                    </div>

                    <div className="form-group">
                      <label>Brand Name</label>
                      <input
                        value={form.brandName}
                        onChange={handleChange("brandName")}
                        {...ro}
                      />
                    </div>
                  </>
                )}
              </div>

            </form>
          </div>
          )}

          {/* ------------- ADDRESS STEP ------------- */}
          {currentStepKey === "address" && (
            <div className="profile-card">
          <h3 className="profile-title">Address</h3>

          <form className="profile-form">

            {/* ROW 1 */}
            <div className="form-row three-col">
              <div className="form-group">
                <label>Address</label>
                <input
                  value={form.address}
                  onChange={handleChange("address")}
                  {...ro}
                />
              </div>

              <div className="form-group">
                <label>Street</label>
                <select
                  value={form.street}
                  onChange={handleChange("street")}
                  {...ro}
                >
                  <option value="">-- Select --</option>
                  {masterData.street.map((s, i) => (
                    <option key={i} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Zone</label>
                <select
                  value={form.zone}
                  onChange={handleChange("zone")}
                  {...ro}
                >
                  <option value="">-- Select --</option>
                  {masterData.zone.map((z, i) => (
                    <option key={i} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ROW 2 */}
            <div className="form-row three-col">
              <div className="form-group">
                <label>Area</label>
                <select
                  value={form.area}
                  onChange={handleChange("area")}
                  {...ro}
                >
                  <option value="">-- Select --</option>
                  {masterData.area.map((a, i) => (
                    <option key={i} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>City</label>
                <input
                  value={form.city}
                  onChange={handleChange("city")}
                  placeholder="Enter city"
                  readOnly
                  className="readonly-field"
                />
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  value={form.country}
                  readOnly
                  className="readonly-field"
                />
              </div>
            </div>

          </form>
        </div>
          )}

          {/* ------------- BANK STEP ------------- */}
          {currentStepKey === "bank" && (
            <div className="profile-card">
  <h3 className="profile-title">Bank Details</h3>

  <form className="profile-form">

    {/* ROW 1 */}
    <div className="form-row three-col">
      <div className="form-group">
        <label>Bank Name</label>
        <input
          value={form.bankName}
          onChange={(e) => {
            markDirty("bank");
            handleChange("bankName")(e);
          }}
          {...ro}
        />
      </div>

      <div className="form-group">
        <label>IBAN</label>
        <input
          value={form.iban}
          onChange={(e) => {
            markDirty("bank");
            const v = e.target.value.replace(/\s/g, "").toUpperCase();
            handleChange("iban")({ target: { value: v } });
          }}
          maxLength={34}
          {...ro}
        />
        <small className="hint">Country code + numbers (e.g. AE…)</small>
      </div>

      <div className="form-group">
        <label>Account Holder</label>
        <input
          value={form.accountHolder}
          onChange={(e) => {
            markDirty("bank");
            handleChange("accountHolder")(e);
          }}
          {...ro}
        />
      </div>
    </div>

    {/* ROW 2 */}
    <div className="form-row three-col">
      <div className="form-group">
        <label>Branch</label>
        <input
          value={form.branch}
          onChange={(e) => {
            markDirty("bank");
            handleChange("branch")(e);
          }}
          {...ro}
        />
      </div>

      <div className="form-group">
        <label>Swift Code</label>
        <input
          value={form.swiftCode}
          onChange={(e) => {
            markDirty("bank");
            const v = e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
            handleChange("swiftCode")({ target: { value: v } });
          }}
          maxLength={11}
          {...ro}
        />
        <small className="hint">8 or 11 characters</small>
      </div>
    </div>

  </form>
</div>
          )}

          {/* -------------- ATTACHMENTS STEP ---------------- */}
          {currentStepKey === "attachments" && (
            <div className="profile-card">
              <h3 className="profile-title">Attachments</h3>

              <form className="profile-form">

                <div className="upload-grid">
                  {renderUploadField("crCopy", "CR Copy")}
                  {renderUploadField("compCardCopy", "Computer Card Copy")}
                  {renderUploadField("tradeLicenseCopy", "Trade License Copy")}
                  {renderUploadField("vatCertificate", "VAT Certificate")}
                  {renderUploadField("companyLogo", "Company Logo")}

                  {roleLower === "supplier" && (
                    <>
                      {renderUploadField("bankLetter", "Bank Letter")}
                      {renderUploadField("certificates", "Certificates")}
                    </>
                  )}

                  {roleLower === "restaurant" && (
                    <>
                      {renderUploadField("foodSafetyCertificate", "Food Safety Certificate")}
                    </>
                  )}
                </div>

              </form>
            </div>
          )}

          {/* -------------------- BRANCH STEP -------------------- */}
          {currentStepKey === "branch" && (
           <div className="profile-card">
            <h3 className="profile-title">
              {roleLower === "supplier"
                ? "Supplier Branch Registration"
                : "Restaurant Branch Registration"}
            </h3>

            <form className="profile-form">

              {/* MULTI BRANCH SELECTOR */}
              <div className="form-row">
                <div className="form-group">
                  <label>Multiple Branches?</label>
                  <div className="radio-group">
                    <label>
                      <input
                        type="radio"
                        value="No"
                        checked={form.multiBranch === "No"}
                        onChange={() => {
                          setForm((f) => ({ ...f, multiBranch: "No" }));
                          setTotalBranches(1);
                          setBranchCount(1);
                          setPendingBranches([]);
                        }}
                        {...ro}
                      />
                      No
                    </label>

                    <label>
                      <input
                        type="radio"
                        value="Yes"
                        checked={form.multiBranch === "Yes"}
                        onChange={() =>
                          setForm((f) => ({ ...f, multiBranch: "Yes" }))
                        }
                        {...ro}
                      />
                      Yes
                    </label>
                  </div>
                </div>

                {form.multiBranch === "Yes" && (
                  <div className="form-group">
                    <label>Total Branches</label>
                    <input
                      type="number"
                      min="1"
                      value={totalBranches}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10) || 1;
                        setTotalBranches(v);
                        setForm((f) => {
                          const updated = [...f.branches];
                          while (updated.length < v) {
                            updated.push({
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
                              branchLicense: null,
                            });
                          }
                          return { ...f, branches: updated.slice(0, v) };
                        });
                      }}
                      {...ro}
                    />
                  </div>
                )}
              </div>

              <div className="branch-box">
                <h4>
                  Branch {branchCount} of {totalBranches}
                </h4>

                {/* ROW 1 */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Branch Name EN</label>
                    <input
                      value={currentBranch.branchNameEn || ""}
                      onChange={(e) => {
                        const en = e.target.value;

                        handleBranchChange(branchCount - 1, "branchNameEn", en);

                        if (en.trim() === "") {
                          handleBranchChange(branchCount - 1, "branchNameAr", "");
                          return;
                        }

                        debouncedBranchTranslate(en, (ar) => {
                          handleBranchChange(branchCount - 1, "branchNameAr", ar);
                        });
                      }}
                      {...ro}
                    />
                  </div>

                  <div className="form-group">
                    <label>Branch Name AR</label>
                    <input
                      value={currentBranch.branchNameAr || ""}
                      readOnly
                      className="readonly-field"
                      dir="rtl"
                    />
                  </div>

                  <div className="form-group">
                    <label>Branch Manager</label>
                    <input
                      value={currentBranch.branchManager || ""}
                      onChange={(e) =>
                        handleBranchChange(
                          branchCount - 1,
                          "branchManager",
                          e.target.value
                        )
                      }
                      {...ro}
                    />
                  </div>
                </div>

                {/* ROW 2 */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Contact</label>
                    <input
                      value={currentBranch.contactNumber || ""}
                      onChange={(e) =>
                        handleBranchChange(
                          branchCount - 1,
                          "contactNumber",
                          e.target.value
                        )
                      }
                      {...ro}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      value={currentBranch.email || ""}
                      onChange={(e) =>
                        handleBranchChange(branchCount - 1, "email", e.target.value)
                      }
                      {...ro}
                    />
                  </div>

                  <div className="form-group">
                    <label>Street</label>
                    <input
                      value={currentBranch.street || ""}
                      onChange={(e) =>
                        handleBranchChange(branchCount - 1, "street", e.target.value)
                      }
                      {...ro}
                    />
                  </div>
                </div>

                {/* ROW 3 */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Zone</label>
                    <input
                      value={currentBranch.zone || ""}
                      onChange={(e) =>
                        handleBranchChange(branchCount - 1, "zone", e.target.value)
                      }
                      {...ro}
                    />
                  </div>

                  <div className="form-group">
                    <label>Building</label>
                    <input
                      value={currentBranch.building || ""}
                      onChange={(e) =>
                        handleBranchChange(branchCount - 1, "building", e.target.value)
                      }
                      {...ro}
                    />
                  </div>

                  <div className="form-group">
                    <label>Office No</label>
                    <input
                      value={currentBranch.officeNo || ""}
                      onChange={(e) =>
                        handleBranchChange(branchCount - 1, "officeNo", e.target.value)
                      }
                      {...ro}
                    />
                  </div>
                </div>

                {/* ROW 4 */}
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      value={currentBranch.city || ""}
                      onChange={(e) =>
                        handleBranchChange(branchCount - 1, "city", e.target.value)
                      }
                      {...ro}
                    />
                  </div>

                  <div className="form-group">
                    <label>Country</label>
                    <input
                      value={currentBranch.country || ""}
                      onChange={(e) =>
                        handleBranchChange(branchCount - 1, "country", e.target.value)
                      }
                      {...ro}
                    />
                  </div>

                  {roleLower === "supplier" && (
                    <div className="form-group">
                      <label>Branch License</label>
                      <input
                        type="text"
                        value={currentBranch.branchLicense || ""}
                        onChange={(e) =>
                          handleBranchChange(
                            branchCount - 1,
                            "branchLicense",
                            e.target.value.toUpperCase()
                          )
                        }
                        {...ro}
                      />
                      <small className="hint">
                        Issued by authority for this branch
                      </small>
                    </div>
                  )}
                </div>
              </div>

              {editMode && (
                <div className="form-actions">
                  {branchCount > 1 && (
                    <button
                      type="button"
                      className="btn-secondary btn"
                      onClick={handleBranchBackStep}
                    >
                      Previous Branch
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleSaveNext}
                  >
                    {branchCount < totalBranches
                      ? "Save & Next Branch"
                      : "Finish Branches"}
                  </button>
                </div>
              )}

            </form>
          </div>
          )}

          {currentStepKey === "store" && (
           <div className="profile-card">
  <h3 className="profile-title">
    {roleLower === "supplier"
      ? "Supplier Store Registration"
      : "Restaurant Store Registration"}
  </h3>

  <form className="profile-form">

    {/* ROW 1 */}
    <div className="form-row">
      {(roleLower === "supplier" || roleLower === "restaurant") && (
        <div className="form-group">
          <label>Select Branch</label>
          <select
            value={form.store.branchName || ""}
            onChange={handleStoreChange("branchName")}
            {...ro}
          >
            <option value="">-- Select Branch --</option>

            {branchDropdown.map((b, idx) => (
              <option key={idx} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label>Store Name (English)</label>
        <input
          value={form.store.storeNameEnglish}
          onChange={(e) => {
            const en = e.target.value;

            handleStoreChange("storeNameEnglish")(e);

            if (en.trim() === "") {
              handleStoreChange("storeNameArabic")({
                target: { value: "" },
              });
              return;
            }

            debouncedStoreTranslate(en, (ar) => {
              handleStoreChange("storeNameArabic")({
                target: { value: ar },
              });
            });
          }}
          {...ro}
        />
      </div>

      <div className="form-group">
        <label>Store Name (Arabic)</label>
        <input
          value={form.store.storeNameArabic}
          readOnly
          dir="rtl"
          style={{ textAlign: "right" }}
          className="readonly-field"
        />
      </div>
    </div>

    {/* ROW 2 */}
    <div className="form-row">
      <div className="form-group">
        <label>Contact Person Name</label>
        <input
          value={form.store.contactPersonName}
          onChange={handleStoreChange("contactPersonName")}
          {...ro}
        />
      </div>

      <div className="form-group">
        <label>Contact Person Mobile</label>
        <input
          value={form.store.contactPersonMobile}
          onChange={handleStoreChange("contactPersonMobile")}
          {...ro}
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          value={form.store.storeEmail}
          onChange={handleStoreChange("storeEmail")}
          {...ro}
        />
      </div>
    </div>

    {/* ROW 3 */}
    <div className="form-row">
      <div className="form-group">
        <label>Street</label>

        <div className="street-row">
          <input
            value={form.store.street}
            onChange={handleStoreChange("street")}
            style={{ flex: 1 }}
            {...ro}
          />

          <FaMapMarkerAlt
            className={`map-icon ${!editMode ? "disabled" : ""}`}
            onClick={() => {
              if (!editMode) return;

              setStoreTempAddress({
                street: form.store.street || "",
                zone: form.store.zone || "",
                city: form.store.city || "",
                country: form.store.country || "",
              });
              setStoreMarkerPosition(null);
              setShowStoreMapModal(true);
            }}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Zone</label>
        <input
          value={form.store.zone}
          onChange={handleStoreChange("zone")}
          {...ro}
        />
      </div>

      <div className="form-group">
        <label>City</label>
        <input
          value={form.store.city}
          onChange={handleStoreChange("city")}
          {...ro}
        />
      </div>
    </div>

    {/* ROW 4 */}
    <div className="form-row">
      <div className="form-group">
        <label>Country</label>
        <input
          value={form.store.country}
          onChange={handleStoreChange("country")}
          {...ro}
        />
      </div>

      <div className="form-group">
        <label>Building</label>
        <input
          value={form.store.building}
          onChange={handleStoreChange("building")}
          {...ro}
        />
      </div>

      <div className="form-group">
        <label>Shop No.</label>
        <input
          value={form.store.shopNo}
          onChange={(e) => {
            const cleaned = e.target.value.replace(/\D/g, "");
            handleStoreChange("shopNo")({
              target: { value: cleaned },
            });
          }}
          {...ro}
        />
      </div>
    </div>

    {/* ROW 5 */}
    <div className="form-row">
      <div className="form-group">
        <label>Operating Hours</label>
        <input
          value={form.store.operatingHours}
          onChange={handleStoreChange("operatingHours")}
          placeholder="9:00 AM - 6:00 PM"
          {...ro}
        />
      </div>

      {roleLower === "supplier" && (
        <>
          <div className="form-group">
            <label>Store Type</label>
            <select
              value={form.store.storeType}
              onChange={handleStoreChange("storeType")}
              {...ro}
            >
              <option value="">Select</option>
              <option value="Warehouse">Warehouse</option>
              <option value="Retail">Retail</option>
              <option value="Distribution">Distribution</option>
            </select>
          </div>

          <div className="form-group">
            <label>Delivery/Pickup Availability</label>
            <select
              value={form.store.deliveryPickupAvailability}
              onChange={handleStoreChange("deliveryPickupAvailability")}
              {...ro}
            >
              <option value="">Select</option>
              <option value="Delivery">Delivery</option>
              <option value="Pickup">Pickup</option>
              <option value="Both">Both</option>
            </select>
          </div>
        </>
      )}
    </div>

  </form>
</div>
          )}

          {/* {editMode && ( */}
          {editMode && currentStepKey !== "branch" && (

            <div className="button-row" style={{ marginTop: 16 }}>
              {stepIndex > 0 && (
                <button className="btn btn-secondary" onClick={handleBack}>
                  Back
                </button>
              )}

              <button className="btn btn-primary" onClick={handleSaveNext}>
                {stepIndex === steps.length - 1 ? "Submit" : "Save & Next"}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}