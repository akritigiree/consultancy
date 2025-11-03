import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';

export default function AppointmentForm() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Dropdown data + loading states
  const [consultants, setConsultants] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingConsultants, setLoadingConsultants] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [form, setForm] = useState({
    consultant: '',
    project: '',
    date: '',
    time: '',
    notes: '',
  });

  // Helpers to render text like: "Name (ID)"
  const consultantLabel = (c) => {
    const name =
      c.name ||
      c.fullName ||
      c.displayName ||
      c.email ||
      `Consultant ${String(c._id).slice(-6)}`;
    return `${name} (${c._id})`;
  };

  const projectLabel = (p) => {
    const title =
      p.title ||
      p.name ||
      p.projectName ||
      `Project ${String(p._id).slice(-6)}`;
    return `${title} (${p._id})`;
  };

  // Fetch consultants & projects
  useEffect(() => {
    const headers = token
      ? { Authorization: `Bearer ${token}` }
      : undefined;

    const fetchConsultants = async () => {
      try {
        setLoadingConsultants(true);
        const res = await fetch('/api/consultants', { headers });
        const data = await res.json();
        setConsultants(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setConsultants([]);
      } finally {
        setLoadingConsultants(false);
      }
    };

    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const res = await fetch('/api/projects', { headers });
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchConsultants();
    fetchProjects();
  }, [token]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validate = () => {
    if (!form.consultant || !form.project || !form.date || !form.time) {
      return 'Please fill in all required fields.';
    }
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(form.time)) {
      return 'Time must be in 24h format (HH:mm).';
    }
    return '';
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);

    try {
      setSubmitting(true);
      setError('');
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to create appointment');
      alert('Appointment booked successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page-wrap">
      <div className="card card--elevated">
        <header className="card__header">
          <h2 className="card__title">Book an Appointment</h2>
          <p className="card__subtitle">
            Select consultant, project, date and time. Add notes if needed.
          </p>
        </header>

        <form onSubmit={submit} className="form-grid">
          {/* Consultant */}
          <div className="form-field">
            <label htmlFor="consultant" className="label">
              Consultant <span className="req">*</span>
            </label>
            <select
              id="consultant"
              name="consultant"
              className="input"
              value={form.consultant}
              onChange={onChange}
              required
              disabled={loadingConsultants || consultants.length === 0}
            >
              {loadingConsultants && <option>Loading consultants…</option>}
              {!loadingConsultants && consultants.length === 0 && (
                <option>No consultants found</option>
              )}
              {!loadingConsultants &&
                consultants.length > 0 && (
                  <>
                    <option value="">-- Select Consultant --</option>
                    {consultants.map((c) => (
                      <option key={c._id} value={c._id}>
                        {consultantLabel(c)}
                      </option>
                    ))}
                  </>
                )}
            </select>
            <small className="help">
              Shown as <b>Name (ID)</b>. The full ID is submitted automatically.
            </small>
          </div>

          {/* Project */}
          <div className="form-field">
            <label htmlFor="project" className="label">
              Project <span className="req">*</span>
            </label>
            <select
              id="project"
              name="project"
              className="input"
              value={form.project}
              onChange={onChange}
              required
              disabled={loadingProjects || projects.length === 0}
            >
              {loadingProjects && <option>Loading projects…</option>}
              {!loadingProjects && projects.length === 0 && (
                <option>No projects found</option>
              )}
              {!loadingProjects &&
                projects.length > 0 && (
                  <>
                    <option value="">-- Select Project --</option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {projectLabel(p)}
                      </option>
                    ))}
                  </>
                )}
            </select>
            <small className="help">
              Shown as <b>Title (ID)</b>. The full ID is submitted automatically.
            </small>
          </div>

          {/* Date */}
          <div className="form-field">
            <label htmlFor="date" className="label">
              Date <span className="req">*</span>
            </label>
            <input
              id="date"
              type="date"
              name="date"
              min={todayISO}
              className="input"
              value={form.date}
              onChange={onChange}
              required
            />
          </div>

          {/* Time */}
          <div className="form-field">
            <label htmlFor="time" className="label">
              Time (24h) <span className="req">*</span>
            </label>
            <input
              id="time"
              type="time"
              name="time"
              className="input"
              value={form.time}
              onChange={onChange}
              required
            />
          </div>

          {/* Notes */}
          <div className="form-field form-field--full">
            <label htmlFor="notes" className="label">Notes</label>
            <textarea
              id="notes"
              name="notes"
              className="textarea"
              rows={4}
              placeholder="Anything the consultant should know?"
              value={form.notes}
              onChange={onChange}
            />
          </div>

          {error && <div className="alert alert--danger">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="btn"
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Booking…' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
