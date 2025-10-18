const userId = localStorage.getItem("user_id");
const role = localStorage.getItem("role");
const name = localStorage.getItem("name");

const userInfo = document.getElementById("userInfo");
const logoutBtn = document.getElementById("logoutBtn");

if (!userId || role !== "Participant") {
  window.location.href = "login.html";
}

userInfo.innerText = name ? `Hello, ${name}` : "";

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

/* ---------- modal elements ---------- */
const modalBackdrop = document.getElementById("modalBackdrop");
const modalEventTitle = document.getElementById("modalEventTitle");
const ticketCountInput = document.getElementById("ticketCountInput");
const modalCancel = document.getElementById("modalCancel");
const modalConfirm = document.getElementById("modalConfirm");

let modalCurrentEvent = null; // event object { event_id, title, ... }
let modalBookingInProgress = false;

/* ---------- helper to open modal ---------- */
function openBookingModal(eventObj) {
  modalCurrentEvent = eventObj;
  modalEventTitle.innerText = eventObj.title;
  ticketCountInput.value = "1";
  modalBackdrop.style.display = "flex";
  ticketCountInput.focus();
}

/* ---------- helper to close modal ---------- */
function closeBookingModal() {
  modalBackdrop.style.display = "none";
  modalCurrentEvent = null;
}

/* Cancel button */
modalCancel.addEventListener("click", () => {
  if (modalBookingInProgress) return;
  closeBookingModal();
});

/* Confirm button -> perform booking */
modalConfirm.addEventListener("click", async () => {
  if (!modalCurrentEvent || modalBookingInProgress) return;
  const raw = ticketCountInput.value;
  const num = parseInt(raw, 10);
  if (Number.isNaN(num) || num <= 0) {
    alert("Enter a valid number of tickets (1 or more).");
    return;
  }

  modalBookingInProgress = true;
  modalConfirm.disabled = true;
  modalCancel.disabled = true;
  modalConfirm.innerText = "Booking...";

  try {
    // Run sequential inserts num times. If you prefer, you can batch server-side instead.
    for (let i = 0; i < num; i++) {
      const res = await fetch("http://localhost:3000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, event_id: modalCurrentEvent.event_id })
      });
      const out = await res.json();
      if (!out.success) {
        // If any booking fails, show message and stop further attempts.
        alert(out.message || "Booking failed");
        break;
      }
    }
    // After attempting bookings, refresh UI
    await loadBookings();
    await loadTickets();
    closeBookingModal();
    alert("Booking completed!");
  } catch (err) {
    console.error("Booking error:", err);
    alert("Network error while booking.");
  } finally {
    modalBookingInProgress = false;
    modalConfirm.disabled = false;
    modalCancel.disabled = false;
    modalConfirm.innerText = "Confirm";
  }
});

/* close modal when clicking backdrop (optional) */
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop && !modalBookingInProgress) closeBookingModal();
});

/* ---------- Events & bookings loading ---------- */

async function loadEvents() {
  const container = document.getElementById("eventsContainer");
  container.innerHTML = "<p>Loading events...</p>";

  try {
    const res = await fetch("http://localhost:3000/api/events");
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      container.innerHTML = "";
      data.data.forEach((e) => {
        const card = document.createElement("div");
        card.className = "card";
        // store event data attributes so handlers can use
        card.innerHTML = `
          <h3>${e.title}</h3>
          <p><strong>Date:</strong> ${new Date(e.date).toDateString()}</p>
          <p><strong>Venue:</strong> ${e.venue}</p>
          <p>${e.description || ""}</p>
          <button class="book-btn" data-event='${JSON.stringify({ event_id: e.event_id, title: e.title })}'>Book Ticket</button>
        `;
        container.appendChild(card);
      });

      // attach click handlers to book buttons (delegation safe)
      document.querySelectorAll(".book-btn").forEach(btn => {
        btn.addEventListener("click", (evt) => {
          const dt = evt.currentTarget.getAttribute("data-event");
          try {
            const eventObj = JSON.parse(dt);
            openBookingModal(eventObj);
          } catch (err) {
            console.error("Invalid event data", err);
          }
        });
      });

    } else {
      container.innerHTML = "<p>No upcoming events found.</p>";
    }
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Failed to load events.</p>";
  }
}

async function loadBookings() {
  const container = document.getElementById("bookingsContainer");
  container.innerHTML = "<p>Loading your bookings...</p>";

  try {
    const res = await fetch(`http://localhost:3000/api/bookings/${userId}`);
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      container.innerHTML = "";
      data.data.forEach((b) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <h3>${b.title}</h3>
          <p><strong>Date:</strong> ${new Date(b.date).toDateString()}</p>
          <p><strong>Venue:</strong> ${b.venue}</p>
          <p>${b.description || ""}</p>
          <p><em>Booked at: ${new Date(b.booked_at).toLocaleString()}</em></p>
        `;
        container.appendChild(card);
      });
    } else {
      container.innerHTML = "<p>You have not booked any events yet.</p>";
    }
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Failed to load bookings.</p>";
  }
}

async function loadTickets() {
  const container = document.getElementById("ticketsContainer");
  container.innerHTML = "<p>Loading your tickets...</p>";

  try {
    const res = await fetch(`http://localhost:3000/api/bookings/${userId}`);
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      container.innerHTML = "";

      // Build counts keyed by event_id
      const ticketCount = {};
      data.data.forEach(b => {
        ticketCount[b.event_id] = (ticketCount[b.event_id] || 0) + 1;
      });

      // Render one ticket card per event
      for (let eventId in ticketCount) {
        const tickets = data.data.filter(b => String(b.event_id) === String(eventId));
        const b = tickets[0]; // first booking for meta info
        const ticket = document.createElement("div");
        ticket.className = "ticket-card";
        ticket.innerHTML = `
          <h3>${b.title}</h3>
          <p><strong>Date:</strong> ${new Date(b.date).toDateString()}</p>
          <p><strong>Venue:</strong> ${b.venue}</p>
          <p><strong>Quantity:</strong> ${ticketCount[eventId]}</p>
          <p><em>Booked most recent at: ${new Date(tickets[0].booked_at).toLocaleString()}</em></p>
        `;
        container.appendChild(ticket);
      }
    } else {
      container.innerHTML = "<p>No tickets booked yet.</p>";
    }
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Failed to load tickets.</p>";
  }
}

/* Initial load */
loadEvents();
loadBookings();
loadTickets();



