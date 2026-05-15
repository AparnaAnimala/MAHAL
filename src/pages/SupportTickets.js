import React, { useState, useEffect } from "react";
import "./css/SupportTicket.css";
import customerSupport from "../images/customer_support.png";
import { useTranslation } from "react-i18next";
/* -------- GET USER FROM TOKEN -------- */
function getUserFromToken() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  return {
    username: localStorage.getItem("username"),
    role: localStorage.getItem("role"),
    user_id: localStorage.getItem("user_id"),
    linked_id: localStorage.getItem("linked_id"),
    token: token
  };
}

export default function SupportTicket() {
  const user = getUserFromToken();
  const { t } = useTranslation();

  const [categories, setCategories] = useState([]);
  const [issue, setIssue] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const [tickets, setTickets] = useState([]);
  const [showStatus, setShowStatus] = useState(false);

  // NEW STATES
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [replyFile, setReplyFile] = useState(null);

  /* ---------- FETCH ISSUES ---------- */
  useEffect(() => {
    if (!user) return;

    fetch("http://192.168.2.9:5000/api/support/categories", {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setCategories(data.categories);
      });
  }, []);

  /* ---------- CANCEL ---------- */
  const handleCancel = () => {
    setIssue("");
    setMessage("");
    setFile(null);
    setAgree(false);
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!issue || !message || !agree) {
      alert(t("fill_required"));
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("subject", issue);
    formData.append("message", message);
    if (file) formData.append("attachment", file);

    const res = await fetch("http://192.168.2.9:5000/api/support/ticket", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      alert(t("ticket_success"));
      handleCancel();
    } else {
      alert(data.error || t("error"));
    }
  };

  /* ---------- TRACK STATUS ---------- */
  const handleTrackStatus = async () => {
    if (showStatus) {
      setShowStatus(false);
      setTickets([]);
      setSelectedTicket(null);
      return;
    }

    const res = await fetch("http://192.168.2.9:5000/api/support/my-tickets", {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });

    const data = await res.json();
    if (data.success) {
      setTickets(data.tickets);
      setShowStatus(true);
    }
  };

  /* ---------- LOAD TICKET DETAILS ---------- */
  const loadTicketDetails = async (ticketId) => {
    const res = await fetch(
      `http://192.168.2.9:5000/api/support/ticket/${ticketId}`,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    const data = await res.json();

    if (res.ok) {
      setSelectedTicket(data.ticket);
      setMessages(data.messages);
      setAttachments(data.attachments);
    }
  };

  /* ---------- REPLY ---------- */
  const handleReply = async () => {
    if (!replyText) return;

    const formData = new FormData();
    formData.append("message", replyText);
    if (replyFile) formData.append("attachment", replyFile);

    const res = await fetch(
      `http://192.168.2.9:5000/api/support/ticket/${selectedTicket.ticket_id}/reply`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      }
    );

    if (res.ok) {
      setReplyText("");
      setReplyFile(null);
      loadTicketDetails(selectedTicket.ticket_id);
    }
  };

  /* ---------- DOWNLOAD ATTACHMENT ---------- */
  const downloadFile = async (id, fileName) => {
    try {
      const res = await fetch(
        `http://192.168.2.9:5000/api/support/attachment/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`, // ✅ REQUIRED
          },
        }
      );

      if (res.status === 401) {
        alert(t("unauthorized"));
        return;
      }

      if (!res.ok) {
        alert(t("download_failed"));
        return;
      }

      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  /* ---------- AUTH GUARD ---------- */
  if (!user || !user.token) {
    window.location.href = "/login";
    return null;
  }

  return (
    <section className="cards-section">
      <div className="support-page">
        <div className="support-card">
          <h1>{t("support_title")}</h1>

          <div className="support-layout">
            {/* LEFT */}
            <div className="support-left">
              <img
                src={customerSupport}
                alt="Support"
                className="support-image"
              />
            </div>

            {/* RIGHT */}
            <div className="support-right">
              {!selectedTicket && (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>{t("email")}</label>
                    <input value={user.username} disabled />
                  </div>

                  <div className="form-group">
                    <label>{t("role")}</label>
                    <input value={user.role} disabled />
                  </div>

                  <div className="form-group">
                    <label>{t("issue")}</label>
                    <select
                      value={issue}
                      onChange={(e) => setIssue(e.target.value)}
                    >
                      <option value="">{t("select_issue")}</option>
                      {categories.map((c) => (
                        <option key={c.category_id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{t("message")}</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <div className="attachments-row">
                    <label className="file-btn">
                      {t("attach_file")} 📎
                      <input
                        type="file"
                        hidden
                        onChange={(e) => setFile(e.target.files[0])}
                      />
                    </label>

                    <label className="checkbox-inline">
                      <input
                        type="checkbox"
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                      />
                      {t("confirm_info")}
                    </label>
                  </div>

                  <div className="button-row">
                    <button type="button" onClick={handleCancel}>
                      {t("cancel")}
                    </button>

                    <button type="submit" disabled={loading}>
                      {t("submit")}
                    </button>

                    <button type="button" onClick={handleTrackStatus}>
                      {showStatus ? t("hide_status") : t("track_status")}
                    </button>
                  </div>
                </form>
              )}

              {/* TICKET LIST */}
              {showStatus && !selectedTicket && (
                <table className="clean-table">
                  <thead>
                    <tr>
                      <th>{t("ticket_id")}</th>
                      <th>{t("issue")}</th>
                      <th>{t("status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t) => (
                      <tr
                        key={t.ticket_id}
                        onClick={() => loadTicketDetails(t.ticket_id)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{t.ticket_id}</td>
                        <td>{t.subject}</td>
                        <td>{t.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* CHAT VIEW */}
              {selectedTicket && (
                <div>
                  <button onClick={() => setSelectedTicket(null)}>
                    ← {t("back")}
                  </button>

                  <h3>Ticket #{selectedTicket.ticket_id}</h3>

                  <div style={{ height: 200, overflow: "auto" }}>
                    {messages.map((m) => (
                      <div key={m.message_id}>
                        <b>{m.sender_role}</b>: {m.message}
                      </div>
                    ))}
                  </div>

                  {/* ATTACHMENTS */}
                  {attachments.map((a) => (
                    <div key={a.attachment_id}>
                      📎 {a.file_name}
                      <button onClick={() => downloadFile(a.attachment_id, a.file_name)}>
                        {t("download")}
                      </button>
                    </div>
                  ))}

                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />

                  <input
                    type="file"
                    onChange={(e) => setReplyFile(e.target.files[0])}
                  />

                  <button onClick={handleReply}>{t("reply")}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}