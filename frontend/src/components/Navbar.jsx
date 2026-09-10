import { Bell, ChevronDown, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/theme.css";

function Navbar({ collapsed = false }) {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const role = localStorage.getItem("userRole");
  const email = localStorage.getItem("userEmail");

  return (
    <header
      className="worknest-navbar"
      style={{
        position: "fixed",
        top: 0,
        left: collapsed ? "78px" : "245px",
        right: 0,
        height: "76px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 30px",
        background:
          "linear-gradient(90deg, #ffffff 0%, #f8f7ff 55%, #f2efff 100%)",
        borderBottom: "1px solid #ddd7ff",
        boxShadow: "0 4px 18px rgba(91, 78, 170, 0.08)",
        zIndex: 2000,
        boxSizing: "border-box",
        transition: "left 0.25s ease",
      }}
    >
      {/* LEFT */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <div
          className="navbar-sparkle"
          style={{
            width: "42px",
            height: "42px",
            minWidth: "42px",
            borderRadius: "13px",
            background: "linear-gradient(135deg, #7057ed, #8b78ff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 5px 14px rgba(112, 87, 237, 0.25)",
          }}
        >
          <Sparkles size={20} color="#ffffff" />
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            className="navbar-greeting"
            style={{
              fontSize: "25px",
              fontWeight: "750",
              color: "#18233b",
              lineHeight: "1.2",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Good morning, {role === "hr" ? "HR" : "Employee"} 👋
          </div>

          <div
            className="navbar-subtitle"
            style={{
              fontSize: "12px",
              color: "#8a94aa",
              marginTop: "3px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Here's what's happening across your organization.
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          flexShrink: 0,
        }}
      >
        {/* NOTIFICATIONS */}
        <button
          type="button"
          onClick={() => navigate("/notifications")}
          style={{
            position: "relative",
            width: "42px",
            height: "42px",
            minWidth: "42px",
            borderRadius: "12px",
            border: "1px solid #ded9ff",
            background: "#ffffff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            boxShadow: "0 3px 10px rgba(80, 70, 150, 0.06)",
          }}
          title="Notifications"
          aria-label="Notifications"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f1eeff";
            e.currentTarget.style.borderColor = "#bcb1ff";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#ffffff";
            e.currentTarget.style.borderColor = "#ded9ff";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <Bell size={20} color="#7057ed" />

          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              width: "17px",
              height: "17px",
              borderRadius: "50%",
              background: "#7057ed",
              color: "#ffffff",
              fontSize: "9px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #ffffff",
            }}
          >
            1
          </span>
        </button>

        {/* PROFILE */}
        <div
          style={{
            position: "relative",
          }}
        >
          <button
            type="button"
            onClick={() => setShowProfile(!showProfile)}
            aria-label="Profile menu"
            style={{
              height: "44px",
              padding: "0 10px 0 5px",
              borderRadius: "23px",
              border: "1px solid #ded9ff",
              background: "#ffffff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 3px 10px rgba(80, 70, 150, 0.06)",
            }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                minWidth: "34px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, #7057ed, #927fff)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: "700",
              }}
            >
              {role === "hr" ? "HR" : "E"}
            </div>

            <ChevronDown
              size={16}
              color="#78839a"
              style={{
                transform: showProfile
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
                transition: "0.2s",
              }}
            />
          </button>

          {showProfile && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "52px",
                width: "225px",
                maxWidth: "calc(100vw - 30px)",
                background: "#ffffff",
                borderRadius: "16px",
                padding: "14px",
                border: "1px solid #e2ddff",
                boxShadow:
                  "0 15px 35px rgba(40, 35, 90, 0.14)",
                zIndex: 3000,
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  padding: "8px",
                  borderRadius: "12px",
                  background: "#f7f5ff",
                  border: "1px solid #ebe7ff",
                  marginBottom: "8px",
                }}
              >
                <strong
                  style={{
                    display: "block",
                    color: "#18233b",
                    fontSize: "14px",
                  }}
                >
                  {role === "hr"
                    ? "HR Administrator"
                    : "Employee"}
                </strong>

                <span
                  style={{
                    display: "block",
                    color: "#8a94aa",
                    fontSize: "11px",
                    marginTop: "3px",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  {email || "Account"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowProfile(false);
                  navigate(
                    role === "hr"
                      ? "/hr-dashboard"
                      : "/employee-dashboard"
                  );
                }}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #e2ddff",
                  borderRadius: "10px",
                  background: "#f7f5ff",
                  color: "#7057ed",
                  fontWeight: "600",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <User size={15} />
                Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.clear();
                  navigate("/login");
                }}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ffd9df",
                  borderRadius: "10px",
                  background: "#fff3f5",
                  color: "#e34b5f",
                  fontWeight: "600",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "13px",
                }}
              >
                ↪ Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;