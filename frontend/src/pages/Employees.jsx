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
} from "lucide-react";
import "../styles/theme.css";

const API = "https://worknest-backend-xesk.onrender.com";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEmail, setEditingEmail] = useState(null);
  const [message, setMessage] = useState("");
  const [uploadingEmail, setUploadingEmail] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "employee",
  });

  const getHeaders = (includeJson = false) => {
    const token = localStorage.getItem("authToken");

    return {
      ...(includeJson ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
    };
  };

  const loadEmployees = async () => {
    try {
      const response = await fetch(`${API}/employees/`, {
        headers: getHeaders(),
      });

      const data = await response.json();

      if (response.ok) {
        setEmployees(data);
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
      loadEmployees();
    } catch {
      setMessage("Backend connection failed");
    }
  };

  const editEmployee = (employee) => {
    setForm({
      name: employee.name || "",
      email: employee.email || "",
      phone: employee.phone || "",
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
        setMessage(data.detail || "Profile image upload failed");
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

  const filteredEmployees = employees.filter((employee) => {
    const text = `${employee.name} ${employee.email} ${employee.phone} ${employee.role}`;
    return text.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="employees-page">
      <div className="employees-header">
        <div>
          <p className="dashboard-eyebrow">PEOPLE MANAGEMENT</p>
          <h1>Employees</h1>
          <p className="dashboard-subtitle">
            Manage your organization's people from one place.
          </p>
        </div>

        <button
          className="primary-button employees-add-button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      <div className="employees-toolbar">
        <div className="employee-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="employee-count">
          <Users size={17} />
          {employees.length} Employees
        </div>
      </div>

      {message && <div className="login-message">{message}</div>}

      <div className="employees-grid">
        {filteredEmployees.length === 0 ? (
          <div className="empty-employees">
            <Users size={40} />
            <h3>No employees found</h3>
            <p>Add your first employee to get started.</p>
          </div>
        ) : (
          filteredEmployees.map((employee) => (
            <div className="employee-card" key={employee.email}>
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
                    employee.name?.charAt(0)?.toUpperCase() || "U"
                  )}
                </div>

                <span
                  className={
                    employee.role === "hr"
                      ? "employee-role hr-role"
                      : "employee-role"
                  }
                >
                  {employee.role === "hr" ? "HR" : "Employee"}
                </span>
              </div>

              <h3>{employee.name}</h3>

              <div className="employee-detail">
                <Mail size={15} />
                <span>{employee.email}</span>
              </div>

              <div className="employee-detail">
                <Phone size={15} />
                <span>{employee.phone}</span>
              </div>

              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  marginTop: "10px",
                  cursor: "pointer",
                  fontSize: "13px",
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
                  disabled={uploadingEmail === employee.email}
                  onChange={(e) => {
                    uploadProfileImage(employee.email, e.target.files[0]);
                    e.target.value = "";
                  }}
                />
              </label>

              <div className="employee-actions">
                <button onClick={() => editEmployee(employee)}>
                  <Pencil size={15} />
                  Edit
                </button>

                <button
                  className="delete-action"
                  onClick={() => deleteEmployee(employee.email)}
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="employee-modal-overlay">
          <div className="employee-modal">
            <button className="modal-close" onClick={resetForm}>
              <X size={20} />
            </button>

            <div className="modal-heading">
              <div className="modal-icon">
                <ShieldCheck size={23} />
              </div>

              <div>
                <p className="panel-label">
                  {editingEmail ? "UPDATE PROFILE" : "NEW TEAM MEMBER"}
                </p>

                <h2>
                  {editingEmail ? "Edit employee" : "Add employee"}
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="employee-form">
              <label>Full Name</label>

              <input
                type="text"
                placeholder="Enter employee name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                required
              />

              <label>Email Address</label>

              <input
                type="email"
                placeholder="employee@company.com"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                required
              />

              <label>Phone Number</label>

              <input
                type="text"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                required
              />

              <label>Role</label>

              <select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
              >
                <option value="employee">Employee</option>
                <option value="hr">HR</option>
              </select>

              <button type="submit" className="primary-button">
                {editingEmail ? "Update Employee" : "Add Employee"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;