import { useEffect, useState } from "react";
import {
  Users,
  Mail,
  Phone,
  BriefcaseBusiness,
  FileText,
  CalendarDays,
  Bell,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/theme.css";

const API = "https://worknest-backend-xesk.onrender.com";

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

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API}/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch {
      // Continue logout even if backend is unavailable
    }

    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("authToken");

    navigate("/login");
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
          setProjects(await projectResponse.json());
        }

        const reportResponse = await fetch(
          `${API}/reports/${encodeURIComponent(email)}`,
          { headers }
        );

        if (reportResponse.ok) {
          setReports(await reportResponse.json());
        }

        const leaveResponse = await fetch(`${API}/leaves/`, {
          headers,
        });

        if (leaveResponse.ok) {
          const leaveData = await leaveResponse.json();

          setLeaves(
            leaveData.filter((leave) => leave.email === email)
          );
        }

        const notificationResponse = await fetch(
          `${API}/notifications/`,
          { headers }
        );

        if (notificationResponse.ok) {
          setNotifications(await notificationResponse.json());
        }
      } catch {
        setMessage("Backend connection failed");
      }
    };

    if (email && token) {
      loadDashboard();
    }
  }, [email, token]);

  return (
    <div className="employees-page">
      <div className="employees-header">
        <div>
          <p className="dashboard-eyebrow">EMPLOYEE WORKSPACE</p>

          <h1>
            Welcome, {employee?.name || "Employee"}
          </h1>

          <p className="dashboard-subtitle">
            Your personal WORKNEST workspace.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={logout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>

      {message && (
        <div className="login-message">
          {message}
        </div>
      )}

      <div className="employees-grid">
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
                employee?.name?.charAt(0)?.toUpperCase() || "U"
              )}
            </div>

            <span className="employee-role">
              Employee
            </span>
          </div>

          <h3>My Profile</h3>

          <div className="employee-detail">
            <Users size={15} />
            <span>{employee?.name || "Loading..."}</span>
          </div>

          <div className="employee-detail">
            <Mail size={15} />
            <span>{employee?.email || email}</span>
          </div>

          <div className="employee-detail">
            <Phone size={15} />
            <span>{employee?.phone || "Not available"}</span>
          </div>
        </div>

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
            style={{ marginTop: "15px" }}
            onClick={() => navigate("/projects")}
          >
            View Projects
          </button>
        </div>

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
            style={{ marginTop: "15px" }}
            onClick={() => navigate("/reports")}
          >
            View Reports
          </button>
        </div>

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
            style={{ marginTop: "15px" }}
            onClick={() => navigate("/leaves")}
          >
            Manage Leave
          </button>
        </div>

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
            style={{ marginTop: "15px" }}
            onClick={() => navigate("/notifications")}
          >
            View Notifications
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;