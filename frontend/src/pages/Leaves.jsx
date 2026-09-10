import { useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  X,
  Plus,
  Clock,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import "../styles/theme.css";

const API = "http://127.0.0.1:8000";

function Leaves() {
  const role = localStorage.getItem("userRole");
  const email = localStorage.getItem("userEmail");
  const token = localStorage.getItem("authToken");

  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [editingLeave, setEditingLeave] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const leavesPerPage = 6;

  const [form, setForm] = useState({
    email: email || "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const getHeaders = (includeJson = false) => ({
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token}`,
  });

  const loadLeaves = async () => {
    try {
      const response = await fetch(`${API}/leaves/`, {
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Unable to load leave requests");
        return;
      }

      if (role === "hr") {
        setLeaves(Array.isArray(data) ? data : []);
      } else {
        const myLeaves = Array.isArray(data)
          ? data.filter((leave) => leave.email === email)
          : [];

        setLeaves(myLeaves);
      }

      setCurrentPage(1);
    } catch {
      setMessage("Backend connection failed");
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const applyLeave = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API}/leaves/`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({
          email: email,
          start_date: form.start_date,
          end_date: form.end_date,
          reason: form.reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Unable to apply for leave");
        return;
      }

      setMessage("Leave request submitted successfully");

      setForm({
        email: email || "",
        start_date: "",
        end_date: "",
        reason: "",
      });

      setShowForm(false);
      loadLeaves();
    } catch {
      setMessage("Backend connection failed");
    }
  };

  const openEdit = (leave) => {
    setEditingLeave(leave);

    setForm({
      email: leave.email,
      start_date: leave.start_date,
      end_date: leave.end_date,
      reason: leave.reason,
    });
  };

  const updateLeaveDetails = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        `${API}/leaves/${editingLeave.id}`,
        {
          method: "PUT",
          headers: getHeaders(true),
          body: JSON.stringify({
            email: form.email,
            start_date: form.start_date,
            end_date: form.end_date,
            reason: form.reason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Unable to update leave request"
        );
        return;
      }

      await Swal.fire({
        title: "Leave Updated",
        text: "Leave request details have been updated successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });

      setEditingLeave(null);

      setForm({
        email: email || "",
        start_date: "",
        end_date: "",
        reason: "",
      });

      loadLeaves();
    } catch {
      setMessage("Backend connection failed");
    }
  };

  const updateLeave = async (leaveEmail, action) => {
    const isApprove = action === "approve";

    const result = await Swal.fire({
      title: isApprove
        ? "Accept Leave Request?"
        : "Decline Leave Request?",
      text: isApprove
        ? `Are you sure you want to accept the leave request from ${leaveEmail}?`
        : `Are you sure you want to decline the leave request from ${leaveEmail}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: isApprove
        ? "Yes, Accept"
        : "Yes, Decline",
      cancelButtonText: "No, Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API}/leaves/${encodeURIComponent(leaveEmail)}/${action}`,
        {
          method: "PUT",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Unable to update leave");
        return;
      }

      await Swal.fire({
        title: isApprove
          ? "Leave Accepted"
          : "Leave Declined",
        text: isApprove
          ? "The employee leave request has been accepted successfully."
          : "The employee leave request has been declined successfully.",
        icon: isApprove ? "success" : "info",
        confirmButtonText: "OK",
      });

      loadLeaves();
    } catch {
      setMessage("Backend connection failed");
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    if (statusFilter === "all") {
      return true;
    }

    const status = (leave.status || "pending")
      .toLowerCase()
      .trim();

    if (statusFilter === "pending") {
      return status === "pending";
    }

    if (statusFilter === "approved") {
      return status === "approved" || status === "approve";
    }

    if (statusFilter === "declined") {
      return status === "declined";
    }

    if (statusFilter === "rejected") {
      return status === "rejected" || status === "reject";
    }

    return true;
  });

  const exportToExcel = () => {
    if (leaves.length === 0) {
      setMessage("No leave data available to export");
      return;
    }

    const exportData = leaves.map((leave) => ({
      "Leave ID": leave.id || "",
      "Employee Email": leave.email || "",
      "Start Date": leave.start_date || "",
      "End Date": leave.end_date || "",
      "Reason": leave.reason || "",
      "Status": leave.status || "Pending",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Leaves"
    );

    XLSX.writeFile(
      workbook,
      "WORKNEST_Leaves.xlsx"
    );

    setMessage(
      "Leave data exported to Excel successfully"
    );
  };

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLeaves.length / leavesPerPage)
  );

  const startIndex =
    (currentPage - 1) * leavesPerPage;

  const currentLeaves = filteredLeaves.slice(
    startIndex,
    startIndex + leavesPerPage
  );

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
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

  return (
    <div className="employees-page">
      <div className="employees-header">
        <div>
          <p className="dashboard-eyebrow">
            LEAVE MANAGEMENT
          </p>

          <h1>Leave Requests</h1>

          <p className="dashboard-subtitle">
            {role === "hr"
              ? "Review and manage employee leave requests."
              : "Apply for leave and track your requests."}
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

          {role !== "hr" && (
            <button
              className="primary-button employees-add-button"
              onClick={() => setShowForm(true)}
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
              Apply Leave
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
            gap: "8px",
          }}
        >
          <Filter size={18} color="#7057ed" />

          <select
            value={statusFilter}
            onChange={(e) =>
              handleStatusFilter(e.target.value)
            }
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid #e1e2e9",
              background: "#ffffff",
              color: "#59647b",
              fontSize: "13px",
              fontWeight: "600",
              outline: "none",
              cursor: "pointer",
              minWidth: "160px",
            }}
          >
            <option value="all">All Leaves</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="employee-count">
          <CalendarDays size={17} />
          {filteredLeaves.length} Leave Requests
        </div>
      </div>

      {message && (
        <div className="login-message">
          {message}
        </div>
      )}

      <div className="employees-grid">
        {currentLeaves.length === 0 ? (
          <div className="empty-employees">
            <CalendarDays size={40} />

            <h3>No leave requests found</h3>

            <p>
              {statusFilter !== "all"
                ? `There are no ${statusFilter} leave requests.`
                : "There are no leave requests to display."}
            </p>
          </div>
        ) : (
          currentLeaves.map((leave) => (
            <div
              className="employee-card"
              key={leave.id}
            >
              <div className="employee-card-top">
                <div className="employee-avatar">
                  <CalendarDays size={22} />
                </div>

                <span className="employee-role">
                  {leave.status || "Pending"}
                </span>
              </div>

              <h3>
                {role === "hr"
                  ? leave.email
                  : "My Leave Request"}
              </h3>

              <div className="employee-detail">
                <CalendarDays size={15} />

                <span>
                  {leave.start_date} → {leave.end_date}
                </span>
              </div>

              <div className="employee-detail">
                <Clock size={15} />

                <span>{leave.reason}</span>
              </div>

              {role === "hr" && (
                <div
                  className="employee-actions"
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() => openEdit(leave)}
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  {(!leave.status ||
                    leave.status.toLowerCase() ===
                      "pending") && (
                    <>
                      <button
                        onClick={() =>
                          updateLeave(
                            leave.email,
                            "approve"
                          )
                        }
                      >
                        <Check size={15} />
                        Accept
                      </button>

                      <button
                        className="delete-action"
                        onClick={() =>
                          updateLeave(
                            leave.email,
                            "decline"
                          )
                        }
                      >
                        <X size={15} />
                        Decline
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          marginTop: "25px",
          marginBottom: "20px",
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
                <CalendarDays size={23} />
              </div>

              <div>
                <p className="panel-label">
                  LEAVE REQUEST
                </p>

                <h2>Apply for leave</h2>
              </div>
            </div>

            <form
              onSubmit={applyLeave}
              className="employee-form"
            >
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

              <label>Reason</label>

              <input
                type="text"
                placeholder="Reason for leave"
                value={form.reason}
                onChange={(e) =>
                  setForm({
                    ...form,
                    reason: e.target.value,
                  })
                }
                required
              />

              <button
                type="submit"
                className="primary-button"
              >
                Submit Leave Request
              </button>
            </form>
          </div>
        </div>
      )}

      {editingLeave && (
        <div className="employee-modal-overlay">
          <div className="employee-modal">
            <button
              className="modal-close"
              onClick={() => setEditingLeave(null)}
            >
              <X size={20} />
            </button>

            <div className="modal-heading">
              <div className="modal-icon">
                <Pencil size={23} />
              </div>

              <div>
                <p className="panel-label">
                  EDIT LEAVE
                </p>

                <h2>Edit leave request</h2>
              </div>
            </div>

            <form
              onSubmit={updateLeaveDetails}
              className="employee-form"
            >
              <label>Employee Email</label>

              <input
                type="email"
                value={form.email}
                readOnly
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

              <label>Reason</label>

              <input
                type="text"
                value={form.reason}
                onChange={(e) =>
                  setForm({
                    ...form,
                    reason: e.target.value,
                  })
                }
                required
              />

              <button
                type="submit"
                className="primary-button"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leaves;