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
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Send,
} from "lucide-react";
import * as XLSX from "xlsx";
import "../styles/theme.css";

const API = "http://127.0.0.1:8000";

const defaultNotifications = [
  {
    id: "default-birthday",
    title: "Team Birthday Celebration",
    message: "Wishing our team member a wonderful birthday! 🎉",
    category: "Birthday",
    date: "2026-09-10",
  },
  {
    id: "default-holiday",
    title: "Special Holiday",
    message: "Take some time to relax, recharge and enjoy your day.",
    category: "Holiday",
    date: "2026-10-02",
  },
  {
    id: "default-announcement",
    title: "Important Team Update",
    message: "Stay connected with the latest WORKNEST organization updates.",
    category: "Announcement",
    date: "2026-09-04",
  },
];

function Notifications() {
  const role = localStorage.getItem("userRole");
  const token = localStorage.getItem("authToken");

  const [notifications, setNotifications] = useState([]);
  const [upcomingNotifications, setUpcomingNotifications] = useState([]);
  const [sentNotifications, setSentNotifications] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [sentPage, setSentPage] = useState(1);
  const [upcomingPage, setUpcomingPage] = useState(1);

  const notificationsPerPage = 6;

  const [form, setForm] = useState({
    title: "",
    message: "",
    category: "Holiday",
    date: "",
  });

  const [sentIds, setSentIds] = useState([]);

  const getHeaders = (includeJson = false) => ({
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token}`,
  });

  const loadNotifications = async () => {
    try {
      const [notificationResponse, holidayResponse] =
        await Promise.all([
          fetch(`${API}/notifications/`, {
            headers: getHeaders(),
          }),
          fetch(`${API}/notifications/holidays`, {
            headers: getHeaders(),
          }),
        ]);

      const notificationData =
        await notificationResponse.json();

      const holidayData =
        await holidayResponse.json();

      if (!notificationResponse.ok) {
        setMessage(
          notificationData.detail ||
            "Unable to load notifications"
        );
        return;
      }

      const normalNotifications =
        Array.isArray(notificationData)
          ? notificationData
          : [];

      const upcomingHolidays =
        holidayResponse.ok &&
        Array.isArray(holidayData)
          ? holidayData.map((holiday) => {
              const title =
                holiday.title?.toLowerCase() || "";

              const festival =
                title.includes("ganesh") ||
                title.includes("diwali") ||
                title.includes("holi") ||
                title.includes("pongal") ||
                title.includes("dussehra") ||
                title.includes("raksha");

              return {
                ...holiday,
                category: festival
                  ? "Festival"
                  : "Holiday",
              };
            })
          : [];

      const existingCategories =
        normalNotifications.map(
          (item) =>
            item.category?.toLowerCase()
        );

      const missingDefaults =
        defaultNotifications.filter(
          (item) =>
            !existingCategories.includes(
              item.category.toLowerCase()
            )
        );

      const allNormalNotifications = [
        ...normalNotifications,
        ...missingDefaults,
      ];

      setSentNotifications(allNormalNotifications);
      setUpcomingNotifications(upcomingHolidays);

      setNotifications([
        ...upcomingHolidays,
        ...allNormalNotifications,
      ]);

      setCurrentPage(1);
      setSentPage(1);
      setUpcomingPage(1);
    } catch {
      setMessage("Backend connection failed");

      setSentNotifications(defaultNotifications);
      setUpcomingNotifications([]);

      setNotifications(defaultNotifications);

      setCurrentPage(1);
      setSentPage(1);
      setUpcomingPage(1);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // HR SENDS AN UPCOMING NOTIFICATION
  const sendUpcomingNotification = async (item) => {
    if (role !== "hr") return;

    if (sentIds.includes(item.id)) {
      setMessage(
        "This notification has already been sent."
      );
      return;
    }

    setMessage("");

    try {
      const response = await fetch(
        `${API}/notifications/`,
        {
          method: "POST",
          headers: getHeaders(true),
          body: JSON.stringify({
            title: item.title,
            message: item.message,
            category:
              item.category === "Festival"
                ? "Festival"
                : item.category || "Holiday",
            date: item.date,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail ||
            "Unable to send notification"
        );
        return;
      }

      setSentIds((previous) => [
        ...previous,
        item.id,
      ]);

      setMessage(
        `${item.title} notification sent successfully to employees.`
      );

      await loadNotifications();
    } catch {
      setMessage("Backend connection failed");
    }
  };

  // HR CREATE NOTIFICATION
  const createNotification = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        `${API}/notifications/`,
        {
          method: "POST",
          headers: getHeaders(true),
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail ||
            "Unable to create notification"
        );
        return;
      }

      setMessage(
        "Notification created successfully"
      );

      setForm({
        title: "",
        message: "",
        category: "Holiday",
        date: "",
      });

      setShowForm(false);

      await loadNotifications();
    } catch {
      setMessage("Backend connection failed");
    }
  };

  const exportToExcel = () => {
    if (notifications.length === 0) {
      setMessage(
        "No notification data available to export"
      );
      return;
    }

    const data = notifications.map((item) => ({
      "Notification ID": item.id || "",
      Title: item.title || "",
      Message: item.message || "",
      Category: item.category || "",
      Date: item.date || "",
    }));

    const worksheet =
      XLSX.utils.json_to_sheet(data);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Notifications"
    );

    XLSX.writeFile(
      workbook,
      "WORKNEST_Notifications.xlsx"
    );

    setMessage(
      "Notification data exported to Excel successfully"
    );
  };

  const getIcon = (category) => {
    const value =
      category?.toLowerCase();

    if (value === "birthday")
      return <Gift size={20} />;

    if (value === "festival")
      return <Flower2 size={20} />;

    if (value === "holiday")
      return <Sun size={20} />;

    return <Megaphone size={20} />;
  };

  const toggleCard = (id) => {
    setExpandedId(
      expandedId === id ? null : id
    );
  };

  const SendButton = ({ item }) => {
    if (role !== "hr") return null;

    const alreadySent =
      sentIds.includes(item.id);

    return (
      <button
        type="button"
        onClick={() =>
          sendUpcomingNotification(item)
        }
        disabled={alreadySent}
        style={{
          marginTop: "9px",
          border: "none",
          padding: "6px 13px",
          borderRadius: "18px",
          cursor: alreadySent
            ? "default"
            : "pointer",
          fontWeight: "700",
          fontSize: "10px",
          background: alreadySent
            ? "#e8f7ef"
            : "#6254e9",
          color: alreadySent
            ? "#168a5b"
            : "#ffffff",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "5px",
        }}
      >
        <Send size={11} />

        {alreadySent
          ? "Sent to Employees"
          : "Send to Employees"}
      </button>
    );
  };

  const FestivalTemplate = ({ item }) => {
    const open =
      expandedId === item.id;

    return (
      <div
        style={{
          marginTop: "10px",
          borderRadius: "16px",
          overflow: "hidden",
          background:
            "linear-gradient(135deg,#fff1f8,#fff8dc,#eafff4)",
          border:
            "1px solid rgba(230,150,180,.35)",
          boxShadow:
            "0 6px 18px rgba(180,100,130,.10)",
        }}
      >
        <div
          style={{
            height: "5px",
            background:
              "linear-gradient(90deg,#ff7eb3,#ffd166,#7bdff2,#b8f28b,#c8a2ff)",
          }}
        />

        <div
          style={{
            padding: "14px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              margin: "0 auto 7px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "rgba(255,255,255,.75)",
            }}
          >
            <Flower2 size={21} />
          </div>

          <div
            style={{
              fontSize: "9px",
              fontWeight: "700",
              letterSpacing: "1.4px",
            }}
          >
            FESTIVAL CELEBRATION
          </div>

          <h3
            style={{
              margin: "5px 0",
              fontSize: "16px",
            }}
          >
            {item.title}
          </h3>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 9px",
              borderRadius: "15px",
              background:
                "rgba(255,255,255,.8)",
              fontSize: "10px",
            }}
          >
            <CalendarDays size={11} />
            {item.date}
          </div>

          {open && (
            <div
              style={{
                marginTop: "10px",
                padding: "9px",
                borderRadius: "10px",
                background:
                  "rgba(255,255,255,.7)",
                fontSize: "11px",
                color: "#666a7d",
              }}
            >
              <Sparkles size={13} />
              <div>{item.message}</div>
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              toggleCard(item.id)
            }
            style={{
              marginTop: "10px",
              border: "none",
              padding: "6px 13px",
              borderRadius: "18px",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "10px",
              background: "#fff",
            }}
          >
            {open
              ? "Hide Wishes"
              : "🌸 Celebrate Together"}
          </button>

          <SendButton item={item} />
        </div>
      </div>
    );
  };

  const BirthdayTemplate = ({ item }) => {
    const open =
      expandedId === item.id;

    return (
      <div
        style={{
          marginTop: "10px",
          borderRadius: "16px",
          overflow: "hidden",
          background:
            "linear-gradient(145deg,#e8f7ff,#fff0f8,#fff8dc)",
          border:
            "1px solid rgba(130,170,230,.35)",
          boxShadow:
            "0 6px 18px rgba(100,140,200,.10)",
        }}
      >
        <div
          style={{
            height: "5px",
            background:
              "linear-gradient(90deg,#ff6b9a,#ffca3a,#4cc9f0,#9b5de5)",
          }}
        />

        <div
          style={{
            padding: "15px 14px 12px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              margin: "0 auto 7px",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "rgba(255,255,255,.8)",
            }}
          >
            <Cake size={22} />
          </div>

          <div
            style={{
              fontSize: "9px",
              fontWeight: "700",
              letterSpacing: "1.4px",
            }}
          >
            BIRTHDAY CELEBRATION
          </div>

          <h3
            style={{
              margin: "5px 0",
              fontSize: "16px",
            }}
          >
            {item.title}
          </h3>

          <p
            style={{
              margin: "4px 0",
              color: "#666a7d",
              fontSize: "10px",
            }}
          >
            🎂 Make a wish • Celebrate 🎉
          </p>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 9px",
              borderRadius: "15px",
              background:
                "rgba(255,255,255,.8)",
              fontSize: "10px",
            }}
          >
            <CalendarDays size={11} />
            {item.date}
          </div>

          {open && (
            <div
              style={{
                marginTop: "10px",
                padding: "9px",
                borderRadius: "10px",
                background:
                  "rgba(255,255,255,.75)",
                color: "#666a7d",
                fontSize: "11px",
              }}
            >
              💖 {item.message}
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              toggleCard(item.id)
            }
            style={{
              marginTop: "10px",
              border: "none",
              padding: "6px 13px",
              borderRadius: "18px",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "10px",
              background: "#fff",
            }}
          >
            {open
              ? "Hide Message"
              : "🎈 Make a Wish"}
          </button>

          <SendButton item={item} />
        </div>
      </div>
    );
  };

  const HolidayTemplate = ({ item }) => {
    const open =
      expandedId === item.id;

    return (
      <div
        style={{
          marginTop: "10px",
          borderRadius: "16px",
          overflow: "hidden",
          background:
            "linear-gradient(135deg,#e6fff7,#eaf0ff,#fff4d9)",
          border:
            "1px solid rgba(100,180,160,.35)",
          boxShadow:
            "0 6px 18px rgba(70,150,140,.10)",
        }}
      >
        <div
          style={{
            height: "5px",
            background:
              "linear-gradient(90deg,#00c6ff,#7ed957,#ffd166,#ff8fab)",
          }}
        />

        <div
          style={{
            padding: "15px 14px 12px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              margin: "0 auto 7px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "rgba(255,255,255,.8)",
            }}
          >
            <Sun size={22} />
          </div>

          <div
            style={{
              fontSize: "9px",
              fontWeight: "700",
              letterSpacing: "1.4px",
            }}
          >
            SPECIAL HOLIDAY
          </div>

          <h3
            style={{
              margin: "5px 0",
              fontSize: "16px",
            }}
          >
            {item.title}
          </h3>

          <p
            style={{
              margin: "4px 0",
              color: "#666a7d",
              fontSize: "10px",
            }}
          >
            🌴 Relax • Recharge • Enjoy
          </p>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 9px",
              borderRadius: "15px",
              background:
                "rgba(255,255,255,.8)",
              fontSize: "10px",
            }}
          >
            <CalendarDays size={11} />
            {item.date}
          </div>

          {open && (
            <div
              style={{
                marginTop: "10px",
                padding: "9px",
                borderRadius: "10px",
                background:
                  "rgba(255,255,255,.75)",
                color: "#666a7d",
                fontSize: "11px",
              }}
            >
              🌈 {item.message}
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              toggleCard(item.id)
            }
            style={{
              marginTop: "10px",
              border: "none",
              padding: "6px 13px",
              borderRadius: "18px",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "10px",
              background: "#fff",
            }}
          >
            {open
              ? "Hide Details"
              : "☀️ Enjoy Your Day"}
          </button>

          <SendButton item={item} />
        </div>
      </div>
    );
  };

  const AnnouncementTemplate = ({
    item,
  }) => {
    const open =
      expandedId === item.id;

    return (
      <div
        style={{
          marginTop: "10px",
          borderRadius: "16px",
          overflow: "hidden",
          background:
            "linear-gradient(135deg,#eef2ff,#f7edff,#e8fbff)",
          border:
            "1px solid rgba(130,130,220,.3)",
          boxShadow:
            "0 6px 18px rgba(90,90,170,.10)",
        }}
      >
        <div
          style={{
            height: "5px",
            background:
              "linear-gradient(90deg,#6c63ff,#a855f7,#38bdf8)",
          }}
        />

        <div style={{ padding: "14px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "rgba(255,255,255,.8)",
              }}
            >
              <Megaphone size={20} />
            </div>

            <div>
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: "700",
                  letterSpacing: "1.2px",
                }}
              >
                WORKNEST UPDATE
              </div>

              <h3
                style={{
                  margin: "4px 0 0",
                  fontSize: "15px",
                }}
              >
                {item.title}
              </h3>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginTop: "10px",
              fontSize: "10px",
              color: "#666a7d",
            }}
          >
            <CalendarDays size={11} />
            {item.date}
          </div>

          {open && (
            <div
              style={{
                marginTop: "10px",
                padding: "9px",
                borderRadius: "10px",
                background:
                  "rgba(255,255,255,.75)",
                color: "#666a7d",
                fontSize: "11px",
              }}
            >
              {item.message}
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              toggleCard(item.id)
            }
            style={{
              marginTop: "10px",
              border: "none",
              padding: "6px 13px",
              borderRadius: "18px",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "10px",
              background: "#fff",
            }}
          >
            {open
              ? "Close Update"
              : "📢 Read Announcement"}
          </button>

          <SendButton item={item} />
        </div>
      </div>
    );
  };

  const renderTemplate = (item) => {
    const category =
      item.category?.toLowerCase();

    if (category === "festival") {
      return (
        <FestivalTemplate item={item} />
      );
    }

    if (category === "birthday") {
      return (
        <BirthdayTemplate item={item} />
      );
    }

    if (category === "holiday") {
      return (
        <HolidayTemplate item={item} />
      );
    }

    return (
      <AnnouncementTemplate item={item} />
    );
  };

  const filteredNotifications =
    notifications.filter((item) => {
      const categoryMatch =
        !categoryFilter ||
        item.category?.toLowerCase() ===
          categoryFilter.toLowerCase();

      const startDateMatch =
        !startDateFilter ||
        item.date >= startDateFilter;

      const endDateMatch =
        !endDateFilter ||
        item.date <= endDateFilter;

      return (
        categoryMatch &&
        startDateMatch &&
        endDateMatch
      );
    });

  const filteredSentNotifications =
    sentNotifications.filter((item) => {
      const categoryMatch =
        !categoryFilter ||
        item.category?.toLowerCase() ===
          categoryFilter.toLowerCase();

      const startDateMatch =
        !startDateFilter ||
        item.date >= startDateFilter;

      const endDateMatch =
        !endDateFilter ||
        item.date <= endDateFilter;

      return (
        categoryMatch &&
        startDateMatch &&
        endDateMatch
      );
    });

  const filteredUpcomingNotifications =
    upcomingNotifications.filter((item) => {
      const categoryMatch =
        !categoryFilter ||
        item.category?.toLowerCase() ===
          categoryFilter.toLowerCase();

      const startDateMatch =
        !startDateFilter ||
        item.date >= startDateFilter;

      const endDateMatch =
        !endDateFilter ||
        item.date <= endDateFilter;

      return (
        categoryMatch &&
        startDateMatch &&
        endDateMatch
      );
    });

  const clearFilters = () => {
    setCategoryFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    setCurrentPage(1);
    setSentPage(1);
    setUpcomingPage(1);
    setExpandedId(null);
  };

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredNotifications.length /
        notificationsPerPage
    )
  );

  const sentTotalPages = Math.max(
    1,
    Math.ceil(
      filteredSentNotifications.length /
        notificationsPerPage
    )
  );

  const upcomingTotalPages = Math.max(
    1,
    Math.ceil(
      filteredUpcomingNotifications.length /
        notificationsPerPage
    )
  );

  const startIndex =
    (currentPage - 1) *
    notificationsPerPage;

  const sentStartIndex =
    (sentPage - 1) *
    notificationsPerPage;

  const upcomingStartIndex =
    (upcomingPage - 1) *
    notificationsPerPage;

  const currentNotifications =
    filteredNotifications.slice(
      startIndex,
      startIndex + notificationsPerPage
    );

  const currentSentNotifications =
    filteredSentNotifications.slice(
      sentStartIndex,
      sentStartIndex + notificationsPerPage
    );

  const currentUpcomingNotifications =
    filteredUpcomingNotifications.slice(
      upcomingStartIndex,
      upcomingStartIndex +
        notificationsPerPage
    );

  const goToPage = (page) => {
    setCurrentPage(page);
    setExpandedId(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goToSentPage = (page) => {
    setSentPage(page);
    setExpandedId(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goToUpcomingPage = (page) => {
    setUpcomingPage(page);
    setExpandedId(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const Pagination = ({
    page,
    totalPages,
    onPageChange,
  }) => {
    if (totalPages <= 1) return null;

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          marginTop: "25px",
          marginBottom: "10px",
          width: "100%",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() =>
            onPageChange(page - 1)
          }
          disabled={page === 1}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "9px 14px",
            borderRadius: "9px",
            border:
              "1px solid #e1e2e9",
            background:
              page === 1
                ? "#f3f3f6"
                : "#fff",
            color:
              page === 1
                ? "#aaa"
                : "#6254e9",
            cursor:
              page === 1
                ? "not-allowed"
                : "pointer",
          }}
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        {Array.from(
          { length: totalPages },
          (_, index) => index + 1
        ).map((number) => (
          <button
            type="button"
            key={number}
            onClick={() =>
              onPageChange(number)
            }
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "9px",
              border:
                page === number
                  ? "1px solid #6254e9"
                  : "1px solid #e1e2e9",
              background:
                page === number
                  ? "#6254e9"
                  : "#fff",
              color:
                page === number
                  ? "#fff"
                  : "#59647b",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            {number}
          </button>
        ))}

        <button
          type="button"
          onClick={() =>
            onPageChange(page + 1)
          }
          disabled={
            page === totalPages
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "9px 14px",
            borderRadius: "9px",
            border:
              "1px solid #e1e2e9",
            background:
              page === totalPages
                ? "#f3f3f6"
                : "#fff",
            color:
              page === totalPages
                ? "#aaa"
                : "#6254e9",
            cursor:
              page === totalPages
                ? "not-allowed"
                : "pointer",
          }}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  const NotificationCards = ({
    items,
    emptyTitle,
    emptyMessage,
  }) => {
    return (
      <div className="employees-grid">
        {items.length === 0 ? (
          <div className="empty-employees">
            <Bell size={40} />

            <h3>{emptyTitle}</h3>

            <p>{emptyMessage}</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              className="employee-card"
              key={item.id}
            >
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
    );
  };

  return (
    <div className="employees-page">
      <div className="employees-header">
        <div>
          <p className="dashboard-eyebrow">
            ORGANIZATION UPDATES
          </p>

          <h1>Notifications</h1>

          <p className="dashboard-subtitle">
            Stay updated with holidays, birthdays,
            festivals and important events.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={exportToExcel}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              padding: "10px 15px",
              border: "none",
              borderRadius: "10px",
              background: "#168a5b",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "600",
              marginTop: "0",
              flexShrink: 0,
            }}
          >
            <FileSpreadsheet size={17} />
            Export Excel
          </button>

          {role === "hr" && (
            <button
              className="primary-button employees-add-button"
              onClick={() =>
                setShowForm(true)
              }
              style={{
                marginTop: "0",
                flexShrink: 0,
              }}
            >
              <Plus size={18} />
              Add Notification
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="login-message">
          {message}
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "22px",
          padding: "14px",
          background: "#fff",
          border:
            "1px solid #e5e7ef",
          borderRadius: "14px",
        }}
      >
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(
              e.target.value
            );
            setCurrentPage(1);
            setSentPage(1);
            setUpcomingPage(1);
            setExpandedId(null);
          }}
          style={{
            height: "38px",
            padding: "0 10px",
            border:
              "1px solid #e1e2e9",
            borderRadius: "9px",
            fontSize: "13px",
            background: "#fff",
          }}
        >
          <option value="">
            All Categories
          </option>
          <option value="Holiday">
            Holiday
          </option>
          <option value="Birthday">
            Birthday
          </option>
          <option value="Festival">
            Festival
          </option>
          <option value="Announcement">
            Announcement
          </option>
        </select>

        <input
          type="date"
          value={startDateFilter}
          onChange={(e) => {
            setStartDateFilter(
              e.target.value
            );
            setCurrentPage(1);
            setSentPage(1);
            setUpcomingPage(1);
            setExpandedId(null);
          }}
          style={{
            height: "38px",
            padding: "0 10px",
            border:
              "1px solid #e1e2e9",
            borderRadius: "9px",
            fontSize: "13px",
          }}
        />

        <input
          type="date"
          value={endDateFilter}
          onChange={(e) => {
            setEndDateFilter(
              e.target.value
            );
            setCurrentPage(1);
            setSentPage(1);
            setUpcomingPage(1);
            setExpandedId(null);
          }}
          style={{
            height: "38px",
            padding: "0 10px",
            border:
              "1px solid #e1e2e9",
            borderRadius: "9px",
            fontSize: "13px",
          }}
        />

        <button
          type="button"
          onClick={clearFilters}
          style={{
            height: "38px",
            padding: "0 13px",
            border:
              "1px solid #e1e2e9",
            borderRadius: "9px",
            background: "#f5f4ff",
            color: "#6254e9",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          Clear Filters
        </button>

        <span
          style={{
            fontSize: "12px",
            color: "#8a94aa",
          }}
        >
          {role === "employee"
            ? `${filteredSentNotifications.length} sent • ${filteredUpcomingNotifications.length} upcoming`
            : `${filteredNotifications.length} notification${
                filteredNotifications.length !==
                1
                  ? "s"
                  : ""
              }`}
        </span>
      </div>

      {/* =========================
          EMPLOYEE VIEW
         ========================= */}

      {role === "employee" ? (
        <>
          {/* SENT BY HR */}
          <section>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "11px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg,#7057ed,#8b78ff)",
                  color: "#fff",
                }}
              >
                <Bell size={19} />
              </div>

              <div>
                <p
                  className="panel-label"
                  style={{
                    margin: 0,
                  }}
                >
                  FROM HR
                </p>

                <h2
                  style={{
                    margin: "3px 0 0",
                    fontSize: "20px",
                    color: "#18233b",
                  }}
                >
                  Notifications from HR
                </h2>
              </div>
            </div>

            <NotificationCards
              items={currentSentNotifications}
              emptyTitle="No notifications from HR"
              emptyMessage="Notifications sent by HR will appear here."
            />

            <Pagination
              page={sentPage}
              totalPages={sentTotalPages}
              onPageChange={goToSentPage}
            />
          </section>

          {/* UPCOMING */}
          <section
            style={{
              marginTop: "42px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "11px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg,#ff9f43,#ffd166)",
                  color: "#fff",
                }}
              >
                <CalendarDays size={19} />
              </div>

              <div>
                <p
                  className="panel-label"
                  style={{
                    margin: 0,
                  }}
                >
                  UPCOMING
                </p>

                <h2
                  style={{
                    margin: "3px 0 0",
                    fontSize: "20px",
                    color: "#18233b",
                  }}
                >
                  Upcoming Notifications
                </h2>
              </div>
            </div>

            <NotificationCards
              items={
                currentUpcomingNotifications
              }
              emptyTitle="No upcoming notifications"
              emptyMessage="Upcoming holidays and festivals will appear here."
            />

            <Pagination
              page={upcomingPage}
              totalPages={
                upcomingTotalPages
              }
              onPageChange={
                goToUpcomingPage
              }
            />
          </section>
        </>
      ) : (
        /* =========================
           HR VIEW — UNCHANGED
           ========================= */
        <>
          <div className="employees-grid">
            {filteredNotifications.length ===
            0 ? (
              <div className="empty-employees">
                <Bell size={40} />

                <h3>
                  No notifications found
                </h3>

                <p>
                  Try changing your filters.
                </p>
              </div>
            ) : (
              currentNotifications.map(
                (item) => (
                  <div
                    className="employee-card"
                    key={item.id}
                  >
                    <div className="employee-card-top">
                      <div className="employee-avatar">
                        {getIcon(
                          item.category
                        )}
                      </div>

                      <span className="employee-role">
                        {item.category}
                      </span>
                    </div>

                    {renderTemplate(item)}
                  </div>
                )
              )
            )}
          </div>

          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </>
      )}

      {showForm && (
        <div className="employee-modal-overlay">
          <div className="employee-modal">
            <button
              type="button"
              className="modal-close"
              onClick={() =>
                setShowForm(false)
              }
            >
              <X size={20} />
            </button>

            <div className="modal-heading">
              <div className="modal-icon">
                <Bell size={23} />
              </div>

              <div>
                <p className="panel-label">
                  ORGANIZATION UPDATE
                </p>

                <h2>
                  Add notification
                </h2>
              </div>
            </div>

            <form
              onSubmit={
                createNotification
              }
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
                    title:
                      e.target.value,
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
                    message:
                      e.target.value,
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
                    category:
                      e.target.value,
                  })
                }
              >
                <option value="Holiday">
                  Holiday
                </option>

                <option value="Birthday">
                  Birthday
                </option>

                <option value="Festival">
                  Festival
                </option>

                <option value="Announcement">
                  Announcement
                </option>
              </select>

              <label>Date</label>

              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    date:
                      e.target.value,
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