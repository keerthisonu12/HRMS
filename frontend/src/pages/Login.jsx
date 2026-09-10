import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  ShieldCheck,
  ArrowRight,
  Users,
  BriefcaseBusiness,
} from "lucide-react";
import "../styles/theme.css";

const API = "http://127.0.0.1:8000";

function Login() {
  const [role, setRole] = useState("employee");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [message, setMessage] = useState("");

  const otpRefs = useRef([]);
  const navigate = useNavigate();

  const sendOtp = async () => {
    if (!email) {
      setMessage("Please enter your email");
      return;
    }

    if (sendingOtp) return;

    setSendingOtp(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API}/send-otp?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Unable to send OTP");
        return;
      }

      setOtpSent(true);
      setOtp(["", "", "", "", "", ""]);

      setMessage(
        "Verification OTP sent successfully. Please check your email."
      );

      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    } catch {
      setMessage("Backend connection failed");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpChange = (value, index) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();

    const pastedOtp = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedOtp) return;

    const newOtp = ["", "", "", "", "", ""];

    pastedOtp.split("").forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);

    setTimeout(() => {
      const focusIndex = Math.min(pastedOtp.length, 5);
      otpRefs.current[focusIndex]?.focus();
    }, 50);
  };

  const login = async (e) => {
    e.preventDefault();

    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      setMessage("Please enter the complete 6-digit OTP");
      return;
    }

    try {
      const response = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: enteredOtp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Login failed");
        return;
      }

      if (data.role !== role) {
        setMessage(`This account is registered as ${data.role}`);
        return;
      }

      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("authToken", data.token);

      navigate(
        data.role === "hr"
          ? "/hr-dashboard"
          : "/employee-dashboard"
      );
    } catch {
      setMessage("Backend connection failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-decoration decoration-one"></div>
      <div className="login-decoration decoration-two"></div>

      <div className="login-shell">
        <div className="login-brand">
          <div className="brand-mark">
            <BriefcaseBusiness size={28} />
          </div>

          <div>
            <h1>WORKNEST</h1>
            <span>People • Performance • Progress</span>
          </div>
        </div>

        <div className="login-card">
          <div className="login-heading">
            <p className="eyebrow">WELCOME BACK</p>

            <h2>
              Work smarter.
              <br />
              Lead better.
            </h2>

            <p>
              Access your workspace securely using email verification.
            </p>
          </div>

          <div className="role-switch">
            <button
              className={role === "employee" ? "active" : ""}
              onClick={() => {
                setRole("employee");
                setMessage("");
              }}
              type="button"
            >
              <Users size={18} />
              Employee
            </button>

            <button
              className={role === "hr" ? "active" : ""}
              onClick={() => {
                setRole("hr");
                setMessage("");
              }}
              type="button"
            >
              <BriefcaseBusiness size={18} />
              HR
            </button>
          </div>

          <form onSubmit={login}>
            <label>Email address</label>

            <div className="input-box">
              <Mail size={19} />

              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (!otpSent) {
                    setMessage("");
                  }
                }}
              />
            </div>

            {!otpSent ? (
              <button
                type="button"
                className="primary-button"
                onClick={sendOtp}
                disabled={sendingOtp}
                style={{
                  opacity: sendingOtp ? 0.6 : 1,
                  cursor: sendingOtp ? "not-allowed" : "pointer",
                }}
              >
                {sendingOtp ? "Sending OTP..." : "Send verification OTP"}
                {!sendingOtp && <ArrowRight size={19} />}
              </button>
            ) : (
              <>
                <label>Verification OTP</label>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "center",
                    margin: "12px 0 20px",
                  }}
                  onPaste={handleOtpPaste}
                >
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        otpRefs.current[index] = element;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) =>
                        handleOtpChange(e.target.value, index)
                      }
                      onKeyDown={(e) =>
                        handleOtpKeyDown(e, index)
                      }
                      style={{
                        width: "48px",
                        height: "56px",
                        border: "1px solid #d1d5db",
                        borderRadius: "9px",
                        textAlign: "center",
                        fontSize: "24px",
                        fontWeight: "600",
                        outline: "none",
                        background: "#ffffff",
                        color: "#1f2937",
                      }}
                      aria-label={`OTP digit ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="primary-button"
                >
                  Enter {role === "hr" ? "HR" : "Employee"} Workspace
                  <ArrowRight size={19} />
                </button>

                <button
                  type="button"
                  className="resend-button"
                  onClick={sendOtp}
                  disabled={sendingOtp}
                  style={{
                    opacity: sendingOtp ? 0.6 : 1,
                    cursor: sendingOtp ? "not-allowed" : "pointer",
                  }}
                >
                  {sendingOtp ? "Sending..." : "Resend OTP"}
                </button>
              </>
            )}
          </form>

          {message && (
            <div className="login-message">
              {message}
            </div>
          )}

          <div className="security-note">
            <ShieldCheck size={17} />
            Secure email-based authentication
          </div>
        </div>

        <p className="login-footer">
          WORKNEST • One workspace for your entire organization
        </p>
      </div>
    </div>
  );
}

export default Login;