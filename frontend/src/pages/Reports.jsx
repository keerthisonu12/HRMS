import { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  X,
  CalendarDays,
  Tag,
  Pencil,
  Search,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import "../styles/theme.css";

const API = "http://127.0.0.1:8000";

function Reports() {
  const role = localStorage.getItem("userRole");
  const email = localStorage.getItem("userEmail");
  const token = localStorage.getItem("authToken");

  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [message, setMessage] = useState("");

  const [employeeFilter, setEmployeeFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 6;

  const [form, setForm] = useState({
    employee_email: email || "",
    project: "",
    start_date: "",
    end_date: "",
    tag: "",
    description: "",
  });

  const getHeaders = (includeJson = false) => ({
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token}`,
  });

  const loadReports = async () => {
    try {
      const url =
        role === "hr"
          ? `${API}/reports/`
          : `${API}/reports/${encodeURIComponent(email)}`;

      const response = await fetch(url, {
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Unable to load reports");
        return;
      }

      setReports(Array.isArray(data) ? data : []);
      setCurrentPage(1);
    } catch {
      setMessage("Backend connection failed");
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const exportToExcel = () => {
    if (reports.length === 0) {
      setMessage("No work report data available to export.");
      return;
    }

    const exportData = reports.map((report) => ({
      "Report ID": report.id,
      "Employee Email": report.employee_email,
      Project: report.project,
      "Start Date": report.start_date,
      "End Date": report.end_date,
      Tag: report.tag,
      Description: report.description,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Work Reports");

    XLSX.writeFile(workbook, "WORKNEST_Reports.xlsx");
  };

  const createReport = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API}/reports/`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({
          employee_email: role === "hr" ? form.employee_email : email,
          project: form.project,
          start_date: form.start_date,
          end_date: form.end_date,
          tag: form.tag,
          description: form.description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Unable to create report");
        return;
      }

      setMessage("Work report created successfully");

      setForm({
        employee_email: email || "",
        project: "",
        start_date: "",
        end_date: "",
        tag: "",
        description: "",
      });

      setShowForm(false);
      loadReports();
    } catch {
      setMessage("Backend connection failed");
    }
  };

  const openEditReport = (report) => {
    setEditingReport(report);

    setForm({
      employee_email: report.employee_email,
      project: report.project,
      start_date: report.start_date,
      end_date: report.end_date,
      tag: report.tag,
      description: report.description,
    });

    setMessage("");
  };

  const updateReport = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        `${API}/reports/${editingReport.id}`,
        {
          method: "PUT",
          headers: getHeaders(true),
          body: JSON.stringify({
            employee_email: email,
            project: form.project,
            start_date: form.start_date,
            end_date: form.end_date,
            tag: form.tag,
            description: form.description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Unable to update work report");
        return;
      }

      setMessage("Work report updated successfully");

      setEditingReport(null);

      setForm({
        employee_email: email || "",
        project: "",
        start_date: "",
        end_date: "",
        tag: "",
        description: "",
      });

      loadReports();
    } catch {
      setMessage("Backend connection failed");
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingReport(null);

    setForm({
      employee_email: email || "",
      project: "",
      start_date: "",
      end_date: "",
      tag: "",
      description: "",
    });
  };

  const filteredReports = reports.filter((report) => {
    const employeeMatch =
      !employeeFilter ||
      (report.employee_email || "")
        .toLowerCase()
        .includes(employeeFilter.toLowerCase());

    const startDateMatch =
      !startDateFilter || report.start_date >= startDateFilter;

    const endDateMatch =
      !endDateFilter || report.end_date <= endDateFilter;

    const tagMatch =
      !tagFilter ||
      (report.tag || "")
        .toLowerCase()
        .includes(tagFilter.toLowerCase());

    return (
      employeeMatch &&
      startDateMatch &&
      endDateMatch &&
      tagMatch
    );
  });

  const clearFilters = () => {
    setEmployeeFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    setTagFilter("");
    setCurrentPage(1);
  };

  const employeeReportCounts = {};

  filteredReports.forEach((report) => {
    const reportEmail = report.employee_email;

    if (!reportEmail) return;

    employeeReportCounts[reportEmail] =
      (employeeReportCounts[reportEmail] || 0) + 1;
  });

  const analyticsData = Object.entries(employeeReportCounts).sort(
    (a, b) => b[1] - a[1]
  );

  const maxReports =
    analyticsData.length > 0
      ? Math.max(...analyticsData.map((item) => item[1]))
      : 0;

  const totalReports = filteredReports.length;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReports.length / reportsPerPage)
  );

  const startIndex = (currentPage - 1) * reportsPerPage;

  const currentReports = filteredReports.slice(
    startIndex,
    startIndex + reportsPerPage
  );

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="employees-page reports-page">

      {/* HEADER */}
      <div
        className="employees-header reports-header"
        style={{
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            minWidth: 0,
            flex: "1 1 350px",
          }}
        >
          <p className="dashboard-eyebrow">
            WORK ANALYTICS
          </p>

          <h1>Work Reports</h1>

          <p className="dashboard-subtitle">
            {role === "hr"
              ? "Track work reports and project progress across your organization."
              : "Create, view and update your own work reports."}
          </p>
        </div>

        {/* PAGE ACTIONS */}
        <div
          className="page-actions"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "10px",
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            className="primary-button"
            onClick={exportToExcel}
            style={{
              width: "auto",
              minWidth: "150px",
              height: "48px",
              marginTop: 0,
              padding: "0 18px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              background: "#168a5b",
              whiteSpace: "nowrap",
            }}
          >
            <FileSpreadsheet size={17} />
            Export Excel
          </button>

          <button
            type="button"
            className="primary-button employees-add-button"
            onClick={() => {
              setEditingReport(null);
              setShowForm(true);
            }}
            style={{
              minWidth: "145px",
              height: "48px",
              marginTop: 0,
              whiteSpace: "nowrap",
            }}
          >
            <Plus size={18} />
            Add Report
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div
        className="reports-filters"
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
        {role === "hr" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              flex: "1 1 170px",
              minWidth: "150px",
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
                width: "100%",
                height: "38px",
                boxSizing: "border-box",
                padding: "0 11px",
                border: "1px solid #e1e2e9",
                borderRadius: "9px",
                outline: "none",
                fontSize: "13px",
              }}
            />
          </div>
        )}

        <input
          type="date"
          value={startDateFilter}
          onChange={(e) => {
            setStartDateFilter(e.target.value);
            setCurrentPage(1);
          }}
          title="Filter by start date"
          style={{
            flex: "1 1 135px",
            minWidth: "130px",
            height: "38px",
            boxSizing: "border-box",
            padding: "0 10px",
            border: "1px solid #e1e2e9",
            borderRadius: "9px",
            outline: "none",
            fontSize: "13px",
          }}
        />

        <input
          type="date"
          value={endDateFilter}
          onChange={(e) => {
            setEndDateFilter(e.target.value);
            setCurrentPage(1);
          }}
          title="Filter by end date"
          style={{
            flex: "1 1 135px",
            minWidth: "130px",
            height: "38px",
            boxSizing: "border-box",
            padding: "0 10px",
            border: "1px solid #e1e2e9",
            borderRadius: "9px",
            outline: "none",
            fontSize: "13px",
          }}
        />

        <input
          type="text"
          placeholder="Filter by tag..."
          value={tagFilter}
          onChange={(e) => {
            setTagFilter(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            flex: "1 1 150px",
            minWidth: "140px",
            height: "38px",
            boxSizing: "border-box",
            padding: "0 11px",
            border: "1px solid #e1e2e9",
            borderRadius: "9px",
            outline: "none",
            fontSize: "13px",
          }}
        />

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
            whiteSpace: "nowrap",
          }}
        >
          Clear Filters
        </button>

        <span
          style={{
            fontSize: "12px",
            color: "#8a94aa",
            marginLeft: "3px",
            whiteSpace: "nowrap",
          }}
        >
          {filteredReports.length} report
          {filteredReports.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* MESSAGE */}
      {message && (
        <div className="login-message">
          {message}
        </div>
      )}

      {/* WORK ANALYTICS */}
      <div
        className="panel analytics-panel"
        style={{
          marginBottom: "25px",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <div
          className="panel-heading"
          style={{
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p className="panel-label">
              WORK ANALYTICS
            </p>

            <h2>
              {role === "hr"
                ? "Employee performance"
                : "Your work performance"}
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              color: "#666a7d",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <FileText size={17} />

            {totalReports}{" "}
            {totalReports === 1 ? "report" : "reports"}
          </div>
        </div>

        <div
          className="performance-list"
          style={{
            width: "100%",
            minWidth: 0,
          }}
        >
          {analyticsData.length === 0 ? (
            <div
              className="performance-row"
              style={{
                minWidth: 0,
                gridTemplateColumns: "minmax(0, 155px) minmax(0, 1fr) 42px",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <strong>
                  No work reports found
                </strong>

                <span>
                  Try changing the filters.
                </span>
              </div>

              <div
                className="progress"
                style={{
                  width: "100%",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: "0%",
                  }}
                />
              </div>

              <b>0%</b>
            </div>
          ) : (
            analyticsData.slice(0, 5).map(([reportEmail, count]) => {
              const percentage =
                maxReports > 0
                  ? Math.round((count / maxReports) * 100)
                  : 0;

              return (
                <div
                  className="performance-row"
                  key={reportEmail}
                  style={{
                    minWidth: 0,
                    width: "100%",
                    gridTemplateColumns:
                      "minmax(0, 155px) minmax(0, 1fr) 42px",
                  }}
                >
                  <div
                    style={{
                      minWidth: 0,
                      overflow: "hidden",
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={reportEmail}
                    >
                      {role === "hr"
                        ? reportEmail
                        : "Your reports"}
                    </strong>

                    <span>
                      {count}{" "}
                      {count === 1 ? "report" : "reports"}
                    </span>
                  </div>

                  <div
                    className="progress"
                    style={{
                      width: "100%",
                      minWidth: 0,
                      maxWidth: "100%",
                    }}
                  >
                    <div
                      style={{
                        width: `${percentage}%`,
                        maxWidth: "100%",
                      }}
                    />
                  </div>

                  <b
                    style={{
                      minWidth: "42px",
                      textAlign: "right",
                    }}
                  >
                    {percentage}%
                  </b>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* REPORT CARDS */}
      <div className="employees-grid reports-grid">
        {filteredReports.length === 0 ? (
          <div className="empty-employees">
            <FileText size={40} />

            <h3>No work reports found</h3>

            <p>
              Try changing your filters or add a new
              work report.
            </p>
          </div>
        ) : (
          currentReports.map((item) => (
            <div
              className="employee-card"
              key={item.id}
            >
              <div className="employee-card-top">
                <div className="employee-avatar">
                  <FileText size={22} />
                </div>

                <span className="employee-role">
                  {item.tag || "Work"}
                </span>
              </div>

              <h3>{item.project}</h3>

              {role === "hr" && (
                <div className="employee-detail">
                  <strong
                    style={{
                      wordBreak: "break-word",
                    }}
                  >
                    {item.employee_email}
                  </strong>
                </div>
              )}

              <div className="employee-detail">
                <CalendarDays size={15} />

                <span>
                  {item.start_date} → {item.end_date}
                </span>
              </div>

              <div className="employee-detail">
                <Tag size={15} />

                <span>{item.tag}</span>
              </div>

              <p
                style={{
                  marginTop: "15px",
                  color: "#666a7d",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  wordBreak: "break-word",
                }}
              >
                {item.description}
              </p>

              {role === "employee" && (
                <button
                  className="primary-button"
                  style={{
                    marginTop: "15px",
                    width: "100%",
                  }}
                  onClick={() => openEditReport(item)}
                >
                  <Pencil size={16} />
                  Edit Work Report
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* PAGINATION */}
      <div
        className="reports-pagination"
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
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "9px 14px",
            borderRadius: "9px",
            border: "1px solid #e1e2e9",
            background:
              currentPage === 1 ? "#f3f3f6" : "#ffffff",
            color:
              currentPage === 1 ? "#aaa" : "#6254e9",
            cursor:
              currentPage === 1
                ? "not-allowed"
                : "pointer",
            fontSize: "13px",
            fontWeight: "600",
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
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "9px 14px",
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
          }}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ADD REPORT MODAL */}
      {showForm && (
        <div className="employee-modal-overlay">
          <div className="employee-modal">
            <button
              className="modal-close"
              onClick={closeForm}
            >
              <X size={20} />
            </button>

            <div className="modal-heading">
              <div className="modal-icon">
                <FileText size={23} />
              </div>

              <div>
                <p className="panel-label">
                  WORK REPORT
                </p>

                <h2>Add work report</h2>
              </div>
            </div>

            <form
              onSubmit={createReport}
              className="employee-form"
            >
              <label>Project Name</label>

              <input
                type="text"
                placeholder="Enter project name"
                value={form.project}
                onChange={(e) =>
                  setForm({
                    ...form,
                    project: e.target.value,
                  })
                }
                required
              />

              {role === "hr" && (
                <>
                  <label>Employee Email</label>

                  <input
                    type="email"
                    placeholder="employee@company.com"
                    value={form.employee_email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        employee_email: e.target.value,
                      })
                    }
                    required
                  />
                </>
              )}

              <label>Start Date</label>

              <input
                type="date"
                value={form.start_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    start_date: e.target.value,
                  })
                }
                required
              />

              <label>End Date</label>

              <input
                type="date"
                value={form.end_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    end_date: e.target.value,
                  })
                }
                required
              />

              <label>Report Tag</label>

              <input
                type="text"
                placeholder="Development, Testing, Meeting..."
                value={form.tag}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tag: e.target.value,
                  })
                }
                required
              />

              <label>Work Description</label>

              <input
                type="text"
                placeholder="Describe the work completed"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                required
              />

              <button
                type="submit"
                className="primary-button"
              >
                Save Work Report
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT REPORT MODAL */}
      {editingReport && (
        <div className="employee-modal-overlay">
          <div className="employee-modal">
            <button
              className="modal-close"
              onClick={closeForm}
            >
              <X size={20} />
            </button>

            <div className="modal-heading">
              <div className="modal-icon">
                <Pencil size={23} />
              </div>

              <div>
                <p className="panel-label">
                  WORK REPORT
                </p>

                <h2>Edit work report</h2>
              </div>
            </div>

            <p
              style={{
                color: "#666a7d",
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              You can update your work progress
              during working hours.
            </p>

            <form
              onSubmit={updateReport}
              className="employee-form"
            >
              <label>Project Name</label>

              <input
                type="text"
                value={form.project}
                onChange={(e) =>
                  setForm({
                    ...form,
                    project: e.target.value,
                  })
                }
                required
              />

              <label>Start Date</label>

              <input
                type="date"
                value={form.start_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    start_date: e.target.value,
                  })
                }
                required
              />

              <label>End Date</label>

              <input
                type="date"
                value={form.end_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    end_date: e.target.value,
                  })
                }
                required
              />

              <label>Report Tag</label>

              <input
                type="text"
                value={form.tag}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tag: e.target.value,
                  })
                }
                required
              />

              <label>Work Description</label>

              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                required
              />

              <button
                type="submit"
                className="primary-button"
              >
                Update Work Report
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;