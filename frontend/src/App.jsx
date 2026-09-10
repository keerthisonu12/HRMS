import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useState } from "react";

import Login from "./pages/Login";
import HRDashboard from "./pages/HRDashboardTemp.jsx";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Employees from "./pages/Employees";
import Leaves from "./pages/Leaves";
import Projects from "./pages/Projects";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import Notifications from "./pages/Notifications";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

function ProtectedLayout({ children, allowedRole }) {
  const role = localStorage.getItem("userRole");
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return (
      <Navigate
        to={
          role === "hr"
            ? "/hr-dashboard"
            : "/employee-dashboard"
        }
        replace
      />
    );
  }

  const isDashboard =
    location.pathname === "/hr-dashboard" ||
    location.pathname === "/employee-dashboard";

  const pageInfo = {
    "/employees": {
      label: "PEOPLE MANAGEMENT",
      title: "Employee Directory",
      description:
        "Manage your organization's people from one place.",
    },
    "/leaves": {
      label: "LEAVE MANAGEMENT",
      title: "Requests & Approvals",
      description:
        "Track employee leave requests and approvals.",
    },
    "/projects": {
      label: "PROJECT MANAGEMENT",
      title: "Active Work",
      description:
        "Keep track of projects and team assignments.",
    },
    "/reports": {
      label: "WORK REPORTS",
      title: "Team Activity",
      description:
        "Track work progress and daily contributions.",
    },
    "/analytics": {
      label: "PERFORMANCE",
      title: "Workforce Insights",
      description:
        "Understand workload and employee performance.",
    },
    "/notifications": {
      label: "ORGANIZATION UPDATES",
      title: "What's New",
      description:
        "Stay updated with important workplace events.",
    },
  };

  const currentPage = pageInfo[location.pathname];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      <Sidebar onCollapse={setCollapsed} />

      <Navbar collapsed={collapsed} />

      <main
        className="worknest-main"
        style={{
          marginLeft: collapsed ? "78px" : "245px",
          paddingTop: "76px",
          minHeight: "100vh",
          width: collapsed
            ? "calc(100% - 78px)"
            : "calc(100% - 245px)",
          boxSizing: "border-box",
          transition:
            "margin-left 0.25s ease, width 0.25s ease",
          overflowX: "hidden",
        }}
      >
        {!isDashboard && currentPage && (
          <div
            style={{
              margin: "18px 28px 24px",
              padding: "14px 18px",
              borderRadius: "16px",
              background:
                "linear-gradient(135deg, #ffffff 0%, #f8f6ff 100%)",
              border: "1px solid #e3defd",
              boxShadow:
                "0 5px 18px rgba(83, 67, 170, 0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
              boxSizing: "border-box",
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "13px",
                minWidth: 0,
                flex: 1,
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  minWidth: "38px",
                  borderRadius: "11px",
                  background:
                    "linear-gradient(135deg, #7057ed, #8d78ff)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "17px",
                  fontWeight: "700",
                  boxShadow:
                    "0 5px 12px rgba(112, 87, 237, 0.22)",
                }}
              >
                ✦
              </div>

              <div
                style={{
                  minWidth: 0,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    letterSpacing: "1.5px",
                    color: "#7057ed",
                    marginBottom: "3px",
                  }}
                >
                  {currentPage.label}
                </div>

                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "650",
                    color: "#18233b",
                    overflowWrap: "anywhere",
                  }}
                >
                  {currentPage.title}
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    color: "#8a94aa",
                    marginTop: "2px",
                    overflowWrap: "anywhere",
                  }}
                >
                  {currentPage.description}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={() => navigate(-1)}
              style={{
                width: "auto",
                minWidth: "0",
                flexShrink: 0,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                padding: "9px 15px",
                fontSize: "12px",
                borderRadius: "10px",
                marginTop: "0",
              }}
            >
              ← Back
            </button>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}

function ProtectedRoute({ children, allowedRole }) {
  return (
    <ProtectedLayout allowedRole={allowedRole}>
      {children}
    </ProtectedLayout>
  );
}

function App() {
  const role = localStorage.getItem("userRole");

  const defaultRoute =
    role === "hr"
      ? "/hr-dashboard"
      : role === "employee"
      ? "/employee-dashboard"
      : "/login";

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to={defaultRoute}
              replace
            />
          }
        />

        <Route
          path="/login"
          element={
            role ? (
              <Navigate
                to={
                  role === "hr"
                    ? "/hr-dashboard"
                    : "/employee-dashboard"
                }
                replace
              />
            ) : (
              <Login />
            )
          }
        />

        <Route
          path="/hr-dashboard"
          element={
            <ProtectedRoute allowedRole="hr">
              <HRDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee-dashboard"
          element={
            <ProtectedRoute allowedRole="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRole="hr">
              <Employees />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leaves"
          element={
            <ProtectedRoute>
              <Leaves />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRole="hr">
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to={defaultRoute}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;