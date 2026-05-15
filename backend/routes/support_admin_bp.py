from flask import Blueprint, request, jsonify, g, Response
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
from db import get_db_connection
from routes.admin_guard import require_admin
from routes.admin_audit import log_admin_action



support_admin_bp = Blueprint(
    "support_admin_bp",
    __name__,
    url_prefix="/api/v1/admin/support"
)


# ============================================================
# CONSTANTS
# ============================================================

VALID_STATUS = {
    "open",
    "in_progress",
    "waiting",
    "resolved",
    "closed"
}


VALID_PRIORITY = {
    "low",
    "normal",
    "high"
}

# ============================================================
# PRIORITY AUTO DETECTION ENGINE
# ============================================================

PRIORITY_KEYWORDS = {
    "high": [
        "payment failed",
        "refund",
        "money deducted",
        "invoice error",
        "not received",
        "fraud",
        "urgent",
        "immediately",
        "asap"
    ],
    "normal": [
        "delay",
        "not working",
        "issue",
        "problem",
        "error"
    ]
}

def detect_priority(subject, message=None):

    text = f"{subject or ''} {message or ''}".lower()

    for keyword in PRIORITY_KEYWORDS["high"]:
        if keyword in text:
            return "high"

    for keyword in PRIORITY_KEYWORDS["normal"]:
        if keyword in text:
            return "normal"

    return "low"

# ============================================================
# HELPER: AUDIT WRAPPER
# ============================================================

def audit(action, ticket_id, old=None, new=None):

    log_admin_action(
        admin_id=g.admin["admin_id"],
        action=action,
        entity_type="support_ticket",
        entity_id=int(ticket_id) if ticket_id else None,
        old_value=old,
        new_value=new,
        ip_address=request.remote_addr
    )


# ============================================================
# HELPER: GET TICKET OR FAIL
# ============================================================

def get_ticket_or_404(cur, ticket_id):

    cur.execute("""
        SELECT
            st.*,
            CASE
                WHEN st.source_role = 'supplier'
                THEN sr.company_name_english
                WHEN st.source_role = 'restaurant'
                THEN rr.restaurant_name_english
                ELSE NULL
            END AS source_name
        FROM support_tickets st
        LEFT JOIN supplier_registration sr
            ON st.source_role = 'supplier'
            AND sr.supplier_id = st.source_id
        LEFT JOIN restaurant_registration rr
            ON st.source_role = 'restaurant'
            AND rr.restaurant_id = st.source_id
        WHERE st.ticket_id = %s
    """, (ticket_id,))

    ticket = cur.fetchone()

    if not ticket:
        return None

    return ticket


# ============================================================
# 1. LIST ALL TICKETS
# ============================================================

@support_admin_bp.route("/tickets", methods=["GET"])
@require_admin("MANAGE_SUPPORT_TICKETS")
def list_tickets():

    status = request.args.get("status")
    priority = request.args.get("priority")
    assigned = request.args.get("assigned_admin_id")

    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        query = """
            SELECT
    st.ticket_id,
    st.subject,
    st.priority,
    st.status,
    st.source_role,
    st.source_id,
    st.assigned_admin_id,
    st.escalation_level,
    st.created_at,
    st.sla_due_at,

    CASE
        WHEN st.sla_due_at IS NOT NULL
        AND st.sla_due_at <= CURRENT_TIMESTAMP
        AND st.status NOT IN ('resolved','closed')
        THEN TRUE
        ELSE FALSE
    END AS sla_breached,

    au.name AS assigned_admin_name,

    -- 🔥 ADD THIS
    CASE
        WHEN st.source_role = 'supplier'
        THEN sr.company_name_english
        WHEN st.source_role = 'restaurant'
        THEN rr.restaurant_name_english
        ELSE NULL
    END AS source_name

FROM support_tickets st

LEFT JOIN admin_users au
    ON au.admin_id = st.assigned_admin_id

LEFT JOIN supplier_registration sr
    ON st.source_role = 'supplier'
    AND sr.supplier_id = st.source_id

LEFT JOIN restaurant_registration rr
    ON st.source_role = 'restaurant'
    AND rr.restaurant_id = st.source_id

WHERE 1=1
        """

        params = []

        # restrict support admins
        if g.admin["role"] == "SUPPORT_ADMIN":
            query += " AND st.assigned_admin_id = %s"
            params.append(g.admin["admin_id"])


       

        if status:
            query += " AND st.status = %s"
            params.append(status)

        if priority:
            query += " AND st.priority = %s"
            params.append(priority)

        if assigned:
            query += " AND st.assigned_admin_id = %s"
            params.append(assigned)

        query += " ORDER BY st.created_at DESC LIMIT 500"

        cur.execute(query, params)

        tickets = cur.fetchall()

        audit("READ_ACCESS", None)

        return jsonify(tickets), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()


# ============================================================
# 2. GET FULL TICKET DETAILS
# ============================================================

@support_admin_bp.route("/ticket/<int:ticket_id>", methods=["GET"])
@require_admin("MANAGE_SUPPORT_TICKETS")
def get_ticket(ticket_id):

    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        ticket = get_ticket_or_404(cur, ticket_id)

        if not ticket:
            return jsonify({"error": "Ticket not found"}), 404


        # messages
        cur.execute("""
            SELECT *
            FROM support_messages
            WHERE ticket_id = %s
            ORDER BY created_at ASC
        """, (ticket_id,))
        messages = cur.fetchall()


        # attachments
        cur.execute("""
            SELECT
                attachment_id,
                ticket_id,
                message_id,
                uploaded_by_role,
                file_name,
                file_type,
                file_size,
                created_at
            FROM support_attachments
            WHERE ticket_id = %s
        """, (ticket_id,))
        attachments = cur.fetchall()


        # notes
        cur.execute("""
            SELECT
                san.*,
                au.name AS admin_name
            FROM support_admin_notes san
            JOIN admin_users au ON au.admin_id = san.admin_id
            WHERE ticket_id = %s
            ORDER BY created_at DESC
        """, (ticket_id,))
        notes = cur.fetchall()


        # status history
        cur.execute("""
            SELECT *
            FROM support_status_history
            WHERE ticket_id = %s
            ORDER BY changed_at DESC
        """, (ticket_id,))
        history = cur.fetchall()


        audit("READ_ACCESS", ticket_id)

        return jsonify({
            "ticket": ticket,
            "messages": messages,
            "attachments": attachments,
            "notes": notes,
            "history": history
        }), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()


# ============================================================
# 3. ASSIGN TICKET
# ============================================================

@support_admin_bp.route("/ticket/<int:ticket_id>/assign", methods=["POST"])
@require_admin("MANAGE_SUPPORT_TICKETS")
def assign_ticket(ticket_id):

    data = request.json or {}

    new_admin_id = data.get("admin_id")

    if not new_admin_id:
        return jsonify({"error": "admin_id required"}), 400


    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        ticket = get_ticket_or_404(cur, ticket_id)

        if not ticket:
            return jsonify({"error": "Ticket not found"}), 404


        old_admin = ticket.get("assigned_admin_id")

        if old_admin == new_admin_id:
            return jsonify({"message": "Already assigned"}), 200


        # Detect priority
        priority = detect_priority(ticket["subject"])

        sla_hours = {
            "high": 4,
            "normal": 12,
            "low": 24
        }

        sla_due = datetime.utcnow() + timedelta(hours=sla_hours[priority])

        cur.execute("""
            UPDATE support_tickets
            SET assigned_admin_id = %s,
                priority = %s,
                sla_due_at = %s,
                status = 'in_progress',
                updated_at = CURRENT_TIMESTAMP
            WHERE ticket_id = %s
        """, (
            new_admin_id,
            priority,
            sla_due,
            ticket_id
        ))



        cur.execute("""
            INSERT INTO support_assignment_history
            (ticket_id, old_admin_id, new_admin_id, changed_by)
            VALUES (%s,%s,%s,%s)
        """, (
            ticket_id,
            old_admin,
            new_admin_id,
            g.admin["admin_id"]
        ))


        audit(
            "CHANGE_ADMIN_ROLE",
            ticket_id,
            {"assigned_admin_id": old_admin},
            {"assigned_admin_id": new_admin_id}
        )

        conn.commit()

        return jsonify({"message": "Ticket assigned"}), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()


# ============================================================
# 4. CHANGE STATUS
# ============================================================

@support_admin_bp.route("/ticket/<int:ticket_id>/status", methods=["POST"])
@require_admin("MANAGE_SUPPORT_TICKETS")
def change_status(ticket_id):

    data = request.json or {}

    new_status = data.get("status")
    remark = data.get("remark")

    if new_status not in VALID_STATUS:
        return jsonify({"error": "Invalid status"}), 400


    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        ticket = get_ticket_or_404(cur, ticket_id)

        if not ticket:
            return jsonify({"error": "Ticket not found"}), 404


        old_status = ticket["status"]


        cur.execute("""
            UPDATE support_tickets
            SET status = %s,
                updated_at = CURRENT_TIMESTAMP,
                closed_at = CASE WHEN %s='closed' THEN CURRENT_TIMESTAMP ELSE closed_at END
            WHERE ticket_id = %s
        """, (new_status, new_status, ticket_id))


        cur.execute("""
            INSERT INTO support_status_history
            (ticket_id, old_status, new_status, changed_by_role, changed_by_id, remark)
            VALUES (%s,%s,%s,'admin',%s,%s)
        """, (
            ticket_id,
            old_status,
            new_status,
            g.admin["admin_id"],
            remark
        ))


        audit(
            "CHANGE_STATUS",
            ticket_id,
            {"status": old_status},
            {"status": new_status}
        )

        conn.commit()

        return jsonify({"message": "Status updated"}), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()


# ============================================================
# 5. ADMIN REPLY
# ============================================================

@support_admin_bp.route("/ticket/<int:ticket_id>/reply", methods=["POST"])
@require_admin("MANAGE_SUPPORT_TICKETS")
def reply_ticket(ticket_id):

    message = (request.json or {}).get("message")

    if not message:
        return jsonify({"error": "message required"}), 400


    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

# get ticket creation time
        cur.execute("""
        SELECT created_at
        FROM support_tickets
        WHERE ticket_id=%s
        """, (ticket_id,))

        row = cur.fetchone()

        if not row or not row[0]:
            return jsonify({"error": "Invalid ticket"}), 400

        created_at = row[0]
    
        response_time = (datetime.utcnow() - created_at).total_seconds()

        # insert message
        cur.execute("""
        INSERT INTO support_messages
        (ticket_id, sender_role, sender_id, message)
        VALUES (%s,'admin',%s,%s)
        """, (
            ticket_id,
            g.admin["admin_id"],
            message
        ))
        # move ticket to in_progress on first reply
        cur.execute("""
        UPDATE support_tickets
        SET status='in_progress',
            updated_at=CURRENT_TIMESTAMP
        WHERE ticket_id=%s
        AND status='open'
        """, (ticket_id,))


        # store SLA metric
        cur.execute("""
INSERT INTO support_sla_metrics
(ticket_id, first_response_time)
VALUES (%s,%s)
ON CONFLICT (ticket_id)
DO NOTHING
""", (
    ticket_id,
    response_time
))


        audit("CREATE_ADMIN", ticket_id)

        conn.commit()

        return jsonify({"message": "Reply sent"}), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()


# ============================================================
# 6. ADD INTERNAL NOTE
# ============================================================

@support_admin_bp.route("/ticket/<int:ticket_id>/note", methods=["POST"])
@require_admin("MANAGE_SUPPORT_TICKETS")
def add_note(ticket_id):

    note = (request.json or {}).get("note")

    if not note:
        return jsonify({"error": "note required"}), 400


    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO support_admin_notes
            (ticket_id, admin_id, note)
            VALUES (%s,%s,%s)
        """, (
            ticket_id,
            g.admin["admin_id"],
            note
        ))

        audit("CREATE_ADMIN", ticket_id)

        conn.commit()

        return jsonify({"message": "Note added"}), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()


# ============================================================
# 7. ESCALATE
# ============================================================

MAX_ESCALATION = 3

ESCALATION_ROLE_MAP = {
    0: "SUPPORT_ADMIN",
    1: "SUPPORT_ADMIN",
    2: "OPS_ADMIN",
    3: "SUPER_ADMIN"
}


@support_admin_bp.route("/ticket/<int:ticket_id>/escalate", methods=["POST"])
@require_admin("MANAGE_SUPPORT_TICKETS")
def escalate_ticket(ticket_id):

    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        ticket = get_ticket_or_404(cur, ticket_id)

        if not ticket:
            return jsonify({"error": "Ticket not found"}), 404

        current_level = ticket.get("escalation_level") or 0

        if current_level >= MAX_ESCALATION:
            return jsonify({"error": "Max escalation reached"}), 400

        new_level = current_level + 1

        target_role = ESCALATION_ROLE_MAP[new_level]

        # find least busy admin
        cur.execute("""
            SELECT au.admin_id
            FROM admin_users au
            JOIN admin_roles ar ON ar.role_id = au.role_id
            LEFT JOIN support_tickets st
                ON st.assigned_admin_id = au.admin_id
                AND st.status NOT IN ('resolved','closed')
            WHERE ar.role_name = %s
              AND au.is_active = true
            GROUP BY au.admin_id
            ORDER BY COUNT(st.ticket_id) ASC
            LIMIT 1
        """, (target_role,))

        admin = cur.fetchone()

        if not admin:
            return jsonify({"error": "No admin available"}), 400

        new_admin_id = admin["admin_id"]

        # escalation priority mapping
        escalation_priority_map = {
            0: ticket["priority"],  # base priority
            1: "normal",
            2: "high",
            3: "high"
        }

        new_active_priority = escalation_priority_map[new_level]

        sla_hours = {
            "low": 24,
            "normal": 12,
            "high": 4
        }

        sla_due = datetime.utcnow() + timedelta(
            hours=sla_hours[new_active_priority]
        )

        cur.execute("""
            UPDATE support_tickets
            SET escalation_level = %s,
                assigned_admin_id = %s,
                original_priority = %s,
                sla_due_at = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE ticket_id = %s
        """, (
            new_level,
            new_admin_id,
            new_active_priority,
            sla_due,
            ticket_id
        ))

        conn.commit()

        return jsonify({
            "message": "Escalated",
            "level": new_level,
            "active_priority": new_active_priority
        })

    finally:
        if cur: cur.close()
        if conn: conn.close()


        # ============================================================
# 8. LIST SUPPORT ADMINS
# ============================================================

@support_admin_bp.route("/admins", methods=["GET"])
@require_admin("MANAGE_SUPPORT_TICKETS")
def list_support_admins():

    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                au.admin_id,
                au.name,
                COUNT(st.ticket_id) FILTER (
                    WHERE st.status NOT IN ('resolved','closed')
                ) AS active_tickets
            FROM admin_users au
            JOIN admin_roles ar
                ON ar.role_id = au.role_id
            LEFT JOIN support_tickets st
                ON st.assigned_admin_id = au.admin_id
            WHERE ar.role_name = 'SUPPORT_ADMIN'
              AND au.is_active = true
            GROUP BY au.admin_id, au.name
            ORDER BY active_tickets ASC, au.name
        """)

        return jsonify(cur.fetchall()), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()
# ============================================================
# 9. AUTO ASSIGN TICKET
# ============================================================

@support_admin_bp.route("/ticket/<int:ticket_id>/auto-assign", methods=["POST"])
@require_admin("MANAGE_SUPPORT_TICKETS")
def auto_assign_ticket(ticket_id):

    if g.admin["role"] != "SUPER_ADMIN":
        return jsonify({"error": "Only SUPER_ADMIN can auto assign"}), 403


    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)


        # get least busy admin
        cur.execute("""
            SELECT
                au.admin_id,
                COUNT(st.ticket_id) FILTER (
                    WHERE st.status NOT IN ('resolved','closed')
                ) AS workload
            FROM admin_users au
            JOIN admin_roles ar
                ON ar.role_id = au.role_id
            LEFT JOIN support_tickets st
                ON st.assigned_admin_id = au.admin_id
            WHERE ar.role_name = 'SUPPORT_ADMIN'
              AND au.is_active = true
            GROUP BY au.admin_id, au.last_login_at, au.name

ORDER BY
workload ASC,
au.last_login_at DESC,
au.admin_id ASC


LIMIT 1

        """)

        row = cur.fetchone()

        if not row:
            return jsonify({"error": "No support admins available"}), 400

        new_admin_id = row["admin_id"]

        # FETCH TICKET FIRST
        ticket = get_ticket_or_404(cur, ticket_id)

        if not ticket:
            return jsonify({"error": "Ticket not found"}), 404

        priority = detect_priority(ticket["subject"])

        sla_hours = {
            "high": 4,
            "normal": 12,
            "low": 24
        }

        sla_due = datetime.utcnow() + timedelta(hours=sla_hours[priority])

        cur.execute("""
UPDATE support_tickets
SET assigned_admin_id=%s,
    priority=%s,
    sla_due_at=%s,
    status='in_progress',
    updated_at=CURRENT_TIMESTAMP
WHERE ticket_id=%s
""", (
    new_admin_id,
    priority,
    sla_due,
    ticket_id
))
        cur.execute("""
INSERT INTO support_assignment_history
(ticket_id, old_admin_id, new_admin_id, changed_by)
VALUES (%s,%s,%s,%s)
""", (
    ticket_id,
    ticket.get("assigned_admin_id"),
    new_admin_id,
    g.admin["admin_id"]
))







        audit(
            "CHANGE_ADMIN_ROLE",
            ticket_id,
            None,
            {"assigned_admin_id": new_admin_id}
        )


        conn.commit()

        return jsonify({
            "message": "Auto assigned",
            "assigned_admin_id": new_admin_id
        }), 200


    finally:
        if cur: cur.close()
        if conn: conn.close()

# ============================================================
# 10. SUPPORT DASHBOARD METRICS
# ============================================================

@support_admin_bp.route("/dashboard", methods=["GET"])
@require_admin("MANAGE_SUPPORT_TICKETS")
def support_dashboard():

    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)


        cur.execute("""
            SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status='open') AS open,
                COUNT(*) FILTER (WHERE status='in_progress') AS in_progress,
                COUNT(*) FILTER (WHERE status='resolved') AS resolved,
                COUNT(*) FILTER (WHERE status='closed') AS closed
            FROM support_tickets
        """)

        stats = cur.fetchone()

        return jsonify(stats), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()

# ============================================================
# 11. SLA BREACHED TICKETS
# ============================================================

@support_admin_bp.route("/sla-breached", methods=["GET"])
@require_admin("MANAGE_SUPPORT_TICKETS")
def sla_breached():

    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT *
            FROM support_tickets
            WHERE sla_due_at IS NOT NULL
AND sla_due_at <= CURRENT_TIMESTAMP
              AND status NOT IN ('resolved','closed')
            ORDER BY sla_due_at ASC
        """)

        return jsonify(cur.fetchall()), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()

# ============================================================
# 12. UNREAD COUNT
# ============================================================

@support_admin_bp.route("/unread-count", methods=["GET"])
@require_admin("MANAGE_SUPPORT_TICKETS")
def unread_count():

    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT COUNT(*)
            FROM support_tickets
            WHERE status='open'
        """)

        count = cur.fetchone()[0]

        return jsonify({"unread": count}), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()
# ============================================================
# ADMIN PERFORMANCE SCORE
# ============================================================

@support_admin_bp.route("/admin-performance", methods=["GET"])
@require_admin("MANAGE_SUPPORT_TICKETS")
def admin_performance():

    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                au.admin_id,
                au.name,

                COUNT(st.ticket_id) AS total_tickets,

                COUNT(st.ticket_id) FILTER (
                    WHERE st.status IN ('resolved','closed')
                ) AS resolved,

                COUNT(st.ticket_id) FILTER (
                    WHERE st.status NOT IN ('resolved','closed')
                ) AS pending,

                AVG(EXTRACT(EPOCH FROM (
st.closed_at - st.created_at
))/3600)
FILTER (WHERE st.closed_at IS NOT NULL)
AS avg_resolution_hours,


(
COUNT(st.ticket_id) FILTER (
WHERE st.status IN ('resolved','closed')
) * 100.0 /
NULLIF(COUNT(st.ticket_id),0)
) AS resolution_rate


            FROM admin_users au

            LEFT JOIN support_tickets st
                ON st.assigned_admin_id = au.admin_id

            JOIN admin_roles ar
                ON ar.role_id = au.role_id

            WHERE ar.role_name='SUPPORT_ADMIN'

            GROUP BY au.admin_id, au.name

            ORDER BY resolved DESC, avg_resolution_hours ASC

        """)

        return jsonify(cur.fetchall()), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()
        
        

@support_admin_bp.route("/ticket/<int:ticket_id>/de-escalate", methods=["POST"])
@require_admin("MANAGE_SUPPORT_TICKETS")
def de_escalate_ticket(ticket_id):

    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        ticket = get_ticket_or_404(cur, ticket_id)

        if not ticket:
            return jsonify({"error": "Ticket not found"}), 404

        level = ticket.get("escalation_level") or 0

        if level <= 0:
            return jsonify({"error": "Already lowest level"}), 400

        new_level = level - 1

        target_role = ESCALATION_ROLE_MAP[new_level]

        cur.execute("""
            SELECT au.admin_id
            FROM admin_users au
            JOIN admin_roles ar ON ar.role_id = au.role_id
            WHERE ar.role_name = %s
            LIMIT 1
        """, (target_role,))

        admin = cur.fetchone()

        escalation_priority_map = {
            0: ticket["priority"],  # restore base priority
            1: "normal",
            2: "high",
            3: "high"
        }

        new_active_priority = escalation_priority_map[new_level]

        sla_hours = {
            "low": 24,
            "normal": 12,
            "high": 4
        }

        sla_due = datetime.utcnow() + timedelta(
            hours=sla_hours[new_active_priority]
        )

        cur.execute("""
            UPDATE support_tickets
            SET escalation_level = %s,
                assigned_admin_id = %s,
                original_priority = %s,
                sla_due_at = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE ticket_id = %s
        """, (
            new_level,
            admin["admin_id"],
            new_active_priority,
            sla_due,
            ticket_id
        ))

        conn.commit()

        return jsonify({
            "message": "De-escalated",
            "level": new_level,
            "active_priority": new_active_priority
        })

    finally:
        if cur: cur.close()
        if conn: conn.close()


@support_admin_bp.route("/ticket/<int:ticket_id>/unassign", methods=["POST"])
@require_admin("MANAGE_SUPPORT_TICKETS")
def unassign_ticket(ticket_id):

    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            UPDATE support_tickets
            SET assigned_admin_id=NULL,
                status='open',
                updated_at=CURRENT_TIMESTAMP
            WHERE ticket_id=%s
        """, (ticket_id,))

        conn.commit()

        return jsonify({"message": "Ticket unassigned"}), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()

@support_admin_bp.route("/ticket/<int:ticket_id>/reopen", methods=["POST"])
@require_admin("MANAGE_SUPPORT_TICKETS")
def reopen_ticket(ticket_id):

    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            UPDATE support_tickets
            SET status='in_progress',
                closed_at=NULL,
                updated_at=CURRENT_TIMESTAMP
            WHERE ticket_id=%s
        """, (ticket_id,))

        conn.commit()

        return jsonify({"message": "Ticket reopened"}), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()


@support_admin_bp.route("/attachment/<int:attachment_id>", methods=["GET"])
@require_admin("MANAGE_SUPPORT_TICKETS")
def admin_download_attachment(attachment_id):

    conn = cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT *
            FROM support_attachments
            WHERE attachment_id=%s
        """, (attachment_id,))

        file = cur.fetchone()

        if not file:
            return jsonify({"error": "Not found"}), 404

        # 🔥 DEBUG (remove later)
        print("ADMIN ATTACHMENT DEBUG:", file["file_name"], file["file_type"])

        data = file.get("file_data")
        file_path = file.get("file_path")

        # ✅ CASE 1: DB FILE (BYTEA)
        if data:
            if isinstance(data, memoryview):
                data = data.tobytes()

            return Response(
                data,
                mimetype=file.get("file_type") or "application/octet-stream",
                headers={
                    "Content-Disposition": f"inline; filename={file['file_name']}"
                }
            )

        # ✅ CASE 2: FILE PATH (SERVER FILE)
        elif file_path:
            try:
                with open(file_path, "rb") as f:
                    return Response(
                        f.read(),
                        mimetype=file.get("file_type") or "application/octet-stream",
                        headers={
                            "Content-Disposition": f"inline; filename={file['file_name']}"
                        }
                    )
            except Exception as e:
                print("FILE PATH ERROR:", e)
                return jsonify({"error": "File not found on server"}), 500

        # ❌ NOTHING FOUND
        else:
            return jsonify({"error": "No file data or path"}), 500

        # 🔥 CRITICAL FIX — memoryview → bytes
        if isinstance(data, memoryview):
            data = data.tobytes()

        return Response(
            data,
            mimetype=file.get("file_type") or "application/octet-stream",
            headers={
                "Content-Disposition": f"inline; filename={file['file_name']}",
                "Cache-Control": "no-cache"
            }
        )

    except Exception as e:
        print("ADMIN ATTACHMENT ERROR:", str(e))  # 🔥 debug visibility
        return jsonify({"error": "Attachment failed"}), 500

    finally:
        if cur: cur.close()
        if conn: conn.close()