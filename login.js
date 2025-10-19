

// const form = document.getElementById("loginForm");

// form.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const email = document.getElementById("email").value;
//   const password = document.getElementById("password").value;

//   try {
//     const res = await fetch("http://localhost:3000/api/auth/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password })
//     });
//     const data = await res.json();
//     if (data.success) {
//       localStorage.setItem("user_id", data.user.user_id);
//       localStorage.setItem("role", data.user.role);
//       localStorage.setItem("name", data.user.name);
//       if (data.user.role === "Organizer") window.location.href = "organizer.html";
//       else window.location.href = "participant.html";
//     } else {
//       alert(data.message);
//     }
//   } catch (err) {
//     console.error(err);
//     alert("Network error");
//   }
// });


const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    
    if (data.success) {
      localStorage.setItem("user_id", data.user.user_id);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("name", data.user.name);
      
      // Redirect based on role
      if (data.user.role === "Organizer") {
        window.location.href = "organizer.html";
      } else if (data.user.role === "Participant") {
        window.location.href = "participant.html";
      }
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
    alert("Network error");
  }
});
