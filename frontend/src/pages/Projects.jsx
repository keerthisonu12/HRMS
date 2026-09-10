import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Plus,
  X,
  CalendarDays,
  User,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileSpreadsheet,
  Users,
} from "lucide-react";
import * as XLSX from "xlsx";
import "../styles/theme.css";

const API = "http://127.0.0.1:8000";

function Projects() {
  const role = localStorage.getItem("userRole");
  const email = localStorage.getItem("userEmail");
  const token = localStorage.getItem("authToken");

  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6;

  const [form, setForm] = useState({
    name: "",
    employee_emails: [],
    start_date: "",
    end_date: "",
    status: "active",
  });

  const getHeaders = (includeJson = false) => ({
    ...(includeJson
      ? { "Content-Type": "application/json" }
      : {}),
    Authorization: `Bearer ${token}`,
  });

  const loadProjects = async () => {
    try {
      const url =
        role === "hr"
          ? `${API}/projects/`
          : `${API}/projects/${encodeURIComponent(email)}`;

      const response = await fetch(url, {
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Unable to load projects"
        );
        return;
      }

      setProjects(Array.isArray(data) ? data : []);
      setCurrentPage(1);
    } catch {
      setMessage("Backend connection failed");
    }
  };

  const loadEmployees = async () => {
    if (role !== "hr") return;

    try {
      const response = await fetch(
        `${API}/employees/`,
        {
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setEmployees(data);
      } else {
        setEmployees([]);
      }
    } catch {
      setEmployees([]);
    }
  };

  useEffect(() => {
    loadProjects();
    loadEmployees();
  }, []);

  const openProjectForm = () => {
    setMessage("");

    setForm({
      name: "",
      employee_emails: [],
      start_date: "",
      end_date: "",
      status: "active",
    });

    setShowForm(true);
  };

  const closeProjectForm = () => {
    setShowForm(false);

    setForm({
      name: "",
      employee_emails: [],
      start_date: "",
      end_date: "",
      status: "active",
    });
  };

  const toggleEmployee = (employeeEmail) => {
    if (!employeeEmail) return;

    setForm((previous) => {
      const alreadySelected =
        previous.employee_emails.includes(employeeEmail);

      return {
        ...previous,
        employee_emails: alreadySelected
          ? previous.employee_emails.filter(
              (item) => item !== employeeEmail
            )
          : [
              ...previous.employee_emails,
              employeeEmail,
            ],
      };
    });
  };

  const selectAllEmployees = () => {
    setForm((previous) => ({
      ...previous,
      employee_emails: employees
        .map((employee) => employee.email)
        .filter(Boolean),
    }));
  };

  const clearSelectedEmployees = () => {
    setForm((previous) => ({
      ...previous,
      employee_emails: [],
    }));
  };

  const createProject = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.name.trim()) {
      setMessage("Please enter a project name.");
      return;
    }

    if (form.employee_emails.length === 0) {
      setMessage("Please select at least one employee.");
      return;
    }

    if (!form.start_date || !form.end_date) {
      setMessage("Please select project start and end dates.");
      return;
    }

    if (form.start_date > form.end_date) {
      setMessage("End date cannot be before start date.");
      return;
    }

    try {
      const response = await fetch(
        `${API}/projects/`,
        {
          method: "POST",
          headers: getHeaders(true),
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Unable to create project"
        );
        return;
      }

      closeProjectForm();

      setMessage("Project created successfully.");

      await loadProjects();
    } catch {
      setMessage("Backend connection failed");
    }
  };

  const filteredProjects = projects.filter(
    (project) => {
      const projectStart =
        project.start_date || "";

      const projectEnd =
        project.end_date || "";

      if (
        filterStartDate &&
        projectStart < filterStartDate
      ) {
        return false;
      }

      if (
        filterEndDate &&
        projectEnd > filterEndDate
      ) {
        return false;
      }

      return true;
    }
  );

  const exportToExcel = () => {
    if (projects.length === 0) {
      setMessage(
        "No project data available to export"
      );
      return;
    }

    const exportData = projects.map(
      (project) => ({
        "Project ID": project.id || "",
        "Project Name":
          project.name || "",
        "Employee Email":
          Array.isArray(
            project.employee_emails
          )
            ? project.employee_emails.join(", ")
            : project.employee_email || "",
        "Start Date":
          project.start_date || "",
        "End Date":
          project.end_date || "",
        Status:
          project.status || "",
      })
    );

    const worksheet =
      XLSX.utils.json_to_sheet(exportData);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Projects"
    );

    XLSX.writeFile(
      workbook,
      "WORKNEST_Projects.xlsx"
    );

    setMessage(
      "Project data exported to Excel successfully"
    );
  };

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProjects.length /
        projectsPerPage
    )
  );

  const startIndex =
    (currentPage - 1) *
    projectsPerPage;

  const currentProjects =
    filteredProjects.slice(
      startIndex,
      startIndex + projectsPerPage
    );

  const handleStartDateFilter = (value) => {
    setFilterStartDate(value);
    setCurrentPage(1);
  };

  const handleEndDateFilter = (value) => {
    setFilterEndDate(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilterStartDate("");
    setFilterEndDate("");
    setCurrentPage(1);
  };

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

  const getEmployeeEmails = (project) => {
    if (
      Array.isArray(project.employee_emails)
    ) {
      return project.employee_emails;
    }

    if (project.employee_email) {
      return [project.employee_email];
    }

    return [];
  };

  return (
    <div className="employees-page">
      <div className="employees-header">
        <div>
          <p className="dashboard-eyebrow">
            PROJECT MANAGEMENT
          </p>

          <h1>Projects</h1>

          <p className="dashboard-subtitle">
            {role === "hr"
              ? "View and manage projects across your organization."
              : "View the projects assigned to you."}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            className="primary-button employees-add-button"
            onClick={exportToExcel}
            style={{
              background: "#168a5b",
              marginTop: "0",
              width: "auto",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              flexShrink: 0,
            }}
          >
            <FileSpreadsheet size={18} />
            Export Excel
          </button>

          {role === "hr" && (
            <button
              type="button"
              className="primary-button employees-add-button"
              onClick={openProjectForm}
              style={{
                marginTop: "0",
                width: "auto",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                flexShrink: 0,
              }}
            >
              <Plus size={18} />
              Add Project
            </button>
          )}
        </div>
      </div>

      <div
        className="employees-toolbar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <Filter
            size={18}
            color="#7057ed"
          />

          <input
            type="date"
            value={filterStartDate}
            onChange={(e) =>
              handleStartDateFilter(
                e.target.value
              )
            }
            title="Filter from start date"
            style={{
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid #e1e2e9",
              background: "#ffffff",
              color: "#59647b",
              fontSize: "13px",
              outline: "none",
            }}
          />

          <span
            style={{
              fontSize: "12px",
              color: "#8a94aa",
              fontWeight: "600",
            }}
          >
            to
          </span>

          <input
            type="date"
            value={filterEndDate}
            onChange={(e) =>
              handleEndDateFilter(
                e.target.value
              )
            }
            title="Filter until end date"
            style={{
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid #e1e2e9",
              background: "#ffffff",
              color: "#59647b",
              fontSize: "13px",
              outline: "none",
            }}
          />

          {(filterStartDate ||
            filterEndDate) && (
            <button
              type="button"
              onClick={clearFilters}
              style={{
                padding: "9px 12px",
                borderRadius: "9px",
                border: "1px solid #e1e2e9",
                background: "#ffffff",
                color: "#6254e9",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          )}
        </div>

        <div className="employee-count">
          <BriefcaseBusiness size={17} />
          {filteredProjects.length} Projects
        </div>
      </div>

      {message && (
        <div className="login-message">
          {message}
        </div>
      )}

      <div className="employees-grid">
        {currentProjects.length === 0 ? (
          <div className="empty-employees">
            <BriefcaseBusiness size={40} />

            <h3>No projects found</h3>

            <p>
              {filterStartDate ||
              filterEndDate
                ? "No projects match the selected date range."
                : "Projects will appear here once they are created."}
            </p>
          </div>
        ) : (
          currentProjects.map((project) => {
            const assignedEmployees =
              getEmployeeEmails(project);

            return (
              <div
                className="employee-card"
                key={project.id}
              >
                <div className="employee-card-top">
                  <div className="employee-avatar">
                    <BriefcaseBusiness size={22} />
                  </div>

                  <span className="employee-role">
                    {project.status || "active"}
                  </span>
                </div>

                <h3>{project.name}</h3>

                <div className="employee-detail">
                  <Users size={15} />

                  <span>
                    {assignedEmployees.length}{" "}
                    {assignedEmployees.length === 1
                      ? "Employee"
                      : "Employees"}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: "6px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  {assignedEmployees.map(
                    (employeeEmail) => (
                      <div
                        key={employeeEmail}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "11px",
                          color: "#667085",
                          overflowWrap: "anywhere",
                        }}
                      >
                        <User size={12} />
                        {employeeEmail}
                      </div>
                    )
                  )}
                </div>

                <div className="employee-detail">
                  <CalendarDays size={15} />

                  <span>
                    {project.start_date} →{" "}
                    {project.end_date}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div
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
          type="button"
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
            type="button"
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
          type="button"
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

      {showForm && (
        <div className="employee-modal-overlay">
          <div className="employee-modal">
            <button
              type="button"
              className="modal-close"
              onClick={closeProjectForm}
            >
              <X size={20} />
            </button>

            <div className="modal-heading">
              <div className="modal-icon">
                <BriefcaseBusiness size={23} />
              </div>

              <div>
                <p className="panel-label">
                  NEW PROJECT
                </p>

                <h2>Add project</h2>
              </div>
            </div>

            <form
              onSubmit={createProject}
              className="employee-form"
            >
              <label>Project Name</label>

              <input
                type="text"
                placeholder="Enter project name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                required
              />

              <label>Assign Employees</label>

              <div
                style={{
                  border: "1px solid #e1e2e9",
                  borderRadius: "10px",
                  background: "#ffffff",
                  padding: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#8a94aa",
                    }}
                  >
                    {form.employee_emails.length}{" "}
                    selected
                  </span>

                  <div
                    style={{
                      display: "flex",
                      gap: "5px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={selectAllEmployees}
                      style={{
                        border: "none",
                        background: "#f0edff",
                        color: "#6254e9",
                        borderRadius: "7px",
                        padding: "5px 8px",
                        fontSize: "10px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Select All
                    </button>

                    <button
                      type="button"
                      onClick={clearSelectedEmployees}
                      style={{
                        border: "none",
                        background: "#f5f5f7",
                        color: "#667085",
                        borderRadius: "7px",
                        padding: "5px 8px",
                        fontSize: "10px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    maxHeight: "180px",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "7px",
                  }}
                >
                  {employees.length === 0 ? (
                    <div
                      style={{
                        padding: "12px 5px",
                        fontSize: "11px",
                        color: "#8a94aa",
                        textAlign: "center",
                      }}
                    >
                      No employees available
                    </div>
                  ) : (
                    employees.map((employee) => {
                      const employeeEmail =
                        employee.email;

                      const employeeName =
                        employee.name ||
                        employeeEmail;

                      const selected =
                        form.employee_emails.includes(
                          employeeEmail
                        );

                      return (
                        <label
                          key={employeeEmail}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "9px",
                            padding: "7px 8px",
                            borderRadius: "8px",
                            background: selected
                              ? "#f4f1ff"
                              : "#fafafa",
                            border: selected
                              ? "1px solid #ddd5ff"
                              : "1px solid transparent",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() =>
                              toggleEmployee(
                                employeeEmail
                              )
                            }
                            style={{
                              width: "14px",
                              height: "14px",
                              minWidth: "14px",
                              minHeight: "14px",
                              margin: 0,
                              padding: 0,
                              accentColor: "#6254e9",
                              cursor: "pointer",
                            }}
                          />

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              minWidth: 0,
                            }}
                          >
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: "600",
                                color: "#30384d",
                              }}
                            >
                              {employeeName}
                            </span>

                            <span
                              style={{
                                fontSize: "10px",
                                color: "#8a94aa",
                                overflowWrap: "anywhere",
                              }}
                            >
                              {employeeEmail}
                            </span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

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

              <label>Status</label>

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
                  })
                }
              >
                <option value="active">
                  Active
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="on_hold">
                  On Hold
                </option>
              </select>

              <button
                type="submit"
                className="primary-button"
              >
                Create Project
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;