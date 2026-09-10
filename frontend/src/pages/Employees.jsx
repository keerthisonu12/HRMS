import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Mail,
  Phone,
  ShieldCheck,
  Camera,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import "../styles/theme.css";

const API = "http://127.0.0.1:8000";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEmail, setEditingEmail] = useState(null);
  const [message, setMessage] = useState("");
  const [uploadingEmail, setUploadingEmail] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 6;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "employee",
  });

  const getHeaders = (includeJson = false) => {
    const token = localStorage.getItem("authToken");

    return {
      ...(includeJson
        ? { "Content-Type": "application/json" }
        : {}),
      Authorization: `Bearer ${token}`,
    };
  };

  const loadEmployees = async () => {
    try {
      const response = await fetch(`${API}/employees/`, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await response.json();

      if (response.ok) {
        setEmployees(Array.isArray(data) ? data : []);
        setMessage("");
      } else {
        setMessage(data.detail || "Unable to load employees");
      }
    } catch {
      setMessage("Backend connection failed");
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      role: "employee",
    });

    setEditingEmail(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const url = editingEmail
        ? `${API}/employees/${encodeURIComponent(editingEmail)}`
        : `${API}/signup`;

      const response = await fetch(url, {
        method: editingEmail ? "PUT" : "POST",
        headers: getHeaders(true),
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Operation failed");
        return;
      }

      setMessage(
        editingEmail
          ? "Employee updated successfully"
          : "Employee added successfully"
      );

      resetForm();
      setCurrentPage(1);
      loadEmployees();
    } catch {
      setMessage("Backend connection failed");
    }
  };

  const editEmployee = (employee) => {
    setForm({
      name: employee.name || "",
      email: employee.email || "",
      phone: employee.phone || employee.phone_number || "",
      role: employee.role || "employee",
    });

    setEditingEmail(employee.email);
    setShowForm(true);
    setMessage("");
  };

  const deleteEmployee = async (email) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${email}?`
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API}/employees/${encodeURIComponent(email)}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Delete failed");
        return;
      }

      setMessage("Employee deleted successfully");
      loadEmployees();
    } catch {
      setMessage("Backend connection failed");
    }
  };

  const uploadProfileImage = async (email, file) => {
    if (!file) return;

    setUploadingEmail(email);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${API}/employees/${encodeURIComponent(email)}/profile-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Profile image upload failed"
        );
        return;
      }

      setMessage("Profile image uploaded successfully");
      loadEmployees();
    } catch {
      setMessage("Backend connection failed");
    } finally {
      setUploadingEmail(null);
    }
  };

  const filteredEmployees = employees.filter((employee) =>
    (employee.name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const exportToExcel = () => {
    if (employees.length === 0) {
      setMessage("No employee data available to export");
      return;
    }

    const exportData = employees.map((employee) => ({
      "Employee ID": employee.id || "",
      Name: employee.name || "",
      Email: employee.email || "",
      Phone: employee.phone || employee.phone_number || "",
      Role: employee.role === "hr" ? "HR" : "Employee",
      "Profile Image": employee.profile_image || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Employees"
    );

    XLSX.writeFile(
      workbook,
      "WORKNEST_Employees.xlsx"
    );

    setMessage(
      "Employee data exported to Excel successfully"
    );
  };

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredEmployees.length / employeesPerPage
    )
  );

  const startIndex =
    (currentPage - 1) * employeesPerPage;

  const currentEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + employeesPerPage
  );

  const handleSearch = (value) => {
    setSearch(value);
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
    <div
      className="employees-page"
      style={{
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <div className="employees-header">
        <div style={{ minWidth: 0 }}>
          <p className="dashboard-eyebrow">
            PEOPLE MANAGEMENT
          </p>

          <h1>Employees</h1>

          <p className="dashboard-subtitle">
            Manage your organization's people from one place.
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
            className="primary-button employees-add-button"
            onClick={exportToExcel}
            style={{
              background: "#168a5b",
              marginTop: "0",
              width: "auto",
              flexShrink: 0,
            }}
          >
            <FileSpreadsheet size={18} />
            Export Excel
          </button>

          <button
            className="primary-button employees-add-button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            style={{
              marginTop: "0",
              width: "auto",
              flexShrink: 0,
            }}
          >
            <Plus size={18} />
            Add Employee
          </button>
        </div>
      </div>

      <div className="employees-toolbar">
        <div className="employee-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search by employee name..."
            value={search}
            onChange={(e) =>
              handleSearch(e.target.value)
            }
          />
        </div>

        <div className="employee-count">
          <Users size={17} />
          {filteredEmployees.length} Employees
        </div>
      </div>

      {message && (
        <div className="login-message">
          {message}
        </div>
      )}

      <div
        className="employees-grid"
        style={{
          width: "100%",
          minWidth: 0,
        }}
      >
        {currentEmployees.length === 0 ? (
          <div className="empty-employees">
            <Users size={40} />

            <h3>No employees found</h3>

            <p>
              {search
                ? "Try searching with another employee name."
                : "Add your first employee to get started."}
            </p>
          </div>
        ) : (
          currentEmployees.map((employee) => (
            <div
              className="employee-card"
              key={employee.email}
              style={{
                minWidth: 0,
                width: "100%",
              }}
            >
              <div className="employee-card-top">
                <div className="employee-avatar">
                  {employee.profile_image ? (
                    <img
                      src={employee.profile_image}
                      alt={employee.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    employee.name
                      ?.charAt(0)
                      ?.toUpperCase() || "U"
                  )}
                </div>

                <span
                  className={
                    employee.role === "hr"
                      ? "employee-role hr-role"
                      : "employee-role"
                  }
                >
                  {employee.role === "hr"
                    ? "HR"
                    : "Employee"}
                </span>
              </div>

              <h3>{employee.name}</h3>

              <div className="employee-detail">
                <Mail size={15} />

                <span
                  style={{
                    overflowWrap: "anywhere",
                  }}
                >
                  {employee.email}
                </span>
              </div>

              <div className="employee-detail">
                <Phone size={15} />

                <span>
                  {employee.phone ||
                    employee.phone_number ||
                    "Not available"}
                </span>
              </div>

              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  marginTop: "10px",
                  cursor: "pointer",
                  fontSize: "13px",
                  maxWidth: "100%",
                }}
              >
                <Camera size={15} />

                {uploadingEmail === employee.email
                  ? "Uploading..."
                  : "Profile Image"}

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={
                    uploadingEmail === employee.email
                  }
                  onChange={(e) => {
                    uploadProfileImage(
                      employee.email,
                      e.target.files[0]
                    );

                    e.target.value = "";
                  }}
                />
              </label>

              <div className="employee-actions">
                <button
                  onClick={() =>
                    editEmployee(employee)
                  }
                >
                  <Pencil size={15} />
                  Edit
                </button>

                <button
                  className="delete-action"
                  onClick={() =>
                    deleteEmployee(employee.email)
                  }
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              </div>
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
              onClick={resetForm}
            >
              <X size={20} />
            </button>

            <div className="modal-heading">
              <div className="modal-icon">
                <ShieldCheck size={23} />
              </div>

              <div>
                <p className="panel-label">
                  {editingEmail
                    ? "UPDATE PROFILE"
                    : "NEW TEAM MEMBER"}
                </p>

                <h2>
                  {editingEmail
                    ? "Edit employee"
                    : "Add employee"}
                </h2>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="employee-form"
            >
              <label>Full Name</label>

              <input
                type="text"
                placeholder="Enter employee name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                required
              />

              <label>Email Address</label>

              <input
                type="email"
                placeholder="employee@company.com"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                required
              />

              <label>Phone Number</label>

              <input
                type="text"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value,
                  })
                }
                required
              />

              <label>Role</label>

              <select
                value={form.role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role: e.target.value,
                  })
                }
              >
                <option value="employee">
                  Employee
                </option>

                <option value="hr">
                  HR
                </option>
              </select>

              <button
                type="submit"
                className="primary-button"
                style={{
                  marginTop: "0",
                }}
              >
                {editingEmail
                  ? "Update Employee"
                  : "Add Employee"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;