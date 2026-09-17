export function Spinner() { return <span className="spinner" aria-label="Loading" />; }
export function Loading({ text = "Loading data..." }) { return <div className="inline-state"><Spinner /> {text}</div>; }
export function Empty({ title, text }) { return <div className="empty-state"><div className="empty-icon">⌂</div><h3>{title}</h3><p>{text}</p></div>; }
export function ErrorMessage({ message }) { return <div className="error-message">{message}</div>; }
export function Badge({ children }) { return <span className={`badge ${String(children).toLowerCase()}`}>{children}</span>; }
export function StatCard({ label, value, note, accent = "purple" }) { return <div className={`stat-card ${accent}`}><span>{label}</span><strong>{value}</strong><small>{note}</small></div>; }
export const formatDate = (date) => date ? new Date(date).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—";
