import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Plus,
  X,
  CalendarDays,
  User,
} from "lucide-react";
import "../styles/theme.css";

const API = "https://worknest-backend-xesk.onrender.com";

function Projects() {
  const role = localStorage.getItem("userRole");
  const email = localStorage.getItem("userEmail");
  const token = localStorage.getItem("authToken");

  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    employee_email: "",
    start_date: "",
    end_date: "",
    status: "active",
  });

  const getHeaders = (includeJson = false) => ({
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
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
        setMessage(data.detail || "Unable to load projects");
        return;
      }

      setProjects(data);
    } catch {
      setMessage("Backend connection failed");
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const openProjectForm = () => {
    setMessage("");

    setForm({
      name: "",
      employee_email: "",
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
      employee_email: "",
      start_date: "",
      end_date: "",
      status: "active",
    });
  };

  const createProject = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API}/projects/`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Unable to create project");
        return;
      }

      setMessage("Project created successfully");

      closeProjectForm();
      loadProjects();
    } catch {
      setMessage("Backend connection failed");
    }
  };

  return (
    <div className="employees-page">
      <div className="employees-header">
        <div>
          <p className="dashboard-eyebrow">PROJECT MANAGEMENT</p>

          <h1>Projects</h1>

          <p className="dashboard-subtitle">
            {role === "hr"
              ? "View and manage projects across your organization."
              : "View the projects assigned to you."}
          </p>
        </div>

        {role === "hr" && (
          <button
            type="button"
            className="primary-button employees-add-button"
            onClick={openProjectForm}
          >
            <Plus size={18} />
            Add Project
          </button>
        )}
      </div>

      {message && (
        <div className="login-message">
          {message}
        </div>
      )}

      <div className="employees-grid">
        {projects.length === 0 ? (
          <div className="empty-employees">
            <BriefcaseBusiness size={40} />

            <h3>No projects available</h3>

            <p>
              Projects will appear here once they are created.
            </p>
          </div>
        ) : (
          projects.map((project) => (
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
                <User size={15} />
                <span>{project.employee_email}</span>
              </div>

              <div className="employee-detail">
                <CalendarDays size={15} />
                <span>
                  {project.start_date} → {project.end_date}
                </span>
              </div>
            </div>
          ))
        )}
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
                <p className="panel-label">NEW PROJECT</p>

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
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
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