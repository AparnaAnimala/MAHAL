// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";

// const API = "http://192.168.2.9:5000/api/v1";

// export default function IssueDetails() {
//   const { issueId } = useParams();
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   const [issue, setIssue] = useState(null);
//   const [remarks, setRemarks] = useState("");
//   const [image, setImage] = useState(null);
//   const [preview, setPreview] = useState(null);

//   useEffect(() => {
//     fetch(`${API}/issues/${issueId}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then(res => res.json())
//       .then(setIssue);
//   }, [issueId, token]);

//   if (!issue) return <p>Loading Issue...</p>;

//   const isClosed = issue.status === "CLOSED";

//   const handleImage = e => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = () => {
//       setImage(reader.result.split(",")[1]);
//       setPreview(reader.result);
//     };
//     reader.readAsDataURL(file);
//   };

//   return (
//     <div className="grn-wrapper">
//       {/* HEADER */}
//       <div className="page_header">
//         <h2>Reported Issue</h2>
//         <button className="btn_add_item_v2" onClick={() => navigate(-1)}>
//           ← Back
//         </button>
//       </div>

//       <div className="grn-top-actions">
//         <span className={`grn-status ${issue.status.toLowerCase()}`}>
//           {issue.status}
//         </span>
//       </div>

//       <div className="grn-no">
//         Issue No: ISS-{String(issue.issue_id).padStart(5, "0")}
//       </div>

//       {/* DETAILS */}
//       <div className="grn-header-card">
//         <div>
//           <label>Issue Type</label>
//           <div>{issue.issue_type}</div>
//         </div>
//         <div>
//           <label>Reported By</label>
//           <div>{issue.reported_by}</div>
//         </div>
//         <div>
//           <label>Date</label>
//           <div>{new Date(issue.created_at).toLocaleDateString()}</div>
//         </div>
//       </div>

//       {/* DESCRIPTION */}
//       <div className="grn-remarks">
//         <label>Description</label>
//         <textarea disabled value={issue.description} />
//       </div>

//       {/* IMAGE */}
//       {!isClosed && (
//         <div
//           className="grn-sign-box"
//           onClick={() => document.getElementById("issue-img").click()}
//         >
//           {!preview ? (
//             <span className="sign-text">Upload Proof</span>
//           ) : (
//             <img src={preview} className="sign-preview" />
//           )}

//           <input
//             id="issue-img"
//             type="file"
//             hidden
//             accept="image/*"
//             onChange={handleImage}
//           />
//         </div>
//       )}

//       {/* ACTIONS */}
//       {!isClosed && (
//         <div className="grn-actions">
//           <button className="btn-primary">
//             Submit Update
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }
