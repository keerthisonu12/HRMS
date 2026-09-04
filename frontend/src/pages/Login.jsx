import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  ShieldCheck,
  ArrowRight,
  Users,
  BriefcaseBusiness,
} from "lucide-react";
import "../styles/theme.css";

const API = "https://worknest-backend-xesk.onrender.com";

function Login() {
  const [role, setRole] = useState("employee");
  const [isSignup, setIsSignup] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const sendOtp = async () => {
    if (!email) {
      setMessage("Please enter your email");
      return;
    }

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
      setMessage(`OTP sent successfully. Test OTP: ${data.otp}`);
    } catch {
      setMessage("Backend connection failed");
    }
  };

  const signup = async (e) => {
    e.preventDefault();

    if (!name || !phone || !email) {
      setMessage("Please fill all required fields");
      return;
    }

    try {
      const response = await fetch(`${API}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          role: "employee",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Signup failed");
        return;
      }

      setMessage("Signup successful. Please login with your email.");
      setIsSignup(false);
      setName("");
      setPhone("");
      setOtp("");
      setOtpSent(false);
    } catch {
      setMessage("Backend connection failed");
    }
  };

  const login = async (e) => {
    e.preventDefault();

    if (!otp) {
      setMessage("Please enter OTP");
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
          otp,
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
            <p className="eyebrow">
              {isSignup ? "JOIN WORKNEST" : "WELCOME BACK"}
            </p>

            <h2>
              {isSignup ? (
                <>
                  Build your
                  <br />
                  workspace.
                </>
              ) : (
                <>
                  Work smarter.
                  <br />
                  Lead better.
                </>
              )}
            </h2>

            <p>
              {isSignup
                ? "Create your employee account securely."
                : "Access your workspace securely using email verification."}
            </p>
          </div>

          {!isSignup && (
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
          )}

          <form onSubmit={isSignup ? signup : login}>
            {isSignup && (
              <>
                <label>Full name</label>

                <div className="input-box">
                  <Users size={19} />

                  <input
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <label>Phone number</label>

                <div className="input-box">
                  <ShieldCheck size={19} />

                  <input
                    type="tel"
                    placeholder="Your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </>
            )}

            <label>Email address</label>

            <div className="input-box">
              <Mail size={19} />

              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {!isSignup && (
              <>
                {!otpSent ? (
                  <button
                    type="button"
                    className="primary-button"
                    onClick={sendOtp}
                  >
                    Send verification OTP
                    <ArrowRight size={19} />
                  </button>
                ) : (
                  <>
                    <label>Verification OTP</label>

                    <div className="input-box">
                      <ShieldCheck size={19} />

                      <input
                        type="text"
                        maxLength="6"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="primary-button">
                      Enter {role === "hr" ? "HR" : "Employee"} Workspace
                      <ArrowRight size={19} />
                    </button>

                    <button
                      type="button"
                      className="resend-button"
                      onClick={sendOtp}
                    >
                      Resend OTP
                    </button>
                  </>
                )}
              </>
            )}

            {isSignup && (
              <button type="submit" className="primary-button">
                Create Employee Account
                <ArrowRight size={19} />
              </button>
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

          <div style={{ textAlign: "center", marginTop: "18px" }}>
            <button
              type="button"
              className="resend-button"
              onClick={() => {
                setIsSignup(!isSignup);
                setMessage("");
                setOtpSent(false);
                setOtp("");
              }}
            >
              {isSignup
                ? "Already have an account? Login"
                : "New employee? Create an account"}
            </button>
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