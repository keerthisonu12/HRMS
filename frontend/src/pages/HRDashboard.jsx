import {
  Users,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  TrendingUp,
  Bell,
  LogOut,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/theme.css";

const API = "http://127.0.0.1:8000";

function HRDashboard() {
  const navigate = useNavigate();

  const logout = async () => {
    const token = localStorage.getItem("authToken");

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

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div className="side-brand">
          <div className="side-logo">
            <BriefcaseBusiness size={22} />
          </div>
          <strong>WORKNEST</strong>
        </div>

        <div className="side-menu">
          <button
            className="menu-item active"
            onClick={() => navigate("/hr-dashboard")}
          >
            <TrendingUp size={18} />
            Overview
          </button>

          <button
            className="menu-item"
            onClick={() => navigate("/employees")}
          >
            <Users size={18} />
            Employees
          </button>

          <button
            className="menu-item"
            onClick={() => navigate("/leaves")}
          >
            <CalendarDays size={18} />
            Leave Requests
          </button>

          <button
            className="menu-item"
            onClick={() => navigate("/projects")}
          >
            <BriefcaseBusiness size={18} />
            Projects
          </button>

          <button
            className="menu-item"
            onClick={() => navigate("/reports")}
          >
            <FileText size={18} />
            Work Reports
          </button>

          <button
            className="menu-item"
            onClick={() => navigate("/notifications")}
          >
            <Bell size={18} />
            Notifications
          </button>
        </div>

        <button className="logout-button" onClick={logout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">HR CONTROL CENTER</p>
            <h1>Good morning, HR 👋</h1>
            <p className="dashboard-subtitle">
              Here's what's happening across your organization.
            </p>
          </div>

          <div className="header-profile">
            <div className="notification-icon">
              <Bell size={19} />
              <span>3</span>
            </div>

            <div className="profile-avatar">HR</div>
          </div>
        </header>

        <section className="stat-grid">
          <div className="stat-card purple">
            <div className="stat-icon">
              <Users size={21} />
            </div>
            <span>Total Employees</span>
            <strong>48</strong>
            <small>
              <ArrowUpRight size={13} /> 8.4% this month
            </small>
          </div>

          <div className="stat-card blue">
            <div className="stat-icon">
              <BriefcaseBusiness size={21} />
            </div>
            <span>Active Projects</span>
            <strong>12</strong>
            <small>
              <ArrowUpRight size={13} /> 3 new projects
            </small>
          </div>

          <div className="stat-card orange">
            <div className="stat-icon">
              <CalendarDays size={21} />
            </div>
            <span>Leave Requests</span>
            <strong>07</strong>
            <small>Needs your attention</small>
          </div>

          <div className="stat-card green">
            <div className="stat-icon">
              <TrendingUp size={21} />
            </div>
            <span>Average Productivity</span>
            <strong>82%</strong>
            <small>
              <ArrowUpRight size={13} /> 5.2% improvement
            </small>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="panel analytics-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-label">WORK ANALYTICS</p>
                <h2>Team performance</h2>
              </div>

              <button
                className="view-button"
                onClick={() => navigate("/analytics")}
              >
                View details
              </button>
            </div>

            <div className="performance-list">
              <div className="performance-row">
                <div>
                  <strong>Development Team</strong>
                  <span>24 reports</span>
                </div>

                <div className="progress">
                  <div style={{ width: "91%" }}></div>
                </div>

                <b>91%</b>
              </div>

              <div className="performance-row">
                <div>
                  <strong>Design Team</strong>
                  <span>18 reports</span>
                </div>

                <div className="progress">
                  <div style={{ width: "84%" }}></div>
                </div>

                <b>84%</b>
              </div>

              <div className="performance-row">
                <div>
                  <strong>Marketing Team</strong>
                  <span>15 reports</span>
                </div>

                <div className="progress">
                  <div style={{ width: "76%" }}></div>
                </div>

                <b>76%</b>
              </div>
            </div>
          </div>

          <div className="panel leave-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-label">ATTENTION</p>
                <h2>Leave requests</h2>
              </div>

              <CalendarDays size={20} />
            </div>

            <div className="leave-preview">
              <div className="mini-avatar">AK</div>

              <div>
                <strong>Alex Kumar</strong>
                <span>2 days • Personal leave</span>
              </div>

              <span className="pending">Pending</span>
            </div>

            <div className="leave-preview">
              <div className="mini-avatar">RS</div>

              <div>
                <strong>Riya Sharma</strong>
                <span>1 day • Medical leave</span>
              </div>

              <span className="pending">Pending</span>
            </div>

            <button
              className="full-button"
              onClick={() => navigate("/leaves")}
            >
              Review all requests
            </button>
          </div>
        </section>

        <section className="welcome-banner">
          <div>
            <p>WORKNEST INSIGHT</p>
            <h2>Your people are your strongest asset.</h2>
            <span>
              Track performance, projects and employee wellbeing
              from one intelligent workspace.
            </span>
          </div>

          <div className="banner-orbit">
            <TrendingUp size={45} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default HRDashboard;