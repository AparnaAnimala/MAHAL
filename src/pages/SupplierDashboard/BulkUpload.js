// import React, { useState } from "react";
// import axios from "axios";
// // import "../css/product.css";
// import "@fortawesome/fontawesome-free/css/all.min.css";

// const API = "http://192.168.2.22:5000/api";

// export default function BulkUpload({ supplierId, branchId, storeId }) {
//   const [excelFile, setExcelFile] = useState(null);
//   const [zipFile, setZipFile] = useState(null);
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // Excel Upload
//   const handleExcelChange = (e) => {
//     setExcelFile(e.target.files[0]);
//     setResult(null);
//   };

//   // ZIP Upload
//   const handleZipChange = (e) => {
//     setZipFile(e.target.files[0]);
//     setResult(null);
//   };

//   const handleUpload = async () => {
//     if (!excelFile) return alert("Please select Excel (.xlsx) file.");
//     if (!zipFile) return alert("Please upload ZIP file containing images.");
//     if (!supplierId) {
//       return alert("Supplier not found. Please login again.");
//     }

//     if (!branchId || !storeId) {
//       return alert("Please select Branch and Store before uploading.");
//     }

//     const formData = new FormData();
//     formData.append("file", excelFile);          // Excel file
//     formData.append("images_zip", zipFile);      // ZIP file
//     formData.append("supplier_id", supplierId);
//     formData.append("branch_id", branchId);
//     formData.append("store_id", storeId);

//     try {
//       setLoading(true);
//       const res = await axios.post(`${API}/products/upload`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       setResult(res.data);

//       if (res.data.imported) {
//         alert(`✅ ${res.data.imported} products imported successfully!`);
//       } else if (res.data.error) {
//         alert(`❌ Upload failed: ${res.data.error}`);
//       }

//     } catch (err) {
//       console.error("❌ Upload Failed:", err.response?.data || err);
//       const errorMsg = err.response?.data?.error || err.message || "Upload failed";
//       setResult({ error: errorMsg });
//       alert(`❌ Upload Failed: ${errorMsg}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDownloadTemplate = () => {
//     window.open(`${API}/products/template`, "_blank");
//   };

//   return (
//     <div className="bulk-upload-inline">
//       <div className="bulk-upload-row">
//         <h2>Bulk Product Upload</h2>

//         <button className="delete-btn" onClick={handleDownloadTemplate}>
//           <i className="fas fa-file-excel"></i> Download Template
//         </button>

//         {/* Excel Upload */}
//         <div className="form-field file-field">
//           <label>Select Excel File (.xlsx)</label>
//           <input
//             type="file"
//             accept=".xlsx"
//             onChange={handleExcelChange}
//           />
//           {excelFile && <p>📄 {excelFile.name}</p>}
//         </div>

//         {/* ZIP Upload */}
//         <div className="form-field file-field">
//           <label>Select ZIP File (Images)</label>
//           <input
//             type="file"
//             accept=".zip"
//             onChange={handleZipChange}
//           />
//           {zipFile && <p>🗂 {zipFile.name}</p>}
//         </div>

//         <button className="delete-btn" onClick={handleUpload} disabled={loading}>
//           {loading ? "Uploading..." : "⬆️ Upload Excel + Images ZIP"}
//         </button>
//       </div>

//       {result && (
//         <div className="upload-result">
//           {result.error ? (
//             <p style={{ color: "red" }}>❌ {result.error}</p>
//           ) : (
//             <>
//               <h4>✅ Upload Summary</h4>
//               <p><strong>Imported:</strong> {result.imported}</p>
//               {result.errors?.length > 0 && (
//                 <ul style={{ color: "red" }}>
//                   {result.errors.map((e, i) => (
//                     <li key={i}>Row {e.row}: {e.error}</li>
//                   ))}
//                 </ul>
//               )}
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }



import React, { useState } from "react";
import axios from "axios";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useTranslation } from "react-i18next";

const API = "http://192.168.2.22:5000/api";

export default function BulkUpload({ supplierId, branchId, storeId }) {
  const [excelFile, setExcelFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith("ar");

  const handleExcelChange = (e) => {
    setExcelFile(e.target.files[0]);
    setResult(null);
  };

  const handleZipChange = (e) => {
    setZipFile(e.target.files[0]);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!excelFile) return alert(t("excel_required"));
    if (!zipFile) return alert(t("zip_required"));
    if (!supplierId) return alert(t("supplier_missing"));
    if (!branchId || !storeId) return alert(t("branch_store_required"));

    const formData = new FormData();
    formData.append("file", excelFile);
    formData.append("images_zip", zipFile);
    formData.append("supplier_id", supplierId);
    formData.append("branch_id", branchId);
    formData.append("store_id", storeId);

    try {
      setLoading(true);

      const res = await axios.post(`${API}/products/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(res.data);

      if (res.data.imported) {
        alert(t("upload_success", { count: res.data.imported }));
      } else if (res.data.error) {
        alert(t("upload_failed", { error: res.data.error }));
      }

    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setResult({ error: errorMsg });
      alert(t("upload_failed", { error: errorMsg }));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    window.open(`${API}/products/template`, "_blank");
  };

  return (
    <div className="bulk-upload-inline" dir={isArabic ? "rtl" : "ltr"}>
      <div className="bulk-upload-row">
        <h2>{t("bulk_upload_title")}</h2>

        <button className="delete-btn" onClick={handleDownloadTemplate}>
          <i className="fas fa-file-excel"></i> {t("download_template")}
        </button>

        {/* Excel */}
        <div className="form-field file-field">
          <label>{t("select_excel")}</label>

          <label className="custom-file-btn">
            {t("choose_file")}
            <input
              type="file"
              accept=".xlsx"
              onChange={handleExcelChange}
              hidden
            />
          </label>

          <span className="file-name">
            {excelFile ? excelFile.name : t("no_file_chosen")}
          </span>
        </div>

        {/* ZIP */}
        <div className="form-field file-field">
          <label>{t("select_zip")}</label>

          <label className="custom-file-btn">
            {t("choose_file")}
            <input
              type="file"
              accept=".zip"
              onChange={handleZipChange}
              hidden
            />
          </label>

          <span className="file-name">
            {zipFile ? zipFile.name : t("no_file_chosen")}
          </span>
        </div>

        <button className="delete-btn" onClick={handleUpload} disabled={loading}>
          {loading ? t("uploading") : t("upload_btn")}
        </button>
      </div>

      {result && (
        <div className="upload-result">
          {result.error ? (
            <p style={{ color: "red" }}>
              ❌ {t("upload_failed", { error: result.error })}
            </p>
          ) : (
            <>
              <h4>✅ {t("upload_summary")}</h4>
              <p>
                <strong>{t("imported")}:</strong> {result.imported}
              </p>

              {result.errors?.length > 0 && (
                <ul style={{ color: "red" }}>
                  {result.errors.map((e, i) => (
                    <li key={i}>
                      {t("row_error", { row: e.row, error: e.error })}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}