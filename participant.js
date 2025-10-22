// const userId = localStorage.getItem("user_id");
// const role = localStorage.getItem("role");
// const name = localStorage.getItem("name");

// const userInfo = document.getElementById("userInfo");
// const logoutBtn = document.getElementById("logoutBtn");

// // Authentication and role check
// if (!userId) {
//   alert("Please login first.");
//   window.location.href = "login.html";
// } else if (role !== "Participant") {
//   alert("Access denied. This page is only for Participants. You are logged in as " + role + ".");
//   window.location.href = "index.html"; // or "organizer.html" if role is Organizer
// }

// userInfo.innerText = name ? `Hello, ${name}` : "";

// // Logout
// logoutBtn.addEventListener("click", () => {
//   localStorage.clear();
//   window.location.href = "login.html";
// });



// /* ---------- modal elements ---------- */
// const modalBackdrop = document.getElementById("modalBackdrop");
// const modalEventTitle = document.getElementById("modalEventTitle");
// const ticketCountInput = document.getElementById("ticketCountInput");
// const modalCancel = document.getElementById("modalCancel");
// const modalConfirm = document.getElementById("modalConfirm");

// let modalCurrentEvent = null; // event object { event_id, title, ... }
// let modalBookingInProgress = false;

// /* ---------- helper to open modal ---------- */
// function openBookingModal(eventObj) {
//   modalCurrentEvent = eventObj;
//   modalEventTitle.innerText = eventObj.title;
//   ticketCountInput.value = "1";
//   modalBackdrop.style.display = "flex";
//   ticketCountInput.focus();
// }

// /* ---------- helper to close modal ---------- */
// function closeBookingModal() {
//   modalBackdrop.style.display = "none";
//   modalCurrentEvent = null;
// }

// /* Cancel button */
// modalCancel.addEventListener("click", () => {
//   if (modalBookingInProgress) return;
//   closeBookingModal();
// });

// /* Confirm button -> perform booking */
// modalConfirm.addEventListener("click", async () => {
//   if (!modalCurrentEvent || modalBookingInProgress) return;
//   const raw = ticketCountInput.value;
//   const num = parseInt(raw, 10);
//   if (Number.isNaN(num) || num <= 0) {
//     alert("Enter a valid number of tickets (1 or more).");
//     return;
//   }

//   modalBookingInProgress = true;
//   modalConfirm.disabled = true;
//   modalCancel.disabled = true;
//   modalConfirm.innerText = "Booking...";

//   try {
//     // Run sequential inserts num times. If you prefer, you can batch server-side instead.
//     for (let i = 0; i < num; i++) {
//       const res = await fetch("http://localhost:3000/api/bookings", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ user_id: userId, event_id: modalCurrentEvent.event_id })
//       });
//       const out = await res.json();
//       if (!out.success) {
//         // If any booking fails, show message and stop further attempts.
//         alert(out.message || "Booking failed");
//         break;
//       }
//     }
//     // After attempting bookings, refresh UI
//     await loadBookings();
//     await loadTickets();
//     closeBookingModal();
//     alert("Booking completed!");
//   } catch (err) {
//     console.error("Booking error:", err);
//     alert("Network error while booking.");
//   } finally {
//     modalBookingInProgress = false;
//     modalConfirm.disabled = false;
//     modalCancel.disabled = false;
//     modalConfirm.innerText = "Confirm";
//   }
// });

// /* close modal when clicking backdrop (optional) */
// modalBackdrop.addEventListener("click", (e) => {
//   if (e.target === modalBackdrop && !modalBookingInProgress) closeBookingModal();
// });

// /* ---------- Events & bookings loading ---------- */

// async function loadEvents() {
//   const container = document.getElementById("eventsContainer");
//   container.innerHTML = "<p>Loading events...</p>";

//   try {
//     const res = await fetch("http://localhost:3000/api/events");
//     const data = await res.json();

//     if (data.success && data.data.length > 0) {
//       container.innerHTML = "";
//       data.data.forEach((e) => {
//         const card = document.createElement("div");
//         card.className = "card";
//         // store event data attributes so handlers can use
//         card.innerHTML = `
//           <h3>${e.title}</h3>
//           <p><strong>Date:</strong> ${new Date(e.date).toDateString()}</p>
//           <p><strong>Venue:</strong> ${e.venue}</p>
//           <p>${e.description || ""}</p>
//           <button class="book-btn" data-event='${JSON.stringify({ event_id: e.event_id, title: e.title })}'>Book Ticket</button>
//         `;
//         container.appendChild(card);
//       });

//       // attach click handlers to book buttons (delegation safe)
//       document.querySelectorAll(".book-btn").forEach(btn => {
//         btn.addEventListener("click", (evt) => {
//           const dt = evt.currentTarget.getAttribute("data-event");
//           try {
//             const eventObj = JSON.parse(dt);
//             openBookingModal(eventObj);
//           } catch (err) {
//             console.error("Invalid event data", err);
//           }
//         });
//       });

//     } else {
//       container.innerHTML = "<p>No upcoming events found.</p>";
//     }
//   } catch (err) {
//     console.error(err);
//     container.innerHTML = "<p>Failed to load events.</p>";
//   }
// }

// async function loadBookings() {
//   const container = document.getElementById("bookingsContainer");
//   container.innerHTML = "<p>Loading your bookings...</p>";

//   try {
//     const res = await fetch(`http://localhost:3000/api/bookings/${userId}`);
//     const data = await res.json();

//     if (data.success && data.data.length > 0) {
//       container.innerHTML = "";
//       data.data.forEach((b) => {
//         const card = document.createElement("div");
//         card.className = "card";
//         card.innerHTML = `
//           <h3>${b.title}</h3>
//           <p><strong>Date:</strong> ${new Date(b.date).toDateString()}</p>
//           <p><strong>Venue:</strong> ${b.venue}</p>
//           <p>${b.description || ""}</p>
//           <p><em>Booked at: ${new Date(b.booked_at).toLocaleString()}</em></p>
//         `;
//         container.appendChild(card);
//       });
//     } else {
//       container.innerHTML = "<p>You have not booked any events yet.</p>";
//     }
//   } catch (err) {
//     console.error(err);
//     container.innerHTML = "<p>Failed to load bookings.</p>";
//   }
// }

// async function loadTickets() {
//   const container = document.getElementById("ticketsContainer");
//   container.innerHTML = "<p>Loading your tickets...</p>";

//   try {
//     const res = await fetch(`http://localhost:3000/api/bookings/${userId}`);
//     const data = await res.json();

//     if (data.success && data.data.length > 0) {
//       container.innerHTML = "";

//       // Build counts keyed by event_id
//       const ticketCount = {};
//       data.data.forEach(b => {
//         ticketCount[b.event_id] = (ticketCount[b.event_id] || 0) + 1;
//       });

//       // Render one ticket card per event
//       for (let eventId in ticketCount) {
//         const tickets = data.data.filter(b => String(b.event_id) === String(eventId));
//         const b = tickets[0]; // first booking for meta info
//         const ticket = document.createElement("div");
//         ticket.className = "ticket-card";
//         ticket.innerHTML = `
//           <h3>${b.title}</h3>
//           <p><strong>Date:</strong> ${new Date(b.date).toDateString()}</p>
//           <p><strong>Venue:</strong> ${b.venue}</p>
//           <p><strong>Quantity:</strong> ${ticketCount[eventId]}</p>
//           <p><em>Booked most recent at: ${new Date(tickets[0].booked_at).toLocaleString()}</em></p>
//         `;
//         container.appendChild(ticket);
//       }
//     } else {
//       container.innerHTML = "<p>No tickets booked yet.</p>";
//     }
//   } catch (err) {
//     console.error(err);
//     container.innerHTML = "<p>Failed to load tickets.</p>";
//   }
// }

// /* Initial load */
// loadEvents();
// loadBookings();
// loadTickets();



const token = localStorage.getItem("token");
const userId = localStorage.getItem("user_id");
const role = localStorage.getItem("role");
const name = localStorage.getItem("name");

const userInfo = document.getElementById("userInfo");
const logoutBtn = document.getElementById("logoutBtn");

// Authentication and role check
if (!token || !userId) {
  alert("Please login first to access this page.");
  window.location.href = "participant-login.html";
} else if (role !== "Participant") {
  alert("Access Denied!\n\nThis page is only accessible to Participants.\nYou are currently logged in as: " + role + "\n\nPlease logout and login with a Participant account.");
  window.location.href = "organizer.html";
}

if (userInfo) userInfo.innerText = name ? `Hello, ${name}` : "";

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    alert("You have successfully logged out!");
    window.location.href = "index.html";
  });
}

// ========== PAYMENT MODAL ELEMENTS ==========
const paymentModalBackdrop = document.getElementById("paymentModalBackdrop");
const paymentEventName = document.getElementById("paymentEventName");
const ticketsCountInput = document.getElementById("ticketsCount");
const ticketsCountDisplay = document.getElementById("ticketsCountDisplay");
const pricePerTicketDisplay = document.getElementById("pricePerTicket");
const totalAmountDisplay = document.getElementById("totalAmount");
const paymentMethodSelect = document.getElementById("paymentMethod");
const paymentCancelBtn = document.getElementById("paymentCancel");
const paymentConfirmBtn = document.getElementById("paymentConfirm");

let currentEvent = null; // Store current event for payment
let paymentInProgress = false;

// ========== PAYMENT MODAL FUNCTIONS ==========

// Open Payment Modal
function openPaymentModal(event) {
  // Validate event object
  if (!event) {
    console.error('openPaymentModal: event is null or undefined');
    alert('Error: Event data is missing. Please refresh the page and try again.');
    return;
  }
  
  if (!event.title) {
    console.error('openPaymentModal: event.title is missing', event);
    alert('Error: Event title is missing. Please refresh the page and try again.');
    return;
  }
  
  console.log('Opening payment modal for event:', event);
  
  currentEvent = event;
  paymentEventName.textContent = event.title || 'Unknown Event';
  ticketsCountInput.value = "1";
  updatePaymentSummary();
  paymentModalBackdrop.style.display = "flex";
  
  // Focus with slight delay to ensure modal is rendered
  setTimeout(() => {
    ticketsCountInput.focus();
  }, 100);
}

// Close Payment Modal
function closePaymentModal() {
  paymentModalBackdrop.style.display = "none";
  currentEvent = null;
  paymentInProgress = false;
}

// Update Payment Summary (real-time calculation)
function updatePaymentSummary() {
  if (!currentEvent) return;
  
  const ticketsCount = parseInt(ticketsCountInput.value) || 1;
  const pricePerTicket = parseFloat(currentEvent.price) || 0;
  const totalAmount = pricePerTicket * ticketsCount;
  
  pricePerTicketDisplay.textContent = `₹ ${pricePerTicket.toFixed(2)}`;
  ticketsCountDisplay.textContent = ticketsCount;
  totalAmountDisplay.textContent = `₹ ${totalAmount.toFixed(2)}`;
}

// Event Listeners for Payment Modal
ticketsCountInput.addEventListener("input", updatePaymentSummary);

paymentCancelBtn.addEventListener("click", () => {
  if (paymentInProgress) return;
  closePaymentModal();
});

paymentConfirmBtn.addEventListener("click", async () => {
  console.log('Payment confirm button clicked');
  console.log('Current event:', currentEvent);
  console.log('Payment in progress:', paymentInProgress);
  
  if (!currentEvent) {
    console.error('currentEvent is null or undefined');
    alert('Error: Event data is missing. Please close this modal and try again.');
    return;
  }
  
  if (paymentInProgress) {
    console.log('Payment already in progress, ignoring click');
    return;
  }
  
  // Validate currentEvent has all required properties
  if (!currentEvent.event_id) {
    console.error('currentEvent.event_id is missing:', currentEvent);
    alert('Error: Event ID is missing. Please close this modal and try again.');
    return;
  }
  
  if (!currentEvent.title) {
    console.error('currentEvent.title is missing:', currentEvent);
    alert('Error: Event title is missing. Please close this modal and try again.');
    return;
  }
  
  const ticketsCount = parseInt(ticketsCountInput.value);
  
  if (isNaN(ticketsCount) || ticketsCount < 1) {
    alert("Please enter a valid number of tickets (minimum 1)");
    return;
  }
  
  const paymentMethod = paymentMethodSelect.value;
  const pricePerTicket = parseFloat(currentEvent.price) || 0;
  const totalAmount = pricePerTicket * ticketsCount;
  
  console.log('Payment details:', {
    event_id: currentEvent.event_id,
    event_title: currentEvent.title,
    tickets_count: ticketsCount,
    total_amount: totalAmount,
    payment_method: paymentMethod
  });
  
  if (!confirm(`Confirm payment of ₹${totalAmount.toFixed(2)} for ${ticketsCount} ticket(s) via ${paymentMethod}?`)) {
    return;
  }
  
  paymentInProgress = true;
  paymentConfirmBtn.disabled = true;
  paymentCancelBtn.disabled = true;
  paymentConfirmBtn.textContent = "Processing...";
  
  try {
    // Step 1: Create booking
    const bookingRes = await fetch("http://localhost:3000/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        event_id: currentEvent.event_id,
        quantity: ticketsCount
      })
    });
    
    const bookingData = await bookingRes.json();
    
    if (!bookingData.success) {
      throw new Error(bookingData.message || "Booking failed");
    }
    
    // Step 2: Process payment
    const paymentRes = await fetch("http://localhost:3000/api/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        booking_id: bookingData.booking.booking_id,
        participant_name: name,
        event_id: currentEvent.event_id,
        event_title: currentEvent.title,
        tickets_count: ticketsCount,
        total_amount: totalAmount,
        payment_method: paymentMethod
      })
    });
    
    const paymentData = await paymentRes.json();
    
    if (!paymentData.success) {
      throw new Error(paymentData.message || "Payment failed");
    }
    
    // Success!
    // Preserve values from currentEvent/paymentData before closing the modal
    const eventTitleForAlert = (currentEvent && currentEvent.title) || (paymentData && paymentData.payment && paymentData.payment.event_title) || 'Event';
    const transactionIdForAlert = (paymentData && paymentData.payment && paymentData.payment.transaction_id) || (paymentData && paymentData.payment && paymentData.payment.payment_id) || 'N/A';

    closePaymentModal();

    // Show success message with transaction details
    alert(
      `✅ Payment Successful!\n\n` +
      `Transaction ID: ${transactionIdForAlert}\n` +
      `Event: ${eventTitleForAlert}\n` +
      `Tickets: ${ticketsCount}\n` +
      `Amount Paid: ₹${totalAmount.toFixed(2)}\n` +
      `Payment Method: ${paymentMethod}\n\n` +
      `Your booking is confirmed!`
    );
    
    // Reload events and tickets
    loadEventsAndBookings();
    loadMyTickets();
    
  } catch (err) {
    console.error("Payment error:", err);
    alert(`❌ Payment Failed\n\n${err.message}\n\nPlease try again.`);
  } finally {
    paymentInProgress = false;
    paymentConfirmBtn.disabled = false;
    paymentCancelBtn.disabled = false;
    paymentConfirmBtn.textContent = "Confirm Payment";
  }
});

// Close modal when clicking backdrop
paymentModalBackdrop.addEventListener("click", (e) => {
  if (e.target === paymentModalBackdrop && !paymentInProgress) {
    closePaymentModal();
  }
});

// ========== LOAD EVENTS WITH PAYMENT BUTTON ==========

async function loadEventsAndBookings() {
  const eventsContainer = document.getElementById("eventsContainer");
  if (!eventsContainer) return;
  
  eventsContainer.innerHTML = "<p style='text-align: center; padding: 20px;'>Loading events...</p>";

  try {
    const eventsRes = await fetch("http://localhost:3000/api/events", {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const eventsData = await eventsRes.json();

    if (eventsData.success && eventsData.data.length > 0) {
      eventsContainer.innerHTML = "";
      
      eventsData.data.forEach(e => {
        const card = document.createElement("div");
        card.className = "card";
        
        const priceDisplay = e.price && parseFloat(e.price) > 0 
          ? `₹ ${parseFloat(e.price).toFixed(2)}` 
          : 'Free';
        
        const eventDate = new Date(e.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isPast = eventDate < today;

        card.innerHTML = `
          <h3>${e.title}</h3>
          <p><strong>📅 Date:</strong> ${eventDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
          <p><strong>📍 Venue:</strong> ${e.venue}</p>
          <p style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: 700; margin: 10px 0;">${priceDisplay}</p>
          ${e.description ? `<p style="color: #666; margin-top: 10px;">${e.description}</p>` : ''}
          ${isPast 
            ? '<button class="btn" disabled style="opacity: 0.5; cursor: not-allowed; margin-top: 15px; background: #ccc;">Event Passed</button>' 
            : `<button class="btn btn-primary book-ticket-btn" 
                      data-event-id="${e.event_id}" 
                      data-event-title="${e.title}" 
                      data-event-venue="${e.venue}" 
                      data-event-price="${e.price || 0}" 
                      style="margin-top: 15px;">Book Tickets</button>`
          }
        `;
        eventsContainer.appendChild(card);
      });
    } else {
      eventsContainer.innerHTML = "<p style='text-align: center; color: #666;'>No upcoming events found.</p>";
    }
  } catch (err) {
    console.error(err);
    eventsContainer.innerHTML = "<p style='text-align: center; color: #e74c3c;'>Failed to load events. Please refresh the page.</p>";
  }
}

// Set up event delegation for book ticket buttons (only once)
document.addEventListener('DOMContentLoaded', () => {
  const eventsContainer = document.getElementById("eventsContainer");
  if (eventsContainer) {
    eventsContainer.addEventListener('click', (event) => {
      if (event.target.classList.contains('book-ticket-btn')) {
        const btn = event.target;
        const eventId = parseInt(btn.dataset.eventId);
        const eventTitle = btn.dataset.eventTitle;
        const eventVenue = btn.dataset.eventVenue;
        const eventPrice = parseFloat(btn.dataset.eventPrice);
        
        console.log('Book ticket button clicked:', { eventId, eventTitle, eventVenue, eventPrice });
        
        openPaymentForEvent(eventId, eventTitle, eventVenue, eventPrice);
      }
    });
  }
});

// Global function to open payment modal (called from onclick)
window.openPaymentForEvent = function(eventId, eventTitle, eventVenue, price) {
  console.log('openPaymentForEvent called with:', { eventId, eventTitle, eventVenue, price });
  
  // Validate parameters
  if (!eventId) {
    console.error('openPaymentForEvent: eventId is missing');
    alert('Error: Event ID is missing. Please refresh the page.');
    return;
  }
  
  if (!eventTitle) {
    console.error('openPaymentForEvent: eventTitle is missing');
    alert('Error: Event title is missing. Please refresh the page.');
    return;
  }
  
  // Create event object
  const eventObj = {
    event_id: eventId,
    title: eventTitle,
    venue: eventVenue || 'TBA',
    price: parseFloat(price) || 0
  };
  
  console.log('Opening modal with event object:', eventObj);
  
  openPaymentModal(eventObj);
};


// Load tickets in beautiful ticket card format
async function loadMyTickets() {
  const container = document.getElementById("myTicketsContainer");
  if (!container) return;
  
  container.innerHTML = "<p style='text-align: center; color: #666; padding: 20px;'>Loading your tickets...</p>";

  try {
    const res = await fetch(`http://localhost:3000/api/payments/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();

    if (data.success && data.data && data.data.length > 0) {
      container.innerHTML = "";
      
      data.data.forEach((payment) => {
        const ticket = document.createElement("div");
        ticket.className = "ticket-card";
        
        const ticketId = payment.transaction_id || `TKT-${String(payment.payment_id).padStart(6, '0')}`;
        const eventDate = new Date(payment.event_date);
        const paymentDate = new Date(payment.payment_date);
        
        ticket.innerHTML = `
          <div class="ticket-header">
            <h3 class="ticket-title">${payment.event_title}</h3>
            <div class="ticket-id">${ticketId}</div>
          </div>
          
          <div class="ticket-details">
            <div class="ticket-detail">
              <div class="ticket-detail-label">Event Date</div>
              <div class="ticket-detail-value">${eventDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</div>
            </div>
            
            <div class="ticket-detail">
              <div class="ticket-detail-label">Venue</div>
              <div class="ticket-detail-value">${payment.event_venue || 'TBA'}</div>
            </div>
            
            <div class="ticket-detail">
              <div class="ticket-detail-label">Participant</div>
              <div class="ticket-detail-value">${payment.participant_name}</div>
            </div>
            
            <div class="ticket-detail">
              <div class="ticket-detail-label">Payment Method</div>
              <div class="ticket-detail-value">${payment.payment_method}</div>
            </div>
            
            <div class="ticket-detail">
              <div class="ticket-detail-label">Tickets</div>
              <div class="ticket-detail-value">🎫 ${payment.tickets_count} ticket${payment.tickets_count > 1 ? 's' : ''}</div>
            </div>
            
            <div class="ticket-detail">
              <div class="ticket-detail-label">Status</div>
              <div class="ticket-detail-value">✅ ${payment.payment_status}</div>
            </div>
          </div>
          
          <div class="ticket-footer">
            <div class="ticket-date">
              Booked on ${paymentDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })} at ${paymentDate.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <div class="ticket-quantity" style="background: rgba(255, 255, 255, 0.2); padding: 8px 15px; border-radius: 20px; font-weight: 700; font-size: 1.1rem; backdrop-filter: blur(10px);">
              ₹ ${parseFloat(payment.total_amount).toFixed(2)}
            </div>
          </div>
        `;
        
        container.appendChild(ticket);
      });
    } else {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #666;">
          <div style="font-size: 3rem; margin-bottom: 20px;">🎫</div>
          <h3 style="margin: 0 0 10px; color: #333;">No Tickets Yet</h3>
          <p style="margin: 0;">You haven't booked any events yet. Browse available events above to get started!</p>
        </div>
      `;
    }
  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #e74c3c;">
        <div style="font-size: 3rem; margin-bottom: 20px;">⚠️</div>
        <h3 style="margin: 0 0 10px; color: #e74c3c;">Failed to Load Tickets</h3>
        <p style="margin: 0;">There was an error loading your tickets. Please try refreshing the page.</p>
      </div>
    `;
  }
}

// Initial load
loadEventsAndBookings();
loadMyTickets();

