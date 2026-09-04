import { useEffect, useState } from "react";
import {
  Bell,
  Plus,
  X,
  CalendarDays,
  Gift,
  Megaphone,
  Sparkles,
  Flower2,
  Cake,
  Sun,
} from "lucide-react";
import "../styles/theme.css";

const API = "https://worknest-backend-xesk.onrender.com";

function Notifications() {
  const role = localStorage.getItem("userRole");
  const token = localStorage.getItem("authToken");

  const [notifications, setNotifications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    message: "",
    category: "Holiday",
    date: "",
  });

  const getHeaders = (includeJson = false) => ({
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token}`,
  });

  const loadNotifications = async () => {
    try {
      const response = await fetch(`${API}/notifications/`, {
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Unable to load notifications");
        return;
      }

      setNotifications(data);
    } catch {
      setMessage("Backend connection failed");
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const createNotification = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API}/notifications/`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Unable to create notification");
        return;
      }

      setMessage("Notification created successfully");

      setForm({
        title: "",
        message: "",
        category: "Holiday",
        date: "",
      });

      setShowForm(false);
      loadNotifications();
    } catch {
      setMessage("Backend connection failed");
    }
  };

  const getIcon = (category) => {
    const value = category?.toLowerCase();

    if (value === "birthday") return <Gift size={24} />;
    if (value === "festival") return <Flower2 size={24} />;
    if (value === "holiday") return <Sun size={24} />;

    return <Megaphone size={24} />;
  };

  const toggleCard = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const FestivalTemplate = ({ item }) => {
    const open = expandedId === item.id;

    return (
      <div
        style={{
          position: "relative",
          marginTop: "18px",
          borderRadius: "24px",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #fff1f8 0%, #fff8dc 45%, #eafff4 100%)",
          border: "1px solid rgba(230,150,180,.35)",
          boxShadow: "0 12px 30px rgba(180,100,130,.12)",
        }}
      >
        <div
          style={{
            height: "9px",
            background:
              "linear-gradient(90deg,#ff7eb3,#ffd166,#7bdff2,#b8f28b,#c8a2ff)",
          }}
        />

        <div style={{ position: "absolute", top: "12px", left: "12px", fontSize: "23px" }}>
          🌸
        </div>

        <div style={{ position: "absolute", top: "8px", right: "15px", fontSize: "23px" }}>
          🌺
        </div>

        <div style={{ position: "absolute", bottom: "8px", left: "18px", fontSize: "20px" }}>
          🌼
        </div>

        <div style={{ position: "absolute", bottom: "8px", right: "18px", fontSize: "20px" }}>
          🌷
        </div>

        <div style={{ padding: "25px 20px 20px", textAlign: "center" }}>
          <div
            style={{
              width: "62px",
              height: "62px",
              margin: "0 auto 10px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,.75)",
              boxShadow: "0 8px 20px rgba(0,0,0,.08)",
            }}
          >
            <Flower2 size={30} />
          </div>

          <div
            style={{
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            FESTIVAL CELEBRATION
          </div>

          <h3 style={{ margin: "7px 0", fontSize: "20px" }}>
            {item.title}
          </h3>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "20px",
              background: "rgba(255,255,255,.8)",
              fontSize: "12px",
            }}
          >
            <CalendarDays size={14} />
            {item.date}
          </div>

          {open && (
            <div
              style={{
                marginTop: "15px",
                padding: "14px",
                borderRadius: "15px",
                background: "rgba(255,255,255,.7)",
                lineHeight: "1.6",
                fontSize: "14px",
                color: "#666a7d",
              }}
            >
              <Sparkles size={17} />
              <div style={{ marginTop: "5px" }}>{item.message}</div>
            </div>
          )}

          <button
            type="button"
            onClick={() => toggleCard(item.id)}
            style={{
              marginTop: "15px",
              border: "none",
              padding: "10px 20px",
              borderRadius: "25px",
              cursor: "pointer",
              fontWeight: "700",
              background: "#fff",
              boxShadow: "0 5px 15px rgba(0,0,0,.08)",
            }}
          >
            {open ? "Hide Wishes" : "🌸 Celebrate Together"}
          </button>
        </div>
      </div>
    );
  };

  const BirthdayTemplate = ({ item }) => {
    const open = expandedId === item.id;

    return (
      <div
        style={{
          position: "relative",
          marginTop: "18px",
          borderRadius: "24px",
          overflow: "hidden",
          background:
            "linear-gradient(145deg,#e8f7ff,#fff0f8,#fff8dc)",
          border: "1px solid rgba(130,170,230,.35)",
          boxShadow: "0 12px 30px rgba(100,140,200,.13)",
        }}
      >
        <div
          style={{
            height: "9px",
            background:
              "linear-gradient(90deg,#ff6b9a,#ffca3a,#4cc9f0,#9b5de5)",
          }}
        />

        <div style={{ position: "absolute", top: "4px", left: "8px", fontSize: "38px" }}>
          🎈
        </div>

        <div style={{ position: "absolute", top: "20px", right: "12px", fontSize: "34px" }}>
          🎈
        </div>

        <div style={{ position: "absolute", top: "75px", left: "28px", fontSize: "20px" }}>
          ✨
        </div>

        <div style={{ position: "absolute", top: "85px", right: "30px", fontSize: "20px" }}>
          ⭐
        </div>

        <div style={{ padding: "28px 20px 20px", textAlign: "center" }}>
          <div
            style={{
              width: "65px",
              height: "65px",
              margin: "0 auto 10px",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,.8)",
              transform: "rotate(-3deg)",
              boxShadow: "0 8px 20px rgba(0,0,0,.08)",
            }}
          >
            <Cake size={31} />
          </div>

          <div
            style={{
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "2px",
            }}
          >
            BIRTHDAY CELEBRATION
          </div>

          <h3 style={{ margin: "7px 0", fontSize: "20px" }}>
            {item.title}
          </h3>

          <p
            style={{
              margin: "5px 0",
              color: "#666a7d",
              fontSize: "13px",
            }}
          >
            🎂 Make a wish • Celebrate • Create memories 🎉
          </p>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "5px",
              padding: "6px 12px",
              borderRadius: "20px",
              background: "rgba(255,255,255,.8)",
              fontSize: "12px",
            }}
          >
            <CalendarDays size={14} />
            {item.date}
          </div>

          {open && (
            <div
              style={{
                marginTop: "15px",
                padding: "14px",
                borderRadius: "15px",
                background: "rgba(255,255,255,.75)",
                color: "#666a7d",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              💖 {item.message}
            </div>
          )}

          <button
            type="button"
            onClick={() => toggleCard(item.id)}
            style={{
              marginTop: "15px",
              border: "none",
              padding: "10px 20px",
              borderRadius: "25px",
              cursor: "pointer",
              fontWeight: "700",
              background: "#fff",
              boxShadow: "0 5px 15px rgba(0,0,0,.08)",
            }}
          >
            {open ? "Hide Message" : "🎈 Make a Wish"}
          </button>
        </div>
      </div>
    );
  };

  const HolidayTemplate = ({ item }) => {
    const open = expandedId === item.id;

    return (
      <div
        style={{
          position: "relative",
          marginTop: "18px",
          borderRadius: "24px",
          overflow: "hidden",
          background:
            "linear-gradient(135deg,#e6fff7,#eaf0ff,#fff4d9)",
          border: "1px solid rgba(100,180,160,.35)",
          boxShadow: "0 12px 30px rgba(70,150,140,.12)",
        }}
      >
        <div
          style={{
            height: "9px",
            background:
              "linear-gradient(90deg,#00c6ff,#7ed957,#ffd166,#ff8fab)",
          }}
        />

        <div style={{ position: "absolute", top: "12px", left: "15px", fontSize: "24px" }}>
          ☀️
        </div>

        <div style={{ position: "absolute", top: "15px", right: "18px", fontSize: "25px" }}>
          🌈
        </div>

        <div style={{ padding: "27px 20px 20px", textAlign: "center" }}>
          <div
            style={{
              width: "65px",
              height: "65px",
              margin: "0 auto 10px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,.8)",
              boxShadow: "0 8px 20px rgba(0,0,0,.08)",
            }}
          >
            <Sun size={32} />
          </div>

          <div
            style={{
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "2px",
            }}
          >
            SPECIAL HOLIDAY
          </div>

          <h3 style={{ margin: "7px 0", fontSize: "20px" }}>
            {item.title}
          </h3>

          <p
            style={{
              margin: "5px 0",
              color: "#666a7d",
              fontSize: "13px",
            }}
          >
            🌴 Relax • Recharge • Enjoy your day
          </p>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "20px",
              background: "rgba(255,255,255,.8)",
              fontSize: "12px",
            }}
          >
            <CalendarDays size={14} />
            {item.date}
          </div>

          {open && (
            <div
              style={{
                marginTop: "15px",
                padding: "14px",
                borderRadius: "15px",
                background: "rgba(255,255,255,.75)",
                color: "#666a7d",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              🌈 {item.message}
            </div>
          )}

          <button
            type="button"
            onClick={() => toggleCard(item.id)}
            style={{
              marginTop: "15px",
              border: "none",
              padding: "10px 20px",
              borderRadius: "25px",
              cursor: "pointer",
              fontWeight: "700",
              background: "#fff",
              boxShadow: "0 5px 15px rgba(0,0,0,.08)",
            }}
          >
            {open ? "Hide Details" : "☀️ Enjoy Your Day"}
          </button>
        </div>
      </div>
    );
  };

  const AnnouncementTemplate = ({ item }) => {
    const open = expandedId === item.id;

    return (
      <div
        style={{
          position: "relative",
          marginTop: "18px",
          borderRadius: "24px",
          overflow: "hidden",
          background:
            "linear-gradient(135deg,#eef2ff,#f7edff,#e8fbff)",
          border: "1px solid rgba(130,130,220,.3)",
          boxShadow: "0 12px 30px rgba(90,90,170,.12)",
        }}
      >
        <div
          style={{
            height: "9px",
            background:
              "linear-gradient(90deg,#6c63ff,#a855f7,#38bdf8)",
          }}
        />

        <div style={{ padding: "24px 20px 20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "54px",
                height: "54px",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,.8)",
              }}
            >
              <Megaphone size={27} />
            </div>

            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "1.5px",
                }}
              >
                WORKNEST UPDATE
              </div>

              <h3 style={{ margin: "5px 0 0", fontSize: "18px" }}>
                {item.title}
              </h3>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "15px",
              fontSize: "12px",
              color: "#666a7d",
            }}
          >
            <CalendarDays size={14} />
            {item.date}
          </div>

          {open && (
            <div
              style={{
                marginTop: "15px",
                padding: "14px",
                borderRadius: "15px",
                background: "rgba(255,255,255,.75)",
                color: "#666a7d",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              {item.message}
            </div>
          )}

          <button
            type="button"
            onClick={() => toggleCard(item.id)}
            style={{
              marginTop: "15px",
              border: "none",
              padding: "10px 20px",
              borderRadius: "25px",
              cursor: "pointer",
              fontWeight: "700",
              background: "#fff",
              boxShadow: "0 5px 15px rgba(0,0,0,.08)",
            }}
          >
            {open ? "Close Update" : "📢 Read Announcement"}
          </button>
        </div>
      </div>
    );
  };

  const renderTemplate = (item) => {
    const category = item.category?.toLowerCase();

    if (category === "festival") {
      return <FestivalTemplate item={item} />;
    }

    if (category === "birthday") {
      return <BirthdayTemplate item={item} />;
    }

    if (category === "holiday") {
      return <HolidayTemplate item={item} />;
    }

    return <AnnouncementTemplate item={item} />;
  };

  return (
    <div className="employees-page">
      <div className="employees-header">
        <div>
          <p className="dashboard-eyebrow">ORGANIZATION UPDATES</p>

          <h1>Notifications</h1>

          <p className="dashboard-subtitle">
            Stay updated with holidays, birthdays, festivals and important events.
          </p>
        </div>

        {role === "hr" && (
          <button
            className="primary-button employees-add-button"
            onClick={() => setShowForm(true)}
          >
            <Plus size={18} />
            Add Notification
          </button>
        )}
      </div>

      {message && (
        <div className="login-message">
          {message}
        </div>
      )}

      <div className="employees-grid">
        {notifications.length === 0 ? (
          <div className="empty-employees">
            <Bell size={40} />

            <h3>No notifications</h3>

            <p>
              Organization notifications will appear here.
            </p>
          </div>
        ) : (
          notifications.map((item) => (
            <div className="employee-card" key={item.id}>
              <div className="employee-card-top">
                <div className="employee-avatar">
                  {getIcon(item.category)}
                </div>

                <span className="employee-role">
                  {item.category}
                </span>
              </div>

              {renderTemplate(item)}
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="employee-modal-overlay">
          <div className="employee-modal">
            <button
              className="modal-close"
              onClick={() => setShowForm(false)}
            >
              <X size={20} />
            </button>

            <div className="modal-heading">
              <div className="modal-icon">
                <Bell size={23} />
              </div>

              <div>
                <p className="panel-label">ORGANIZATION UPDATE</p>
                <h2>Add notification</h2>
              </div>
            </div>

            <form
              onSubmit={createNotification}
              className="employee-form"
            >
              <label>Title</label>

              <input
                type="text"
                placeholder="e.g. Happy Ganesh Chaturthi"
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
                required
              />

              <label>Message</label>

              <input
                type="text"
                placeholder="Enter notification message"
                value={form.message}
                onChange={(e) =>
                  setForm({
                    ...form,
                    message: e.target.value,
                  })
                }
                required
              />

              <label>Category</label>

              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                  })
                }
              >
                <option value="Holiday">Holiday</option>
                <option value="Birthday">Birthday</option>
                <option value="Festival">Festival</option>
                <option value="Announcement">Announcement</option>
              </select>

              <label>Date</label>

              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    date: e.target.value,
                  })
                }
                required
              />

              <button
                type="submit"
                className="primary-button"
              >
                Create Notification
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;