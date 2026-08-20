const token = localStorage.getItem("jwt");
if (token === null) {
  window.location.href = "index.html";
}

async function loadProfile() {
  // fetch and display user info
  const userDisplay = document.getElementById("user");
  const userData = await fetchUser();
  userDisplay.textContent = userData.data.user[0].login;

  // fetch and display xp info
  const xpDisplay = document.getElementById("xp");
  const xpData = await fetchXP();
  const xp = sumXP(xpData);
  xpDisplay.textContent = xp.toLocaleString();

  // fetch and display audit info
  const auditDisplay = document.getElementById("audit");
  const auditData = await fetchAuditRatio();
  auditDisplay.textContent = auditData.data.user[0].auditRatio.toFixed(2);
}
loadProfile();

// clear the token and send user back to login
let logoutButton = document.getElementById("logout");
logoutButton.addEventListener("click", function () {
  localStorage.removeItem("jwt");
  window.location.href = "index.html";
});
