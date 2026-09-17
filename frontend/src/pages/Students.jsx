import { useEffect, useState } from "react";
import { getErrorMessage, studentService } from "../services/api";
import { Empty, ErrorMessage, Loading } from "../components/UI";

const blankStudent = { Name: "", Rollno: "", Course: "", Campus: "", Year: 1, Roomno: "Unassigned" };

export default function Students() {
	const [students, setStudents] = useState([]);
	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState(null);
	const [formOpen, setFormOpen] = useState(false);
	const [form, setForm] = useState(blankStudent);
	const [busy, setBusy] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const load = () => { setLoading(true); studentService.list().then(({ data }) => setStudents(data)).catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false)); };
	useEffect(load, []);
	const filtered = students.filter((student) => [student.Name, student.Rollno, student.Course, student.Campus].some((value) => String(value || "").toLowerCase().includes(query.toLowerCase())));
	const openForm = (student = null) => { setSelected(student); setForm(student ? { ...student } : blankStudent); setFormOpen(true); setError(""); setMessage(""); };
	const save = async (event) => { event.preventDefault(); setBusy(true); setError(""); try { if (selected) await studentService.update(selected._id, form); else await studentService.create(form); setMessage(selected ? "Student updated." : "Student added."); setSelected(null); setFormOpen(false); load(); } catch (err) { setError(getErrorMessage(err, "Student could not be saved.")); } finally { setBusy(false); } };
	const remove = async (student) => { if (!window.confirm(`Delete ${student.Name}?`)) return; try { await studentService.remove(student._id); setMessage("Student deleted."); load(); } catch (err) { setError(getErrorMessage(err)); } };
	return <div className="page-stack"><div className="page-heading"><div><span className="eyebrow">Directory</span><h2>Students</h2><p className="muted">Search and manage registered campus residents.</p></div><button className="primary-button" onClick={() => openForm()}>Add student <span>+</span></button></div>{message && <div className="success-message">{message}</div>}{error && !formOpen && <ErrorMessage message={error} />}<section className="panel"><div className="toolbar"><div className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, roll number or course" /></div><span className="panel-count">{filtered.length} students</span></div>{loading ? <Loading text="Loading students..." /> : filtered.length ? <div className="table-wrap"><table><thead><tr><th>Student</th><th>Roll no.</th><th>Course</th><th>Campus</th><th>Year</th><th>Room</th><th>Actions</th></tr></thead><tbody>{filtered.map((student) => <tr key={student._id}><td><div className="table-person"><span className="avatar small">{student.Name?.slice(0, 1)}</span><strong>{student.Name}</strong></div></td><td>{student.Rollno}</td><td>{student.Course}</td><td>{student.Campus}</td><td>{student.Year}</td><td>{student.Roomno || "Unassigned"}</td><td><button className="text-button" onClick={() => openForm(student)}>Edit</button><button className="text-button danger" onClick={() => remove(student)}>Delete</button></td></tr>)}</tbody></table></div> : <Empty title="No students found" text={query ? "Try a different search term." : "No students have been registered yet."} />}</section>{formOpen ? <div className="modal-backdrop"><form className="modal" onSubmit={save}><div className="panel-heading"><div><span className="eyebrow">Directory record</span><h3>{selected ? "Edit student" : "Add student"}</h3></div><button type="button" className="close-button" onClick={() => { setSelected(null); setForm(blankStudent); setFormOpen(false); }}>×</button></div>{error && <ErrorMessage message={error} />}<div className="form-grid">{["Name", "Rollno", "Course", "Campus", "Year", "Roomno"].map((field) => <label key={field}>{field}<input required={field !== "Roomno"} type={field === "Year" ? "number" : "text"} value={form[field] ?? ""} onChange={(event) => setForm({ ...form, [field]: field === "Year" ? Number(event.target.value) : event.target.value })} /></label>)}</div><button className="primary-button full" disabled={busy}>{busy ? "Saving..." : "Save student"}</button></form></div> : null}</div>;
}
