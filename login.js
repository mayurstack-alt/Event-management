// const formLogin = document.getElementById("loginForm");

// formLogin.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const email = document.getElementById("email").value;
//   const password = document.getElementById("password").value;

//   try {
//     const res = await fetch("http://localhost:3000/api/auth/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password })
//     });
//     const out = await res.json();

//     if (out.success) {
//       const user = out.user;
//       localStorage.setItem("user_id", user.user_id);
//       localStorage.setItem("role", user.role);
//       localStorage.setItem("name", user.name);
//       if (user.role === "Organizer") window.location.href = "organizer.html";
//       else window.location.href = "participant.html";
//     } else {
//       alert(out.message || "Login failed");
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
      if (data.user.role === "Organizer") window.location.href = "organizer.html";
      else window.location.href = "participant.html";
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
    alert("Network error");
  }
});
