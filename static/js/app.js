const username = document.getElementById("username");
const password = document.getElementById("password");
const form = document.getElementById("login-form");
const error = document.getElementById("error");

// handles the login form submit
form.addEventListener("submit", async function (event) {
  event.preventDefault();
  try {
    const token = await login(username.value, password.value);
    localStorage.setItem("jwt", token);
    window.location.href = "profile.html";
  } catch (err) {
    error.textContent = err.message;
  }
});
