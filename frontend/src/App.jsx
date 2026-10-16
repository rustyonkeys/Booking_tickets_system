import { useEffect, useMemo, useState } from "react";
import { api } from "./api";

const icons = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  bus: <><rect x="4" y="3" width="16" height="15" rx="3" /><path d="M7 18v2m10-2v2M4 11h16M8 7h.01M16 7h.01M8 15h.01M16 15h.01" /></>,
  ticket: <><path d="M4 5h16v5a2 2 0 0 0 0 4v5H4v-5a2 2 0 0 0 0-4Z" /><path d="M13 5v3m0 3v2m0 3v3" /></>,
  plus: <path d="M12 5v14m-7-7h14" />,
  search: <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></>,
  route: <><circle cx="6" cy="6" r="2" /><circle cx="18" cy="18" r="2" /><path d="M8 6h3a3 3 0 0 1 3 3v6a3 3 0 0 0 3 3h-1" /></>,
  users: <><path d="M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4" /><circle cx="12" cy="8" r="3" /><path d="M19 18c0-1.5-.8-2.8-2-3.5M17 6.5a2.5 2.5 0 0 1 0 4.9" /></>,
  edit: <><path d="m14 5 5 5M4 20l4.5-1 10-10a2 2 0 0 0-3-3l-10 10Z" /></>,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  alert: <><circle cx="12" cy="12" r="9" /><path d="M12 8v5m0 3h.01" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
};

function Icon({ name, size = 20 }) {
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icons[name]}</svg>;
}

const emptyBus = { bus_name: "", bus_number: "", capacity: "" };
const emptyBooking = { user_id: "", schedule_id: "", seat_number: "", booking_status: "pending" };

function App() {
  const [view, setView] = useState("overview");
  const [buses, setBuses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState(true);
  const [bookingError, setBookingError] = useState("");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadBuses = async () => {
    try {
      setBuses(await api.getBuses());
      setApiOnline(true);
    } catch (error) {
      setApiOnline(false);
      throw error;
    }
  };
  const loadBookings = async () => {
    try {
      setBookings(await api.getBookings());
      setBookingError("");
    } catch (error) {
      setBookingError(error.message);
    }
  };

  useEffect(() => {
    Promise.allSettled([loadBuses(), loadBookings()]).finally(() => setLoading(false));
  }, []);

  const notify = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  const switchView = (next) => {
    setView(next);
    setSidebarOpen(false);
  };

  const reservedSeats = bookings.filter((item) => String(item.booking_status).toLowerCase() !== "cancelled").length;
  const totalSeats = buses.reduce((sum, bus) => sum + Number(bus.capacity || 0), 0);
  const occupancy = totalSeats ? Math.round((reservedSeats / totalSeats) * 100) : 0;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Icon name="route" /></div>
          <div><strong>RouteFlow</strong><span>Ticket operations</span></div>
        </div>
        <nav>
          <NavItem icon="grid" label="Overview" active={view === "overview"} onClick={() => switchView("overview")} />
          <NavItem icon="bus" label="Fleet" active={view === "fleet"} onClick={() => switchView("fleet")} />
          <NavItem icon="ticket" label="Bookings" active={view === "bookings"} onClick={() => switchView("bookings")} />
        </nav>
        <div className="sidebar-note">
          <span>System status</span>
          <strong><i className={apiOnline ? "" : "offline"} /> {apiOnline ? "API connected" : "API unavailable"}</strong>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setSidebarOpen(!sidebarOpen)}><Icon name="menu" /></button>
          <div>
            <p className="eyebrow">Operations console</p>
            <h1>{view === "overview" ? "Good morning" : view === "fleet" ? "Fleet management" : "Booking desk"}</h1>
          </div>
          <div className="profile">
            <div className="avatar">AD</div>
            <div><strong>Admin desk</strong><span>Operations manager</span></div>
          </div>
        </header>

        <section className="content">
          {loading ? <Loading /> : view === "overview" ? (
            <Overview buses={buses} bookings={bookings} occupancy={occupancy} bookingError={bookingError} onNavigate={switchView} onAddBus={() => setModal({ type: "bus" })} onAddBooking={() => setModal({ type: "booking" })} />
          ) : view === "fleet" ? (
            <Fleet buses={buses} onAdd={() => setModal({ type: "bus" })} onEdit={(bus) => setModal({ type: "bus", bus })} />
          ) : (
            <Bookings bookings={bookings} error={bookingError} onAdd={() => setModal({ type: "booking" })} />
          )}
        </section>
      </main>

      {modal?.type === "bus" && <BusModal bus={modal.bus} onClose={() => setModal(null)} onSaved={async (message) => { setModal(null); await loadBuses(); notify(message); }} />}
      {modal?.type === "booking" && <BookingModal buses={buses} onClose={() => setModal(null)} onSaved={async (message) => { setModal(null); await loadBookings(); notify(message); }} />}
      {toast && <div className={`toast ${toast.type}`}><Icon name={toast.type === "success" ? "check" : "alert"} />{toast.message}</div>}
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}><Icon name={icon} />{label}</button>;
}

function Overview({ buses, bookings, occupancy, bookingError, onNavigate, onAddBus, onAddBooking }) {
  const recent = bookings.slice(-4).reverse();
  return <>
    <div className="hero">
      <div>
        <p className="eyebrow">Saturday, May 30</p>
        <h2>Keep every journey<br /><em>moving smoothly.</em></h2>
        <p>Manage your fleet and keep an eye on ticket activity from one simple workspace.</p>
      </div>
      <div className="hero-actions">
        <button className="button light" onClick={onAddBooking}><Icon name="plus" /> New booking</button>
        <button className="button ghost" onClick={onAddBus}><Icon name="bus" /> Add bus</button>
      </div>
    </div>

    <div className="stats-grid">
      <Stat label="Fleet size" value={buses.length} detail="registered buses" icon="bus" tone="blue" />
      <Stat label="Ticket activity" value={bookings.length} detail="total bookings" icon="ticket" tone="orange" />
      <Stat label="Seat occupancy" value={`${occupancy}%`} detail="across your fleet" icon="users" tone="green" />
    </div>

    <div className="overview-grid">
      <div className="panel">
        <PanelHeader title="Fleet snapshot" subtitle="Your registered buses" action="View fleet" onClick={() => onNavigate("fleet")} />
        {buses.length ? <div className="bus-list">{buses.slice(0, 4).map((bus) => <BusRow key={bus.id} bus={bus} />)}</div> : <Empty title="No buses yet" text="Add your first vehicle to get started." />}
      </div>
      <div className="panel">
        <PanelHeader title="Recent bookings" subtitle="Latest ticket activity" action="View all" onClick={() => onNavigate("bookings")} />
        {bookingError ? <ErrorState text="The booking API needs a backend adjustment before ticket activity can load." /> : recent.length ? <div className="booking-list">{recent.map((booking) => <BookingRow key={booking.id} booking={booking} />)}</div> : <Empty title="No bookings yet" text="New ticket activity will appear here." />}
      </div>
    </div>
  </>;
}

function Stat({ label, value, detail, icon, tone }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon name={icon} /></div><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div>;
}

function PanelHeader({ title, subtitle, action, onClick }) {
  return <div className="panel-header"><div><h3>{title}</h3><p>{subtitle}</p></div><button onClick={onClick}>{action} <span>&rarr;</span></button></div>;
}

function Fleet({ buses, onAdd, onEdit }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => buses.filter((bus) => `${bus.bus_name} ${bus.bus_number}`.toLowerCase().includes(search.toLowerCase())), [buses, search]);
  return <>
    <PageIntro title="Your road-ready fleet" text="Add vehicles, update details, and keep your operating capacity accurate." action="Add new bus" onClick={onAdd} />
    <div className="panel table-panel">
      <div className="table-toolbar">
        <div><h3>Registered buses</h3><p>{filtered.length} vehicles in your fleet</p></div>
        <label className="search"><Icon name="search" size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search fleet" /></label>
      </div>
      {filtered.length ? <div className="table-wrap"><table><thead><tr><th>Bus</th><th>Registration</th><th>Capacity</th><th>Status</th><th /></tr></thead><tbody>{filtered.map((bus) => <tr key={bus.id}><td><strong>{bus.bus_name}</strong><span>Vehicle #{String(bus.id).padStart(3, "0")}</span></td><td>{bus.bus_number}</td><td>{bus.capacity} seats</td><td><span className="status active">Active</span></td><td><button className="row-action" onClick={() => onEdit(bus)}><Icon name="edit" size={17} /> Edit</button></td></tr>)}</tbody></table></div> : <Empty title="No matching buses" text="Try another search or add a new vehicle." />}
    </div>
  </>;
}

function Bookings({ bookings, error, onAdd }) {
  return <>
    <PageIntro title="Ticket activity" text="Create reservations and keep tabs on recent bookings." action="Create booking" onClick={onAdd} />
    <div className="panel table-panel">
      <div className="table-toolbar"><div><h3>All bookings</h3><p>{bookings.length} reservations recorded</p></div></div>
      {error ? <ErrorState text="The current booking endpoint returns fields that do not match the Booking model. Update the backend route to use trip_id and is_created." /> : bookings.length ? <div className="table-wrap"><table><thead><tr><th>Booking</th><th>User</th><th>Trip</th><th>Seat</th><th>Status</th></tr></thead><tbody>{bookings.map((booking) => <tr key={booking.id}><td><strong>#{String(booking.id).padStart(4, "0")}</strong><span>{formatDate(booking.created_at || booking.is_created)}</span></td><td>User #{booking.user_id}</td><td>Trip #{booking.schedule_id || booking.trip_id}</td><td>{booking.seat_number || "Unassigned"}</td><td><span className={`status ${String(booking.booking_status).toLowerCase()}`}>{booking.booking_status}</span></td></tr>)}</tbody></table></div> : <Empty title="No bookings yet" text="Create the first reservation for your passengers." />}
    </div>
  </>;
}

function PageIntro({ title, text, action, onClick }) {
  return <div className="page-intro"><div><p className="eyebrow">RouteFlow workspace</p><h2>{title}</h2><p>{text}</p></div><button className="button primary" onClick={onClick}><Icon name="plus" />{action}</button></div>;
}

function BusRow({ bus }) {
  return <div className="list-row"><div className="mini-icon"><Icon name="bus" size={18} /></div><div><strong>{bus.bus_name}</strong><span>{bus.bus_number}</span></div><small>{bus.capacity} seats</small></div>;
}

function BookingRow({ booking }) {
  return <div className="list-row"><div className="mini-icon ticket"><Icon name="ticket" size={18} /></div><div><strong>Booking #{String(booking.id).padStart(4, "0")}</strong><span>Seat {booking.seat_number || "unassigned"}</span></div><span className={`status ${String(booking.booking_status).toLowerCase()}`}>{booking.booking_status}</span></div>;
}

function BusModal({ bus, onClose, onSaved }) {
  const [form, setForm] = useState(bus || emptyBus);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const payload = { ...form, capacity: Number(form.capacity) };
      const result = bus ? await api.updateBus(bus.id, payload) : await api.createBus(payload);
      await onSaved(result.message);
    } catch (err) { setError(err.message); setSaving(false); }
  };
  return <Modal title={bus ? "Update bus" : "Add a new bus"} subtitle="Keep your fleet details accurate." onClose={onClose}><form onSubmit={submit}><Field label="Bus name" value={form.bus_name} onChange={(bus_name) => setForm({ ...form, bus_name })} placeholder="e.g. Coastal Express" /><Field label="Registration number" value={form.bus_number} onChange={(bus_number) => setForm({ ...form, bus_number })} placeholder="e.g. MH-14-AB-1234" /><Field label="Seat capacity" value={form.capacity} onChange={(capacity) => setForm({ ...form, capacity })} placeholder="e.g. 42" type="number" min="1" />{error && <FormError text={error} />}<FormActions onClose={onClose} saving={saving} label={bus ? "Save changes" : "Add bus"} /></form></Modal>;
}

function BookingModal({ onClose, onSaved }) {
  const [form, setForm] = useState(emptyBooking);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const payload = { ...form, user_id: Number(form.user_id), schedule_id: Number(form.schedule_id) };
      const result = await api.createBooking(payload);
      await onSaved(result.message);
    } catch (err) { setError(`${err.message}. The backend booking route may need the trip_id field fix.`); setSaving(false); }
  };
  return <Modal title="Create booking" subtitle="Reserve a seat for a passenger." onClose={onClose}><form onSubmit={submit}><Field label="User ID" value={form.user_id} onChange={(user_id) => setForm({ ...form, user_id })} placeholder="e.g. 12" type="number" min="1" /><Field label="Trip ID" value={form.schedule_id} onChange={(schedule_id) => setForm({ ...form, schedule_id })} placeholder="e.g. 4" type="number" min="1" /><Field label="Seat number" value={form.seat_number} onChange={(seat_number) => setForm({ ...form, seat_number })} placeholder="e.g. A12" />{error && <FormError text={error} />}<FormActions onClose={onClose} saving={saving} label="Create booking" /></form></Modal>;
}

function Modal({ title, subtitle, onClose, children }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={(event) => event.stopPropagation()}><button className="icon-button modal-close" onClick={onClose}><Icon name="close" size={18} /></button><p className="eyebrow">RouteFlow desk</p><h2>{title}</h2><p className="modal-subtitle">{subtitle}</p>{children}</div></div>;
}

function Field({ label, onChange, ...props }) {
  return <label className="field"><span>{label}</span><input required onChange={(event) => onChange(event.target.value)} {...props} /></label>;
}

function FormActions({ onClose, saving, label }) {
  return <div className="form-actions"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button primary" disabled={saving}>{saving ? "Saving..." : label}</button></div>;
}

function FormError({ text }) { return <div className="form-error"><Icon name="alert" size={18} />{text}</div>; }
function ErrorState({ text }) { return <div className="error-state"><Icon name="alert" /><div><strong>Booking API needs attention</strong><p>{text}</p></div></div>; }
function Empty({ title, text }) { return <div className="empty"><Icon name="route" /><strong>{title}</strong><p>{text}</p></div>; }
function Loading() { return <div className="loading"><div /><p>Preparing your operations desk...</p></div>; }
function formatDate(value) { return value ? new Date(value).toLocaleDateString() : "Recently created"; }

export default App;
