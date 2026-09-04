import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BriefcaseBusiness,
  FileText,
  BarChart3,
  Bell,
  LogOut,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/theme.css";

const API = "https://worknest-backend-xesk.onrender.com";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("userRole");

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

  const menuItems =
    role === "hr"
      ? [
          {
            label: "Dashboard",
            icon: LayoutDashboard,
            path: "/hr-dashboard",
          },
          {
            label: "Employees",
            icon: Users,
            path: "/employees",
          },
          {
            label: "Leaves",
            icon: CalendarDays,
            path: "/leaves",
          },
          {
            label: "Projects",
            icon: BriefcaseBusiness,
            path: "/projects",
          },
          {
            label: "Reports",
            icon: FileText,
            path: "/reports",
          },
          {
            label: "Analytics",
            icon: BarChart3,
            path: "/analytics",
          },
          {
            label: "Notifications",
            icon: Bell,
            path: "/notifications",
          },
        ]
      : [
          {
            label: "Dashboard",
            icon: LayoutDashboard,
            path: "/employee-dashboard",
          },
          {
            label: "Leaves",
            icon: CalendarDays,
            path: "/leaves",
          },
          {
            label: "Projects",
            icon: BriefcaseBusiness,
            path: "/projects",
          },
          {
            label: "Reports",
            icon: FileText,
            path: "/reports",
          },
          {
            label: "Notifications",
            icon: Bell,
            path: "/notifications",
          },
        ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">
          <BriefcaseBusiness size={22} />
        </div>

        <div>
          <h2>WORKNEST</h2>
          <span>People • Performance • Progress</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              className={
                location.pathname === item.path
                  ? "sidebar-item active"
                  : "sidebar-item"
              }
              onClick={() => navigate(item.path)}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button className="sidebar-logout" onClick={logout}>
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;