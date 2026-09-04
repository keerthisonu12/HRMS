import { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  FileText,
  TrendingUp,
} from "lucide-react";
import "../styles/theme.css";

const API = "http://127.0.0.1:8000";

function Analytics() {
  const [analytics, setAnalytics] = useState([]);
  const [message, setMessage] = useState("");

  const loadAnalytics = async () => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(`${API}/analytics/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Unable to load analytics");
        return;
      }

      if (!Array.isArray(data)) {
        setAnalytics([]);
        setMessage(data.message || "No work reports available");
        return;
      }

      setAnalytics(data);
    } catch {
      setMessage("Backend connection failed");
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const totalReports = analytics.reduce(
    (total, item) => total + item.work_reports,
    0
  );

  return (
    <div className="employees-page">
      <div className="employees-header">
        <div>
          <p className="dashboard-eyebrow">PERFORMANCE INSIGHTS</p>

          <h1>Work Analytics</h1>

          <p className="dashboard-subtitle">
            Compare employee workload using work report percentages.
          </p>
        </div>

        <div className="employee-count">
          <BarChart3 size={18} />
          Live Analytics
        </div>
      </div>

      {message && (
        <div className="login-message">
          {message}
        </div>
      )}

      <div className="employees-toolbar">
        <div className="employee-count">
          <Users size={17} />
          {analytics.length} Employees
        </div>

        <div className="employee-count">
          <FileText size={17} />
          {totalReports} Work Reports
        </div>
      </div>

      <div className="employees-grid">
        {analytics.length === 0 ? (
          <div className="empty-employees">
            <BarChart3 size={40} />

            <h3>No analytics available</h3>

            <p>
              Add work reports to generate employee performance percentages.
            </p>
          </div>
        ) : (
          analytics.map((item) => (
            <div
              className="employee-card"
              key={item.employee_email}
            >
              <div className="employee-card-top">
                <div className="employee-avatar">
                  <TrendingUp size={22} />
                </div>

                <span className="employee-role">
                  {item.work_percentage}%
                </span>
              </div>

              <h3>{item.employee_email}</h3>

              <div className="employee-detail">
                <FileText size={15} />
                <span>
                  {item.work_reports} Work Reports
                </span>
              </div>

              <div
                style={{
                  marginTop: "18px",
                  background: "#eeeef5",
                  borderRadius: "10px",
                  height: "10px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${item.work_percentage}%`,
                    height: "100%",
                    background: "#6254d8",
                    borderRadius: "10px",
                  }}
                ></div>
              </div>

              <p
                style={{
                  marginTop: "10px",
                  fontSize: "13px",
                  color: "#777b8f",
                }}
              >
                {item.work_percentage}% of total reported work
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Analytics;