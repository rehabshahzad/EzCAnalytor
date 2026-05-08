import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import API from "../../services/api";
import { Spinner } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";

const crimeTypes = [
  "Homicide",
  "Narcotics",
  "Cyber Crime",
  "Fraud",
  "Traffic Violation",
  "Domestic Violence",
  "Burglary",
  "Arson",
  "Disturbance",
  "Human Trafficking"
];

const areaOptionsMap = {
  Lahore: [
    "Gulberg", "DHA", "Model Town", "Johar Town", "Shalimar", "Iqbal Town",
    "Bahria Town", "Wapda Town", "Garden Town", "Samanabad", "Allama Iqbal Town",
    "Liberty Market", "Township", "Mughalpura", "Ferozepur Road", "Cantt"
  ],
  Karachi: [
    "Clifton", "Gulshan", "PECHS", "Korangi", "North Nazimabad", "Malir",
    "Defense", "Nazimabad", "Surjani Town", "Saddar", "Bahadurabad",
    "Liaquatabad", "Landhi", "Gadap", "Orangi Town", "Karachi Cantt"
  ],
  Islamabad: [
    "F-6", "F-7", "G-6", "Blue Area", "DHA", "I-8",
    "F-10", "E-11", "G-10", "G-11", "G-13",
    "Margalla", "Aabpara", "Sectors F-11", "I-9", "Bahria Town"
  ],
  Rawalpindi: [
    "Satellite Town", "Chaklala", "Gawalmandi", "Murree Road", "Taxila",
    "Adyala", "College Road", "Saddar", "Bahria Town", "Peshawar Road",
    "Rasulpur", "DHA", "New Town", "Ganjmandi", "Kashmir Road"
  ],
};

const CrimeForm = ({ editMode = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    crimeType: "",
    city: "",
    area: "",
    incidentDate: "",
    status: "open",
    officer: "",
  });

  const [officers, setOfficers] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(editMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load officers for admin
    if (isAdmin) {
      API.get("/officers")
        .then((r) => setOfficers(r.data.data || []))
        .catch(() => {});
    }

    // Load existing crime if editing
    if (editMode && id) {
      API.get(`/crimes/${id}`)
        .then((r) => {
          const c = r.data.data;

          setForm({
            title: c.title || "",
            description: c.description || "",
            crimeType: c.crimeType || "",
            city: c.city || "",
            area: c.area || "",
            incidentDate: c.incidentDate
              ? c.incidentDate.split("T")[0]
              : "",
            status: c.status || "open",
            officer: c.officer?._id || "",
          });
        })
        .catch(() => setError("Failed to load crime report"))
        .finally(() => setLoading(false));
    }
  }, [editMode, id, isAdmin]);

  const handleChange = (e) => {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("crimeType", form.crimeType);
      formData.append("area", form.area);
      formData.append("incidentDate", form.incidentDate);
      formData.append("status", form.status);
      formData.append("city", user?.city || "");
      if (form.officer) formData.append("officer", form.officer);

      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      if (editMode) {
        await API.put(`/crimes/${id}`, formData);
      } else {
        await API.post("/crimes", formData);
      }

      navigate("/crimes");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save crime report"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">
            {editMode ? "EDIT CRIME REPORT" : "NEW CRIME REPORT"}
          </div>

          <div className="section-subtitle">
            {editMode
              ? "Update incident details"
              : "File a new incident"}
          </div>
        </div>

        <Link to="/crimes" className="btn btn-secondary">
          ← Back
        </Link>
      </div>

      {error && (
        <div
          className="alert alert-error"
          style={{ marginBottom: 16 }}
        >
          ⚠ {error}
        </div>
      )}

      <div className="card" style={{ maxWidth: 760 }}>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="row g-3">
            {/* Title */}
            <div className="col-12">
              <div className="form-group">
                <label className="form-label">Title *</label>

                <input
                  type="text"
                  name="title"
                  className="form-control"
                  placeholder="Brief descriptive title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="col-12">
              <div className="form-group">
                <label className="form-label">Description *</label>

                <textarea
                  name="description"
                  className="form-control"
                  placeholder="Detailed account of what happened..."
                  value={form.description}
                  onChange={handleChange}
                  required
                  style={{ minHeight: 120 }}
                />
              </div>
            </div>

            {/* Crime Type */}
            <div className="col-12 col-md-6">
              <div className="form-group">
                <label className="form-label">Crime Type *</label>

                <select
                  name="crimeType"
                  className="form-control"
                  value={form.crimeType}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select crime type --</option>
                  {crimeTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status */}
            <div className="col-12 col-md-6">
              <div className="form-group">
                <label className="form-label">Status</label>

                <select
                  name="status"
                  className="form-control"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="open">Open</option>
                  <option value="investigating">
                    Investigating
                  </option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* City */}
            <div className="col-12 col-md-6">
              <div className="form-group">
                <label className="form-label">City</label>

                <input
                  type="text"
                  className="form-control"
                  value={user?.city || ""}
                  readOnly
                  style={{
                    opacity: 0.6,
                    cursor: "not-allowed",
                  }}
                />
              </div>
            </div>

            {/* Area */}
            <div className="col-12 col-md-6">
              <div className="form-group">
                <label className="form-label">Area *</label>

                <select
                  name="area"
                  className="form-control"
                  value={form.area}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select area --</option>
                  {(areaOptionsMap[user?.city] || ["Central", "East", "West", "North", "South"]).map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
                {!areaOptionsMap[user?.city] && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
                    City not recognized — choose a generic area or type a valid location in the record.
                  </div>
                )}
              </div>
            </div>

            {/* Incident Date */}
            <div className="col-12 col-md-6">
              <div className="form-group">
                <label className="form-label">
                  Incident Date *
                </label>

                <input
                  type="date"
                  name="incidentDate"
                  className="form-control"
                  value={form.incidentDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="col-12 col-md-6">
              <div className="form-group">
                <label className="form-label">Images (optional)</label>
                <input
                  type="file"
                  name="images"
                  className="form-control"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                />
                {imageFiles.length > 0 && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
                    {imageFiles.length} file{imageFiles.length > 1 ? "s" : ""} selected
                  </div>
                )}
              </div>
            </div>

            {/* Officer Dropdown */}
            {isAdmin && (
              <div className="col-12 col-md-6">
                <div className="form-group">
                  <label className="form-label">
                    Assign Officer (Optional)
                  </label>

                  <select
                    name="officer"
                    className="form-control"
                    value={form.officer}
                    onChange={handleChange}
                  >
                    <option value="">
                      -- Leave Unassigned --
                    </option>

                    {officers.map((o) => (
                      <option key={o._id} value={o._id}>
                        {o.name} (#{o.badgeNumber}) —{" "}
                        {o.department}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="col-12">
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  paddingTop: 8,
                }}
              >
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editMode
                    ? "✓ Update Report"
                    : "✓ Submit Report"}
                </button>

                <Link
                  to="/crimes"
                  className="btn btn-secondary"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrimeForm;