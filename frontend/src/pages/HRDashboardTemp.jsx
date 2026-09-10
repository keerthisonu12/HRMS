import {
  Users,
  BriefcaseBusiness,
  CalendarDays,
  TrendingUp,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/theme.css";

const API = "http://127.0.0.1:8000";

function HRDashboard() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [reports, setReports] = useState([]);

  const [performancePage, setPerformancePage] = useState(1);
  const [leavePage, setLeavePage] = useState(1);

  const itemsPerPage = 3;

  const loadDashboardData = async () => {
    const token = localStorage.getItem("authToken");

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const [
        employeesRes,
        projectsRes,
        leavesRes,
        reportsRes,
      ] = await Promise.all([
        fetch(`${API}/employees/`, { headers }),
        fetch(`${API}/projects/`, { headers }),
        fetch(`${API}/leaves/`, { headers }),
        fetch(`${API}/reports/`, { headers }),
      ]);

      const employeesData = await employeesRes.json();
      const projectsData = await projectsRes.json();
      const leavesData = await leavesRes.json();
      const reportsData = await reportsRes.json();

      if (employeesRes.ok) {
        setEmployees(Array.isArray(employeesData) ? employeesData : []);
      }

      if (projectsRes.ok) {
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      }

      if (leavesRes.ok) {
        setLeaves(Array.isArray(leavesData) ? leavesData : []);
      }

      if (reportsRes.ok) {
        setReports(Array.isArray(reportsData) ? reportsData : []);
      }
    } catch {
      setEmployees([]);
      setProjects([]);
      setLeaves([]);
      setReports([]);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const activeProjects = projects.filter(
    (project) => project.status?.toLowerCase() === "active"
  );

  const pendingLeaves = leaves.filter(
    (leave) => leave.status?.toLowerCase() === "pending"
  );

  const employeesWithReports = new Set(
    reports.map((report) => report.employee_email)
  );

  const productivity =
    employees.length > 0
      ? Math.round((employeesWithReports.size / employees.length) * 100)
      : 0;

  const employeeReportCounts = {};

  reports.forEach((report) => {
    const email = report.employee_email;

    if (!email) return;

    employeeReportCounts[email] =
      (employeeReportCounts[email] || 0) + 1;
  });

  const performanceData = Object.entries(employeeReportCounts).sort(
    (a, b) => b[1] - a[1]
  );

  const maxReports =
    performanceData.length > 0
      ? Math.max(...performanceData.map((item) => item[1]))
      : 0;

  const getEmployeeName = (email) => {
    const employee = employees.find(
      (item) =>
        item.email?.toLowerCase() === email?.toLowerCase()
    );

    return employee?.name || email;
  };

  const getInitials = (name) => {
    if (!name) return "HR";

    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const performanceTotalPages = Math.ceil(
    performanceData.length / itemsPerPage
  );

  const performanceStartIndex =
    (performancePage - 1) * itemsPerPage;

  const currentPerformanceData = performanceData.slice(
    performanceStartIndex,
    performanceStartIndex + itemsPerPage
  );

  const leaveTotalPages = Math.ceil(
    pendingLeaves.length / itemsPerPage
  );

  const leaveStartIndex =
    (leavePage - 1) * itemsPerPage;

  const currentLeaves = pendingLeaves.slice(
    leaveStartIndex,
    leaveStartIndex + itemsPerPage
  );

  const previousPerformancePage = () => {
    if (performancePage > 1) {
      setPerformancePage(performancePage - 1);
    }
  };

  const nextPerformancePage = () => {
    if (performancePage < performanceTotalPages) {
      setPerformancePage(performancePage + 1);
    }
  };

  const previousLeavePage = () => {
    if (leavePage > 1) {
      setLeavePage(leavePage - 1);
    }
  };

  const nextLeavePage = () => {
    if (leavePage < leaveTotalPages) {
      setLeavePage(leavePage + 1);
    }
  };

  return (
    <div
      className="dashboard-page"
      style={{
        width: "100%",
        maxWidth: "none",
        minWidth: 0,
        margin: 0,
        padding: 0,
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      <main
        className="dashboard-main"
        style={{
          width: "100%",
          maxWidth: "none",
          minWidth: 0,
          margin: 0,
          boxSizing: "border-box",
        }}
      >
        <section className="stat-grid">
          <div className="stat-card purple">
            <div className="stat-icon">
              <Users size={21} />
            </div>
            <span>Total Employees</span>
            <strong>{employees.length}</strong>
            <small>
              <ArrowUpRight size={13} />
              Current employees
            </small>
          </div>

          <div className="stat-card blue">
            <div className="stat-icon">
              <BriefcaseBusiness size={21} />
            </div>
            <span>Active Projects</span>
            <strong>{activeProjects.length}</strong>
            <small>
              <ArrowUpRight size={13} />
              Currently active
            </small>
          </div>

          <div className="stat-card orange">
            <div className="stat-icon">
              <CalendarDays size={21} />
            </div>
            <span>Leave Requests</span>
            <strong>{pendingLeaves.length}</strong>
            <small>Needs your attention</small>
          </div>

          <div className="stat-card green">
            <div className="stat-icon">
              <TrendingUp size={21} />
            </div>
            <span>Average Productivity</span>
            <strong>{productivity}%</strong>
            <small>
              <ArrowUpRight size={13} />
              Report activity
            </small>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="panel analytics-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-label">WORK ANALYTICS</p>
                <h2>Employee performance</h2>
              </div>

              <button
                className="view-button"
                onClick={() => navigate("/analytics")}
              >
                View details
              </button>
            </div>

            <div className="performance-list">
              {currentPerformanceData.length === 0 ? (
                <div className="performance-row">
                  <div>
                    <strong>No work reports yet</strong>
                    <span>Reports will appear here</span>
                  </div>

                  <div className="progress">
                    <div style={{ width: "0%" }}></div>
                  </div>

                  <b>0%</b>
                </div>
              ) : (
                currentPerformanceData.map(([email, count]) => {
                  const percentage =
                    maxReports > 0
                      ? Math.round((count / maxReports) * 100)
                      : 0;

                  return (
                    <div
                      className="performance-row"
                      key={email}
                    >
                      <div>
                        <strong>{getEmployeeName(email)}</strong>
                        <span>
                          {count}{" "}
                          {count === 1 ? "report" : "reports"}
                        </span>
                      </div>

                      <div className="progress">
                        <div
                          style={{
                            width: `${percentage}%`,
                          }}
                        ></div>
                      </div>

                      <b>{percentage}%</b>
                    </div>
                  );
                })
              )}
            </div>

            {performanceTotalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "7px",
                  marginTop: "16px",
                  paddingTop: "12px",
                  borderTop: "1px solid #eeeef5",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={previousPerformancePage}
                  disabled={performancePage === 1}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    border: "1px solid #e1e2e9",
                    background:
                      performancePage === 1
                        ? "#f5f5f7"
                        : "#ffffff",
                    color:
                      performancePage === 1
                        ? "#aaa"
                        : "#6254d8",
                    cursor:
                      performancePage === 1
                        ? "not-allowed"
                        : "pointer",
                    fontSize: "11px",
                    fontWeight: "600",
                  }}
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>

                {Array.from(
                  { length: performanceTotalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPerformancePage(page)}
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "8px",
                      border:
                        performancePage === page
                          ? "1px solid #6254d8"
                          : "1px solid #e1e2e9",
                      background:
                        performancePage === page
                          ? "#6254d8"
                          : "#ffffff",
                      color:
                        performancePage === page
                          ? "#ffffff"
                          : "#59647b",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={nextPerformancePage}
                  disabled={
                    performancePage === performanceTotalPages
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    border: "1px solid #e1e2e9",
                    background:
                      performancePage === performanceTotalPages
                        ? "#f5f5f7"
                        : "#ffffff",
                    color:
                      performancePage === performanceTotalPages
                        ? "#aaa"
                        : "#6254d8",
                    cursor:
                      performancePage === performanceTotalPages
                        ? "not-allowed"
                        : "pointer",
                    fontSize: "11px",
                    fontWeight: "600",
                  }}
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="panel leave-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-label">ATTENTION</p>
                <h2>Leave requests</h2>
              </div>

              <CalendarDays size={20} />
            </div>

            {currentLeaves.length === 0 ? (
              <div className="leave-preview">
                <div className="mini-avatar">✓</div>

                <div>
                  <strong>No pending requests</strong>
                  <span>All leave requests are handled</span>
                </div>
              </div>
            ) : (
              currentLeaves.map((leave) => {
                const employee = employees.find(
                  (item) =>
                    item.email?.toLowerCase() ===
                    leave.email?.toLowerCase()
                );

                const employeeName =
                  employee?.name || leave.email;

                return (
                  <div
                    className="leave-preview"
                    key={leave.id}
                  >
                    <div className="mini-avatar">
                      {getInitials(employeeName)}
                    </div>

                    <div>
                      <strong>{employeeName}</strong>

                      <span>
                        {leave.start_date} → {leave.end_date}
                      </span>
                    </div>

                    <span className="pending">Pending</span>
                  </div>
                );
              })
            )}

            {leaveTotalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "7px",
                  marginTop: "12px",
                  paddingTop: "10px",
                  borderTop: "1px solid #eeeef5",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={previousLeavePage}
                  disabled={leavePage === 1}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 9px",
                    borderRadius: "8px",
                    border: "1px solid #e1e2e9",
                    background:
                      leavePage === 1
                        ? "#f5f5f7"
                        : "#ffffff",
                    color:
                      leavePage === 1
                        ? "#aaa"
                        : "#6254d8",
                    cursor:
                      leavePage === 1
                        ? "not-allowed"
                        : "pointer",
                    fontSize: "10px",
                    fontWeight: "600",
                  }}
                >
                  <ChevronLeft size={13} />
                  Previous
                </button>

                {Array.from(
                  { length: leaveTotalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setLeavePage(page)}
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      border:
                        leavePage === page
                          ? "1px solid #6254d8"
                          : "1px solid #e1e2e9",
                      background:
                        leavePage === page
                          ? "#6254d8"
                          : "#ffffff",
                      color:
                        leavePage === page
                          ? "#ffffff"
                          : "#59647b",
                      cursor: "pointer",
                      fontSize: "10px",
                      fontWeight: "600",
                    }}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={nextLeavePage}
                  disabled={leavePage === leaveTotalPages}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 9px",
                    borderRadius: "8px",
                    border: "1px solid #e1e2e9",
                    background:
                      leavePage === leaveTotalPages
                        ? "#f5f5f7"
                        : "#ffffff",
                    color:
                      leavePage === leaveTotalPages
                        ? "#aaa"
                        : "#6254d8",
                    cursor:
                      leavePage === leaveTotalPages
                        ? "not-allowed"
                        : "pointer",
                    fontSize: "10px",
                    fontWeight: "600",
                  }}
                >
                  Next
                  <ChevronRight size={13} />
                </button>
              </div>
            )}

            <button
              className="full-button"
              onClick={() => navigate("/leaves")}
            >
              Review all requests
            </button>
          </div>
        </section>

        <section className="welcome-banner">
          <div>
            <p>WORKNEST INSIGHT</p>

            <h2>Your people are your strongest asset.</h2>

            <span>
              Track performance, projects and employee
              wellbeing from one intelligent workspace.
            </span>
          </div>

          <div className="banner-orbit">
            <TrendingUp size={45} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default HRDashboard;