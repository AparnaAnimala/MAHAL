import React, { useEffect, useState, useCallback } from "react";
import "../css/AdminProfileChanges.css";
export default function AdminProfileChanges() {

  const camelToSnake = (key) =>
    key.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase());
  const ADMIN_TOKEN = localStorage.getItem("admin_token");

  useEffect(() => {
    if (!ADMIN_TOKEN) {
      console.error("❌ Admin token missing in localStorage");
      alert("Session expired. Please login again.");
      window.location.href = "/admin/login";
    }
  }, [ADMIN_TOKEN]);

  const CANONICAL_KEY_MAP = React.useMemo(() => ({
    cr_expiry: "cr_expiry_date",
    cr_expiry_date: "cr_expiry_date",

    comp_card_number: "computer_card_number",
    computer_card_number: "computer_card_number",

    comp_card_expiry: "computer_card_expiry_date",
    computer_card_expiry_date: "computer_card_expiry_date",

    vat_number: "vat_tax_number",
    vat_tax_number: "vat_tax_number",

    signing_authority: "signing_authority_name",
    signing_authority_name: "signing_authority_name",

    companyName: "company_name_english",
    company_name: "company_name_english",

    org_companyEmail: "company_email",
    org_company_email: "company_email",
    company_email: "company_email",
    restaurant_email_address: "company_email",
    contact_person_email: "company_email",
    restaurant_name_english: "company_name_english",

    street: "street",
    zone: "zone",
    area: "area",
    city: "city",
    country: "country",
    address: "address",

    streetName: "street",
    zoneName: "zone",
    areaName: "area",
    cityName: "city",
    countryName: "country",

    bank_name: "bank_name",
    bankName: "bank_name",

    bank_branch: "bank_branch",
    branch: "bank_branch",

    account_holder: "account_holder_name",
    account_holder_name: "account_holder_name",
    accountHolder: "account_holder_name",

    swift_code: "swift_code",
    swiftCode: "swift_code",

    iban: "iban",

    branch_name_english: "branch_name_english",
    branchNameEn: "branch_name_english",

    branch_name_arabic: "branch_name_arabic",
    branchNameAr: "branch_name_arabic",

    branch_manager_name: "branch_manager_name",
    branchManager: "branch_manager_name",

    contact_number: "contact_number",
    contactNumber: "contact_number",

    office_no: "office_no",
    officeNo: "office_no",
    office_number: "office_no",

    branch_license: "branch_license",
    branchLicense: "branch_license",

    store_name_english: "store_name_english",
    storeNameEnglish: "store_name_english",

    store_name_arabic: "store_name_arabic",
    storeNameArabic: "store_name_arabic",

    contact_person_name: "contact_person_name",
    contactPersonName: "contact_person_name",

    contact_person_mobile: "contact_person_mobile",
    contactPersonMobile: "contact_person_mobile",

    email: "email",
    storeEmail: "email",

    shop_no: "shop_no",
    shopNo: "shop_no",

    store_type: "store_type",
    storeType: "store_type",

    operating_hours: "operating_hours",
    operatingHours: "operating_hours",

    delivery_pickup_availability: "delivery_pickup_availability",
    deliveryPickupAvailability: "delivery_pickup_availability",

    branchName: "branch_name_english",
    branch_name: "branch_name_english",
  }), []);

  const FILE_KEY_MAP = {
    crCopy: "upload_cr_company",
    upload_cr_company: "upload_cr_company",
    upload_cr_copy: "upload_cr_company",

    compCardCopy: "upload_computer_card_copy",
    upload_computer_card_copy: "upload_computer_card_copy",

    tradeLicenseCopy: "upload_trade_license_copy",
    upload_trade_license_copy: "upload_trade_license_copy",

    vatCertificate: "upload_vat_certificates_copy",
    upload_vat_certificates_copy: "upload_vat_certificates_copy",
    upload_vat_certificate_copy: "upload_vat_certificates_copy",

    companyLogo: "upload_company_logo",
    upload_company_logo: "upload_company_logo",

    bankLetter: "upload_bank_letter",
    upload_bank_letter: "upload_bank_letter",

    certificates: "certificates",

    foodSafetyCertificate: "upload_food_safety_certificate",
    upload_food_safety_certificate: "upload_food_safety_certificate"
  };

  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const selectedItem = items.find(i => i.id === selectedId) || null;
  const [loading, setLoading] = useState(false);
  const [previewModal, setPreviewModal] = useState({
    open: false,
    title: "",
    oldSrc: null,
    newSrc: null,
  });
  const normalizeByCanonicalMap = React.useCallback(
    (data = {}) =>
      Object.fromEntries(
        Object.entries(data).map(([k, v]) => {
          const isSnake = k.includes("_");
          const snakeKey = isSnake ? k : camelToSnake(k);

          const finalKey =
            CANONICAL_KEY_MAP[snakeKey] ||
            CANONICAL_KEY_MAP[k] ||
            snakeKey;

          return [
            finalKey,
            v ?? data[finalKey] ?? null
          ];
        })
      ),
    [CANONICAL_KEY_MAP]
  );

  let processedNewData = selectedItem?.new_data || {};

  const normalizeFiles = (data = {}) => {
    const normalized = {};

    Object.keys(data).forEach((key) => {
      let value = data[key];

      // if (typeof value === "string") {
      //   try {
      //     value = JSON.parse(value);
      //   } catch (e) {
      //     console.error("❌ JSON parse failed:", key, value);
      //   }
      // }

      if (
        typeof value === "string" &&
        (value.startsWith("{") || value.startsWith("["))
      ) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          console.error("❌ JSON parse failed:", key, value);
        }
      }

      const mappedKey = FILE_KEY_MAP[key] || key;
      normalized[mappedKey] = value;
    });
    return normalized;
  };

  processedNewData = normalizeFiles(processedNewData);
  console.log("🔥 AFTER NORMALIZE NEW:", processedNewData);

  if (selectedItem?.section === "store") {
    if (processedNewData?.stores?.length > 0) {
      processedNewData = processedNewData.stores[0].data || {};
    }
  }

  let processedOldData = selectedItem?.old_data || {};


  if (selectedItem?.section === "store") {
    if (Array.isArray(processedOldData) && processedOldData.length > 0) {
      processedOldData = processedOldData[0];
    }
  }

  processedOldData = normalizeFiles(processedOldData);
  console.log("🔥 AFTER NORMALIZE OLD:", processedOldData);

  if (selectedItem?.section === "store") {
    if (Array.isArray(processedOldData) && processedOldData.length > 0) {
      processedOldData = processedOldData[0];
    }
  }

  const normalizedNew = normalizeByCanonicalMap(processedNewData);
  const normalizedOld = normalizeByCanonicalMap(processedOldData);

  const isBranchSection = selectedItem?.section === "branch";

  const branchChanges = isBranchSection
    ? (
      Array.isArray(selectedItem?.new_data?.branches)
        ? selectedItem.new_data.branches
        : Array.isArray(selectedItem?.new_data)
          ? selectedItem.new_data
          : []   // 🔥 fallback
    )
    : [];

  const oldBranches = isBranchSection
    ? (
      Array.isArray(selectedItem?.old_data)
        ? selectedItem.old_data
        : selectedItem?.old_data?.branches || []
    )
    : [];

  const oldFiles = React.useMemo(() => {
    return selectedItem?.old_data || {};
  }, [selectedItem]);

  const newFiles = React.useMemo(() => {
    return selectedItem?.new_data || {};
  }, [selectedItem]);

  const normalizedOldFiles = normalizeFiles(oldFiles);
  const normalizedNewFiles = normalizeFiles(newFiles);
  console.log("🔥 OLD FILES:", normalizedOldFiles);
  console.log("🔥 NEW FILES:", normalizedNewFiles);

  const fileKeys = Array.from(
    new Set([
      ...Object.keys(normalizedOldFiles),
      ...Object.keys(normalizedNewFiles),
    ])
  );

  const SECTION_LABELS = {
    basic: "Basic Profile",
    org: "Organization",
    address: "Address",
    bank: "Bank",
    files: "Documents",
    branch: "Branch",
    store: "Store",
  };

  const FILE_LABELS = {
    upload_cr_company: "CR Copy",
    upload_computer_card_copy: "Computer Card",
    upload_trade_license_copy: "Trade License",
    upload_vat_certificates_copy: "VAT Certificate",
    upload_company_logo: "Company Logo",
    upload_bank_letter: "Bank Letter",
    certificates: "Certificates",
    upload_food_safety_certificate: "Food Safety Certificate",
  };

  const isRestaurant = (selectedItem?.role || "").toLowerCase() === "restaurant";

  const BRANCH_ALLOWED_FIELDS = [
    "branch_name_english",
    "branch_name_arabic",
    "branch_manager_name",
    "contact_number",
    "email",
    "street",
    "zone",
    "building",
    "office_no",
    "city",
    "country",
    ...(isRestaurant ? [] : ["branch_license"])
  ];

  const STORE_ALLOWED_FIELDS = [
    "branch_name_english",
    "store_name_english",
    "store_name_arabic",
    "contact_person_name",
    "contact_person_mobile",
    "email",
    "street",
    "zone",
    "building",
    "shop_no",
    "operating_hours",
    "city",
    "country",
    ...(isRestaurant ? [] : ["store_type", "delivery_pickup_availability"])
  ];

  const allKeys = Array.from(
    new Set([
      ...Object.keys(normalizedOld),
      ...Object.keys(normalizedNew),
    ])
  );

  const cleanedKeys = allKeys.filter(k => {

    if (k === "restaurant_name_english" && normalizedNew.company_name_english) return false;
    return true;
  });

  const baseKeys = cleanedKeys;

  const filteredKeys =
    selectedItem?.section === "branch"
      ? baseKeys.filter(k =>
        BRANCH_ALLOWED_FIELDS.includes(k) &&
        !((selectedItem?.role || "").toLowerCase() === "restaurant" && k === "branch_license")
      )
      : selectedItem?.section === "store"
        ? baseKeys.filter(k =>
          STORE_ALLOWED_FIELDS.includes(k) &&
          !((selectedItem?.role || "").toLowerCase() === "restaurant" &&
            ["store_type", "delivery_pickup_availability"].includes(k))
        )
        : (selectedItem?.role || "").toLowerCase() === "restaurant" && selectedItem?.section === "org"
          ? baseKeys.filter(k =>
            !["contact_person_name", "contact_person_mobile", "brand_name", "category"].includes(k)
          )
          : baseKeys;

  const normalizeFile = (file) => {
    if (!file) return null;

    if (file?.content && file?.mimetype) {
      return file;
    }

    if (file?.data) {
      const [meta, base64] = file.data.split(",");
      return {
        mimetype: meta.replace("data:", "").replace(";base64", ""),
        content: base64,
      };
    }

    if (file?.preview) {
      const [meta, base64] = file.preview.split(",");
      return {
        mimetype: meta.replace("data:", "").replace(";base64", ""),
        content: base64,
      };
    }

    return null;
  };

  const renderFilePreview = (file, key) => {
    const f = normalizeFile(file);

    if (!f) {
      return <i>Not available</i>;
    }

    const src = `data:${f.mimetype};base64,${f.content}`;

    /* ===== PDF ===== */
    if (f.mimetype === "application/pdf") {
      return (
        <div className="preview-wrapper">

          <iframe
            src={src}
            title={FILE_LABELS[key] || key}
            className="preview-pdf"
          />

          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="view-btn2"
          >
            View PDF
          </a>

        </div>
      );
    }

    /* ===== IMAGE ===== */
    return (
      <div className="preview-wrapper">

        <div className="image-preview-box">

          <button
            className="eye-btn"
            onClick={() => window.open(src, "_blank")}
          >
            👁
          </button>

          <img
            src={src}
            alt={FILE_LABELS[key] || key}
            className="preview-image"
          />

        </div>

      </div>
    );
  };

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/v1/admin/change-requests/pending",
        {
          headers: {
            Authorization: `Bearer ${ADMIN_TOKEN}`,
          },
        }
      );

      if (res.status === 401) {
        alert("Admin session expired. Please login again.");
        localStorage.removeItem("admin_token");
        window.location.href = "/admin/login";
        return;
      }

      const data = await res.json();

      if (data.status) {
        setItems(data.items);
      }
    } catch (err) {
      console.error("❌ Network error loading pending requests:", err);
    }
  }, [ADMIN_TOKEN]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!selectedItem) return;

    console.log("OLD:", selectedItem.old_data);
    console.log("NEW:", selectedItem.new_data);

    console.log(
      "NORMALIZED NEW:",
      normalizeByCanonicalMap(selectedItem.new_data)
    );
  }, [selectedItem, normalizeByCanonicalMap]);

  const approve = async (id) => {
    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/v1/admin/change-requests/${id}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ADMIN_TOKEN}`,
          },
        }
      );

      if (res.status === 401) {
        alert("Admin session expired. Please login again.");
        localStorage.removeItem("admin_token");
        window.location.href = "/admin/login";
        return;
      }

      if (!res.ok) {
        const text = await res.text();

        console.error("Approve failed:", text);
        alert("Approve failed");

        return;
      }

      await loadData();
      setSelectedId(null);
    } catch (err) {
      console.error("❌ Network error:", err);
      alert("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  const reject = async (id) => {
    const reason = prompt("Enter rejection reason:");

    if (!reason) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/v1/admin/change-requests/${id}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ADMIN_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (res.status === 401) {
        alert("Admin session expired. Please login again.");
        localStorage.removeItem("admin_token");
        window.location.href = "/admin/login";
        return;
      }

      if (!res.ok) {
        const text = await res.text();

        console.error("Reject failed:", text);
        alert("Reject failed");

        return;
      }

      setSelectedId(null);
      await loadData();
    } catch (err) {
      console.error("❌ Network error:", err);
      alert("Server not reachable");
    }
  };

  return (
    <div className="profile-container two-column">
      <h2 className="title">Pending Profile Change Requests</h2>

      {/* ===== TABLE ===== */}
      <div className="table-card">
        <table className="modern-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Role</th>
              <th>Entity ID</th>
              <th>Section</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="5">No pending requests</td>
              </tr>
            ) : (
              items.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>

                  <td>
                    <span className="role-badge">Restaurant</span>
                  </td>

                  <td>{r.entity_id}</td>

                  <td>
                    <span className="section-badge">
                      {SECTION_LABELS[r.section] || r.section}
                    </span>
                    {r.section === "branch" && r.target_row_id && (
                      <span> (ID: {r.target_row_id})</span>
                    )}
                  </td>

                  <td>
                    <button
                      className="btn12 view"
                      onClick={() => setSelectedId(r.id)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===== MODAL ===== */}
      {selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content">

            <button
              className="modal-close"
              onClick={() => setSelectedId(null)}
            >
              ✖
            </button>

            {selectedItem.section !== "files" ? (
              <>

                {/* ===== ALL OLD BRANCHES ===== */}
                {isBranchSection && oldBranches.length > 0 && (
                  <>
                    <h3 className="old-branches-title">
                      All Old Branches
                    </h3>

                    <div className="old-branches-grid">
                      {oldBranches.map((b, i) => {

                        const nb = normalizeByCanonicalMap(b);

                        return (
                          <div className="old-branch-card" key={i}>

                            <div className="old-branch-header">
                              Branch {i + 1}
                            </div>

                            <div className="old-branch-body">

                              <div>
                                <strong>Branch Name (EN):</strong>
                                <span>{nb.branch_name_english || "-"}</span>
                              </div>

                              <div>
                                <strong>Branch Name (AR):</strong>
                                <span>{nb.branch_name_arabic || "-"}</span>
                              </div>

                              <div>
                                <strong>Manager:</strong>
                                <span>{nb.branch_manager_name || "-"}</span>
                              </div>

                              <div>
                                <strong>Contact:</strong>
                                <span>{nb.contact_number || "-"}</span>
                              </div>

                              <div>
                                <strong>Email:</strong>
                                <span>{nb.email || "-"}</span>
                              </div>

                              <div>
                                <strong>Street:</strong>
                                <span>{nb.street || "-"}</span>
                              </div>

                              <div>
                                <strong>Zone:</strong>
                                <span>{nb.zone || "-"}</span>
                              </div>

                              <div>
                                <strong>Building:</strong>
                                <span>{nb.building || "-"}</span>
                              </div>

                              <div>
                                <strong>Office No:</strong>
                                <span>{nb.office_no || "-"}</span>
                              </div>

                              <div>
                                <strong>City:</strong>
                                <span>{nb.city || "-"}</span>
                              </div>

                              <div>
                                <strong>Country:</strong>
                                <span>{nb.country || "-"}</span>
                              </div>

                              {!isRestaurant && (
                                <div>
                                  <strong>Branch License:</strong>
                                  <span>{nb.branch_license || "-"}</span>
                                </div>
                              )}

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                <h3 className="changed-fields-title">Changed Fields</h3>

                {/* ===== BRANCH ===== */}
                {isBranchSection ? (
                  <div className="branch-grid">
                    {["update", "add", "delete"].map((type) => {
                      const filtered = branchChanges.filter(
                        (b) => (b.action || "").toLowerCase() === type
                      );

                      if (filtered.length === 0) return null;

                      return (
                        <div className="branch-column" key={type}>
                          <div className={`branch-title ${type}`}>
                            {type.toUpperCase()}
                          </div>

                          {filtered.map((b, index) => {
                            const rawOldBranch = oldBranches.find(
                              (ob) => ob.branch_id === b.branch_id
                            );

                            const oldBranch = normalizeByCanonicalMap(rawOldBranch || {});
                            const newBranch = normalizeByCanonicalMap(b.data || {});

                            const allKeys = Array.from(
                              new Set([
                                ...Object.keys(oldBranch),
                                ...Object.keys(newBranch),
                              ])
                            );

                            return (
                              <div className="branch-card" key={index}>
                                {allKeys
                                  .filter(
                                    (k) =>
                                      BRANCH_ALLOWED_FIELDS.includes(k) &&
                                      !(isRestaurant && k === "branch_license")
                                  )
                                  .map((k) => {
                                    const oldVal = (oldBranch?.[k] ?? "").toString().trim();
                                    const newVal = (newBranch?.[k] ?? oldVal ?? "").toString().trim();

                                    const isSame = oldVal === newVal;

                                    return (
                                      <div className="compare-row" key={k}>
                                        <div className="field-label">{k}</div>

                                        <div className="field-values">
                                          <span className={isSame ? "same-badge" : "old-badge"}>
                                            {oldVal || "-"}
                                          </span>

                                          <span className="arrow">→</span>

                                          <span className={isSame ? "same-badge" : "new-badge"}>
                                            {newVal}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* ===== NORMAL SECTION ===== */
                  (filteredKeys || allKeys).map((key) => {
                    let rawOld = normalizedOld[key];

                    if (key === "company_email") {
                      rawOld =
                        normalizedOld["company_email"] ||
                        normalizedOld["contact_person_email"] ||
                        normalizedOld["restaurant_email_address"] ||
                        "";
                    }

                    const rawNew = normalizedNew[key];

                    const oldVal = (rawOld ?? "").toString().trim();
                    const newVal = (rawNew ?? oldVal ?? "").toString().trim();

                    const isSame = oldVal === newVal;

                    return (
                      <div className="compare-row" key={key}>
                        <div className="field-label">{key}</div>

                        <div className="field-values">
                          <span className="old-badge">
                            {oldVal}
                          </span>

                          <span className="arrow">→</span>

                          <span className="new-badge">
                            {newVal || "-"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            ) : (
              <>
                <h3>Documents</h3>

                <div className="doc-grid">
                  {fileKeys.map((key) => {
                    const oldFile = normalizeFile(normalizedOldFiles[key]);
                    const newFile = normalizeFile(normalizedNewFiles[key]);

                    const oldSrc = oldFile
                      ? `data:${oldFile.mimetype};base64,${oldFile.content}`
                      : null;

                    const newSrc = newFile
                      ? `data:${newFile.mimetype};base64,${newFile.content}`
                      : null;

                    return (
                      <div className="doc-card" key={key}>

                        {/* ===== TITLE + SINGLE EYE BUTTON ===== */}
                        <div className="doc-title-wrapper">

                          <h4 className="doc-title">
                            {FILE_LABELS[key] || key}
                          </h4>

                          <button
                            className="doc-view-icon"
                            onClick={() =>
                              setPreviewModal({
                                open: true,
                                title: FILE_LABELS[key] || key,
                                oldSrc,
                                newSrc,
                              })
                            }
                          >
                            👁
                          </button>

                        </div>

                        {/* ===== OLD / NEW ===== */}
                        <div className="doc-compare">

                          <div className="doc-box old">
                            <p>Old</p>

                            {oldSrc && (
                              <img
                                src={oldSrc}
                                alt="Old"
                                className="preview-image"
                              />
                            )}
                          </div>

                          <div className="doc-box new">
                            <p>New</p>

                            {newSrc && (
                              <img
                                src={newSrc}
                                alt="New"
                                className="preview-image"
                              />
                            )}
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {previewModal.open && (
              <div className="image-modal-overlay">

                <div className="modal-contents">

                  <button
                    className="image-modal-close"
                    onClick={() =>
                      setPreviewModal({
                        open: false,
                        title: "",
                        oldSrc: null,
                        newSrc: null,
                      })
                    }
                  >
                    ✕
                  </button>

                  <h2>{previewModal.title}</h2>

                  <div className="image-modal-grid">

                    <div>
                      <h3>Old</h3>

                      {previewModal.oldSrc && (
                        <img
                          src={previewModal.oldSrc}
                          alt="Old"
                          className="popup-preview-image"
                        />
                      )}
                    </div>

                    <div>
                      <h3>New</h3>

                      {previewModal.newSrc && (
                        <img
                          src={previewModal.newSrc}
                          alt="New"
                          className="popup-preview-image"
                        />
                      )}
                    </div>

                  </div>
                </div>
              </div>
            )}
            {/* ===== BUTTONS ===== */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              marginTop: "20px"
            }}>
              <button
                className="btn2 approve"
                onClick={() => approve(selectedItem.id)}
              >
                Approve
              </button>

              <button
                className="btn2 reject"
                onClick={() => reject(selectedItem.id)}
              >
                Reject
              </button>

              <button
                className="btn2 cancel"
                onClick={() => setSelectedId(null)}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}