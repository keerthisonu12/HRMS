import { useEffect, useState } from "react";
import {
  Users,
  Mail,
  Phone,
  BriefcaseBusiness,
  FileText,
  CalendarDays,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/theme.css";

const API = "http://127.0.0.1:8000";

function EmployeeDashboard() {
  const email = localStorage.getItem("userEmail");
  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const employeeResponse = await fetch(
          `${API}/employees/${encodeURIComponent(email)}`,
          { headers }
        );

        if (employeeResponse.ok) {
          setEmployee(await employeeResponse.json());
        }

        const projectResponse = await fetch(
          `${API}/projects/${encodeURIComponent(email)}`,
          { headers }
        );

        if (projectResponse.ok) {
          const projectData = await projectResponse.json();
          setProjects(
            Array.isArray(projectData) ? projectData : []
          );
        }

        const reportResponse = await fetch(
          `${API}/reports/${encodeURIComponent(email)}`,
          { headers }
        );

        if (reportResponse.ok) {
          const reportData = await reportResponse.json();
          setReports(
            Array.isArray(reportData) ? reportData : []
          );
        }

        const leaveResponse = await fetch(`${API}/leaves/`, {
          headers,
        });

        if (leaveResponse.ok) {
          const leaveData = await leaveResponse.json();

          setLeaves(
            Array.isArray(leaveData)
              ? leaveData.filter(
                  (leave) =>
                    leave.email?.toLowerCase() ===
                    email?.toLowerCase()
                )
              : []
          );
        }

        const notificationResponse = await fetch(
          `${API}/notifications/`,
          { headers }
        );

        if (notificationResponse.ok) {
          const notificationData =
            await notificationResponse.json();

          setNotifications(
            Array.isArray(notificationData)
              ? notificationData
              : []
          );
        }
      } catch {
        setMessage("Backend connection failed");
      }
    };

    if (email && token) {
      loadDashboard();
    }
  }, [email, token]);

  const dashboardCards = [
    {
      id: "profile",
      content: (
        <div className="employee-card">
          <div className="employee-card-top">
            <div
              className="employee-avatar"
              style={{
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {employee?.profile_image ? (
                <img
                  src={employee.profile_image}
                  alt={employee.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center top",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                employee?.name
                  ?.charAt(0)
                  ?.toUpperCase() || "U"
              )}
            </div>

            <span className="employee-role">
              Employee
            </span>
          </div>

          <h3>My Profile</h3>

          <div className="employee-detail">
            <Users size={15} />
            <span>
              {employee?.name || "Loading..."}
            </span>
          </div>

          <div className="employee-detail">
            <Mail size={15} />
            <span>
              {employee?.email || email}
            </span>
          </div>

          <div className="employee-detail">
            <Phone size={15} />
            <span>
              {employee?.phone ||
                employee?.phone_number ||
                "Not available"}
            </span>
          </div>
        </div>
      ),
    },

    {
      id: "projects",
      content: (
        <div className="employee-card">
          <div className="employee-card-top">
            <div className="employee-avatar">
              <BriefcaseBusiness size={22} />
            </div>

            <span className="employee-role">
              {projects.length}
            </span>
          </div>

          <h3>My Projects</h3>

          <div className="employee-detail">
            <BriefcaseBusiness size={15} />
            <span>
              {projects.length} project
              {projects.length !== 1 ? "s" : ""}
            </span>
          </div>

          <button
            className="primary-button"
            style={{
              marginTop: "15px",
              maxWidth: "100%",
            }}
            onClick={() => navigate("/projects")}
          >
            View Projects
          </button>
        </div>
      ),
    },

    {
      id: "reports",
      content: (
        <div className="employee-card">
          <div className="employee-card-top">
            <div className="employee-avatar">
              <FileText size={22} />
            </div>

            <span className="employee-role">
              {reports.length}
            </span>
          </div>

          <h3>My Work Reports</h3>

          <div className="employee-detail">
            <FileText size={15} />
            <span>
              {reports.length} report
              {reports.length !== 1 ? "s" : ""}
            </span>
          </div>

          <button
            className="primary-button"
            style={{
              marginTop: "15px",
              maxWidth: "100%",
            }}
            onClick={() => navigate("/reports")}
          >
            View Reports
          </button>
        </div>
      ),
    },

    {
      id: "leaves",
      content: (
        <div className="employee-card">
          <div className="employee-card-top">
            <div className="employee-avatar">
              <CalendarDays size={22} />
            </div>

            <span className="employee-role">
              {leaves.length}
            </span>
          </div>

          <h3>My Leave Requests</h3>

          <div className="employee-detail">
            <CalendarDays size={15} />
            <span>
              {leaves.length} request
              {leaves.length !== 1 ? "s" : ""}
            </span>
          </div>

          <button
            className="primary-button"
            style={{
              marginTop: "15px",
              maxWidth: "100%",
            }}
            onClick={() => navigate("/leaves")}
          >
            Manage Leave
          </button>
        </div>
      ),
    },

    {
      id: "notifications",
      content: (
        <div className="employee-card">
          <div className="employee-card-top">
            <div className="employee-avatar">
              <Bell size={22} />
            </div>

            <span className="employee-role">
              {notifications.length}
            </span>
          </div>

          <h3>Notifications</h3>

          <div className="employee-detail">
            <Bell size={15} />
            <span>
              {notifications.length} organization update
              {notifications.length !== 1 ? "s" : ""}
            </span>
          </div>

          <button
            className="primary-button"
            style={{
              marginTop: "15px",
              maxWidth: "100%",
            }}
            onClick={() =>
              navigate("/notifications")
            }
          >
            View Notifications
          </button>
        </div>
      ),
    },
  ];

  return (
    <div
      className="employees-page"
      style={{
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <div className="employees-header">
        <div style={{ minWidth: 0 }}>
          <p className="dashboard-eyebrow">
            EMPLOYEE WORKSPACE
          </p>

          <h1>
            Welcome, {employee?.name || "Employee"}
          </h1>

          <p className="dashboard-subtitle">
            Your personal WORKNEST workspace.
          </p>
        </div>
      </div>

      {message && (
        <div className="login-message">
          {message}
        </div>
      )}

      <div
        className="employees-grid"
        style={{
          width: "100%",
          minWidth: 0,
        }}
      >
        {dashboardCards.map((card) => (
          <div
            key={card.id}
            style={{
              minWidth: 0,
              width: "100%",
            }}
          >
            {card.content}
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmployeeDashboard;