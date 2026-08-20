// redirect to login if no token is stored
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
  const cleanedXP = cleanXP(xpData);
  const xp = sumXP(cleanedXP);
  xpDisplay.textContent = Math.round(xp / 1000) + " kB";
  
  // fetch and display audit info
  const auditDisplay = document.getElementById("audit");
  const auditData = await fetchAuditRatio();
  auditDisplay.textContent = auditData.data.user[0].auditRatio.toFixed(2);

  // fetch and display xp graph
  const xpGraph = document.getElementById("xp-graph");
  const cumulative = cumulativeXP(cleanedXP);
  const coordinates = xpToCoordinates(cumulative, 1000, 280);
  const graphSVG = buildXPGraph(
    coordinates,
    cumulative[cumulative.length - 1].total,
    new Date(cumulative[0].date).toLocaleDateString(),
    new Date(cumulative[cumulative.length - 1].date).toLocaleDateString(),
  );
  xpGraph.innerHTML = graphSVG;

  // fetch and display pass/fail graph
  const passFailGraph = document.getElementById("passfail-graph");
  const resultsData = await fetchResults();
  const counts = passFailCounts(resultsData);
  const passFailSVG = buildPassFailGraph(counts);
  passFailGraph.innerHTML = passFailSVG;
}
loadProfile();

// clear the token and send user back to login
const logoutButton = document.getElementById("logout");
logoutButton.addEventListener("click", function () {
  localStorage.removeItem("jwt");
  window.location.href = "index.html";
});
