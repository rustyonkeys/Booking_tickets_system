const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || "Something went wrong");
  }

  return data;
}

export const api = {
  getBuses: () => request("/bus_details"),
  createBus: (bus) =>
    request("/bus_details", { method: "POST", body: JSON.stringify(bus) }),
  updateBus: (id, bus) =>
    request(`/bus_details/${id}`, { method: "PUT", body: JSON.stringify(bus) }),
  getBookings: () => request("/booking"),
  createBooking: (booking) =>
    request("/booking", { method: "POST", body: JSON.stringify(booking) }),
};
