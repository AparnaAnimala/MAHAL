import React, { useEffect, useState, useRef } from "react";
import "../css/SupportAdminPanel.css";

const API_BASE = "http://192.168.2.22:5000/api/v1/admin/support";
const attachmentCache = new Map();

export default function SupportAdminPanel() {

    const ADMIN_TOKEN = localStorage.getItem("admin_token");


    const headers = {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        "Content-Type": "application/json"
    };

    const pollingRef = useRef(null);
    const selectedTicketRef = useRef(null);


    /* ================= STATE ================= */

    const [tickets, setTickets] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const [messages, setMessages] = useState([]);
    const [notes, setNotes] = useState([]);
    const [history, setHistory] = useState([]);

    const [replyText, setReplyText] = useState("");
    const [noteText, setNoteText] = useState("");

    const [dashboard, setDashboard] = useState({});
    const [filterStatus, setFilterStatus] = useState("");
    const [filterPriority, setFilterPriority] = useState("");

    const ADMIN_ROLE = localStorage.getItem("admin_role");
    const ADMIN_ID = parseInt(localStorage.getItem("admin_id"));


    /* ================= LOADERS ================= */

    const loadDashboard = async () => {

        try {
            const res = await fetch(`${API_BASE}/dashboard`, { headers });
            if (!res.ok) return;
            setDashboard(await res.json());
        } catch { }
    };

    const loadAdmins = async () => {

        try {
            const res = await fetch(`${API_BASE}/admins`, { headers });
            if (!res.ok) return;
            setAdmins(await res.json());
        } catch { }
    };

    const loadTickets = async () => {

        try {

            let url = `${API_BASE}/tickets?`;

            if (filterStatus)
                url += `status=${filterStatus}&`;

            if (filterPriority)
                url += `priority=${filterPriority}&`;

            const res = await fetch(url, { headers });

            if (!res.ok) return;

            const data = await res.json();

            setTickets(data);

        } catch { }
    };

    const loadTicketDetails = async (ticketId) => {
        try {
            selectedTicketRef.current = ticketId;

            const res = await fetch(`${API_BASE}/ticket/${ticketId}`, { headers });

            if (!res.ok) {
                console.error("Ticket details failed:", await res.text());
                return;
            }

            const data = await res.json();

            setSelectedTicket({
                ...data.ticket,
                attachments: data.attachments
            });

            setMessages(data.messages);
            setNotes(data.notes);
            setHistory(data.history);

        } catch (err) {
            console.error("Ticket load error:", err);
        }
    };



    /* ================= ACTIONS ================= */

    const assignTicket = async (ticketId, adminId) => {

        await fetch(`${API_BASE}/ticket/${ticketId}/assign`, {
            method: "POST",
            headers,
            body: JSON.stringify({ admin_id: adminId })
        });

        loadTickets();
        loadTicketDetails(ticketId);
    };

    const autoAssign = async (ticketId) => {

        await fetch(`${API_BASE}/ticket/${ticketId}/auto-assign`, {
            method: "POST",
            headers
        });

        loadTickets();
        loadTicketDetails(ticketId);
    };

    const unassignTicket = async (ticketId) => {

        await fetch(`${API_BASE}/ticket/${ticketId}/unassign`, {
            method: "POST",
            headers
        });

        loadTickets();
        loadTicketDetails(ticketId);
    };

    const escalate = async (ticketId) => {

        await fetch(`${API_BASE}/ticket/${ticketId}/escalate`, {
            method: "POST",
            headers
        });

        loadTickets();
        loadTicketDetails(ticketId);
    };

    const deEscalate = async (ticketId) => {

        await fetch(`${API_BASE}/ticket/${ticketId}/de-escalate`, {
            method: "POST",
            headers
        });

        loadTickets();
        loadTicketDetails(ticketId);
    };

    const reopenTicket = async (ticketId) => {

        await fetch(`${API_BASE}/ticket/${ticketId}/reopen`, {
            method: "POST",
            headers
        });

        loadTickets();
        loadTicketDetails(ticketId);
    };

    const changeStatus = async (ticketId, status) => {

        await fetch(`${API_BASE}/ticket/${ticketId}/status`, {
            method: "POST",
            headers,
            body: JSON.stringify({ status })
        });

        loadTickets();
        loadTicketDetails(ticketId);
    };

    const reply = async () => {

        if (!replyText || !selectedTicket) return;

        await fetch(`${API_BASE}/ticket/${selectedTicket.ticket_id}/reply`, {
            method: "POST",
            headers,
            body: JSON.stringify({ message: replyText })
        });

        setReplyText("");

        if (selectedTicket?.ticket_id) {
            loadTicketDetails(selectedTicket.ticket_id);
        }
    };

    const addNote = async () => {

        if (!noteText || !selectedTicket) return;

        await fetch(`${API_BASE}/ticket/${selectedTicket.ticket_id}/note`, {
            method: "POST",
            headers,
            body: JSON.stringify({ note: noteText })
        });

        setNoteText("");

        if (selectedTicket?.ticket_id) {
            loadTicketDetails(selectedTicket.ticket_id);
        }
    };




    /* ================= INIT ================= */

    useEffect(() => {

        loadDashboard();
        loadAdmins();
        loadTickets();

        // ✅ SLOW polling (tickets list)
        const ticketInterval = setInterval(() => {
            loadTickets();
        }, 50000); // 15 sec

        // ✅ FAST polling (selected ticket only)
        const detailInterval = setInterval(() => {

            if (
                selectedTicketRef.current &&
                selectedTicket &&
                selectedTicket.ticket_id === selectedTicketRef.current &&
                selectedTicket.status !== "closed"
            ) {
                loadTicketDetails(selectedTicketRef.current);
            }

        }, 60000); // keep 5 sec

        return () => {
            clearInterval(ticketInterval);
            clearInterval(detailInterval);
        };

    }, []);

    useEffect(() => {

        loadTickets();

    }, [filterStatus, filterPriority]);

    const attachmentCache = new Map();

    function AttachmentPreview({ a }) {

        const [url, setUrl] = useState(null);
        const [error, setError] = useState(false);

        useEffect(() => {

            let objectUrl;

            const load = async () => {

                // ✅ CACHE HIT
                if (attachmentCache.has(a.attachment_id)) {
                    setUrl(attachmentCache.get(a.attachment_id));
                    return;
                }

                try {
                    const res = await fetch(
                        `http://192.168.2.22:5000/api/v1/admin/support/attachment/${a.attachment_id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("admin_token")}`
                            }
                        }
                    );

                    if (!res.ok) {
                        console.error("Attachment failed:", await res.text());
                        setError(true);
                        return;
                    }

                    const blob = await res.blob();
                    objectUrl = URL.createObjectURL(blob);

                    // ✅ STORE IN CACHE
                    attachmentCache.set(a.attachment_id, objectUrl);

                    setUrl(objectUrl);

                } catch (err) {
                    console.error("Attachment error:", err);
                    setError(true);
                }
            };

            load();

            return () => {
                // ❌ DO NOT revoke if cached (important)
                // only revoke if not cached
                if (objectUrl && !attachmentCache.has(a.attachment_id)) {
                    URL.revokeObjectURL(objectUrl);
                }
            };

        }, [a.attachment_id]);

        if (error) return <div style={{ color: "red" }}>Failed</div>;
        if (!url) return <div>Loading...</div>;

        // IMAGE PREVIEW
        if (a.file_type?.startsWith("image")) {
            return (
                <div style={{ marginBottom: "10px" }}>
                    <img
                        src={url}
                        alt={a.file_name}
                        style={{
                            maxWidth: "200px",
                            borderRadius: "8px"
                        }}
                    />
                </div>
            );
        }

        // FILE PREVIEW
        return (
            <a href={url} target="_blank" rel="noreferrer">
                📎 {a.file_name}
            </a>
        );
    }

    /* ================= HELPERS ================= */

    const slaColor = (ticket) =>
        ticket.sla_breached ? "red" : "green";

    const priorityColor = (p) =>
        p === "high" ? "red" :
            p === "normal" ? "orange" : "green";

    /* ================= UI ================= */

    return (
        <div className="main-container">

            {/* LEFT PANEL */}
            <div className="left-panel">

                <div className="header">
                    <div>
                        <h2>Dashboard</h2>
                        <p>
                            Open: {dashboard.open || 0} |
                            In Progress: {dashboard.in_progress || 0} |
                            Closed: {dashboard.closed || 0}
                        </p>
                    </div>

                    <select
                        className="ticket-select"
                        onChange={(e) => {
                            if (e.target.value) {
                                loadTicketDetails(e.target.value);
                            }
                        }}
                    >
                        <option value="">Select Ticket</option>
                        {tickets.map(t => (
                            <option key={t.ticket_id} value={t.ticket_id}>
                                #{t.ticket_id} - {t.subject}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-bar">
                    <select onChange={e => setFilterStatus(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                    </select>

                    <select onChange={e => setFilterPriority(e.target.value)}>
                        <option value="">All Priority</option>
                        <option value="high">High</option>
                        <option value="normal">Normal</option>
                        <option value="low">Low</option>
                    </select>

                    <input placeholder="Search" />
                </div>

                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Type</th>
                            <th>Name</th>
                            <th>Subject</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Created At</th>
                            <th>Service Level (SLA)</th>
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
                                <td>{t.source_role?.toUpperCase()}</td>
                                <td>{t.source_name || "Unknown"}</td>
                                <td>{t.subject}</td>

                                <td>
                                    <span
                                        className={`badge ${t.status === "open"
                                            ? "badge-open"
                                            : t.status === "in_progress"
                                                ? "badge-inprogress"
                                                : "badge-resolved"
                                            }`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {t.status?.replace("_", " ")}
                                    </span>
                                </td>


                                <td>
                                    <span className={`badge ${(t.original_priority || t.priority) === "high"
                                        ? "badge-high"
                                        : (t.original_priority || t.priority) === "normal"
                                            ? "badge-normal"
                                            : "badge-low"
                                        }`}>
                                        {t.original_priority || t.priority}
                                    </span>
                                </td>

                                <td>
                                    {t.created_at
                                        ? new Date(t.created_at).toLocaleString()
                                        : "-"}
                                </td>

                                <td>
                                    <span className={`badge ${t.sla_breached
                                        ? "badge-sla-breach"
                                        : "badge-sla"
                                        }`}>
                                        {t.sla_breached ? "Breached" : "Within SLA"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>

            {/* ===== MODAL ===== */}
            {selectedTicket && (
                <div
                    className="ticket-modal-overlay"
                    onClick={() => setSelectedTicket(null)}
                >

                    <div
                        className="ticket-modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <button
                            className="ticket-modal-close"
                            onClick={() => setSelectedTicket(null)}
                        >
                            ✕
                        </button>

                        <div className="ticket-layout">

                            <h3 className="ticket-title">
                                Ticket #{selectedTicket.ticket_id} — {selectedTicket.source_role} — {selectedTicket.source_name}
                            </h3>

                            <div className="action-bar">

                                {/* SUPER ADMIN ONLY */}
                                {ADMIN_ROLE === "SUPER_ADMIN" && (
                                    <>
                                        <button
                                            className="btn-blue"
                                            onClick={() => autoAssign(selectedTicket.ticket_id)}
                                        >
                                            Auto Assign
                                        </button>

                                        <button
                                            className="btn-gray"
                                            onClick={() => unassignTicket(selectedTicket.ticket_id)}
                                        >
                                            Unassign
                                        </button>
                                    </>
                                )}

                                {/* ESCALATE */}
                                {(selectedTicket.assigned_admin_id === ADMIN_ID ||
                                    ADMIN_ROLE === "OPS_ADMIN" ||
                                    ADMIN_ROLE === "SUPER_ADMIN") && (
                                        <button
                                            className="btn-red"
                                            onClick={() => escalate(selectedTicket.ticket_id)}
                                        >
                                            Escalate
                                        </button>
                                    )}

                                {/* DE-ESCALATE */}
                                {(selectedTicket.escalation_level > 0 &&
                                    (ADMIN_ROLE === "OPS_ADMIN" ||
                                        ADMIN_ROLE === "SUPER_ADMIN")) && (
                                        <button
                                            className="btn-orange"
                                            onClick={() => deEscalate(selectedTicket.ticket_id)}
                                        >
                                            De-Escalate
                                        </button>
                                    )}

                                {/* RESOLVE */}
                                {(selectedTicket.assigned_admin_id === ADMIN_ID ||
                                    ADMIN_ROLE === "OPS_ADMIN" ||
                                    ADMIN_ROLE === "SUPER_ADMIN") && (
                                        <button
                                            className="btn-green"
                                            onClick={() =>
                                                changeStatus(selectedTicket.ticket_id, "resolved")
                                            }
                                        >
                                            Resolve
                                        </button>
                                    )}

                                {/* REOPEN */}
                                {(ADMIN_ROLE === "OPS_ADMIN" ||
                                    ADMIN_ROLE === "SUPER_ADMIN") && (
                                        <button
                                            className="btn-cyan"
                                            onClick={() => reopenTicket(selectedTicket.ticket_id)}
                                        >
                                            Reopen
                                        </button>
                                    )}

                                {/* CLOSE */}
                                {(ADMIN_ROLE === "OPS_ADMIN" ||
                                    ADMIN_ROLE === "SUPER_ADMIN") && (
                                        <button
                                            className="btn-dark"
                                            onClick={() =>
                                                changeStatus(selectedTicket.ticket_id, "closed")
                                            }
                                        >
                                            Close
                                        </button>
                                    )}
                            </div>

                            <div className="ticket-body">

                                <div className="ticket-left">

                                    <div className="card">
                                        <h4>Conversation</h4>

                                        <div className="conversation-box">
                                            {messages.map(m => (
                                                <div key={m.message_id}>
                                                    <b>{m.sender_role}</b>: {m.message}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="reply-box">
                                            <input
                                                value={replyText}
                                                onChange={e => setReplyText(e.target.value)}
                                                placeholder="Write a reply..."
                                            />

                                            <button className="btn-primary" onClick={reply}>
                                                Submit Reply →
                                            </button>
                                        </div>
                                    </div>

                                    <div className="card">
                                        <h4>Add Note</h4>

                                        <textarea
                                            value={noteText}
                                            onChange={e => setNoteText(e.target.value)}
                                        />

                                        <button className="btn-primary" onClick={addNote}>
                                            Add Note →
                                        </button>
                                    </div>

                                </div>

                                <div className="ticket-right">

                                    <div className="card">
                                        <h4>Ticket Info</h4>

                                        <select
                                            className="assign-select"
                                            onChange={e => {
                                                if (e.target.value) {
                                                    assignTicket(selectedTicket.ticket_id, e.target.value);
                                                }
                                            }}
                                        >
                                            <option>Assign Admin</option>

                                            {admins.map(a => (
                                                <option
                                                    key={a.admin_id}
                                                    value={a.admin_id}
                                                >
                                                    {a.name}
                                                </option>
                                            ))}
                                        </select>

                                        <div className="info-row">
                                            <span>Status</span>

                                            <span className={`badge ${selectedTicket.status === "open"
                                                ? "badge-open"
                                                : selectedTicket.status === "in_progress"
                                                    ? "badge-inprogress"
                                                    : selectedTicket.status === "resolved"
                                                        ? "badge-resolved"
                                                        : "badge-closed"
                                                }`}>
                                                {selectedTicket.status}
                                            </span>
                                        </div>

                                        <div className="info-row">
                                            <span>Priority</span>

                                            <span className={`badge ${(selectedTicket.original_priority || selectedTicket.priority) === "high"
                                                ? "badge-high"
                                                : (selectedTicket.original_priority || selectedTicket.priority) === "normal"
                                                    ? "badge-normal"
                                                    : "badge-low"
                                                }`}>
                                                {selectedTicket.original_priority || selectedTicket.priority}
                                            </span>
                                        </div>

                                        <div className="info-row">
                                            <span>Escalation</span>

                                            <span className={`badge ${selectedTicket.escalation_level > 0
                                                ? "badge-escalated"
                                                : "badge-normal"
                                                }`}>
                                                Level {selectedTicket.escalation_level || 0}
                                            </span>
                                        </div>

                                        <div className="info-row">
                                            <span>SLA</span>

                                            <span className="badge badge-sla">
                                                {selectedTicket.sla_breached
                                                    ? "Breached"
                                                    : "Within SLA"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="card">
                                        <h4>Details</h4>

                                        <p>
                                            <b>Created:</b> {selectedTicket.created_at}
                                        </p>

                                        <p>
                                            <b>Type:</b> {selectedTicket.source_role}
                                        </p>

                                        <p>
                                            <b>Subject:</b> {selectedTicket.subject}
                                        </p>
                                    </div>

                                    <div className="card">
                                        <h4>Attachments</h4>

                                        {selectedTicket.attachments?.length > 0 ? (
                                            selectedTicket.attachments.map(a => (
                                                <AttachmentPreview
                                                    key={a.attachment_id}
                                                    a={a}
                                                />
                                            ))
                                        ) : (
                                            <p>No attachments</p>
                                        )}
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>
            )}

        </div>


    );
}