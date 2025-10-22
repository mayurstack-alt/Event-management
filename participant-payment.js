// Authentication
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

// Payment Modal Elements
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

// Open Payment Modal
function openPaymentModal(event) {
  currentEvent = event;
  paymentEventName.textContent = event.title;
  ticketsCountInput.value = "1";
  updatePaymentSummary();
  paymentModalBackdrop.style.display = "flex";
  ticketsCountInput.focus();
}

// Close Payment Modal
function closePaymentModal() {
  paymentModalBackdrop.style.display = "none";
  currentEvent = null;
  paymentInProgress = false;
}

// Update Payment Summary
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
  if (!currentEvent || paymentInProgress) return;
  
  const ticketsCount = parseInt(ticketsCountInput.value);
  
  if (isNaN(ticketsCount) || ticketsCount < 1) {
    alert("Please enter a valid number of tickets (minimum 1)");
    return;
  }
  
  const paymentMethod = paymentMethodSelect.value;
  const pricePerTicket = parseFloat(currentEvent.price) || 0;
  const totalAmount = pricePerTicket * ticketsCount;
  
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
    closePaymentModal();
    
    // Show success message with transaction details
    alert(
      `✅ Payment Successful!\n\n` +
      `Transaction ID: ${paymentData.payment.transaction_id}\n` +
      `Event: ${currentEvent.title}\n` +
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

// Load Events and Bookings
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
          <div class="price-badge">${priceDisplay}</div>
          ${e.description ? `<p style="color: #666; margin-top: 10px;">${e.description}</p>` : ''}
          ${isPast 
            ? '<button class="btn" disabled style="opacity: 0.5; cursor: not-allowed; margin-top: 15px;">Event Passed</button>' 
            : `<button class="btn btn-primary" onclick="openPaymentForEvent(${e.event_id}, '${e.title.replace(/'/g, "\\'")}', ${e.price || 0})" style="margin-top: 15px;">Book Tickets</button>`
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

// Global function to open payment modal
window.openPaymentForEvent = function(eventId, eventTitle, price) {
  openPaymentModal({
    event_id: eventId,
    title: eventTitle,
    price: price
  });
};

// Load My Tickets (from payments)
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
            <div class="ticket-amount">
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
