import { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  X,
  CalendarDays,
  Tag,
} from "lucide-react";
import "../styles/theme.css";

const API = "http://127.0.0.1:8000";

function Reports() {
  const role = localStorage.getItem("userRole");
  const email = localStorage.getItem("userEmail");
  const token = localStorage.getItem("authToken");

  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    employee_email: email || "",
    project: "",
    start_date: "",
    end_date: "",
    tag: "",
    description: "",
  });

  const getHeaders = (includeJson = false) => ({
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token}`,
  });

  const loadReports = async () => {
    try {
      const url =
        role === "hr"
          ? `${API}/reports/`
          : `${API}/reports/${encodeURIComponent(email)}`;

      const response = await fetch(url, {
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Unable to load reports");
        return;
      }

      setReports(data);
    } catch {
      setMessage("Backend connection failed");
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const createReport = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API}/reports/`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({
          employee_email: email,
          project: form.project,
          start_date: form.start_date,
          end_date: form.end_date,
          tag: form.tag,
          description: form.description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Unable to create report");
        return;
      }

      setMessage("Work report created successfully");

      setForm({
        employee_email: email || "",
        project: "",
        start_date: "",
        end_date: "",
        tag: "",
        description: "",
      });

      setShowForm(false);
      loadReports();
    } catch {
      setMessage("Backend connection failed");
    }
  };

  return (
    <div className="employees-page">
      <div className="employees-header">
        <div>
          <p className="dashboard-eyebrow">WORK ANALYTICS</p>

          <h1>Work Reports</h1>

          <p className="dashboard-subtitle">
            {role === "hr"
              ? "Track work reports and project progress across your organization."
              : "Create and view your own work reports."}
          </p>
        </div>

        <button
          className="primary-button employees-add-button"
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} />
          Add Report
        </button>
      </div>

      {message && (
        <div className="login-message">
          {message}
        </div>
      )}

      <div className="employees-grid">
        {reports.length === 0 ? (
          <div className="empty-employees">
            <FileText size={40} />

            <h3>No work reports</h3>

            <p>
              Work reports will appear here once they are added.
            </p>
          </div>
        ) : (
          reports.map((item) => (
            <div
              className="employee-card"
              key={item.id}
            >
              <div className="employee-card-top">
                <div className="employee-avatar">
                  <FileText size={22} />
                </div>

                <span className="employee-role">
                  {item.tag || "Work"}
                </span>
              </div>

              <h3>{item.project}</h3>

              {role === "hr" && (
                <div className="employee-detail">
                  <strong>{item.employee_email}</strong>
                </div>
              )}

              <div className="employee-detail">
                <CalendarDays size={15} />

                <span>
                  {item.start_date} → {item.end_date}
                </span>
              </div>

              <div className="employee-detail">
                <Tag size={15} />

                <span>{item.tag}</span>
              </div>

              <p
                style={{
                  marginTop: "15px",
                  color: "#666a7d",
                  fontSize: "14px",
                  lineHeight: "1.6",
                }}
              >
                {item.description}
              </p>
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
                <FileText size={23} />
              </div>

              <div>
                <p className="panel-label">WORK REPORT</p>

                <h2>Add work report</h2>
              </div>
            </div>

            <form
              onSubmit={createReport}
              className="employee-form"
            >
              <label>Project Name</label>

              <input
                type="text"
                placeholder="Enter project name"
                value={form.project}
                onChange={(e) =>
                  setForm({
                    ...form,
                    project: e.target.value,
                  })
                }
                required
              />

              {role === "hr" && (
                <>
                  <label>Employee Email</label>

                  <input
                    type="email"
                    placeholder="employee@company.com"
                    value={form.employee_email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        employee_email: e.target.value,
                      })
                    }
                    required
                  />
                </>
              )}

              <label>Start Date</label>

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

              <label>End Date</label>

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

              <label>Report Tag</label>

              <input
                type="text"
                placeholder="Development, Testing, Meeting..."
                value={form.tag}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tag: e.target.value,
                  })
                }
                required
              />

              <label>Work Description</label>

              <input
                type="text"
                placeholder="Describe the work completed"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                required
              />

              <button
                type="submit"
                className="primary-button"
              >
                Save Work Report
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;