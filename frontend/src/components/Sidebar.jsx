import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BriefcaseBusiness,
  FileText,
  BarChart3,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/theme.css";

const API = "http://127.0.0.1:8000";

function Sidebar({ onCollapse }) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("userRole");

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth <= 700
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 700;
      const tablet = window.innerWidth <= 900;

      setIsMobile(mobile);

      if (mobile || tablet) {
        setCollapsed(true);
      }

      if (!mobile) {
        setMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isMobile ? "0px" : collapsed ? "78px" : "245px"
    );

    if (onCollapse) {
      onCollapse(collapsed || isMobile);
    }
  }, [collapsed, isMobile, onCollapse]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(true);
    } else {
      setCollapsed((previous) => !previous);
    }
  };

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);

    if (isMobile) {
      setMobileOpen(false);
    }
  };

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
      // Continue logout
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
    <>
      {isMobile && !mobileOpen && (
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Open menu"
          style={{
            position: "fixed",
            top: "88px",
            left: "12px",
            width: "40px",
            height: "40px",
            border: "none",
            borderRadius: "11px",
            background: "#ffffff",
            color: "#6254d8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 5px 18px rgba(40, 35, 80, 0.14)",
            zIndex: 5000,
            cursor: "pointer",
          }}
        >
          <Menu size={21} />
        </button>
      )}

      {isMobile && mobileOpen && (
        <div
          onClick={closeMobileSidebar}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 20, 35, 0.42)",
            zIndex: 3998,
          }}
        />
      )}

      <aside
        className="sidebar"
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          left: isMobile
            ? mobileOpen
              ? "0px"
              : "-260px"
            : "0px",
          width: isMobile
            ? "245px"
            : collapsed
            ? "78px"
            : "245px",
          height: "100vh",
          minHeight: "100vh",
          display: "block",
          visibility: "visible",
          transform: "none",
          zIndex: 3999,
          overflowY: "auto",
          overflowX: "hidden",
          transition: "left 0.25s ease, width 0.25s ease",
          boxSizing: "border-box",
        }}
      >
        <div
          className="sidebar-brand"
          style={{
            justifyContent:
              collapsed && !isMobile
                ? "center"
                : "flex-start",
            overflow: "hidden",
          }}
        >
          <div className="brand-mark">
            <BriefcaseBusiness size={22} />
          </div>

          {(!collapsed || isMobile) && (
            <div>
              <h2>WORKNEST</h2>
              <span>People • Performance • Progress</span>
            </div>
          )}
        </div>

        {isMobile ? (
          <button
            type="button"
            onClick={closeMobileSidebar}
            aria-label="Close menu"
            style={{
              position: "absolute",
              top: "18px",
              right: "12px",
              width: "30px",
              height: "30px",
              border: "none",
              borderRadius: "9px",
              background: "rgba(255,255,255,0.10)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
            }}
          >
            <X size={17} />
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            style={{
              position: "absolute",
              top: "86px",
              right: "-1px",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              border: "none",
              background: "#ffffff",
              color: "#6254d8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
              cursor: "pointer",
            }}
          >
            {collapsed ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronLeft size={14} />
            )}
          </button>
        )}

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                type="button"
                key={item.path}
                className={
                  location.pathname === item.path
                    ? "sidebar-item active"
                    : "sidebar-item"
                }
                onClick={() => handleNavigation(item.path)}
                title={
                  !isMobile && collapsed
                    ? item.label
                    : ""
                }
                aria-label={item.label}
                style={{
                  justifyContent:
                    collapsed && !isMobile
                      ? "center"
                      : "flex-start",
                  padding:
                    collapsed && !isMobile
                      ? "12px 0"
                      : undefined,
                  minWidth: 0,
                }}
              >
                <Icon size={19} />

                {(!collapsed || isMobile) && (
                  <span>{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          className="sidebar-logout"
          onClick={logout}
          title={
            !isMobile && collapsed
              ? "Logout"
              : ""
          }
          aria-label="Logout"
          style={{
            justifyContent:
              collapsed && !isMobile
                ? "center"
                : "flex-start",
            padding:
              collapsed && !isMobile
                ? "12px 0"
                : undefined,
            minWidth: 0,
          }}
        >
          <LogOut size={18} />

          {(!collapsed || isMobile) && "Logout"}
        </button>
      </aside>
    </>
  );
}

export default Sidebar;