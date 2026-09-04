import { useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  X,
  Plus,
  Clock,
} from "lucide-react";
import "../styles/theme.css";

const API = "https://worknest-backend-xesk.onrender.com";

function Leaves() {
  const role = localStorage.getItem("userRole");
  const email = localStorage.getItem("userEmail");
  const token = localStorage.getItem("authToken");

  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    email: email || "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const getHeaders = (includeJson = false) => ({
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token}`,
  });

  const loadLeaves = async () => {
    try {
      const response = await fetch(`${API}/leaves/`, {
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Unable to load leave requests");
        return;
      }

      if (role === "hr") {
        setLeaves(data);
      } else {
        const myLeaves = data.filter(
          (leave) => leave.email === email
        );

        setLeaves(myLeaves);
      }
    } catch {
      setMessage("Backend connection failed");
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const applyLeave = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API}/leaves/`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({
          email: email,
          start_date: form.start_date,
          end_date: form.end_date,
          reason: form.reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Unable to apply for leave");
        return;
      }

      setMessage("Leave request submitted successfully");

      setForm({
        email: email || "",
        start_date: "",
        end_date: "",
        reason: "",
      });

      setShowForm(false);
      loadLeaves();
    } catch {
      setMessage("Backend connection failed");
    }
  };

  const updateLeave = async (leaveEmail, action) => {
    try {
      const response = await fetch(
        `${API}/leaves/${encodeURIComponent(leaveEmail)}/${action}`,
        {
          method: "PUT",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Unable to update leave");
        return;
      }

      setMessage(
        action === "approve"
          ? "Leave approved successfully"
          : "Leave declined successfully"
      );

      loadLeaves();
    } catch {
      setMessage("Backend connection failed");
    }
  };

  return (
    <div className="employees-page">
      <div className="employees-header">
        <div>
          <p className="dashboard-eyebrow">LEAVE MANAGEMENT</p>

          <h1>Leave Requests</h1>

          <p className="dashboard-subtitle">
            {role === "hr"
              ? "Review and manage employee leave requests."
              : "Apply for leave and track your requests."}
          </p>
        </div>

        {role !== "hr" && (
          <button
            className="primary-button employees-add-button"
            onClick={() => setShowForm(true)}
          >
            <Plus size={18} />
            Apply Leave
          </button>
        )}
      </div>

      {message && (
        <div className="login-message">
          {message}
        </div>
      )}

      <div className="employees-grid">
        {leaves.length === 0 ? (
          <div className="empty-employees">
            <CalendarDays size={40} />

            <h3>No leave requests</h3>

            <p>
              There are no leave requests to display.
            </p>
          </div>
        ) : (
          leaves.map((leave) => (
            <div
              className="employee-card"
              key={leave.id}
            >
              <div className="employee-card-top">
                <div className="employee-avatar">
                  <CalendarDays size={22} />
                </div>

                <span className="employee-role">
                  {leave.status || "Pending"}
                </span>
              </div>

              <h3>
                {role === "hr"
                  ? leave.email
                  : "My Leave Request"}
              </h3>

              <div className="employee-detail">
                <CalendarDays size={15} />

                <span>
                  {leave.start_date} → {leave.end_date}
                </span>
              </div>

              <div className="employee-detail">
                <Clock size={15} />

                <span>
                  {leave.reason}
                </span>
              </div>

              {role === "hr" &&
                (!leave.status ||
                  leave.status.toLowerCase() === "pending") && (
                  <div className="employee-actions">
                    <button
                      onClick={() =>
                        updateLeave(leave.email, "approve")
                      }
                    >
                      <Check size={15} />
                      Accept
                    </button>

                    <button
                      className="delete-action"
                      onClick={() =>
                        updateLeave(leave.email, "decline")
                      }
                    >
                      <X size={15} />
                      Decline
                    </button>
                  </div>
                )}
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="employee-modal-overlay">
          <div className="employee-modal">
            <button
              className="modal-close"
              onClick={() => setShowForm(false)}
            >
              <X size={20} />
            </button>

            <div className="modal-heading">
              <div className="modal-icon">
                <CalendarDays size={23} />
              </div>

              <div>
                <p className="panel-label">
                  LEAVE REQUEST
                </p>

                <h2>
                  Apply for leave
                </h2>
              </div>
            </div>

            <form
              onSubmit={applyLeave}
              className="employee-form"
            >
              <label>
                Start Date
              </label>

              <input
                type="date"
                value={form.start_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    start_date: e.target.value,
                  })
                }
                required
              />

              <label>
                End Date
              </label>

              <input
                type="date"
                value={form.end_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    end_date: e.target.value,
                  })
                }
                required
              />

              <label>
                Reason
              </label>

              <input
                type="text"
                placeholder="Reason for leave"
                value={form.reason}
                onChange={(e) =>
                  setForm({
                    ...form,
                    reason: e.target.value,
                  })
                }
                required
              />

              <button
                type="submit"
                className="primary-button"
              >
                Submit Leave Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leaves;