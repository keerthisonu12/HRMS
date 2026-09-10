import { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  FileText,
  TrendingUp,
  Search,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import "../styles/theme.css";

const API = "http://127.0.0.1:8000";

function Analytics() {
  const [analytics, setAnalytics] = useState([]);
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [employeeFilter, setEmployeeFilter] = useState("");
  const [minPercentage, setMinPercentage] = useState("");
  const [maxPercentage, setMaxPercentage] = useState("");

  const analyticsPerPage = 6;

  const loadAnalytics = async () => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(`${API}/analytics/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Unable to load analytics");
        return;
      }

      if (!Array.isArray(data)) {
        setAnalytics([]);
        setMessage(data.message || "No work reports available");
        setCurrentPage(1);
        return;
      }

      setAnalytics(data);
      setCurrentPage(1);
    } catch {
      setMessage("Backend connection failed");
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  // ---------------- EXPORT EXCEL ----------------

  const exportToExcel = () => {
    if (analytics.length === 0) {
      setMessage("No analytics data available to export.");
      return;
    }

    const exportData = analytics.map((item) => ({
      "Employee Email": item.employee_email,
      "Work Reports": item.work_reports,
      "Work Percentage": `${item.work_percentage}%`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Analytics"
    );

    XLSX.writeFile(
      workbook,
      "WORKNEST_Analytics.xlsx"
    );
  };

  // ---------------- FILTER ANALYTICS ----------------

  const filteredAnalytics = analytics.filter((item) => {
    const employeeMatch =
      !employeeFilter ||
      (item.employee_email || "")
        .toLowerCase()
        .includes(employeeFilter.toLowerCase());

    const percentage = Number(
      item.work_percentage || 0
    );

    const minMatch =
      minPercentage === "" ||
      percentage >= Number(minPercentage);

    const maxMatch =
      maxPercentage === "" ||
      percentage <= Number(maxPercentage);

    return employeeMatch && minMatch && maxMatch;
  });

  const clearFilters = () => {
    setEmployeeFilter("");
    setMinPercentage("");
    setMaxPercentage("");
    setCurrentPage(1);
  };

  const totalReports = filteredAnalytics.reduce(
    (total, item) =>
      total + Number(item.work_reports || 0),
    0
  );

  // ---------------- PAGINATION ----------------

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredAnalytics.length / analyticsPerPage
    )
  );

  const startIndex =
    (currentPage - 1) * analyticsPerPage;

  const currentAnalytics =
    filteredAnalytics.slice(
      startIndex,
      startIndex + analyticsPerPage
    );

  const goToPage = (page) => {
    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const previousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  return (
    <div className="employees-page">

      {/* HEADER */}

      <div className="employees-header">

        <div>
          <p className="dashboard-eyebrow">
            PERFORMANCE INSIGHTS
          </p>

          <h1>Work Analytics</h1>

          <p className="dashboard-subtitle">
            Compare employee workload using work report percentages.
          </p>
        </div>

        <div
          className="page-header-actions"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "12px",
            flexWrap: "nowrap",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            className="primary-button export-button"
            onClick={exportToExcel}
            style={{
              width: "auto",
              minWidth: "145px",
              height: "48px",
              marginTop: "0",
              padding: "0 18px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              background: "#168a5b",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <FileSpreadsheet size={17} />
            Export Excel
          </button>

          <div
            className="employee-count live-analytics-badge"
            style={{
              height: "48px",
              padding: "0 14px",
              borderRadius: "12px",
              background: "#ffffff",
              border: "1px solid #e5e7ef",
              boxSizing: "border-box",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <BarChart3 size={18} />
            Live Analytics
          </div>
        </div>
      </div>

      {message && (
        <div className="login-message">
          {message}
        </div>
      )}

      {/* FILTERS */}

      <div
        className="analytics-filters"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "22px",
          padding: "14px",
          background: "#ffffff",
          border: "1px solid #e5e7ef",
          borderRadius: "14px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
          }}
        >
          <Search size={16} color="#7d879d" />

          <input
            type="text"
            placeholder="Employee email..."
            value={employeeFilter}
            onChange={(e) => {
              setEmployeeFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              height: "38px",
              padding: "0 11px",
              border: "1px solid #e1e2e9",
              borderRadius: "9px",
              outline: "none",
              fontSize: "13px",
            }}
          />
        </div>

        <select
          value={minPercentage}
          onChange={(e) => {
            setMinPercentage(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            height: "38px",
            padding: "0 10px",
            border: "1px solid #e1e2e9",
            borderRadius: "9px",
            outline: "none",
            fontSize: "13px",
            background: "#ffffff",
            color: "#59647b",
          }}
        >
          <option value="">Minimum Work %</option>
          <option value="10">10%+</option>
          <option value="25">25%+</option>
          <option value="50">50%+</option>
          <option value="75">75%+</option>
          <option value="90">90%+</option>
        </select>

        <select
          value={maxPercentage}
          onChange={(e) => {
            setMaxPercentage(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            height: "38px",
            padding: "0 10px",
            border: "1px solid #e1e2e9",
            borderRadius: "9px",
            outline: "none",
            fontSize: "13px",
            background: "#ffffff",
            color: "#59647b",
          }}
        >
          <option value="">Maximum Work %</option>
          <option value="25">Up to 25%</option>
          <option value="50">Up to 50%</option>
          <option value="75">Up to 75%</option>
          <option value="90">Up to 90%</option>
          <option value="100">Up to 100%</option>
        </select>

        <button
          type="button"
          onClick={clearFilters}
          style={{
            height: "38px",
            padding: "0 13px",
            border: "1px solid #e1e2e9",
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
          {filteredAnalytics.length} employee
          {filteredAnalytics.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* SUMMARY */}

      <div className="employees-toolbar">
        <div className="employee-count">
          <Users size={17} />
          {filteredAnalytics.length} Employees
        </div>

        <div className="employee-count">
          <FileText size={17} />
          {totalReports} Work Reports
        </div>
      </div>

      {/* ANALYTICS CARDS */}

      <div className="employees-grid">
        {filteredAnalytics.length === 0 ? (
          <div className="empty-employees">
            <BarChart3 size={40} />

            <h3>No analytics found</h3>

            <p>
              Try changing your filters or add work reports.
            </p>
          </div>
        ) : (
          currentAnalytics.map((item) => (
            <div
              className="employee-card"
              key={item.employee_email}
            >
              <div className="employee-card-top">
                <div className="employee-avatar">
                  <TrendingUp size={22} />
                </div>

                <span className="employee-role">
                  {item.work_percentage}%
                </span>
              </div>

              <h3>{item.employee_email}</h3>

              <div className="employee-detail">
                <FileText size={15} />

                <span>
                  {item.work_reports} Work Reports
                </span>
              </div>

              <div
                style={{
                  marginTop: "18px",
                  background: "#eeeef5",
                  borderRadius: "10px",
                  height: "10px",
                  overflow: "hidden",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(
                      Number(item.work_percentage) || 0,
                      100
                    )}%`,
                    height: "100%",
                    background: "#6254d8",
                    borderRadius: "10px",
                  }}
                ></div>
              </div>

              <p
                style={{
                  marginTop: "10px",
                  fontSize: "13px",
                  color: "#777b8f",
                }}
              >
                {item.work_percentage}% of total reported work
              </p>
            </div>
          ))
        )}
      </div>

      {/* PAGINATION */}

      <div
        className="pagination-controls"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          marginTop: "30px",
          marginBottom: "25px",
          width: "100%",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={previousPage}
          disabled={currentPage === 1}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
            padding: "9px 14px",
            minHeight: "36px",
            borderRadius: "9px",
            border: "1px solid #e1e2e9",
            background:
              currentPage === 1
                ? "#f3f3f6"
                : "#ffffff",
            color:
              currentPage === 1
                ? "#aaa"
                : "#6254e9",
            cursor:
              currentPage === 1
                ? "not-allowed"
                : "pointer",
            fontSize: "13px",
            fontWeight: "600",
            whiteSpace: "nowrap",
          }}
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        {Array.from(
          { length: totalPages },
          (_, index) => index + 1
        ).map((page) => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            style={{
              width: "36px",
              height: "36px",
              minWidth: "36px",
              borderRadius: "9px",
              border:
                currentPage === page
                  ? "1px solid #6254e9"
                  : "1px solid #e1e2e9",
              background:
                currentPage === page
                  ? "#6254e9"
                  : "#ffffff",
              color:
                currentPage === page
                  ? "#ffffff"
                  : "#59647b",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            {page}
          </button>
        ))}

        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
            padding: "9px 14px",
            minHeight: "36px",
            borderRadius: "9px",
            border: "1px solid #e1e2e9",
            background:
              currentPage === totalPages
                ? "#f3f3f6"
                : "#ffffff",
            color:
              currentPage === totalPages
                ? "#aaa"
                : "#6254e9",
            cursor:
              currentPage === totalPages
                ? "not-allowed"
                : "pointer",
            fontSize: "13px",
            fontWeight: "600",
            whiteSpace: "nowrap",
          }}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default Analytics;